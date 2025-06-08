import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ChatWindow({ isOpen, onClose, children }: ChatWindowProps) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe or have the embedded parameter
    const isInIframe = window.self !== window.top;
    const hasEmbeddedParam = new URLSearchParams(window.location.search).get('embedded') === 'true';
    setIsEmbedded(isInIframe || hasEmbeddedParam);

    // Apply iframe-specific styles
    if (isInIframe || hasEmbeddedParam) {
      document.body.style.background = 'transparent';
      document.documentElement.style.background = 'transparent';
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed bottom-4 right-4 z-50",
            isEmbedded ? "w-[350px] h-[500px]" : "w-[400px] h-[600px]"
          )}
        >
          <div className="chat-window h-full w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Chat with us</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 