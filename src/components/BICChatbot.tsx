/**
 * BICChatbot Component
 * The main chatbot interface component that manages the chat state,
 * handles message sending/receiving, and orchestrates the chat UI components.
 * Integrates with OpenAI's API for AI-powered responses.
 */

import React, { useState, useEffect } from 'react';
import { OpenAIService, createSystemPrompt, type ChatMessage } from '@/utils/openaiService';
import ChatBubble from './chat/ChatBubble';
import ChatWindow from './chat/ChatWindow';
import { Message, BICChatbotProps } from './chat/types';

/**
 * BICChatbot Component
 * Main component that manages the chat interface and AI interactions
 * @param {BICChatbotProps} props - Component props including optional API key
 * @returns {JSX.Element} The complete chat interface
 */
const BICChatbot: React.FC<BICChatbotProps> = ({ apiKey }) => {
  // State management for chat interface
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');

  // Default API key for OpenAI service
  const defaultApiKey = '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';

  /**
   * Effect to show welcome message when chat is first opened
   */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hi! I'm Bibhrajit from BIC. I help AI, robotics, and autonomy founders raise capital and scale their companies. What can I help you with today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  /**
   * Handles sending messages to the AI service and managing the chat state
   * @param {string} content - The message content to send
   */
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const currentApiKey = apiKey || defaultApiKey;
    console.log('Starting message send with content:', content);

    // Create and add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setShowQuestions(false);
    setStreamingMessage('');

    try {
      // Initialize OpenAI service
      const openaiService = new OpenAIService({
        apiKey: currentApiKey,
        model: 'gpt-4.1-2025-04-14',
        temperature: 0.7,
        maxTokens: 1000
      });

      // Prepare message history for context
      const recentMessages = messages.slice(-8);
      const chatMessages: ChatMessage[] = [
        {
          role: 'system',
          content: createSystemPrompt()
        },
        ...recentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: content.trim()
        }
      ];

      console.log('Sending to OpenAI with', chatMessages.length, 'messages');

      // Stream the AI response
      let fullResponse = '';
      await openaiService.sendMessageStream(chatMessages, (chunk: string) => {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      });

      console.log('Streaming completed. Final response:', fullResponse);

      // Add AI response to chat
      if (fullResponse.trim()) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: fullResponse.trim(),
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No response received');
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please reach out directly to our team at info@bicorp.ai and we'll get back to you quickly.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Reset loading states
      setIsLoading(false);
      setIsTyping(false);
      setStreamingMessage('');
    }
  };

  /**
   * Handles clicking on suggested questions
   * @param {string} question - The selected question
   */
  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Floating chat bubble button */}
      <ChatBubble 
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
      />
      {/* Main chat window */}
      <ChatWindow
        isOpen={isOpen}
        isMinimized={isMinimized}
        messages={messages}
        streamingMessage={streamingMessage}
        isLoading={isLoading}
        isTyping={isTyping}
        showQuestions={showQuestions}
        onMinimize={() => setIsMinimized(!isMinimized)}
        onClose={() => setIsOpen(false)}
        onSendMessage={sendMessage}
        onQuestionClick={handleQuestionClick}
      />
    </>
  );
};

export default BICChatbot;
