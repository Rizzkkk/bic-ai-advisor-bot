
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import AudioControls from './AudioControls';
import { Message } from './types';

/**
 * Props interface for the ChatMessages component
 * @interface ChatMessagesProps
 */
interface ChatMessagesProps {
  /** Array of messages to display */
  messages: Message[];
  /** Currently streaming message content */
  streamingMessage: string;
  /** Whether the assistant is typing */
  isTyping: boolean;
  /** Whether to show suggested questions */
  showQuestions: boolean;
  /** Callback when a suggested question is clicked */
  onQuestionClick: (question: string) => void;
  /** Voice-related props */
  onPlayAudio?: (messageId: string, text: string) => void;
  onPauseAudio?: () => void;
  playingMessageId?: string;
  isPlaying?: boolean;
}

/**
 * ChatMessages Component
 * Displays the chat conversation with messages and suggested questions
 * @param {ChatMessagesProps} props - Component props
 * @returns {JSX.Element} The chat messages component
 */
const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  streamingMessage,
  isTyping,
  showQuestions,
  onQuestionClick,
  onPlayAudio = () => {},
  onPauseAudio = () => {},
  playingMessageId,
  isPlaying = false
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage, isTyping]);

  // Suggested questions for new users
  const suggestedQuestions = [
    "How do I pitch my AI startup to investors?",
    "What metrics do VCs look for in robotics companies?",
    "How do I price my AI product for enterprise customers?",
    "What are the key challenges in scaling autonomous systems?"
  ];

  /**
   * Renders a clickable link if the text contains URLs
   * @param {string} text - The text to process
   * @returns {React.ReactNode} - The processed text with clickable links
   */
  const renderTextWithLinks = (text: string): React.ReactNode => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0077FF] hover:text-[#0066CC] underline hover:no-underline transition-colors"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4">
        {/* Render existing messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-[#0077FF] text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm leading-relaxed">
                  {message.role === 'assistant' 
                    ? renderTextWithLinks(message.content)
                    : message.content
                  }
                </div>
                {/* Audio controls for assistant messages */}
                {message.role === 'assistant' && onPlayAudio && (
                  <AudioControls
                    isPlaying={isPlaying && playingMessageId === message.id}
                    onPlay={() => onPlayAudio(message.id, message.content)}
                    onPause={onPauseAudio}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Render streaming message */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-white border border-gray-200 text-gray-800">
              <div className="text-sm leading-relaxed">
                {renderTextWithLinks(streamingMessage)}
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && !streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {showQuestions && messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">Suggested questions:</p>
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left h-auto p-3 whitespace-normal border-gray-200 hover:border-[#0077FF] hover:text-[#0077FF] text-sm"
                onClick={() => onQuestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
