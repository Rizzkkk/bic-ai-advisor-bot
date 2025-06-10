/**
 * Chat Bubble Component
 * This component represents the floating chat bubble button that toggles the visibility
 * of the main chat window. It typically appears minimized on the screen until clicked,
 * providing a discreet way for users to access the chatbot interface.
 */

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props interface for the ChatBubble component
 * @interface ChatBubbleProps
 */
interface ChatBubbleProps {
  /** Controls whether the chat window is currently open */
  isOpen: boolean;
  /** Callback function to handle opening the chat window */
  onOpen: () => void;
}

/**
 * ChatBubble Component
 * Renders a floating circular button with the BIC logo that opens the chat window
 * @param {ChatBubbleProps} props - Component props
 * @returns {JSX.Element} A floating button component
 */
const ChatBubble: React.FC<ChatBubbleProps> = ({ isOpen, onOpen }) => {
  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isOpen ? 'scale-0' : 'scale-100'
      }`}
    >
      <Button
        onClick={onOpen}
        className="chat-bubble w-16 h-16 rounded-full hover:scale-105 transition-all duration-300"
      >
        {/* BIC Logo with fallback to MessageCircle icon */}
        <img 
          src="/bic-logo.png" 
          alt="BIC" 
          className="w-8 h-8 object-contain"
          onError={(e) => {
            // Hide the image and show the fallback icon if image fails to load
            (e.target as HTMLElement).style.display = 'none';
            (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
        <MessageCircle className="w-7 h-7 text-white hidden" />
      </Button>
    </div>
  );
};

export default ChatBubble;
