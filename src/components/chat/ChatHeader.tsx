
import React from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isMinimized, onMinimize, onClose }) => {
  return (
    <div className="bg-gradient-to-r from-[#0077FF] to-[#00E89D] p-4 text-white flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
            <img 
              src="/bic-logo.png" 
              alt="BIC" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <MessageCircle className="w-6 h-6 text-[#0077FF] hidden" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Chat with Bibhrajit</h3>
            <p className="text-white/80 text-sm">BIC Investment Corp</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={onMinimize}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 bg-transparent"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 bg-transparent"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
