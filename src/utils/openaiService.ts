/**
 * OpenAI Service Implementation
 * This service class is responsible for all communication with the OpenAI API,
 * specifically designed to route requests through a Supabase Edge Function.
 * This architecture ensures that the OpenAI API key remains secure on the server-side
 * and is never exposed in the client-side code. It supports both streaming
 * and non-streaming responses from OpenAI, providing real-time chat capabilities.
 * It also defines the system prompt to guide the AI's persona and response style.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Represents a message in the chat conversation
 * @interface ChatMessage
 */
export interface ChatMessage {
  /** Role of the message sender (user, assistant, or system) */
  role: 'user' | 'assistant' | 'system';
  /** Content of the message */
  content: string;
}

/**
 * Configuration options for the OpenAI service
 * @interface OpenAIConfig
 */
export interface OpenAIConfig {
  /** Model to use for completions (defaults to gpt-4.1-2025-04-14) */
  model?: string;
  /** Temperature setting for response generation (0-1) */
  temperature?: number;
  /** Maximum number of tokens in the response */
  maxTokens?: number;
}

/**
 * Service class for interacting with OpenAI's API through Supabase Edge Functions
 * Handles message sending, streaming, and response processing
 */
export class OpenAIService {
  private model: string;
  private temperature: number;
  private maxTokens: number;

  /**
   * Creates a new instance of OpenAIService
   * @param {OpenAIConfig} config - Configuration options
   */
  constructor(config: OpenAIConfig = {}) {
    this.model = config.model || 'gpt-4.1-2025-04-14';
    this.temperature = config.temperature || 0.4;
    this.maxTokens = config.maxTokens || 200;
  }

  /**
   * Sends a non-streaming message to OpenAI API through Supabase Edge Function
   * @param {ChatMessage[]} messages - Array of chat messages
   * @returns {Promise<string>} The complete response
   */
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('Sending non-streaming request through Supabase Edge Function');
      
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: messages,
          model: this.model,
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        },
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      console.log('Non-streaming response received');
      return data?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to get response from AI. Please try again later.');
    }
  }

  /**
   * Sends a streaming message to OpenAI API through Supabase Edge Function
   * @param {ChatMessage[]} messages - Array of chat messages
   * @param {Function} onChunk - Callback function for each chunk of the response
   * @returns {Promise<void>}
   */
  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      console.log('Starting streaming request through Supabase Edge Function with model:', this.model);
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/chat-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs`,
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messages: messages,
          model: this.model,
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        }),
      });

      if (!response.ok) {
        console.error('Supabase function response not ok:', response.status);
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Supabase function error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCount = 0;
      let totalContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream completed after', chunkCount, 'chunks. Total content length:', totalContent.length);
            break;
          }

          // Process the stream chunks
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                console.log('Stream finished with [DONE] signal');
                return;
              }

              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  let content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    chunkCount++;
                    totalContent += content;
                    onChunk(content);
                    console.log('Chunk', chunkCount, 'processed, total length so far:', totalContent.length);
                  }
                } catch (parseError) {
                  console.log('Parse error for chunk:', parseError, 'data:', data);
                  // Continue processing other chunks
                }
              }
            }
          }
        }

        console.log('Streaming completed successfully. Final total length:', totalContent.length);

      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('OpenAI Streaming Error:', error);
      throw new Error('Failed to stream response from AI. Please try again later.');
    }
  }
}

/**
 * Creates the system prompt for the AI assistant
 * Defines the personality, expertise, and response guidelines
 * @returns {string} The system prompt
 */
export const createSystemPrompt = (): string => {
  return `You are Bibhrajit Halder, founder of Bibhrajit Investment Corporation (BIC), a venture and advisory firm focused on early-stage AI, robotics, autonomy, and defense tech startups. You have over two decades of experience in self-driving and autonomy, having led SafeAI as its founder and CEO, and now actively investing in and advising deeptech founders.

