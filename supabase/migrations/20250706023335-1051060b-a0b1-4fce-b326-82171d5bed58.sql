
-- Create avatar_interactions table for analytics
CREATE TABLE public.avatar_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_query TEXT NOT NULL,
  retrieved_chunks TEXT[] DEFAULT '{}',
  generated_response TEXT NOT NULL,
  response_rating INTEGER,
  feedback_text TEXT,
  tone_score NUMERIC(3,2),
  relevance_score NUMERIC(3,2),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_sources table for content management
CREATE TABLE public.content_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'document', 'audio', 'social_post', 'email', 'strategic_doc')),
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'error')),
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_url TEXT,
  raw_content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_chunks table for RAG
CREATE TABLE public.content_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.content_sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  domain TEXT NOT NULL CHECK (domain IN ('leadership', 'mna', 'consulting', 'strategy', 'investing', 'personal_philosophy')),
  embedding VECTOR(3072),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create processing_logs table for tracking content processing
CREATE TABLE public.processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.content_sources(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('upload', 'chunk', 'clean', 'embed', 'index', 'complete')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_avatar_interactions_session_id ON public.avatar_interactions(session_id);
CREATE INDEX idx_avatar_interactions_created_at ON public.avatar_interactions(created_at);
CREATE INDEX idx_content_chunks_source_id ON public.content_chunks(source_id);
CREATE INDEX idx_content_chunks_domain ON public.content_chunks(domain);
CREATE INDEX idx_processing_logs_source_id ON public.processing_logs(source_id);

-- Enable RLS
ALTER TABLE public.avatar_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin access for now, can be refined later)
CREATE POLICY "Admin access to avatar_interactions" ON public.avatar_interactions FOR ALL USING (true);
CREATE POLICY "Admin access to content_sources" ON public.content_sources FOR ALL USING (true);
CREATE POLICY "Admin access to content_chunks" ON public.content_chunks FOR ALL USING (true);
CREATE POLICY "Admin access to processing_logs" ON public.processing_logs FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO public.content_sources (name, type, status, raw_content, metadata) VALUES
('Bibhrajit Leadership Philosophy', 'strategic_doc', 'processed', 'Leadership is about serving others and creating value. In my experience building SafeAI and now at BIC, I believe in direct communication, strategic thinking, and focusing on what truly matters for customers and stakeholders.', '{"domain": "leadership", "keywords": ["leadership", "strategy", "communication"]}'),
('AI Investment Thesis', 'strategic_doc', 'processed', 'At BIC, we focus on AI, robotics, and autonomy startups that solve real-world problems. We look for founders who understand both the technical complexity and market dynamics. The key is finding companies that can bridge the gap between cutting-edge research and practical applications.', '{"domain": "investing", "keywords": ["AI", "robotics", "investing", "startups"]}'),
('M&A Strategy Insights', 'strategic_doc', 'processed', 'Successful M&A in deeptech requires understanding both technical synergies and cultural fit. During my time in M&A, I learned that the best deals happen when there is strategic alignment, not just financial arbitrage. Integration is where most deals fail or succeed.', '{"domain": "mna", "keywords": ["M&A", "strategy", "integration", "deeptech"]}');

INSERT INTO public.content_chunks (source_id, chunk_index, content, domain, token_count, metadata) 
SELECT 
  cs.id,
  1,
  cs.raw_content,
  CASE 
    WHEN cs.metadata->>'domain' = 'leadership' THEN 'leadership'
    WHEN cs.metadata->>'domain' = 'investing' THEN 'investing'
    WHEN cs.metadata->>'domain' = 'mna' THEN 'mna'
    ELSE 'strategy'
  END,
  array_length(string_to_array(cs.raw_content, ' '), 1),
  cs.metadata
FROM public.content_sources cs;
