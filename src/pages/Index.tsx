/**
 * Index Page Component
 * This component serves as the main landing page of the application.
 * Its primary role is to render the `BICChatbot` interface,
 * making it the central feature visible to users upon visiting the application's root URL.
 */

import * as React from 'react';

/**
 * Index Component
 * Main landing page that displays the BIC Chatbot interface
 * @returns {JSX.Element} The index page component
 */
const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to BIC AI Advisor Bot</h1>
      <p className="text-lg text-gray-700">This page serves as a placeholder for your main application content.</p>
      <p className="text-md text-gray-500 mt-2">The chatbot widget is designed to be embedded on your website.</p>
    </div>
  );
};

export default Index;
