
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

    // Create the search function in the database
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
          similarity float,
          source_id uuid,
          metadata jsonb
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT
            cc.id,
            cc.content,
            cc.domain,
            1 - (cc.embedding <=> query_embedding) as similarity,
            cc.source_id,
            cc.metadata
          FROM content_chunks cc
          WHERE cc.embedding IS NOT NULL
            AND 1 - (cc.embedding <=> query_embedding) > match_threshold
          ORDER BY cc.embedding <=> query_embedding
          LIMIT match_count;
        END;
        $$;
      `
    });

    if (error) {
      throw new Error(`Failed to create search function: ${error.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Search function created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
