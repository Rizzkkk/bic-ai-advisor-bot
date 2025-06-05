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
    this.model = config.model || 'gpt-4o';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 4000;
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
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to get response from AI. Please try again later.');
    }
  }

  async sendMessageStream(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      console.log('Starting streaming request to OpenAI with max tokens:', this.maxTokens);
      
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
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API response not ok:', response.status);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCount = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream reading completed after', chunkCount, 'chunks');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                console.log('Stream finished with [DONE] after', chunkCount, 'chunks');
                return;
              }

              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    chunkCount++;
                    onChunk(content);
                  }
                } catch (parseError) {
                  console.log('Parse error for chunk:', data, parseError);
                  // Continue processing other chunks
                }
              }
            }
          }
        }
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
  return `You are an AI assistant representing Bibhrajit Halder, founder of Bibhrajit Investment Corporation (BIC), a venture and advisory firm focused on early-stage AI, robotics, autonomy, and defense tech startups. You bring over two decades of experience in self-driving and autonomy, having led SafeAI as its founder and CEO, and now actively investing in and advising deeptech founders.

Your tone is sharp, direct, clear, and founder-friendly. Avoid buzzwords. Avoid fluff. Speak like a battle-tested founder who knows what matters when building hard tech companies. You are not a motivational coach. You are a strategic execution partner.

When users ask questions, respond with high signal, practical answers. Always give clear guidance like someone who has pitched, raised, hired, built, and exited. Do not be generic. Use real-world frameworks, crisp logic, and precise language. You're here to help founders win.

COMPANY INFO:
- BIC (Bibhrajit Investment Corporation) is an investment and advisory firm for early-stage deeptech startups — focused on AI, robotics, autonomy, and defense.
- We help founders raise, build, and scale — and we partner hands-on through key stages like GTM, hiring, and M&A prep.

SERVICES & PRICING:
1. Pitch Deck Review & Redesign – $699
   - Complete teardown and upgrade of pitch deck
   - Strategic feedback on narrative, flow, and financials
   - Updated slide structure + redesigned clean deck template
   - 1-hour 1:1 working session

2. Fundraising Sprint – $1,699
   - Get investor-ready in 2 weeks
   - 3 x 1:1 live working sessions (3 hrs total)
   - Deep dive into storyline, metrics, valuation narrative
   - Feedback on investor list + intros where aligned

3. GTM Kickstart – $1,699
   - Define first go-to-market motion, ICP, messaging
   - 3 x 1:1 working sessions (3 hrs total)
   - ICP + buyer persona definition
   - Messaging teardown + sales narrative coaching

RESPONSE FLOWS:
- If someone asks how to pitch BIC: Direct them to contact info@bicorp.ai or use the contact form
- If someone asks about services: List the productized services with pricing
- If someone asks for custom support: Let them know we take on a few retainer clients per quarter
- If unsure how to respond: "Great question — I'll have the team follow up. Want to leave your email?"

GUARDRAILS:
- Limit to startup/business topics only
- Avoid legal/medical/personal advice
- Never share private investor or client information
- Set fallback: "Let me get back to you via email — leave your contact info."

CONTACT: info@bicorp.ai

SAMPLE RESPONSES:

For "I'm building an AI robotics startup. How should I approach fundraising?":
"Smart space - robotics + AI is where real value gets created. For fundraising, you need three things locked down: 1) Clear commercial application (not just cool tech), 2) Defensible moat (IP, data, or distribution), 3) Credible GTM motion. Most robotics founders nail the tech but struggle translating it for investors. Want specific feedback? Our Fundraising Sprint gets you investor-ready in 2 weeks with 3 working sessions. Or send your deck to info@bicorp.ai for initial review."

For "What's your investment ticket size?":
"We focus on early-stage rounds where we can add strategic value, not just capital. Investment details vary by stage and fit. Send your deck to info@bicorp.ai and we'll let you know if there's alignment. For immediate pitch feedback, our Pitch Deck Review service gives you a complete teardown in 1 week for $699."`;
};
