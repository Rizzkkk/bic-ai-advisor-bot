
import React, { useRef, useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceInput from './VoiceInput';
import { AudioRecorder } from '@/utils/AudioRecorder';

/**
 * Props interface for the ChatInput component
 * @interface ChatInputProps
 */
interface ChatInputProps {
  /** Indicates whether a message is currently being processed */
  isLoading: boolean;
  /** Callback function to handle sending a new message */
  onSendMessage: (message: string) => void;
  /** Whether voice input is enabled (Avatar mode) */
  isAvatarMode?: boolean;
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
  isAvatarMode = false
}) => {
  // Reference to the input element for direct manipulation
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);

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

  /**
   * Start voice recording
   */
  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      const recorder = new AudioRecorder();
      await recorder.startRecording();
      setAudioRecorder(recorder);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  /**
   * Stop voice recording and process speech-to-text
   */
  const handleStopRecording = async () => {
    if (!audioRecorder) return;

    try {
      setIsProcessingVoice(true);
      const audioBlob = await audioRecorder.stopRecording();
      
      // Convert to base64 for edge function
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Send to speech-to-text edge function  
      const response = await fetch('https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      const result = await response.json();
      
      if (result.text) {
        // Set the transcribed text in the input field
        if (inputRef.current) {
          inputRef.current.value = result.text;
        }
        // Optionally auto-send the message
        onSendMessage(result.text);
      }
    } catch (error) {
      console.error('Failed to process voice input:', error);
    } finally {
      setIsRecording(false);
      setIsProcessingVoice(false);
      setAudioRecorder(null);
    }
  };

  return (
    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
      {/* Input field and controls container */}
      <div className="flex space-x-2 mb-3 items-end">
        <Input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder={isAvatarMode ? "Ask Bibhrajit about business strategy, fundraising, or leadership..." : "Ask about AI startups, funding, or strategy..."}
          className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
          disabled={isLoading}
        />
        
        {/* Voice Input - only show in Avatar mode */}
        {isAvatarMode && (
          <VoiceInput
            isRecording={isRecording}
            isProcessing={isProcessingVoice}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            disabled={isLoading}
          />
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
