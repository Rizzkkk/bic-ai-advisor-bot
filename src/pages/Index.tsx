
import React from 'react';
import BICChatbot from '@/components/BICChatbot';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Target, Zap, Shield, ArrowRight, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                <img 
                  src="/bic-logo.png" 
                  alt="BIC" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <MessageCircle className="w-6 h-6 text-[#0077FF] hidden" />
              </div>
              <span className="font-semibold text-gray-800">BIC AI Advisor</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Chat with
            <span className="bg-gradient-to-r from-[#0077FF] to-[#00E89D] bg-clip-text text-transparent"> Bibhrajit</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get strategic advice from a battle-tested founder who's built, scaled, and exited in AI, robotics, and autonomy. 
            Real experience. Sharp insights. No buzzwords.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <Target className="w-5 h-5 text-[#0077FF]" />
              <span className="text-sm font-medium text-gray-700">AI & Robotics Focus</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <Zap className="w-5 h-5 text-[#00E89D]" />
              <span className="text-sm font-medium text-gray-700">20+ Years Experience</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <Shield className="w-5 h-5 text-[#0077FF]" />
              <span className="text-sm font-medium text-gray-700">Founder of SafeAI</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0077FF] to-[#0066CC] rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Investment Guidance</h3>
            <p className="text-gray-600 mb-4">
              Get insights on pitching to VCs, structuring rounds, and building investor relationships from someone who's been there.
            </p>
            <div className="text-[#0077FF] text-sm font-medium">
              Pitch deck reviews • Fundraising strategy • Investor intros
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-[#00E89D] to-[#00CC88] rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">GTM Strategy</h3>
            <p className="text-gray-600 mb-4">
              Turn breakthrough tech into commercial success. Learn how to position, price, and sell complex AI/robotics solutions.
            </p>
            <div className="text-[#00E89D] text-sm font-medium">
              Market positioning • Pricing strategy • Sales playbooks
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0077FF] to-[#00E89D] rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Technical Leadership</h3>
            <p className="text-gray-600 mb-4">
              Navigate the challenges of deep tech startups. From autonomy to robotics to AI - get guidance from real operational experience.
            </p>
            <div className="text-[#0077FF] text-sm font-medium">
              Team building • Product strategy • Technical roadmaps
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-[#0077FF]/10 to-[#00E89D]/10 border border-[#0077FF]/20 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Get Strategic Advice?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Click the chat bubble to start a conversation. Ask about fundraising, GTM, AI strategy, or any startup challenge you're facing.
            </p>
            <Button 
              className="bg-gradient-to-r from-[#0077FF] to-[#00E89D] hover:from-[#0066CC] hover:to-[#00CC88] text-white px-8 py-3 text-lg"
              onClick={() => {
                const chatBubble = document.querySelector('[data-chat-bubble="true"]') as HTMLElement;
                if (chatBubble) {
                  chatBubble.click();
                }
              }}
            >
              Start Chatting
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Powered by <strong>Bibhrajit Investment Corporation</strong> • 
            <a href="mailto:info@bicorp.ai" className="text-[#0077FF] hover:underline ml-1">
              info@bicorp.ai
            </a>
          </p>
        </div>
      </div>

      {/* Chatbot Widget */}
      <BICChatbot />
    </div>
  );
};

export default Index;
