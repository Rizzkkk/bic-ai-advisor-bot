
import { Message } from '@/components/chat/types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AvatarService {
  private readonly apiUrl = 'https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/enhanced-chat-completion';
  private readonly apiKey = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs';

  async sendMessage(content: string, previousMessages: Message[], sessionId: string): Promise<string | null> {
    try {
      console.log('AvatarService: Sending message to enhanced chat completion');

      // Prepare messages for API
      const chatMessages: ChatMessage[] = [
        ...previousMessages.slice(-8).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: content.trim()
        }
      ];

      const requestBody = {
        messages: chatMessages,
        sessionId,
        useRAG: true
      };

      console.log('AvatarService: Request payload:', requestBody);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AvatarService: API error:', response.status, errorText);
        throw new Error(`Avatar API failed: ${response.status}`);
      }

      // Handle streaming response
      let fullResponse = '';
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
              }
            } catch (parseError) {
              // Skip malformed JSON
            }
          }
        }
      }

      console.log('AvatarService: Received response:', fullResponse.substring(0, 100));
      return fullResponse.trim() || null;

    } catch (error) {
      console.error('AvatarService: Error:', error);
      return null;
    }
  }
}
