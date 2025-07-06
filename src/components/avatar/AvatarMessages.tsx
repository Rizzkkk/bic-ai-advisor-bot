
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { Message } from '@/components/chat/types';

interface AvatarMessagesProps {
  messages: Message[];
  streamingMessage: string;
  isTyping: boolean;
  onPlayTTS: (messageId: string, text: string) => void;
  onStopTTS: () => void;
  playingMessageId: string | null;
  isPlaying: boolean;
}

const AvatarMessages: React.FC<AvatarMessagesProps> = ({
  messages,
  streamingMessage,
  isTyping,
  onPlayTTS,
  onStopTTS,
  playingMessageId,
  isPlaying
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage, isTyping]);

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
        {/* Render messages */}
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
                <div className="text-sm leading-relaxed flex-1">
                  {message.role === 'assistant' 
                    ? renderTextWithLinks(message.content)
                    : message.content
                  }
                </div>
                {/* TTS controls for assistant messages */}
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 flex-shrink-0"
                    onClick={() => {
                      if (isPlaying && playingMessageId === message.id) {
                        onStopTTS();
                      } else {
                        onPlayTTS(message.id, message.content);
                      }
                    }}
                  >
                    {isPlaying && playingMessageId === message.id ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message */}
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
      </div>
    </ScrollArea>
  );
};

export default AvatarMessages;
