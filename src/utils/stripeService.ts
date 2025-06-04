
export interface StripeConfig {
  publishableKey: string;
}

export interface ServicePayment {
  name: string;
  price: number;
  priceId?: string;
  description: string;
}

export class StripeService {
  private publishableKey: string;

  constructor(config: StripeConfig) {
    this.publishableKey = config.publishableKey;
  }

  // Service configurations for BIC
  private services: Record<string, ServicePayment> = {
    'pitch-deck-review': {
      name: 'Pitch Deck Review & Redesign',
      price: 69900, // $699.00 in cents
      priceId: 'price_pitch_deck_review', // Replace with actual Stripe price ID
      description: 'Complete teardown and upgrade of your pitch deck with 1-hour working session'
    },
    'fundraising-sprint': {
      name: 'Fundraising Sprint',
      price: 169900, // $1,699.00 in cents
      priceId: 'price_fundraising_sprint', // Replace with actual Stripe price ID
      description: 'Get investor-ready in 2 weeks with 3 working sessions'
    },
    'gtm-kickstart': {
      name: 'GTM Kickstart',
      price: 169900, // $1,699.00 in cents
      priceId: 'price_gtm_kickstart', // Replace with actual Stripe price ID
      description: 'Define your go-to-market strategy with expert guidance'
    }
  };

  async createCheckoutSession(serviceKey: string, customerEmail?: string): Promise<string> {
    const service = this.services[serviceKey];
    if (!service) {
      throw new Error('Invalid service selected');
    }

    // In production, this would call your backend to create a Stripe session
    // For now, we'll simulate the checkout URL
    const checkoutUrl = `https://checkout.stripe.com/pay/${service.priceId}`;
    
    console.log('Creating checkout session for:', {
      service: service.name,
      price: service.price,
      customerEmail,
      checkoutUrl
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return checkoutUrl;
  }

  async redirectToCheckout(serviceKey: string, customerEmail?: string): Promise<void> {
    try {
      const checkoutUrl = await this.createCheckoutSession(serviceKey, customerEmail);
      
      // Open Stripe checkout in new tab
      window.open(checkoutUrl, '_blank');
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw new Error('Failed to redirect to checkout. Please try again.');
    }
  }

  getServiceInfo(serviceKey: string): ServicePayment | null {
    return this.services[serviceKey] || null;
  }

  formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toLocaleString()}`;
  }

  getAllServices(): Record<string, ServicePayment> {
    return { ...this.services };
  }
}

// Helper function to create Stripe service instance
export const createStripeService = (publishableKey: string): StripeService => {
  return new StripeService({ publishableKey });
};

// Default service for demo purposes
export const defaultStripeService = new StripeService({
  publishableKey: 'pk_test_demo_key' // Replace with actual publishable key
});
