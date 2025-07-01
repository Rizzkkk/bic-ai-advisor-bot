
import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  disabled?: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  disabled = false
}) => {
  const handleClick = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="ghost"
      size="sm"
      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
      title={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {isPlaying ? (
        <Pause className="w-3 h-3" />
      ) : (
        <Play className="w-3 h-3" />
      )}
    </Button>
  );
};

export default AudioControls;
