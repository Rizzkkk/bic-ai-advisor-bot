
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentChunk {
  id: string;
  content: string;
  domain: string;
  metadata: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { chunks } = await req.json();

    console.log(`Processing ${chunks.length} chunks for embedding generation`);

    const embeddings = [];
    
    // Process chunks in batches of 10 to avoid rate limits
    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      const batchPromises = batch.map(async (chunk: ContentChunk) => {
        
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-large',
            input: chunk.content,
            dimensions: 3072
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${data.error?.message}`);
        }

        return {
          id: chunk.id,
          embedding: data.data[0].embedding,
          content: chunk.content,
          domain: chunk.domain,
          metadata: chunk.metadata
        };
      });

      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
      
      // Small delay between batches
      if (i + 10 < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Update the content_chunks table with embeddings
    for (const embedding of embeddings) {
      const { error } = await supabase
        .from('content_chunks')
        .update({ 
          embedding: embedding.embedding,
          token_count: Math.ceil(embedding.content.length / 4) // Rough token estimate
        })
        .eq('id', embedding.id);

      if (error) {
        console.error('Error updating embedding:', error);
      }
    }

    console.log(`Successfully generated embeddings for ${embeddings.length} chunks`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: embeddings.length,
      message: `Generated embeddings for ${embeddings.length} content chunks`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
