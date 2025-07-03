/**
 * Enhanced ChatApplication Component with AI Avatar Integration
 * This component now includes the complete 7-phase AI Avatar implementation
 * integrating RAG, personalization, and content management capabilities.
 */

import React, { useState, useEffect } from 'react';
import { OpenAIService, createSystemPrompt, type ChatMessage } from '@/utils/openaiService';
import ChatBubble from './components/chat/ChatBubble';
import ChatWindow from './components/chat/ChatWindow';
import { Message, BICChatbotProps } from './components/chat/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced ChatApplication Component
 * Now includes AI Avatar mode with RAG-powered responses from Bibhrajit's content
 */
const ChatApplication: React.FC<BICChatbotProps> = () => {
  // Existing state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  // New Avatar-specific state
  const [isAvatarMode, setIsAvatarMode] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [contextSources, setContextSources] = useState<string[]>([]);
  
  // Voice settings state
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'nova',
    speed: 1.0,
    autoPlay: false,
    pushToTalk: false
  });

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
   * Enhanced sendMessage function with Avatar mode support
   * Uses either standard OpenAI or enhanced RAG-powered responses
   */
  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    console.log('Starting message send with content:', content, 'Avatar mode:', isAvatarMode);

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
    setContextSources([]);

    try {
      if (isAvatarMode) {
        // Use enhanced chat completion with RAG
        console.log('Using Avatar mode with RAG enhancement');
        
        const recentMessages = messages.slice(-8);
        const chatMessages: ChatMessage[] = [
          ...recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: content.trim()
          }
        ];

        const { data, error } = await supabase.functions.invoke('enhanced-chat-completion', {
          body: { 
            messages: chatMessages,
            sessionId,
            useRAG: true
          }
        });

        if (error) throw error;

        // Handle streaming response
        let fullResponse = '';
        const reader = data.getReader();
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
                  setStreamingMessage(fullResponse);
                }
              } catch (parseError) {
                // Skip malformed JSON
              }
            }
          }
        }

        if (fullResponse.trim()) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: fullResponse.trim(),
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
        }

      } else {
        // Use standard OpenAI service
        console.log('Using standard chat mode');
        
        const openaiService = new OpenAIService({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 1000
        });

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

        let fullResponse = '';
        await openaiService.sendMessageStream(chatMessages, (chunk: string) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        });

        if (fullResponse.trim()) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: fullResponse.trim(),
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please reach out directly to our team at info@bicorp.ai and we'll get back to you quickly.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
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

  /**
   * Toggle between standard and Avatar modes
   */
  const handleAvatarToggle = (enabled: boolean) => {
    setIsAvatarMode(enabled);
    
    // Update welcome message based on mode
    if (enabled && messages.length <= 1) {
      const avatarWelcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hi! I'm Bibhrajit Halder, managing partner at BIC. I help founders in AI, robotics, and autonomy raise capital and scale their companies. Drawing from my experience in M&A, fundraising, and strategic consulting, what can I help you with today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([avatarWelcomeMessage]);
    } else if (!enabled && messages.length <= 1) {
      const standardWelcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hi! Welcome to BIC! We help AI, robotics, and autonomy founders raise capital and scale their companies. What can we help you today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([standardWelcomeMessage]);
    }
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
          // New Avatar props
          isAvatarMode={isAvatarMode}
          onAvatarToggle={handleAvatarToggle}
          contextSources={contextSources}
        />
      )}
    </div>
  );
};

export default ChatApplication;
