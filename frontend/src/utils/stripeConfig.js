import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key
// In production, load this from environment variables or a secure backend endpoint
// For demo purposes, using a test key here
const publishableKey = 'pk_test_51OSFhXDvFbptpRp6vvv5GOVdwbJXgqZcFrLqeRJWPOEHx6rjBfOHx9RLDr0S8DBSbjuAj8a61bA9TxwZNshFKbKu00oMadVQKg';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(publishableKey);

// Define common options for Elements appearance
const elementsOptions = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    },
  ],
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#f9fafb',
      colorText: '#4b5563',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
    rules: {
      '.Input': {
        border: '1px solid #E5E7EB',
        boxShadow: 'none',
        fontSize: '14px',
      },
      '.Input:focus': {
        boxShadow: '0 0 0 2px #0570de',
        border: '1px solid #0570de',
      },
      '.Label': {
        fontSize: '14px',
        color: '#6b7280',
      },
      '.Error': {
        fontSize: '14px',
        color: '#f87171',
      }
    }
  }
};

export { stripePromise, elementsOptions }; 