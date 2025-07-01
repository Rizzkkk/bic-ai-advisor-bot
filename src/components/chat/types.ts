/**
 * Type Definitions for Chat Components
 * This file contains TypeScript interface and type definitions used across the chatbot's UI components.
 * It ensures type safety and consistency for data structures like chat messages, component props,
 * and other related data, facilitating better code organization and maintainability.
 */

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

/**
 * Voice-related state and settings
 */
export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  voiceMode: boolean;
}

export interface VoiceSettings {
  voice: string;
  speed: number;
  autoPlay: boolean;
  pushToTalk: boolean;
}
