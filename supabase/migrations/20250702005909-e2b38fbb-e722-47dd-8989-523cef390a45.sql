
-- Create content management tables for AI Avatar system

-- Table for storing original content sources
CREATE TABLE public.content_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'document', 'audio', 'social_post', 'email', 'strategic_doc')),
  source_url TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_path TEXT,
  raw_content TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'error')),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for processed content chunks
CREATE TABLE public.content_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.content_sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  domain TEXT NOT NULL CHECK (domain IN ('leadership', 'mna', 'consulting', 'strategy', 'investing', 'personal_philosophy')),
  embedding VECTOR(3072), -- OpenAI text-embedding-3-large dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for content metadata and tags
CREATE TABLE public.content_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content_chunks(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_value TEXT NOT NULL,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('tone', 'audience', 'domain', 'date', 'priority')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking processing pipeline progress
CREATE TABLE public.processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.content_sources(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('upload', 'chunk', 'clean', 'embed', 'index', 'complete')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing user interactions and feedback
CREATE TABLE public.avatar_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_query TEXT NOT NULL,
  retrieved_chunks UUID[] DEFAULT '{}',
  generated_response TEXT NOT NULL,
  response_rating INTEGER CHECK (response_rating IN (-1, 1)),
  feedback_text TEXT,
  tone_score INTEGER CHECK (tone_score BETWEEN 1 AND 5),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (for now, allow all authenticated users)
CREATE POLICY "Allow authenticated users to manage content sources" 
  ON public.content_sources 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage content chunks" 
  ON public.content_chunks 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage content metadata" 
  ON public.content_metadata 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view processing logs" 
  ON public.processing_logs 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all users to create interactions" 
  ON public.avatar_interactions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view interactions" 
  ON public.avatar_interactions 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_content_chunks_source_id ON public.content_chunks(source_id);
CREATE INDEX idx_content_chunks_domain ON public.content_chunks(domain);
CREATE INDEX idx_content_chunks_embedding ON public.content_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_content_metadata_content_id ON public.content_metadata(content_id);
CREATE INDEX idx_content_metadata_tag_name ON public.content_metadata(tag_name);
CREATE INDEX idx_processing_logs_source_id ON public.processing_logs(source_id);
CREATE INDEX idx_processing_logs_stage ON public.processing_logs(stage);
CREATE INDEX idx_avatar_interactions_session_id ON public.avatar_interactions(session_id);
CREATE INDEX idx_avatar_interactions_created_at ON public.avatar_interactions(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content_sources
CREATE TRIGGER update_content_sources_updated_at 
    BEFORE UPDATE ON public.content_sources 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
