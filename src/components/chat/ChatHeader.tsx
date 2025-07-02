
/**
 * Enhanced ChatHeader Component with Avatar Mode Toggle
 */

import React from 'react';
import { X, Minus, Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  isEmbedded?: boolean;
  isAvatarMode?: boolean;
  onAvatarToggle?: (enabled: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isMinimized,
  onMinimize,
  onClose,
  isEmbedded = false,
  isAvatarMode = false,
  onAvatarToggle
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#0077FF] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">BIC</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {isAvatarMode ? 'Bibhrajit AI Avatar' : 'BIC AI Assistant'}
          </h3>
          <p className="text-xs text-gray-500">
            {isAvatarMode ? 'Powered by personal knowledge base' : 'AI, Robotics & Autonomy Expert'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Avatar Mode Toggle */}
        {onAvatarToggle && (
          <div className="flex items-center gap-2 mr-2">
            <Button
              variant={isAvatarMode ? "default" : "outline"}
              size="sm"
              onClick={() => onAvatarToggle(!isAvatarMode)}
              className="flex items-center gap-2"
            >
              {isAvatarMode ? (
                <>
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">Avatar</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Standard</span>
                </>
              )}
            </Button>
            
            {isAvatarMode && (
              <Badge variant="secondary" className="text-xs hidden sm:inline-block">
                RAG
              </Badge>
            )}
          </div>
        )}

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
