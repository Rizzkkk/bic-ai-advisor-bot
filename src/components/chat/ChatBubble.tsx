
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatBubbleProps {
  isOpen: boolean;
  onOpen: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ isOpen, onOpen }) => {
  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isOpen ? 'scale-0' : 'scale-100'
      }`}
    >
      <Button
        onClick={onOpen}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0077FF] to-[#0066CC] hover:from-[#0066CC] hover:to-[#0055AA] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <img 
          src="/bic-logo.png" 
          alt="BIC" 
          className="w-8 h-8 object-contain"
          onError={(e) => {
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
