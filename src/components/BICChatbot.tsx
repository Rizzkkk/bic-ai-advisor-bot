
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { OpenAIService, createSystemPrompt, type ChatMessage } from '@/utils/openaiService';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface BICChatbotProps {
  apiKey?: string;
  stripeKey?: string;
}

const BICChatbot: React.FC<BICChatbotProps> = ({ apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const premadeQuestions = [
    "How do I pitch my AI startup to BIC?",
    "What services do you offer for fundraising?", 
    "Can you help with go-to-market strategy?",
    "What makes a good robotics startup?",
    "How should I structure my Series A round?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hi! I'm here to help with questions about AI, robotics, and startup strategy. What can I help you with today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!apiKey && isOpen && !showApiKeyInput) {
      setShowApiKeyInput(true);
    }
  }, [apiKey, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const currentApiKey = apiKey || userApiKey;
    if (!currentApiKey) {
      setShowApiKeyInput(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    setShowQuestions(false);

    try {
      const openaiService = new OpenAIService({
        apiKey: currentApiKey,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500
      });

      // Build conversation history for context
      const chatMessages: ChatMessage[] = [
        {
          role: 'system',
          content: createSystemPrompt()
        },
        ...messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: content.trim()
        }
      ];

      const response = await openaiService.sendMessage(chatMessages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please check your API key or reach out to our team at info@bicorp.ai and we'll get back to you quickly.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleApiKeySubmit = () => {
    if (userApiKey.trim()) {
      setShowApiKeyInput(false);
    }
  };

  const ChatBubble = () => (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isOpen ? 'scale-0' : 'scale-100'
      }`}
    >
      <Button
        onClick={() => setIsOpen(true)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0077FF] to-[#0066CC] hover:from-[#0066CC] hover:to-[#0055AA] shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none hover:scale-105"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </Button>
    </div>
  );

  const ChatWindow = () => (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      } ${isMinimized ? 'h-16' : 'h-[550px]'} w-96 max-w-[calc(100vw-2rem)] sm:max-w-96`}
    >
      <Card className="h-full bg-white shadow-2xl border-0 overflow-hidden rounded-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0077FF] to-[#00E89D] p-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Chat with Bibhrajit</h3>
                <p className="text-white/80 text-sm">BIC Investment Corp</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
              {/* API Key Input */}
              {showApiKeyInput && !apiKey && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-blue-800">Enter your OpenAI API key to start chatting:</p>
                  <Input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="text-sm"
                  />
                  <Button
                    onClick={handleApiKeySubmit}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Start Chat
                  </Button>
                  <p className="text-xs text-blue-600">
                    Your API key is stored locally and never shared. Get one at openai.com
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-[#0077FF] text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {/* Premade Questions */}
              {showQuestions && messages.length <= 1 && !showApiKeyInput && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Quick questions to get started:</p>
                  {premadeQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionClick(question)}
                      className="w-full text-left justify-start text-sm h-auto py-2 px-3 border-[#0077FF]/20 text-[#0077FF] hover:bg-[#0077FF]/5"
                      disabled={!apiKey && !userApiKey}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t bg-gray-50 flex-shrink-0">
              <div className="flex space-x-2 mb-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about AI startups, funding, or strategy..."
                  className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
                  disabled={isLoading || (!apiKey && !userApiKey)}
                />
                <Button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading || (!apiKey && !userApiKey)}
                  className="bg-[#0077FF] hover:bg-[#0066CC] rounded-full w-9 h-9 p-0 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Powered by BIC AI • info@bicorp.ai
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );

  return (
    <>
      <ChatBubble />
      <ChatWindow />
    </>
  );
};

export default BICChatbot;
