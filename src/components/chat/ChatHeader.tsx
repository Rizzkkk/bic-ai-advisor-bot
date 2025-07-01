
/**
 * ChatHeader Component
 * Displays the header section of the chat window with title, minimize/close buttons, and voice toggle
 */

import React from 'react';
import { X, Minus, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props interface for the ChatHeader component
 * @interface ChatHeaderProps
 */
interface ChatHeaderProps {
  /** Controls whether the chat window is minimized */
  isMinimized: boolean;
  /** Callback function to handle minimizing the chat window */
  onMinimize: () => void;
  /** Callback function to handle closing the chat window */
  onClose: () => void;
  /** Whether the widget is in embedded mode */
  isEmbedded?: boolean;
  /** Whether voice mode is enabled */
  voiceMode?: boolean;
  /** Callback to toggle voice mode */
  onToggleVoiceMode?: () => void;
}

/**
 * ChatHeader Component
 * Renders the header of the chat interface with controls
 * @param {ChatHeaderProps} props - Component props
 * @returns {JSX.Element} The chat header component
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  isMinimized,
  onMinimize,
  onClose,
  isEmbedded = false,
  voiceMode = false,
  onToggleVoiceMode = () => {}
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      {/* Chat title and logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#0077FF] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">BIC</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">BIC AI Assistant</h3>
          <p className="text-xs text-gray-500">AI, Robotics & Autonomy Expert</p>
        </div>
      </div>

      {/* Header controls */}
      <div className="flex items-center space-x-2">
        {/* Voice mode toggle */}
        <Button
          onClick={onToggleVoiceMode}
          variant="ghost"
          size="sm"
          className={`w-8 h-8 p-0 rounded-full transition-colors ${
            voiceMode 
              ? 'bg-[#0077FF] text-white hover:bg-[#0066CC]' 
              : 'hover:bg-gray-100'
          }`}
          title={voiceMode ? 'Disable voice mode' : 'Enable voice mode'}
        >
          {voiceMode ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </Button>

        {/* Minimize/Close buttons - only show in non-embedded mode */}
        {!isEmbedded && (
          <>
            <Button
              onClick={onMinimize}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
              title="Minimize chat"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
