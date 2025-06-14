import { createRoot } from 'react-dom/client';
import React from 'react';
import ChatApplication from './ChatApplication';
import './index.css'; // Ensure global styles are loaded

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<ChatApplication />);
} else {
  // Fallback if 'root' element doesn't exist, though it should be provided by the embedding page
  console.error("Root element for chatbot iframe not found!");
} 