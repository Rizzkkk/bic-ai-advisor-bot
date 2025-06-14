/**
 * Chat Messages Component
 * This component is responsible for rendering the list of messages in the chat window.
 * It displays both user and AI-generated messages, handles streaming updates for AI responses,
 * and ensures the chat scrolls to the latest message for a continuous conversation flow.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Message } from './types';

/**
 * Props interface for the ChatMessages component
 * @interface ChatMessagesProps
 */
interface ChatMessagesProps {
  /** Array of chat messages to display */
  messages: Message[];
  /** Currently streaming message content */
  streamingMessage: string;
  /** Indicates if the assistant is currently typing */
  isTyping: boolean;
  /** Controls visibility of suggested questions */
  showQuestions: boolean;
  /** Callback function when a suggested question is clicked */
  onQuestionClick: (question: string) => void;
}

/**
 * ChatMessages Component
 * Renders the chat message history with support for streaming messages and suggested questions
 * @param {ChatMessagesProps} props - Component props
 * @returns {JSX.Element} The chat messages component
 */
const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  isTyping,
  showQuestions,
  onQuestionClick
}) => {
  // Refs for scroll management
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  /**
   * Predefined questions to help users get started
   * @type {string[]}
   */
  const premadeQuestions = [
    "How do I pitch my AI startup to BIC?",
    "What services do you offer for fundraising?", 
    "Can you help with go-to-market strategy?"
  ];

  /**
   * Handles scroll events to detect if user has manually scrolled
   * Updates userScrolledRef to prevent auto-scrolling if user is reading previous messages
   */
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      userScrolledRef.current = !isAtBottom;
    }
  }, []);

  /**
   * Scrolls to the bottom of the messages container
   * Only scrolls if user hasn't manually scrolled up
   */
  const scrollToBottom = useCallback(() => {
    if (!userScrolledRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll when new messages arrive or streaming message updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  // Utility to auto-link URLs in text
  function linkify(text: string) {
    const urlRegex = /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/g;
    return text.split(urlRegex).map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0077FF] underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  }

  return (
    <div 
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0"
    >
      {/* Render chat message history */}
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
              {linkify(message.content)}
            </div>
          </div>
        </div>
      ))}

      {/* Display streaming message with typing indicator */}
      {streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-[85%] p-3 rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 whitespace-pre-wrap">
            {linkify(streamingMessage)}
            <span className="animate-pulse ml-1">●</span>
          </div>
        </div>
      )}
      
      {/* Show suggested questions for new conversations */}
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
      
      {/* Display typing indicator when assistant is typing */}
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
      
      {/* Invisible element for scroll management */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
