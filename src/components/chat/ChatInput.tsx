import React, { useRef, useState } from 'react';
import { Send, Loader, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SimpleVoiceRecorder from '@/components/voice/SimpleVoiceRecorder';

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  isAvatarMode?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  isLoading, 
  onSendMessage,
  isAvatarMode = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isContinuousMode, setIsContinuousMode] = useState(false);

  const handleSend = () => {
    if (inputRef.current && !isLoading) {
      const value = inputRef.current.value.trim();
      if (value) {
        onSendMessage(value);
        inputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscription = (text: string) => {
    if (inputRef.current) {
      inputRef.current.value = text;
    }
    // In Avatar mode, immediately send the message for continuous conversation
    if (isAvatarMode && isContinuousMode) {
      onSendMessage(text);
    } else {
      // Otherwise just populate the input field
      onSendMessage(text);
    }
  };

  return (
    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
      <div className="flex space-x-2 mb-3 items-end">
        <Input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder={isAvatarMode ? "Ask Bibhrajit about business strategy, fundraising, or leadership..." : "Ask about AI startups, funding, or strategy..."}
          className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
          disabled={isLoading}
        />
        
        {isAvatarMode && (
          <div className="flex items-center space-x-2">
            <SimpleVoiceRecorder
              onTranscription={handleVoiceTranscription}
              disabled={isLoading}
            />
            <Button
              variant={isContinuousMode ? "default" : "outline"}
              onClick={() => setIsContinuousMode(!isContinuousMode)}
              className={`rounded-full w-9 h-9 p-0 flex-shrink-0 ${
                isContinuousMode 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'border-green-200 text-green-600 hover:bg-green-50'
              }`}
              title={isContinuousMode ? "Continuous conversation ON" : "Click for continuous conversation"}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <Button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-[#0077FF] hover:bg-[#0066CC] rounded-full w-9 h-9 p-0 flex-shrink-0"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {isAvatarMode && isContinuousMode && (
        <div className="text-xs text-green-600 text-center mb-2">
          🎤 Continuous conversation mode: Voice input will auto-send
        </div>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        Powered by BIC AI • info@bicorp.ai
      </p>
    </div>
  );
};

export default ChatInput;
