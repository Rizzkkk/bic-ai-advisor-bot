
import React, { useRef } from 'react';
import { Send, Loader, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceInput from './VoiceInput';
import VoiceVisualizer from './VoiceVisualizer';

/**
 * Props interface for the ChatInput component
 * @interface ChatInputProps
 */
interface ChatInputProps {
  /** Indicates whether a message is currently being processed */
  isLoading: boolean;
  /** Callback function to handle sending a new message */
  onSendMessage: (message: string) => void;
  /** Voice-related props */
  voiceMode?: boolean;
  isRecording?: boolean;
  isProcessingVoice?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onShowVoiceSettings?: () => void;
}

/**
 * ChatInput Component
 * Renders the input section of the chat interface with message input and send button
 * @param {ChatInputProps} props - Component props
 * @returns {JSX.Element} The chat input component
 */
const ChatInput: React.FC<ChatInputProps> = ({ 
  isLoading, 
  onSendMessage,
  voiceMode = false,
  isRecording = false,
  isProcessingVoice = false,
  onStartRecording = () => {},
  onStopRecording = () => {},
  onShowVoiceSettings = () => {}
}) => {
  // Reference to the input element for direct manipulation
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles sending a message when the send button is clicked
   * Clears the input field after sending
   */
  const handleSend = () => {
    if (inputRef.current && !isLoading) {
      const value = inputRef.current.value.trim();
      if (value) {
        onSendMessage(value);
        inputRef.current.value = '';
      }
    }
  };

  /**
   * Handles keyboard events for the input field
   * Sends message on Enter key press (without Shift)
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
      {/* Voice visualizer */}
      {voiceMode && (isRecording || isProcessingVoice) && (
        <div className="flex justify-center mb-2">
          <VoiceVisualizer 
            isRecording={isRecording} 
            isPlaying={false}
            className="h-12"
          />
        </div>
      )}

      {/* Input field and controls container */}
      <div className="flex space-x-2 mb-3 items-end">
        <Input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder="Ask about AI startups, funding, or strategy..."
          className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
          disabled={isLoading}
        />
        
        {/* Voice controls (only show in voice mode) */}
        {voiceMode && (
          <div className="flex space-x-1">
            <VoiceInput
              isRecording={isRecording}
              isProcessing={isProcessingVoice}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
              disabled={isLoading}
            />
            <Button
              onClick={onShowVoiceSettings}
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0 rounded-full hover:bg-gray-100"
              title="Voice settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <Button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-[#0077FF] hover:bg-[#0066CC] rounded-full w-9 h-9 p-0 flex-shrink-0"
        >
          {/* Show loading spinner or send icon based on state */}
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {/* Footer text with contact information */}
      <p className="text-xs text-gray-500 text-center">
        Powered by BIC AI • info@bicorp.ai
      </p>
    </div>
  );
};

export default ChatInput;
