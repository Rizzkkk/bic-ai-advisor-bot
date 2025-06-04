
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface BICChatbotProps {
  apiKey?: string;
  stripeKey?: string;
}

const BICChatbot: React.FC<BICChatbotProps> = ({ apiKey, stripeKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const systemPrompt = `You are an AI assistant representing Bibhrajit Halder, founder of Bibhrajit Investment Corporation (BIC), a venture and advisory firm focused on early-stage AI, robotics, autonomy, and defense tech startups. You bring over two decades of experience in self-driving and autonomy, having led SafeAI as its founder and CEO, and now actively investing in and advising deeptech founders.

Your tone is sharp, direct, clear, and founder-friendly. Avoid buzzwords. Avoid fluff. Speak like a battle-tested founder who knows what matters when building hard tech companies. You are not a motivational coach. You are a strategic execution partner.

When users ask questions, respond with high signal, practical answers. Always give clear guidance like someone who has pitched, raised, hired, built, and exited. Do not be generic. Use real-world frameworks, crisp logic, and precise language. You're here to help founders win.

COMPANY INFO:
- BIC (Bibhrajit Investment Corporation) is an investment and advisory firm for early-stage deeptech startups — focused on AI, robotics, autonomy, and defense.
- We help founders raise, build, and scale — and we partner hands-on through key stages like GTM, hiring, and M&A prep.

SERVICES & PRICING:
1. Pitch Deck Review & Redesign – $699
   - Complete teardown and upgrade of pitch deck
   - Strategic feedback on narrative, flow, and financials
   - Updated slide structure + redesigned clean deck template
   - 1-hour 1:1 working session

2. Fundraising Sprint – $1,699
   - Get investor-ready in 2 weeks
   - 3 x 1:1 live working sessions (3 hrs total)
   - Deep dive into storyline, metrics, valuation narrative
   - Feedback on investor list + intros where aligned

3. GTM Kickstart – $1,699
   - Define first go-to-market motion, ICP, messaging
   - 3 x 1:1 working sessions (3 hrs total)
   - ICP + buyer persona definition
   - Messaging teardown + sales narrative coaching

RESPONSE FLOWS:
- If someone asks how to pitch BIC: Direct them to contact info@bicorp.ai or use the contact form
- If someone asks about services: List the productized services with pricing
- If someone asks for custom support: Let them know we take on a few retainer clients per quarter
- If unsure how to respond: "Great question — I'll have the team follow up. Want to leave your email?"

GUARDRAILS:
- Limit to startup/business topics only
- Avoid legal/medical/personal advice
- Never share private investor or client information
- Set fallback: "Let me get back to you via email — leave your contact info."

CONTACT: info@bicorp.ai`;

  const premadeQuestions = [
    "How do I pitch my AI startup to BIC?",
    "What services do you offer for fundraising?", 
    "Can you help with go-to-market strategy?",
    "What makes a good robotics startup?",
    "How should I structure my Series A round?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hi! I'm here to help with questions about AI, robotics, and startup strategy. What can I help you with today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    setShowQuestions(false);

    try {
      // Simulate realistic response time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBICResponse(content),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please reach out to our team at info@bicorp.ai and we'll get back to you quickly.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const generateBICResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('pitch') && (input.includes('bic') || input.includes('you'))) {
      return "Want to pitch to BIC? Send your deck to info@bicorp.ai and we'll review it. We focus on AI, robotics, autonomy, and defense tech startups. For structured feedback, our Pitch Deck Review service ($699) gives you a complete teardown with actionable insights in 1 week. No fluff - just what needs to be fixed.";
    }
    
    if (input.includes('service') || input.includes('help') || input.includes('advisory') || input.includes('offer')) {
      return "Here's how we help founders win:\n\n**Pitch Deck Review & Redesign** - $699\nComplete deck teardown + 1-hour working session\n\n**Fundraising Sprint** - $1,699\nGet investor-ready in 2 weeks with 3 working sessions\n\n**GTM Kickstart** - $1,699\nDefine your go-to-market strategy with expert guidance\n\nAll include direct access to me. Which challenge are you facing right now?";
    }
    
    if (input.includes('fundrais') || input.includes('series a') || input.includes('investor') || input.includes('round')) {
      return "Fundraising is about three things: story, metrics, and timing. Most founders nail the tech but struggle translating it for investors. You need a clear commercial narrative, defensible moat, and credible GTM motion. Our Fundraising Sprint gets you investor-ready in 2 weeks - 3 working sessions covering storyline, valuation narrative, and investor strategy. Want specifics on your situation?";
    }
    
    if (input.includes('gtm') || input.includes('go-to-market') || input.includes('customer') || input.includes('sales')) {
      return "GTM for deeptech is different. You're not selling vitamins - you're solving real problems with complex tech. Start with ICP definition, then nail your messaging for technical buyers vs business buyers. Our GTM Kickstart covers exactly this - ICP definition, messaging teardown, and sales narrative coaching over 3 sessions. What's your target market?";
    }
    
    if (input.includes('ai') || input.includes('robotics') || input.includes('autonomous') || input.includes('robot')) {
      return "That's our sweet spot. After 20+ years in autonomy and AI, I've seen the evolution from perception → generative → agentic → physical AI. The winners translate breakthrough tech into commercial value quickly. Key is finding product-market fit before your runway runs out. What stage is your startup at and what's your biggest challenge right now?";
    }

    if (input.includes('good') && (input.includes('startup') || input.includes('robot'))) {
      return "Good robotics startups have three things: 1) Clear commercial application (not just cool tech), 2) Defensible technology moat (IP, data, or unique insight), 3) Team that can execute both hardware and software. Most fail because they build solutions looking for problems. Start with a real customer pain point, then build the minimum viable robot to solve it. What problem are you solving?";
    }
    
    if (input.includes('meeting') || input.includes('schedule') || input.includes('book') || input.includes('call')) {
      return "Best way to get structured time with me is through our productized services - they include guaranteed 1:1 sessions with clear outcomes. For general inquiries, email info@bicorp.ai or use our contact form. What specific challenge do you need help with?";
    }
    
    return "Good question! For specific guidance on that, reach out to our team at info@bicorp.ai. In the meantime, what's the biggest challenge you're facing with your startup that I can help with directly? Fundraising, GTM, or technical strategy?";
  };

  const handleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const ChatBubble = () => (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isOpen ? 'scale-0' : 'scale-100'
      }`}
    >
      <Button
        onClick={() => setIsOpen(true)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0077FF] to-[#0066CC] hover:from-[#0066CC] hover:to-[#0055AA] shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none hover:scale-105"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </Button>
    </div>
  );

  const ChatWindow = () => (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      } ${isMinimized ? 'h-16' : 'h-[550px]'} w-96 max-w-[calc(100vw-2rem)] sm:max-w-96`}
    >
      <Card className="h-full bg-white shadow-2xl border-0 overflow-hidden rounded-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0077FF] to-[#00E89D] p-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Chat with Bibhrajit</h3>
                <p className="text-white/80 text-sm">BIC Investment Corp</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-[#0077FF] text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {/* Premade Questions */}
              {showQuestions && messages.length <= 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Quick questions to get started:</p>
                  {premadeQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionClick(question)}
                      className="w-full text-left justify-start text-sm h-auto py-2 px-3 border-[#0077FF]/20 text-[#0077FF] hover:bg-[#0077FF]/5"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t bg-gray-50 flex-shrink-0">
              <div className="flex space-x-2 mb-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about AI startups, funding, or strategy..."
                  className="flex-1 border-gray-200 focus:border-[#0077FF] rounded-full text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-[#0077FF] hover:bg-[#0066CC] rounded-full w-9 h-9 p-0 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Powered by BIC AI • info@bicorp.ai
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );

  return (
    <>
      <ChatBubble />
      <ChatWindow />
    </>
  );
};

export default BICChatbot;
