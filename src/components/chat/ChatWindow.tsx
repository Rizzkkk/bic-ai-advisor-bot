
import React from 'react';
import { Card } from '@/components/ui/card';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Message } from './types';

interface ChatWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
  isTyping: boolean;
  showQuestions: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onQuestionClick: (question: string) => void;
}

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
  onQuestionClick
}) => {
  const chatWindowClass = `fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
    isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
  } ${isMinimized ? 'h-16' : 'h-[600px]'} w-96 max-w-[calc(100vw-2rem)] sm:max-w-96`;

  return (
    <div className={chatWindowClass}>
      <Card className="h-full bg-white shadow-2xl border-0 overflow-hidden rounded-2xl flex flex-col">
        <ChatHeader
          isMinimized={isMinimized}
          onMinimize={() => onMinimize()}
          onClose={onClose}
        />

        {!isMinimized && (
          <>
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
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatWindow;
