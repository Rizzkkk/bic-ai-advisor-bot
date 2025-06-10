
/**
 * Chat Window Component
 * This component represents the main interface of the chatbot, containing the conversation display,
 * message input area, and control buttons (minimize/close).
 * It orchestrates the layout and interaction of various chat-related sub-components.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Message } from './types';

/**
 * Props interface for the ChatWindow component
 * @interface ChatWindowProps
 */
interface ChatWindowProps {
  /** Controls whether the chat window is visible */
  isOpen: boolean;
  /** Controls whether the chat window is minimized */
  isMinimized: boolean;
  /** Array of chat messages to display */
  messages: Message[];
  /** Currently streaming message content */
  streamingMessage: string;
  /** Indicates if a message is being processed */
  isLoading: boolean;
  /** Indicates if the assistant is typing */
  isTyping: boolean;
  /** Controls visibility of suggested questions */
  showQuestions: boolean;
  /** Callback function to handle minimizing the chat window */
  onMinimize: () => void;
  /** Callback function to handle closing the chat window */
  onClose: () => void;
  /** Callback function to handle sending a new message */
  onSendMessage: (message: string) => void;
  /** Callback function when a suggested question is clicked */
  onQuestionClick: (question: string) => void;
  /** Whether the widget is in embedded mode */
  isEmbedded?: boolean;
}

/**
 * ChatWindow Component
 * Renders the main chat interface container with header, messages, and input
 * @param {ChatWindowProps} props - Component props
 * @returns {JSX.Element} The chat window component
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  isMinimized,
  messages,
  streamingMessage,
  isLoading,
  isTyping,
  showQuestions,
  onMinimize,
  onClose,
  onSendMessage,
  onQuestionClick,
  isEmbedded = false
}) => {
  // Dynamic class names for chat window positioning and animations
  const chatWindowClass = isEmbedded 
    ? "fixed inset-0 z-50 h-full w-full" 
    : `fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
        isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none hidden'
      } h-[500px] w-[350px] max-w-[calc(100vw-2rem)] sm:max-w-[350px]`;

  return (
    <div className={chatWindowClass}>
      <Card 
        removeBackground={true} 
        className={`h-full overflow-hidden flex flex-col ${isEmbedded ? 'embedded-chat-window' : 'chat-window'}`}
      >
        {/* Chat header with close control */}
        <ChatHeader
          isMinimized={false}
          onMinimize={onMinimize}
          onClose={onClose}
          isEmbedded={isEmbedded}
        />

        {/* Messages and input */}
        <ChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          isTyping={isTyping}
          showQuestions={showQuestions}
          onQuestionClick={onQuestionClick}
        />
        <ChatInput
          isLoading={isLoading}
          onSendMessage={onSendMessage}
        />
      </Card>
    </div>
  );
};

export default ChatWindow;
