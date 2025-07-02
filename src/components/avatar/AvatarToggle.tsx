
import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AvatarToggleProps {
  isAvatarMode: boolean;
  onToggle: (enabled: boolean) => void;
}

const AvatarToggle: React.FC<AvatarToggleProps> = ({ isAvatarMode, onToggle }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isAvatarMode ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!isAvatarMode)}
        className="flex items-center gap-2"
      >
        {isAvatarMode ? (
          <>
            <Bot className="w-4 h-4" />
            <span>Bibhrajit AI</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            <span>Standard Chat</span>
          </>
        )}
      </Button>
      
      {isAvatarMode && (
        <Badge variant="secondary" className="text-xs">
          RAG Enhanced
        </Badge>
      )}
    </div>
  );
};

export default AvatarToggle;
