
import React, { useEffect, useState } from 'react';

interface VoiceVisualizerProps {
  isRecording: boolean;
  isPlaying: boolean;
  className?: string;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isRecording,
  isPlaying,
  className = ''
}) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording || isPlaying) {
      interval = setInterval(() => {
        // Generate random heights for animation effect
        const newBars = Array.from({ length: 5 }, () => 
          Math.random() * 40 + 10
        );
        setBars(newBars);
      }, 100);
    } else {
      setBars([]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPlaying]);

  if (!isRecording && !isPlaying) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-100 ${
            isRecording ? 'bg-red-500' : 'bg-[#0077FF]'
          }`}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
