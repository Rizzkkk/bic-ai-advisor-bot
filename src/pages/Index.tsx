/**
 * Index Page Component
 * The main landing page of the application.
 * Renders the BIC Chatbot interface as the primary content.
 */

import * as React from 'react';
import BICChatbot from '@/components/BICChatbot';

/**
 * Index Component
 * Main landing page that displays the BIC Chatbot interface
 * @returns {JSX.Element} The index page component
 */
const Index = () => {
  return (
    <div>
      <BICChatbot />
    </div>
  );
};

export default Index;
