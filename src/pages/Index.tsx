
/**
 * Enhanced Index Page Component
 * Now includes the AI Avatar-powered ChatApplication
 */

import * as React from 'react';
import ChatApplication from '@/ChatApplication';

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <ChatApplication />
    </div>
  );
};

export default Index;
