
import React, { useState, useEffect } from 'react';
import { Message } from '@/components/chat/types';
import { AvatarService } from './AvatarService';
import { AvatarTTS } from './AvatarTTS';
import AvatarMessages from './AvatarMessages';
import AvatarInput from './AvatarInput';

interface AvatarChatProps {
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  sessionId: string;
}

const AvatarChat: React.FC<AvatarChatProps> = ({
  messages,
  streamingMessage,
  isLoading,
  isTyping,
  onSendMessage,
  sessionId
}) => {
  const [currentTTS, setCurrentTTS] = useState<string | null>(null);
  const avatarService = new AvatarService();
  const avatarTTS = new AvatarTTS();

  // Auto-play TTS for new assistant messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id !== currentTTS) {
      console.log('Playing TTS for new message:', lastMessage.content.substring(0, 50));
      setCurrentTTS(lastMessage.id);
      
      avatarTTS.speak(lastMessage.content).catch(error => {
        console.error('TTS failed:', error);
      });
    }
  }, [messages, currentTTS]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    try {
      console.log('Avatar sending message:', content);
      
      // Stop current TTS
      avatarTTS.stop();
      
      // Send to enhanced chat completion
      const response = await avatarService.sendMessage(content, messages, sessionId);
      
      if (response) {
        onSendMessage(content);
      }
    } catch (error) {
      console.error('Avatar chat error:', error);
      onSendMessage(content); // Fallback to normal processing
    }
  };

  const handlePlayTTS = (messageId: string, text: string) => {
    console.log('Manual TTS play for message:', messageId);
    setCurrentTTS(messageId);
    avatarTTS.speak(text).catch(error => {
      console.error('Manual TTS failed:', error);
    });
  };

  const handleStopTTS = () => {
    avatarTTS.stop();
    setCurrentTTS(null);
  };

  return (
    <div className="flex flex-col h-full">
      <AvatarMessages
        messages={messages}
        streamingMessage={streamingMessage}
        isTyping={isTyping}
        onPlayTTS={handlePlayTTS}
        onStopTTS={handleStopTTS}
        playingMessageId={currentTTS}
        isPlaying={avatarTTS.isPlaying()}
      />
      <AvatarInput
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default AvatarChat;
