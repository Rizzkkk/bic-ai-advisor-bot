import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import ChatBubble from './components/chat/ChatBubble';
import './index.css'; // Ensure global styles are loaded

const Widget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ChatApplication, setChatApplication] = useState<React.ComponentType | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    const isInIframe = window.self !== window.top;
    const hasEmbeddedParam = new URLSearchParams(window.location.search).get('embedded') === 'true';
    setIsEmbedded(isInIframe || hasEmbeddedParam);

    if (isInIframe || hasEmbeddedParam) {
      document.body.style.background = 'transparent';
      document.documentElement.style.background = 'transparent';
    }
  }, []);

  const handleOpenChat = async () => {
    setIsOpen(true);
    if (!ChatApplication) {
      // Dynamically import the ChatApplication component
      const module = await import('./ChatApplication');
      setChatApplication(() => module.default);
    }
  };

  return (
    <>
      <ChatBubble isOpen={isOpen} onOpen={handleOpenChat} />
      {isOpen && ChatApplication && (
        <ChatApplication />
      )}
    </>
  );
};

// Create a root element and render the widget
const rootElement = document.createElement('div');
rootElement.id = 'chatbot-widget-root';
document.body.appendChild(rootElement);
ReactDOM.createRoot(rootElement).render(<Widget />); 