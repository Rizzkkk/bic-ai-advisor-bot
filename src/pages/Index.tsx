
/**
 * Enhanced Index Page Component
 * Now includes the AI Avatar-powered ChatApplication
 */

import * as React from 'react';
import ChatApplication from '@/ChatApplication';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <ChatApplication />
    </div>
  );
};

export default Index;
