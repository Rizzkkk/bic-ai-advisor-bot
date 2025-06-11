/**
 * ChatHeader Component
 * The header section of the chat window containing the BIC logo, title,
 * and control buttons for minimizing and closing the chat.
 */

import React from 'react';
import { MessageCircle, X, MinimizeIcon } from 'lucide-react';
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
}

/**
 * ChatHeader Component
 * Renders the header section of the chat window with branding and controls
 * @param {ChatHeaderProps} props - Component props
 * @returns {JSX.Element} The chat window header component
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isMinimized, 
  onMinimize, 
  onClose, 
  isEmbedded = false 
}) => {
  return (
    <div className="bg-gradient-to-r from-[#0077FF] to-[#00E89D] p-4 text-white flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left section with logo and title */}
        <div className="flex items-center space-x-3">
          {/* Logo container with fallback icon */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
            <img 
              src="/bic-logo.png" 
              alt="BIC" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Show fallback icon if logo fails to load
                (e.target as HTMLElement).style.display = 'none';
                (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <MessageCircle className="w-6 h-6 text-[#0077FF] hidden" />
          </div>
          {/* Title and subtitle */}
          <div>
            <h3 className="font-semibold text-lg">Chat with us</h3>
            <p className="text-white/80 text-sm">BIC Investment Corp</p>
          </div>
        </div>
        
        {/* Right section with minimize and close buttons */}
        <div className="flex items-center justify-end gap-1">
          <Button
            onClick={onMinimize}
            className="text-white hover:bg-white/20 h-10 w-10 p-0 bg-transparent flex items-center justify-center"
            aria-label="Minimize chat"
          >
            <MinimizeIcon className="w-5 h-5" />
          </Button>
          <Button
            onClick={onClose}
            className="text-white hover:bg-white/20 h-10 w-10 p-0 bg-transparent flex items-center justify-center"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
