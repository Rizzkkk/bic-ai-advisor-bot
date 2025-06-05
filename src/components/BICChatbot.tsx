import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { OpenAIService, createSystemPrompt, type ChatMessage } from '@/utils/openaiService';
import ServiceButtons from '@/components/ServiceButtons';
import ContactForm from '@/components/ContactForm';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  showServices?: boolean;
  showContactForm?: boolean;
}

interface BICChatbotProps {
  apiKey?: string;
}

const BICChatbot: React.FC<BICChatbotProps> = ({ apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the provided API key as default
  const defaultApiKey = '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';

  const premadeQuestions = [
    "How do I pitch my AI startup to BIC?",
    "What services do you offer for fundraising?", 
    "Can you help with go-to-market strategy?",
    "What makes a good robotics startup?",
    "How should I structure my Series A round?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

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
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectResponseType = (content: string) => {
    const lowerContent = content.toLowerCase();
    
    const serviceKeywords = [
      'pitch deck review', 'fundraising sprint', 'gtm kickstart',
      '$699', '$1,699', 'services', 'productized'
    ];
    
    const contactKeywords = [
      'info@bicorp.ai', 'contact form', 'send your deck',
      'email us', 'get in touch', 'reach out'
    ];
    
    const hasServiceKeywords = serviceKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );
    
    const hasContactKeywords = contactKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );
    
    return {
      showServices: hasServiceKeywords,
      showContactForm: hasContactKeywords
    };
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const currentApiKey = apiKey || defaultApiKey;
    console.log('Starting message send with API key available:', !!currentApiKey);

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
    setStreamingMessage('');

    try {
      const openaiService = new OpenAIService({
        apiKey: currentApiKey,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 800
      });

      // Build conversation history (keep last 10 messages for context)
      const recentMessages = messages.slice(-10);
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

      console.log('Sending to OpenAI with', chatMessages.length, 'messages');

      let fullResponse = '';
      let chunkCount = 0;

      await openaiService.sendMessageStream(chatMessages, (chunk: string) => {
        chunkCount++;
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
        console.log('Received chunk', chunkCount, 'length:', chunk.length);
      });

      console.log('Streaming complete. Total response length:', fullResponse.length);

      if (!fullResponse.trim()) {
        throw new Error('Empty response from AI');
      }

      const responseType = detectResponseType(fullResponse);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fullResponse,
        role: 'assistant',
        timestamp: new Date(),
        showServices: responseType.showServices,
        showContactForm: responseType.showContactForm
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');
      console.log('Message successfully added to conversation');

    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please reach out directly to our team at info@bicorp.ai and we'll get back to you quickly.",
        role: 'assistant',
        timestamp: new Date(),
        showContactForm: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    console.log('Question clicked:', question);
    sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleServiceSelect = (service: any) => {
    console.log('Service selected:', service.name);
  };

  const handleContactSubmit = (data: any) => {
    console.log('Contact form submitted:', data);
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
        data-chat-bubble="true"
      >
        <img 
          src="/bic-logo.png" 
          alt="BIC" 
          className="w-8 h-8 object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
            (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
        <MessageCircle className="w-7 h-7 text-white hidden" />
      </Button>
    </div>
  );

  const ChatWindow = () => (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      } ${isMinimized ? 'h-16' : 'h-[600px]'} w-96 max-w-[calc(100vw-2rem)] sm:max-w-96`}
    >
      <Card className="h-full bg-white shadow-2xl border-0 overflow-hidden rounded-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0077FF] to-[#00E89D] p-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                <img 
                  src="/bic-logo.png" 
                  alt="BIC" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <MessageCircle className="w-6 h-6 text-[#0077FF] hidden" />
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
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
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

                  {message.showServices && (
                    <div className="mb-3">
                      <ServiceButtons onServiceSelect={handleServiceSelect} />
                    </div>
                  )}

                  {message.showContactForm && (
                    <div className="mb-3">
                      <ContactForm 
                        onSubmit={handleContactSubmit}
                        initialMessage="I'd like to learn more about BIC's services."
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
              )}
              
              {showQuestions && messages.length <= 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Quick questions to get started:</p>
                  {premadeQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionClick(question)}
                      className="w-full text-left justify-start text-sm h-auto py-2 px-3 border-[#0077FF]/20 text-[#0077FF] hover:bg-[#0077FF]/5"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}
              
              {isTyping && !streamingMessage && (
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
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex space-x-2 mb-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about AI startups, funding, or strategy..."
                  className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
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
