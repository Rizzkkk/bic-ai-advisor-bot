
/**
 * Enhanced Type Definitions for Chat Components
 * Now includes Avatar mode and RAG-specific types
 */

/**
 * Represents a chat message in the conversation
 */
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  contextSources?: string[];
  confidence?: number;
}

/**
 * Enhanced props interface for the BIC Chatbot component
 */
export interface BICChatbotProps {
  apiKey?: string;
  isAvatarMode?: boolean;
  onAvatarToggle?: (enabled: boolean) => void;
}

/**
 * Content source types for the Avatar system
 */
export interface ContentSource {
  id: string;
  name: string;
  type: 'article' | 'document' | 'audio' | 'social_post' | 'email' | 'strategic_doc';
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  upload_date: string;
  source_url?: string;
  raw_content?: string;
  metadata: Record<string, any>;
}

/**
 * Content chunk with embedding information
 */
export interface ContentChunk {
  id: string;
  source_id: string;
  chunk_index: number;
  content: string;
  token_count?: number;
  domain: 'leadership' | 'mna' | 'consulting' | 'strategy' | 'investing' | 'personal_philosophy';
  embedding?: number[];
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * RAG retrieval result
 */
export interface RetrievalResult {
  id: string;
  content: string;
  domain: string;
  similarity: number;
  source_id: string;
  metadata: Record<string, any>;
}

/**
 * Avatar interaction tracking
 */
export interface AvatarInteraction {
  id: string;
  session_id: string;
  user_query: string;
  retrieved_chunks: string[];
  generated_response: string;
  response_rating?: number;
  feedback_text?: string;
  tone_score?: number;
  relevance_score?: number;
  response_time_ms?: number;
  created_at: string;
}

/**
 * Voice settings for TTS integration
 */
export interface VoiceSettings {
  voice: string;
  speed: number;
  autoPlay: boolean;
  pushToTalk: boolean;
}

/**
 * Processing pipeline status
 */
export interface ProcessingLog {
  id: string;
  source_id: string;
  stage: 'upload' | 'chunk' | 'clean' | 'embed' | 'index' | 'complete';
  status: 'started' | 'completed' | 'failed';
  message?: string;
  processing_time_ms?: number;
  created_at: string;
}
