
import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  streamingMessage: string;
  isTyping: boolean;
  showQuestions: boolean;
  onQuestionClick: (question: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  isTyping,
  showQuestions,
  onQuestionClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  const premadeQuestions = [
    "How do I pitch my AI startup to BIC?",
    "What services do you offer for fundraising?", 
    "Can you help with go-to-market strategy?",
    "What makes a good robotics startup?",
    "How should I structure my Series A round?"
  ];

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      userScrolledRef.current = !isAtBottom;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!userScrolledRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  return (
    <div 
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0"
    >
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
        </div>
      ))}

      {streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-[85%] p-3 rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 whitespace-pre-wrap">
            {streamingMessage}
            <span className="animate-pulse ml-1">●</span>
          </div>
        </div>
      )}
      
      {showQuestions && messages.length <= 1 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">Quick questions to get started:</p>
          {premadeQuestions.map((question, index) => (
            <Button
              key={index}
              onClick={() => onQuestionClick(question)}
              className="w-full text-left justify-start text-sm h-auto py-2 px-3 border-[#0077FF]/20 text-[#0077FF] hover:bg-[#0077FF]/5 bg-transparent"
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
  );
};

export default ChatMessages;
