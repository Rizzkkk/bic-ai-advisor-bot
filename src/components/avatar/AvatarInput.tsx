
import React, { useRef, useState } from 'react';
import { Send, Loader, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarVoiceRecorder } from './AvatarVoiceRecorder';

interface AvatarInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const AvatarInput: React.FC<AvatarInputProps> = ({ 
  isLoading, 
  onSendMessage
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const voiceRecorder = new AvatarVoiceRecorder();

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
    
    // In continuous mode, auto-send
    if (isContinuousMode) {
      onSendMessage(text);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
      <div className="flex space-x-2 mb-3 items-end">
        <Input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder="Ask Bibhrajit about business strategy, fundraising, or leadership..."
          className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
          disabled={isLoading}
        />
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => voiceRecorder.toggleRecording(handleVoiceTranscription)}
            disabled={isLoading}
            className="rounded-full w-9 h-9 p-0 flex-shrink-0 bg-blue-500 hover:bg-blue-600"
            title="Voice input"
          >
            {voiceRecorder.isRecording() ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          
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
      
      {isContinuousMode && (
        <div className="text-xs text-green-600 text-center mb-2">
          🎤 Continuous conversation mode: Voice input will auto-send
        </div>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        Powered by Bibhrajit AI Avatar • RAG Enhanced
      </p>
    </div>
  );
};

export default AvatarInput;
