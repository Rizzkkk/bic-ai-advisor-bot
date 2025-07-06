
/**
 * Main ChatApplication Component with AI Avatar Integration
 */

import React, { useState, useEffect } from 'react';
import { OpenAIService, createSystemPrompt, type ChatMessage } from '@/utils/openaiService';
import ChatBubble from './components/chat/ChatBubble';
import ChatWindow from './components/chat/ChatWindow';
import { Message, BICChatbotProps } from './components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { simpleTTSService } from '@/utils/SimpleTTSService';

const ChatApplication: React.FC<BICChatbotProps> = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [isAvatarMode, setIsAvatarMode] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [contextSources, setContextSources] = useState<string[]>([]);

  // Check embedded mode
  useEffect(() => {
    const isInIframe = window.self !== window.top;
    const hasEmbeddedParam = new URLSearchParams(window.location.search).get('embedded') === 'true';
    const embedded = isInIframe || hasEmbeddedParam;
    
    setIsEmbedded(embedded);
    
    if (embedded) {
      setIsOpen(false);
      setIsMinimized(true);
      document.body.style.background = 'transparent';
      document.documentElement.style.background = 'transparent';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.height = '100vh';
      document.body.style.width = '100vw';
      document.body.style.overflow = 'hidden';
    }
  }, []);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasWelcomed) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: isAvatarMode 
          ? "Hi! I'm Bibhrajit Halder, managing partner at BIC. I help founders in AI, robotics, and autonomy raise capital and scale their companies. Drawing from my experience in M&A, fundraising, and strategic consulting, what can I help you with today?"
          : "Hi! Welcome to BIC! We help AI, robotics, and autonomy founders raise capital and scale their companies. What can we help you today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setHasWelcomed(true);

      // Auto-play welcome message in Avatar mode
      if (isAvatarMode) {
        setTimeout(() => {
          simpleTTSService.speak(welcomeMessage.content, 'nova').catch(error => {
            console.error('Welcome TTS failed:', error);
          });
        }, 500);
      }
    }
  }, [isOpen, messages.length, hasWelcomed, isAvatarMode]);

  // Send message function
  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    console.log('Sending message:', content, 'Avatar mode:', isAvatarMode);

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
        // Use enhanced chat with RAG
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

        console.log('Invoking enhanced-chat-completion with:', { messages: chatMessages, sessionId, useRAG: true });

        const response = await fetch('https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/enhanced-chat-completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs',
          },
          body: JSON.stringify({ 
            messages: chatMessages,
            sessionId,
            useRAG: true
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Enhanced chat completion error:', response.status, errorText);
          throw new Error(`Avatar chat failed: ${response.status}`);
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

          // Auto-play TTS in Avatar mode with delay to ensure message is added
          setTimeout(async () => {
            try {
              console.log('Starting TTS for Avatar response...');
              await simpleTTSService.speak(fullResponse.trim(), 'nova');
              console.log('TTS completed successfully');
            } catch (error) {
              console.error('TTS failed:', error);
            }
          }, 100);
        }

      } else {
        // Use standard OpenAI
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
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: isAvatarMode 
          ? "I'm having trouble with my Avatar connection right now. Let me try switching to standard mode to help you better."
          : "I'm having trouble connecting right now. Please reach out directly to our team at info@bicorp.ai and we'll get back to you quickly.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);

      // If Avatar mode fails, suggest switching to standard mode
      if (isAvatarMode) {
        setTimeout(() => {
          setIsAvatarMode(false);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setStreamingMessage('');
    }
  }

  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    // Stop any playing audio
    simpleTTSService.stop();
    setTimeout(() => {
      setMessages([]);
      setHasWelcomed(false);
    }, 500);
  };

  const handleMinimizeChat = () => {
    setIsOpen(false);
    setIsMinimized(true);
    // Stop any playing audio
    simpleTTSService.stop();
  };

  const handleAvatarToggle = (enabled: boolean) => {
    console.log('Avatar mode toggled:', enabled);
    setIsAvatarMode(enabled);
    
    // Stop any currently playing audio
    simpleTTSService.stop();
    
    // Reset conversation for clean Avatar experience
    setMessages([]);
    setHasWelcomed(false);
    setShowQuestions(true);
  };

  return (
    <div className={isEmbedded ? "h-full w-full overflow-hidden" : ""}>
      {(!isOpen || isMinimized) && (
        <ChatBubble 
          isOpen={isOpen}
          onOpen={handleOpenChat}
        />
      )}
      
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
          isAvatarMode={isAvatarMode}
          onAvatarToggle={handleAvatarToggle}
          contextSources={contextSources}
        />
      )}
    </div>
  );
};

export default ChatApplication;
