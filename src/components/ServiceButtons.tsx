/**
 * Service Buttons Component
 * This component renders a set of interactive buttons, likely representing different services or actions.
 * It is designed to provide quick access to specific features or initiate particular workflows within the application.
 * Each button's functionality and appearance would be configured through its props.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface Service {
  name: string;
  price: string;
  description: string;
  features: string[];
  stripeLink?: string;
}

interface ServiceButtonsProps {
  onServiceSelect: (service: Service) => void;
}

const ServiceButtons: React.FC<ServiceButtonsProps> = ({ onServiceSelect }) => {
  const services: Service[] = [
    {
      name: "Pitch Deck Review & Redesign",
      price: "$699",
      description: "Complete teardown and upgrade of your pitch deck",
      features: [
        "Strategic feedback on narrative & flow",
        "Updated slide structure",
        "Redesigned clean template", 
        "1-hour 1:1 working session"
      ],
      stripeLink: "https://buy.stripe.com/pitch-deck-review"
    },
    {
      name: "Fundraising Sprint",
      price: "$1,699",
      description: "Get investor-ready in 2 weeks",
      features: [
        "3 x 1:1 live working sessions",
        "Deep dive into storyline & metrics",
        "Valuation narrative coaching",
        "Investor list feedback & intros"
      ],
      stripeLink: "https://buy.stripe.com/fundraising-sprint"
    },
    {
      name: "GTM Kickstart",
      price: "$1,699", 
      description: "Define your go-to-market strategy",
      features: [
        "3 x 1:1 working sessions",
        "ICP & buyer persona definition",
        "Messaging teardown",
        "Sales narrative coaching"
      ],
      stripeLink: "https://buy.stripe.com/gtm-kickstart"
    }
  ];

  const handleServiceClick = (service: Service) => {
    // In production, this would redirect to Stripe
    console.log(`Selected service: ${service.name}`);
    onServiceSelect(service);
    
    // Simulate Stripe redirect
    if (service.stripeLink) {
      window.open(service.stripeLink, '_blank');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        BIC Services - Choose Your Path
      </h3>
      
      {services.map((service, index) => (
        <Card 
          key={index}
          className="p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#0077FF]/50 cursor-pointer group"
          onClick={() => handleServiceClick(service)}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 group-hover:text-[#0077FF] transition-colors">
                {service.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#0077FF]">{service.price}</div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0077FF] transition-colors ml-auto mt-1" />
            </div>
          </div>
          
          <div className="space-y-2">
            {service.features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#00E89D]" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-4 bg-[#0077FF] hover:bg-[#0066CC] text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleServiceClick(service);
            }}
          >
            Get Started - {service.price}
          </Button>
        </Card>
      ))}
      
      <Card className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">Need Custom Support?</h4>
        <p className="text-sm text-gray-600 mb-3">
          We take on a few retainer clients per quarter for deeper partnership.
        </p>
        <Button 
          variant="outline" 
          className="w-full border-[#0077FF] text-[#0077FF] hover:bg-[#0077FF] hover:text-white"
          onClick={() => window.open('mailto:info@bicorp.ai?subject=Custom Support Inquiry', '_blank')}
        >
          Apply for Custom Support
        </Button>
      </Card>
    </div>
  );
};

export default ServiceButtons;
