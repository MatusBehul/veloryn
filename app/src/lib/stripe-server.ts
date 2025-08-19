import Stripe from 'stripe';

// Initialize Stripe instance only when needed at runtime
export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });
};

// For backward compatibility
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

export const PRICE_ID = process.env.STRIPE_PRICE_ID || '';
