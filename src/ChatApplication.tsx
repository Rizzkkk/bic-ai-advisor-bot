
/**
 * BICChatbot Component
 * This is the main component that orchestrates the entire chatbot user interface and its core functionalities.
 * It manages the chatbot's state, including whether it's open, minimized, the conversation history,
 * and loading/typing indicators. This component handles user input, sends messages to the AI service
 * via Supabase Edge Functions, and displays the streamed responses in real-time.
 * It integrates various chat-related sub-components to form the complete chatbot experience.
 */

import React, { useState, useEffect } from 'react';
import { OpenAIService, createSystemPrompt, type ChatMessage } from '@/utils/openaiService';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import ChatBubble from './components/chat/ChatBubble';
import ChatWindow from './components/chat/ChatWindow';
import VoiceSettings from './components/chat/VoiceSettings';
import { Message, BICChatbotProps } from './components/chat/types';

/**
 * ChatApplication Component
 * Main component that manages the chat interface and AI interactions through Supabase
 * @param {BICChatbotProps} props - Component props (apiKey is no longer used)
 * @returns {JSX.Element} The complete chat interface
 */
const ChatApplication: React.FC<BICChatbotProps> = () => {
  // State management for chat interface
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  // Voice functionality using custom hook
  const {
    voiceState,
    playingMessageId,
    showVoiceSettings,
    setShowVoiceSettings,
    handleStartRecording,
    handleStopRecording,
    handlePlayAudio,
    handlePauseAudio,
    toggleVoiceMode,
    updateVoiceSettings,
    getVoiceSettings
  } = useVoiceChat(sendMessage);

  /**
   * Effect to check if we're in embedded mode and handle initial state
   */
  useEffect(() => {
    // Check if we're in an iframe or have the embedded parameter
    const isInIframe = window.self !== window.top;
    const hasEmbeddedParam = new URLSearchParams(window.location.search).get('embedded') === 'true';
    const embedded = isInIframe || hasEmbeddedParam;
    
    setIsEmbedded(embedded);
    
    // In embedded mode, start closed and minimized
    if (embedded) {
      setIsOpen(false);
      setIsMinimized(true);
    }

    // Apply iframe-specific styles
    if (embedded) {
      document.body.style.background = 'transparent';
      document.documentElement.style.background = 'transparent';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.height = '100vh';
      document.body.style.width = '100vw';
      document.body.style.overflow = 'hidden';
    }
  }, []);

  /**
   * Effect to show welcome message when chat is first opened
   */
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasWelcomed) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hi! Welcome to BIC! We help AI, robotics, and autonomy founders raise capital and scale their companies. What can we help you today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setHasWelcomed(true);
    }
  }, [isOpen, messages.length, hasWelcomed]);

  /**
   * Handle voice message sending after AI response
   */
  useEffect(() => {
    if (voiceState.voiceMode && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isLoading) {
        // Auto-play the latest AI response if voice mode is enabled
        handlePlayAudio(lastMessage.id, lastMessage.content);
      }
    }
  }, [messages, isLoading, voiceState.voiceMode, handlePlayAudio]);

  /**
   * Handles sending messages to the AI service through Supabase Edge Functions
   * @param {string} content - The message content to send
   */
  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    console.log('Starting message send with content:', content);

    // Create and add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setShowQuestions(false);
    setStreamingMessage('');

    try {
      // Initialize OpenAI service (no API key needed, using Supabase)
      const openaiService = new OpenAIService({
        model: 'gpt-4.1-2025-04-14',
        temperature: 0.7,
        maxTokens: 1000
      });

      // Prepare message history for context
      const recentMessages = messages.slice(-8);
      const chatMessages: ChatMessage[] = [
        {
          role: 'system',
          content: createSystemPrompt()
        },
        ...recentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: content.trim()
        }
      ];

      console.log('Sending to OpenAI through Supabase with', chatMessages.length, 'messages');

      // Stream the AI response
      let fullResponse = '';
      await openaiService.sendMessageStream(chatMessages, (chunk: string) => {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      });

      console.log('Streaming completed. Final response:', fullResponse);

      // Add AI response to chat
      if (fullResponse.trim()) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: fullResponse.trim(),
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No response received');
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please reach out directly to our team at info@bicorp.ai and we'll get back to you quickly.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Reset loading states
      setIsLoading(false);
      setIsTyping(false);
      setStreamingMessage('');
    }
  }

  /**
   * Handles clicking on suggested questions
   * @param {string} question - The selected question
   */
  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  /**
   * Handle opening the chat widget
   */
  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  /**
   * Handle closing the chat widget (X button)
   */
  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setTimeout(() => {
      setMessages([]);
      setHasWelcomed(false);
    }, 500); // Delay reset by 500ms for a reset effect
  };

  /**
   * Minimize chat (hide window, keep messages)
   */
  const handleMinimizeChat = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  return (
    <div className={isEmbedded ? "h-full w-full overflow-hidden" : ""}>
      {/* Chat bubble - show when chat is closed or minimized */}
      {(!isOpen || isMinimized) && (
        <ChatBubble 
          isOpen={isOpen}
          onOpen={handleOpenChat}
        />
      )}
      
      {/* Main chat window - only show when open */}
      {isOpen && (
        <ChatWindow
          isOpen={isOpen}
          isMinimized={isMinimized}
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isLoading}
          isTyping={isTyping}
          showQuestions={showQuestions}
          onMinimize={handleMinimizeChat}
          onClose={handleCloseChat}
          onSendMessage={sendMessage}
          onQuestionClick={handleQuestionClick}
          isEmbedded={isEmbedded}
          // Voice-related props
          voiceMode={voiceState.voiceMode}
          isRecording={voiceState.isRecording}
          isProcessingVoice={voiceState.isProcessing}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onToggleVoiceMode={toggleVoiceMode}
          onPlayAudio={handlePlayAudio}
          onPauseAudio={handlePauseAudio}
          onShowVoiceSettings={() => setShowVoiceSettings(true)}
          playingMessageId={playingMessageId}
          isPlaying={voiceState.isPlaying}
        />
      )}

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        settings={getVoiceSettings()}
        onUpdateSettings={updateVoiceSettings}
      />
    </div>
  );
};

export default ChatApplication;
