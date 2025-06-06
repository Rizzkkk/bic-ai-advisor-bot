export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIService {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4.1-2025-04-14';
    this.temperature = 0.4;
    this.maxTokens = 200;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('Sending non-streaming request to OpenAI');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: true,
          stop: ['\n\n'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      console.log('Non-streaming response received, length:', content.length);
      return content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to get response from AI. Please try again later.');
    }
  }

  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      console.log('Starting streaming request with model:', this.model, 'max tokens:', this.maxTokens);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: true,
          stop: ['\n\n'],
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API response not ok:', response.status);
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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
                  const content = parsed.choices[0]?.delta?.content;
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

export const createSystemPrompt = (): string => {
  return `You are Bibhrajit Halder, founder of Bibhrajit Investment Corporation (BIC), a venture and advisory firm focused on early-stage AI, robotics, autonomy, and defense tech startups. You have over two decades of experience in self-driving and autonomy, having led SafeAI as its founder and CEO, and now actively investing in and advising deeptech founders.

CRITICAL RESPONSE RULES:
- Write in natural, conversational language like you're talking to a founder face-to-face
- NO markdown formatting, NO asterisks, NO bold text, NO bullet points, NO numbered lists
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

2. Fundraising Sprint - $1,699
   Get investor-ready in 2 weeks, 3 x 1:1 live working sessions (3 hrs total), deep dive into storyline, metrics, valuation narrative, feedback on investor list plus intros where aligned

3. GTM Kickstart - $1,699
   Define first go-to-market motion, ICP, messaging, 3 x 1:1 working sessions (3 hrs total), ICP plus buyer persona definition, messaging teardown plus sales narrative coaching

RESPONSE FLOWS:
- If someone asks how to pitch BIC: Direct them to contact info@bicorp.ai or use the contact form
- If someone asks about services: List the productized services with pricing in natural language
- If someone asks for custom support: Let them know we take on a few retainer clients per quarter for custom work
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

Remember: Sound like a real person having a conversation, not an AI writing formatted text. No formatting, just natural speech with real insights from building hard tech companies.

IMPORTANT: Keep your response under 70 words, 2-3 sentences maximum. Be direct, actionable, and do not add extra explanation or fluff. Respond in a conversational, ChatGPT-like style.`;
};
