
import React, { useRef, useState } from 'react';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VoiceInput from './VoiceInput';
import { AudioRecorder } from '@/utils/AudioRecorder';

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
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [voiceError, setVoiceError] = useState<string>('');

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

  const handleStartRecording = async () => {
    try {
      setVoiceError('');
      
      // Check browser support
      if (!AudioRecorder.isSupported()) {
        setVoiceError('Voice recording is not supported in this browser. Please use Chrome, Firefox, or Safari.');
        return;
      }

      console.log('Starting voice recording...');
      setIsRecording(true);
      
      const recorder = new AudioRecorder();
      
      // Request permission first
      const hasPermission = await recorder.requestPermission();
      if (!hasPermission) {
        setVoiceError('Microphone access denied. Please allow microphone access in your browser settings.');
        setIsRecording(false);
        return;
      }

      await recorder.startRecording();
      setAudioRecorder(recorder);
      console.log('Voice recording started successfully');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setVoiceError(error.message || 'Failed to start recording. Please check your microphone.');
      setIsRecording(false);
      setAudioRecorder(null);
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorder) {
      console.error('No audio recorder available');
      return;
    }

    try {
      console.log('Stopping voice recording...');
      setIsProcessingVoice(true);
      
      const audioBlob = await audioRecorder.stopRecording();
      console.log('Audio blob created:', audioBlob.size, 'bytes');
      
      // Convert to base64 for edge function
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) {
            throw new Error('Failed to convert audio to base64');
          }

          console.log('Sending audio to speech-to-text service...');
          
          // Send to speech-to-text edge function with proper authorization
          const response = await fetch('https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/speech-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs'}`,
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Speech-to-text service failed');
          }

          const result = await response.json();
          console.log('Speech-to-text result:', result);
          
          if (result.text && result.text.trim()) {
            // Set the transcribed text in the input field
            if (inputRef.current) {
              inputRef.current.value = result.text;
            }
            // Auto-send the message
            onSendMessage(result.text);
            setVoiceError(''); // Clear any previous errors
          } else {
            setVoiceError('No speech detected. Please try speaking more clearly.');
          }
        } catch (error) {
          console.error('Failed to process voice input:', error);
          setVoiceError(error.message || 'Failed to process voice input. Please try again.');
        }
      };

      reader.onerror = () => {
        console.error('Failed to read audio file');
        setVoiceError('Failed to process audio. Please try again.');
      };

      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setVoiceError(error.message || 'Failed to stop recording. Please try again.');
    } finally {
      setIsRecording(false);
      setIsProcessingVoice(false);
      setAudioRecorder(null);
    }
  };

  return (
    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
      {/* Voice Error Alert */}
      {voiceError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{voiceError}</AlertDescription>
        </Alert>
      )}

      {/* Input field and controls container */}
      <div className="flex space-x-2 mb-3 items-end">
        <Input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder={isAvatarMode ? "Ask Bibhrajit about business strategy, fundraising, or leadership..." : "Ask about AI startups, funding, or strategy..."}
          className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
          disabled={isLoading || isRecording || isProcessingVoice}
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
          disabled={isLoading || isRecording || isProcessingVoice}
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