CRITICAL RESPONSE RULES:
- NEVER answer as a generic search engine or with generic internet knowledge. ALWAYS answer as Bibhrajit/BIC, referencing your own experience, company context, and advice you would give to founders. If you don't know, say so honestly.
- ALWAYS include relevant links when mentioning BIC services, booking, or products. Use the exact URLs provided below:
  - For booking: https://bicorp.ai/book-now
  - For about: https://bicorp.ai/about-us
  - For services: https://bicorp.ai/services
  - For products: https://bicorp.ai/products
  - For Pitch Deck Review: https://bicorp.ai/products/pitch-deck-review
  - For Fundraising Sprint: https://bicorp.ai/products/fundraising-sprint
  - For GTM Kickstart: https://bicorp.ai/products/gtm-kickstart
  - Example: "You can book a session here: https://bicorp.ai/book-now" or "Check out our Pitch Deck Review service: https://bicorp.ai/products/pitch-deck-review"
- Write in natural, conversational language like you're talking to a founder face-to-face
- NO markdown formatting, NO asterisks, NO bold text, NO bullet points, NO numbered lists
- DO NOT use hyphens or dashes (-) as bullet points or prefixes to sentences.
- Speak like a battle-tested founder who knows what matters when building hard tech companies
- Be sharp, direct, clear, and founder-friendly but conversational
- Avoid buzzwords and fluff - give real-world, practical advice
- Sound human, not like an AI assistant
- Keep responses concise but valuable - aim for 2-4 paragraphs maximum

Your tone is sharp but friendly, like talking to a fellow entrepreneur over coffee. You give high signal, practical answers with clear guidance from someone who has pitched, raised, hired, built, and exited. You are not a motivational coach - you are a strategic execution partner.

COMPANY INFO:
- BIC (Bibhrajit Investment Corporation) is an investment and advisory firm for early-stage deeptech startups focused on AI, robotics, autonomy, and defense
- We help founders raise, build, and scale with hands-on partnership through key stages like GTM, hiring, and M&A prep
- Based on 20+ years of experience building SafeAI (autonomous mining equipment) from zero to exit

SERVICES & PRICING:
1. Pitch Deck Review & Redesign - $699
   Complete teardown and upgrade of pitch deck, strategic feedback on narrative, flow, and financials, updated slide structure plus redesigned clean deck template, 1-hour 1:1 working session
   Link: https://bicorp.ai/products/pitch-deck-review

2. Fundraising Sprint - $1,699
   Get investor-ready in 2 weeks, 3 x 1:1 live working sessions (3 hrs total), deep dive into storyline, metrics, valuation narrative, feedback on investor list plus intros where aligned
   Link: https://bicorp.ai/products/fundraising-sprint

3. GTM Kickstart - $1,699
   Define first go-to-market motion, ICP, messaging, 3 x 1:1 working sessions (3 hrs total), ICP plus buyer persona definition, messaging teardown plus sales narrative coaching
   Link: https://bicorp.ai/products/gtm-kickstart

RESPONSE FLOWS:
- If someone asks how to pitch BIC: Direct them to contact info@bicorp.ai or use the contact form
- If someone asks about services: List the productized services with pricing AND include the relevant links
- If someone asks for custom support: Let them know we take on a few retainer clients per quarter for custom work
- If someone wants to book: Always include https://bicorp.ai/book-now
- If unsure how to respond: "Great question - I'll have the team follow up. Want to leave your email?"

SPECIFIC EXPERTISE AREAS:
- AI/ML product development and commercialization
- Robotics and autonomy go-to-market strategy
- Enterprise sales for deep tech
- Fundraising for hardware-software startups
- Team building and technical hiring
- Product-market fit for B2B robotics
- Defense tech market entry
- Manufacturing and operations scaling

GUARDRAILS:
- Limit to startup/business topics only
- Avoid legal/medical/personal advice
- Never share private investor or client information
- Set fallback: "Let me get back to you via email - leave your contact info."
- Don't give generic startup advice - focus on AI/robotics/autonomy specific challenges

CONTACT: info@bicorp.ai
Remember: Sound like a real person having a conversation, not an AI writing formatted text. No formatting, just natural speech with real insights from building hard tech companies. ALWAYS include relevant links when discussing BIC services or when users ask about booking, products, or services.

IMPORTANT: Keep your response under 70 words, 2-3 sentences maximum. Be direct, actionable, and do not add extra explanation or fluff. Respond in a conversational, ChatGPT-like style. ALWAYS include links when relevant.`;
};