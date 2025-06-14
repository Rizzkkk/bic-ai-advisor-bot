/**
 * Contact Form Component
 * This component provides a form for users to submit contact information or inquiries.
 * It typically includes fields for name, email, subject, and message.
 * The component handles form input, validation, and submission logic,
 * likely interacting with a backend service to send the form data.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Send, Mail, CheckCircle } from 'lucide-react';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  initialMessage?: string;
}

interface ContactFormData {
  email: string;
  name: string;
  company: string;
  message: string;
  inquiryType: 'investment' | 'services' | 'general';
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, initialMessage = '' }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    name: '',
    company: '',
    message: initialMessage,
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In production, this would send to your backend/webhook
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Contact form submission:', formData);
      
      // Simulate sending email to info@bicorp.ai
      const emailSubject = `New ${formData.inquiryType} inquiry from ${formData.name}`;
      const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Inquiry Type: ${formData.inquiryType}

Message:
${formData.message}
      `.trim();

      // In production, replace with actual email sending logic
      console.log('Would send email:', { emailSubject, emailBody });
      
      onSubmit(formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Message Sent!</h3>
          <p className="text-gray-600 mb-4">
            Thanks for reaching out. Our team will review your inquiry and get back to you within 24 hours.
          </p>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <Mail className="w-5 h-5 text-[#0077FF] inline mr-2" />
            <span className="text-sm text-gray-600">
              You'll hear from us at: <strong>{formData.email}</strong>
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Get in Touch</h3>
        <p className="text-sm text-gray-600">
          Our team will review your inquiry and connect you with the right resources.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="mt-1"
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="mt-1"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company" className="text-sm font-medium text-gray-700">
            Company
          </Label>
          <Input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="mt-1"
            placeholder="Your startup/company name"
          />
        </div>

        <div>
          <Label htmlFor="inquiryType" className="text-sm font-medium text-gray-700">
            Inquiry Type *
          </Label>
          <select
            id="inquiryType"
            value={formData.inquiryType}
            onChange={(e) => handleInputChange('inquiryType', e.target.value as ContactFormData['inquiryType'])}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:border-transparent"
            required
          >
            <option value="general">General Inquiry</option>
            <option value="investment">Investment/Pitch</option>
            <option value="services">Advisory Services</option>
          </select>
        </div>

        <div>
          <Label htmlFor="message" className="text-sm font-medium text-gray-700">
            Message *
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            required
            className="mt-1 min-h-[100px]"
            placeholder="Tell us about your startup, funding needs, or specific questions..."
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !formData.email || !formData.name || !formData.message}
          className="w-full bg-[#0077FF] hover:bg-[#0066CC] text-white"
        >
          {isSubmitting ? (
            <>
              <Send className="w-4 h-4 mr-2 animate-pulse" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Messages go directly to: <strong>info@bicorp.ai</strong>
          </p>
        </div>
      </form>
    </Card>
  );
};

export default ContactForm;
