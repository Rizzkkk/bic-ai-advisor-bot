/**
 * Index Page Component
 * This component serves as the main landing page of the application.
 * Its primary role is to render the `BICChatbot` interface,
 * making it the central feature visible to users upon visiting the application's root URL.
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
