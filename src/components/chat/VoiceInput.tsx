
import React, { useState } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  disabled = false
}) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const getIcon = () => {
    if (isProcessing) {
      return <Loader className="w-4 h-4 animate-spin" />;
    }
    return isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />;
  };

  const getButtonClass = () => {
    const baseClass = "rounded-full w-9 h-9 p-0 flex-shrink-0 transition-all duration-200";
    
    if (isRecording) {
      return `${baseClass} bg-red-500 hover:bg-red-600 animate-pulse`;
    }
    
    if (isProcessing) {
      return `${baseClass} bg-gray-400`;
    }
    
    return `${baseClass} bg-[#0077FF] hover:bg-[#0066CC]`;
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={getButtonClass()}
        title={isRecording ? 'Stop recording' : 'Start voice recording'}
      >
        {getIcon()}
      </Button>
      {isRecording && (
        <span className="text-xs text-red-500 mt-1 animate-pulse">
          Listening...
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

export default VoiceInput;
