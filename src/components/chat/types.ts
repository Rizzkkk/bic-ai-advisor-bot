
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface BICChatbotProps {
  apiKey?: string;
}
