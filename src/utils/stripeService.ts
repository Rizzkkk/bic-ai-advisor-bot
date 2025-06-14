/**
 * Stripe Service Integration
 * This service handles interactions with the Stripe API for payment processing.
 * It likely contains functions for creating payment intents, managing subscriptions,
 * or handling other e-commerce related operations, securely communicating with
 * Stripe through a backend or serverless function to protect API keys.
 */

/**
 * Stripe Service Implementation
 * Handles payment processing and checkout functionality for BIC services.
 * Manages service configurations and Stripe checkout sessions.
 */

/**
 * Configuration options for the Stripe service
 * @interface StripeConfig
 */
export interface StripeConfig {
  /** Stripe publishable key for client-side operations */
  publishableKey: string;
}

/**
 * Represents a service that can be purchased
 * @interface ServicePayment
 */
export interface ServicePayment {
  /** Name of the service */
  name: string;
  /** Price in cents (e.g., 69900 for $699.00) */
  price: number;
  /** Stripe price ID for the service */
  priceId?: string;
  /** Description of the service */
  description: string;
}

/**
 * Service class for handling Stripe payment operations
 * Manages service configurations and checkout processes
 */
export class StripeService {
  private publishableKey: string;

  /**
   * Creates a new instance of StripeService
   * @param {StripeConfig} config - Configuration options
   */
  constructor(config: StripeConfig) {
    this.publishableKey = config.publishableKey;
  }

  /**
   * Service configurations for BIC offerings
   * Each service includes name, price, and description
   */
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

  /**
   * Creates a Stripe checkout session for a service
   * @param {string} serviceKey - Key of the service to purchase
   * @param {string} [customerEmail] - Optional customer email
   * @returns {Promise<string>} Checkout session URL
   */
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

  /**
   * Redirects the user to the Stripe checkout page
   * @param {string} serviceKey - Key of the service to purchase
   * @param {string} [customerEmail] - Optional customer email
   * @returns {Promise<void>}
   */
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

  /**
   * Retrieves information about a specific service
   * @param {string} serviceKey - Key of the service
   * @returns {ServicePayment | null} Service information or null if not found
   */
  getServiceInfo(serviceKey: string): ServicePayment | null {
    return this.services[serviceKey] || null;
  }

  /**
   * Formats a price in cents to a display string
   * @param {number} priceInCents - Price in cents
   * @returns {string} Formatted price string (e.g., "$699.00")
   */
  formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toLocaleString()}`;
  }

  /**
   * Retrieves all available services
   * @returns {Record<string, ServicePayment>} Object containing all services
   */
  getAllServices(): Record<string, ServicePayment> {
    return { ...this.services };
  }
}

/**
 * Helper function to create a Stripe service instance
 * @param {string} publishableKey - Stripe publishable key
 * @returns {StripeService} New Stripe service instance
 */
export const createStripeService = (publishableKey: string): StripeService => {
  return new StripeService({ publishableKey });
};

/**
 * Default Stripe service instance for demo purposes
 * Note: Replace with actual publishable key in production
 */
export const defaultStripeService = new StripeService({
  publishableKey: 'pk_test_demo_key' // Replace with actual publishable key
});
