
import { useState, useRef, useEffect } from 'react';
import { VoiceService, VoiceSettings } from '@/utils/VoiceService';
import { VoiceState } from '@/components/chat/types';

export const useVoiceChat = (onTranscript: (text: string) => void) => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isProcessing: false,
    isPlaying: false,
    voiceMode: false
  });
  
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const voiceServiceRef = useRef<VoiceService | null>(null);

  useEffect(() => {
    voiceServiceRef.current = new VoiceService(
      // On transcript received
      (text: string) => {
        onTranscript(text);
        setVoiceState(prev => ({ ...prev, isProcessing: false }));
      },
      // On recording state change
      (isRecording: boolean) => {
        setVoiceState(prev => ({ ...prev, isRecording }));
      },
      // On playback state change
      (isPlaying: boolean) => {
        setVoiceState(prev => ({ ...prev, isPlaying }));
        if (!isPlaying) {
          setPlayingMessageId(null);
        }
      },
      // On error
      (error: string) => {
        console.error('Voice service error:', error);
        setVoiceState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isProcessing: false 
        }));
      }
    );

    return () => {
      voiceServiceRef.current = null;
    };
  }, [onTranscript]);

  const handleStartRecording = async () => {
    if (voiceServiceRef.current) {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));
      await voiceServiceRef.current.startRecording();
    }
  };

  const handleStopRecording = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopRecording();
    }
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (voiceServiceRef.current) {
      setPlayingMessageId(messageId);
      await voiceServiceRef.current.speakText(text);
    }
  };

  const handlePauseAudio = () => {
    if (voiceServiceRef.current) {
      if (voiceState.isPlaying) {
        voiceServiceRef.current.pausePlayback();
      } else {
        voiceServiceRef.current.resumePlayback();
      }
    }
  };

  const toggleVoiceMode = () => {
    setVoiceState(prev => ({ ...prev, voiceMode: !prev.voiceMode }));
  };

  const updateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.updateSettings(newSettings);
    }
  };

  const getVoiceSettings = (): VoiceSettings => {
    return voiceServiceRef.current?.getSettings() || {
      voice: 'alloy',
      speed: 1.0,
      autoPlay: true,
      pushToTalk: false
    };
  };

  return {
    voiceState,
    playingMessageId,
    showVoiceSettings,
    setShowVoiceSettings,
    handleStartRecording,
    handleStopRecording,
    handlePlayAudio,
    handlePauseAudio,
    toggleVoiceMode,
    updateVoiceSettings,
    getVoiceSettings
  };
};
