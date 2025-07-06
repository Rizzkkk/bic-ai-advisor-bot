
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Create the search function
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (error) {
      console.error('Error creating search function:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: 'Search function created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-search-function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
