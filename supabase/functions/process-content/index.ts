
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentSource {
  id: string;
  name: string;
  type: string;
  raw_content: string;
  metadata: any;
}

// Simple content chunking function
function chunkContent(content: string, maxTokens: number = 600): string[] {
  const words = content.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentTokenCount = 0;

  for (const word of words) {
    const wordTokens = Math.ceil(word.length / 4); // Rough token estimation
    
    if (currentTokenCount + wordTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
      currentTokenCount = wordTokens;
    } else {
      currentChunk.push(word);
      currentTokenCount += wordTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

// Determine content domain based on keywords
function determineContentDomain(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('leadership') || contentLower.includes('management') || contentLower.includes('team')) {
    return 'leadership';
  } else if (contentLower.includes('merger') || contentLower.includes('acquisition') || contentLower.includes('m&a')) {
    return 'mna';
  } else if (contentLower.includes('consulting') || contentLower.includes('advisory')) {
    return 'consulting';
  } else if (contentLower.includes('strategy') || contentLower.includes('strategic')) {
    return 'strategy';
  } else if (contentLower.includes('investing') || contentLower.includes('investment') || contentLower.includes('venture')) {
    return 'investing';
  } else {
    return 'personal_philosophy';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { sourceId } = await req.json();

    console.log(`Processing content for source: ${sourceId}`);

    // Log processing start
    await supabase.from('processing_logs').insert({
      source_id: sourceId,
      stage: 'chunk',
      status: 'started',
      message: 'Starting content chunking process'
    });

    // Get the content source
    const { data: source, error: sourceError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      throw new Error(`Content source not found: ${sourceError?.message}`);
    }

    if (!source.raw_content) {
      throw new Error('No raw content found to process');
    }

    // Chunk the content
    const chunks = chunkContent(source.raw_content);
    console.log(`Generated ${chunks.length} chunks from content`);

    // Process each chunk
    const processedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const domain = determineContentDomain(chunk);
      const tokenCount = Math.ceil(chunk.length / 4);

      const { data: insertedChunk, error: chunkError } = await supabase
        .from('content_chunks')
        .insert({
          source_id: sourceId,
          chunk_index: i,
          content: chunk,
          token_count: tokenCount,
          domain: domain,
          metadata: {
            auto_classified: true,
            processing_date: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (chunkError) {
        console.error('Error inserting chunk:', chunkError);
        continue;
      }

      processedChunks.push(insertedChunk);
    }

    // Update source status
    await supabase
      .from('content_sources')
      .update({ status: 'processed' })
      .eq('id', sourceId);

    // Log processing completion
    await supabase.from('processing_logs').insert({
      source_id: sourceId,
      stage: 'chunk',
      status: 'completed',
      message: `Successfully processed ${processedChunks.length} chunks`,
      processing_time_ms: 0 // Could be calculated if needed
    });

    console.log(`Successfully processed ${processedChunks.length} chunks`);

    return new Response(JSON.stringify({ 
      success: true,
      chunksCreated: processedChunks.length,
      chunks: processedChunks
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-content function:', error);
    
    // Log error
    if (req.body) {
      const { sourceId } = await req.json();
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      await supabase.from('processing_logs').insert({
        source_id: sourceId,
        stage: 'chunk',
        status: 'failed',
        message: error.message
      });
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
