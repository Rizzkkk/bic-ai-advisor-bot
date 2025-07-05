
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleVoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const SimpleVoiceRecorder: React.FC<SimpleVoiceRecorderProps> = ({
  onTranscription,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      console.log('Starting voice recording...');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        await processAudio();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        throw new Error('No audio data recorded');
      }

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('Created audio blob:', audioBlob.size, 'bytes');

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) {
            throw new Error('Failed to convert audio to base64');
          }

          console.log('Sending to speech-to-text...');
          
          // Send to Supabase edge function
          const response = await fetch('https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/speech-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs',
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Speech-to-text failed');
          }

          const result = await response.json();
          console.log('Transcription result:', result);

          if (result.text && result.text.trim()) {
            onTranscription(result.text.trim());
          } else {
            alert('No speech detected. Please try again.');
          }

        } catch (error) {
          console.error('Transcription error:', error);
          alert('Failed to process speech. Please try again.');
        }
      };

      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('Audio processing error:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      // Cleanup
      cleanup();
      setIsProcessing(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getButtonClass = () => {
    const baseClass = "rounded-full w-10 h-10 p-0 transition-all duration-200";
    
    if (isRecording) {
      return `${baseClass} bg-red-500 hover:bg-red-600 animate-pulse`;
    }
    
    if (isProcessing) {
      return `${baseClass} bg-gray-400`;
    }
    
    return `${baseClass} bg-blue-500 hover:bg-blue-600`;
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={getButtonClass()}
        title={isRecording ? 'Stop recording' : 'Start voice recording'}
      >
        {isProcessing ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
      {isRecording && (
        <span className="text-xs text-red-500 mt-1 animate-pulse">
          Recording...
        </span>
      )}
      {isProcessing && (
        <span className="text-xs text-gray-500 mt-1">
          Processing...
        </span>
      )}
    </div>
  );
};

export default SimpleVoiceRecorder;
