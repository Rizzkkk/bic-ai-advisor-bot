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
import ChatBubble from './components/chat/ChatBubble';
import ChatWindow from './components/chat/ChatWindow';
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

    // Apply iframe-specific styles with AGGRESSIVE transparency enforcement
    if (embedded) {
      const forceTransparency = () => {
        // Force transparency on all possible elements
        const elementsToMakeTransparent = [
          document.body,
          document.documentElement,
          document.getElementById('root'),
          ...Array.from(document.querySelectorAll('div')),
          ...Array.from(document.querySelectorAll('[class*="bg-"]')),
          ...Array.from(document.querySelectorAll('[data-radix-portal]')),
        ].filter(Boolean);

        elementsToMakeTransparent.forEach(element => {
          if (element && !element.classList.contains('chat-window') && 
              !element.classList.contains('embedded-chat-window') && 
              !element.classList.contains('chat-bubble')) {
            element.style.background = 'transparent';
            element.style.backgroundColor = 'transparent';
          }
        });

        // Set basic layout styles
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.height = '100vh';
        document.body.style.width = '100vw';
        document.body.style.overflow = 'hidden';
        
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.height = '100%';
          rootElement.style.width = '100%';
        }
      };

      // Apply immediately
      forceTransparency();
      
      // Apply after a short delay to catch any late-loading elements
      setTimeout(forceTransparency, 100);
      
      // Watch for DOM changes and reapply transparency
      const observer = new MutationObserver(() => {
        forceTransparency();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      return () => observer.disconnect();
    }
  }, []);

  /**
   * Effect to show welcome message when chat is first opened
   */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hi! I'm Bibhrajit from BIC. I help AI, robotics, and autonomy founders raise capital and scale their companies. What can I help you with today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Add dark mode detection and class application with AGGRESSIVE transparency preservation
  useEffect(() => {
    const root = document.documentElement;
    if (!root) return;
    
    function applyTheme() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('System dark mode detected:', isDark);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // CRITICAL: Force transparency regardless of theme
      if (isEmbedded) {
        const forceTransparencyAfterTheme = () => {
          // Target all possible background elements
          const allElements = [
            document.body,
            document.documentElement,
            document.getElementById('root'),
            ...Array.from(document.querySelectorAll('*'))
          ].filter(Boolean);

          allElements.forEach(element => {
            if (element && 
                !element.classList.contains('chat-window') && 
                !element.classList.contains('embedded-chat-window') && 
                !element.classList.contains('chat-bubble')) {
              element.style.background = 'transparent';
              element.style.backgroundColor = 'transparent';
            }
          });
        };

        // Apply immediately and after a delay
        forceTransparencyAfterTheme();
        setTimeout(forceTransparencyAfterTheme, 50);
        setTimeout(forceTransparencyAfterTheme, 200);
      }
    }
    
    applyTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    
    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [isEmbedded]);

  /**
   * Handles sending messages to the AI service through Supabase Edge Functions
   * @param {string} content - The message content to send
   */
  const sendMessage = async (content: string) => {
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
  };

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
   * Handle closing the chat widget
   */
  const handleCloseChat = () => {
    if (isEmbedded) {
      setIsOpen(false);
      setIsMinimized(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div 
      className={`${isEmbedded ? "h-full w-full overflow-hidden" : ""}`} 
      style={{ 
        background: 'transparent', 
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Chat bubble - show in both modes when chat is closed */}
      {(!isOpen || !isEmbedded) && (
        <ChatBubble 
          isOpen={isOpen}
          onOpen={handleOpenChat}
        />
      )}
      
      {/* Main chat window - only show when open */}
      {isOpen && (
        <ChatWindow
          isOpen={isOpen}
          isMinimized={false}
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isLoading}
          isTyping={isTyping}
          showQuestions={showQuestions}
          onMinimize={() => {}}
          onClose={handleCloseChat}
          onSendMessage={sendMessage}
          onQuestionClick={handleQuestionClick}
          isEmbedded={isEmbedded}
        />
      )}
    </div>
  );
};

export default ChatApplication;