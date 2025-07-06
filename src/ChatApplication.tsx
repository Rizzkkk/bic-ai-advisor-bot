import React, { useState, useEffect } from 'react';
import { OpenAIService, createSystemPrompt, type ChatMessage } from '@/utils/openaiService';
import ChatBubble from './components/chat/ChatBubble';
import ChatWindow from './components/chat/ChatWindow';
import { AvatarChat } from './components/avatar';
import { Message, BICChatbotProps } from './components/chat/types';

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
    }
  }, [isOpen, messages.length, hasWelcomed, isAvatarMode]);

  // Standard chat message function
  async function sendStandardMessage(content: string) {
    if (!content.trim() || isLoading) return;

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

    } catch (error) {
      console.error('Error sending standard message:', error);
      
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

  // Avatar message function - simpler, let AvatarChat handle the complexity
  async function sendAvatarMessage(content: string) {
    if (!content.trim() || isLoading) return;

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

    // Let AvatarChat handle the API call and response
    // This is just for UI state management
    setTimeout(() => {
      setIsLoading(false);
      setIsTyping(false);
      setStreamingMessage('');
    }, 1000);
  }

  const sendMessage = isAvatarMode ? sendAvatarMessage : sendStandardMessage;

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
    setTimeout(() => {
      setMessages([]);
      setHasWelcomed(false);
    }, 500);
  };

  const handleMinimizeChat = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleAvatarToggle = (enabled: boolean) => {
    console.log('Avatar mode toggled:', enabled);
    setIsAvatarMode(enabled);
    
    // Reset conversation for clean experience
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
        <div className={isEmbedded ? "fixed inset-0 z-50 h-full w-full" : `fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out scale-100 opacity-100 pointer-events-auto h-[500px] w-[350px] max-w-[calc(100vw-2rem)] sm:max-w-[350px]`}>
          {isAvatarMode ? (
            <div className="h-full overflow-hidden flex flex-col bg-white rounded-lg shadow-lg border">
              {/* Avatar Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">BH</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Bibhrajit AI Avatar</h3>
                      <p className="text-xs opacity-90">RAG Enhanced • Live</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAvatarToggle(false)}
                      className="text-white/80 hover:text-white text-xs px-2 py-1 rounded"
                    >
                      Standard
                    </button>
                    <button
                      onClick={handleCloseChat}
                      className="text-white/80 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Avatar Chat Component */}
              <AvatarChat
                messages={messages}
                streamingMessage={streamingMessage}
                isLoading={isLoading}
                isTyping={isTyping}
                onSendMessage={sendMessage}
                sessionId={sessionId}
              />
            </div>
          ) : (
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
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatApplication;
