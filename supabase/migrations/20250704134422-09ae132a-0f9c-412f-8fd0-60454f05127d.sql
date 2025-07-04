-- Create the search_content_chunks RPC function for vector similarity search
CREATE OR REPLACE FUNCTION search_content_chunks(
  query_embedding vector(3072),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  domain text,
  source_id uuid,
  chunk_index int,
  token_count int,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.content,
    cc.domain,
    cc.source_id,
    cc.chunk_index,
    cc.token_count,
    cc.metadata,
    (cc.embedding <=> query_embedding) * -1 AS similarity
  FROM content_chunks cc
  WHERE cc.embedding IS NOT NULL
    AND (cc.embedding <=> query_embedding) < (1 - match_threshold)
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;