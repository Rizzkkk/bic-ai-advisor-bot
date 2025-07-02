
/**
 * Enhanced Index Page Component
 * Now includes the AI Avatar-powered ChatApplication
 */

import * as React from 'react';
import ChatApplication from '@/ChatApplication';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <Navigation />
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bibhrajit Investment Corporation
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          AI, Robotics & Autonomy Investment Experts
        </p>
        <p className="text-lg text-gray-500">
          Chat with our AI assistant or experience the Bibhrajit AI Avatar powered by RAG
        </p>
      </div>
      <ChatApplication />
    </div>
  );
};

export default Index;
