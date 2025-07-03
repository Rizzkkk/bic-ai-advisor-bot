
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

const BIBHRAJIT_PERSONA_PROMPT = `You are Bibhrajit Halder, founder and managing partner at BIC (Business Intelligence & Capital). 

Core Identity:
- Serial entrepreneur with deep expertise in M&A, fundraising, and strategic consulting
- Direct, strategic, and philosophical communication style
- Focus on practical business insights over theoretical concepts
- Calm, composed, and confident in delivery
- Grounded in real-world business experience

Communication Style:
- Strategic and thoughtful in approach
- Direct but not harsh - philosophical when discussing leadership/vision
- Concise but comprehensive responses
- Idea-driven, not hype-driven
- Use concrete examples from business experience

Audience Adaptations:
- Founders: Focus on practical go-to-market, fundraising, scaling advice
- Investors: Emphasize strategic analysis, market opportunities, risk assessment
- Engineers: Bridge technical innovation with business strategy
- Executives: Leadership philosophy, organizational strategy, decision-making

Tone Characteristics:
- Confident but not arrogant
- Strategic thinking with practical application
- Philosophical about leadership and vision
- Direct and honest about challenges
- Supportive but realistic about expectations

Based on my past content and experience:
{context}

User Question: {query}

Respond as Bibhrajit Halder would, drawing from the provided context while maintaining your authentic voice and expertise. Keep responses focused and actionable.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { messages, sessionId, useRAG = true } = await req.json();
    
    const startTime = Date.now();
    const userQuery = messages[messages.length - 1].content;
    let retrievedChunks: string[] = [];
    let systemPrompt = BIBHRAJIT_PERSONA_PROMPT.replace('{context}', '').replace('{query}', userQuery);

    // RAG Pipeline: Retrieve relevant context
    if (useRAG && userQuery) {
      console.log('Starting RAG retrieval for query:', userQuery);
      
      // Generate embedding for the user query
      const queryEmbeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-large',
          input: userQuery,
          dimensions: 3072
        }),
      });

      const queryEmbeddingData = await queryEmbeddingResponse.json();
      
      if (queryEmbeddingResponse.ok && queryEmbeddingData.data?.[0]?.embedding) {
        const queryEmbedding = queryEmbeddingData.data[0].embedding;
        
        // Perform similarity search
        const { data: similarChunks, error } = await supabase.rpc('search_content_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 5
        });

        if (!error && similarChunks?.length > 0) {
          const contextChunks = similarChunks.map((chunk: any) => 
            `[From ${chunk.domain}]: ${chunk.content}`
          ).join('\n\n');
          retrievedChunks = similarChunks.map((chunk: any) => chunk.id);
          
          systemPrompt = BIBHRAJIT_PERSONA_PROMPT
            .replace('{context}', contextChunks)
            .replace('{query}', userQuery);
          
          console.log(`Retrieved ${similarChunks.length} relevant chunks for context`);
        } else {
          console.log('No relevant chunks found or error:', error);
        }
      }
    }

    // Generate response using OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.filter((msg: any) => msg.role !== 'system')
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message}`);
    }

    const responseTime = Date.now() - startTime;
    let fullResponse = '';

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Log the interaction
                  if (sessionId) {
                    await supabase.from('avatar_interactions').insert({
                      session_id: sessionId,
                      user_query: userQuery,
                      retrieved_chunks: retrievedChunks,
                      generated_response: fullResponse,
                      response_time_ms: responseTime
                    });
                  }
                  
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                  }
                } catch (parseError) {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in enhanced-chat-completion function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
