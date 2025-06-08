/**
 * Represents a chat message in the conversation
 * @interface Message
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** The actual content/text of the message */
  content: string;
  /** Indicates whether the message is from the user or the AI assistant */
  role: 'user' | 'assistant';
  /** When the message was sent/received */
  timestamp: Date;
}

/**
 * Props interface for the BIC Chatbot component
 * @interface BICChatbotProps
 */
export interface BICChatbotProps {
  /** Optional API key for authentication with the chat service */
  apiKey?: string;
}
