// Load Stripe with the API key from environment variables or fallback to a test key
// For demo purposes only - in production, always use environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51OSFhXDvFbptpRp65HGpOaxTVgZQJhCUaLw8oCTu5rN8iOPzRPHItvEzF1KyL1H0YyEEhVzrEkLxNNRoKWWHyYEm00gTVt47Kg';

// Initialize Stripe with the secret key
const stripe = require('stripe')(stripeSecretKey);

console.log(`Stripe configured with ${stripeSecretKey.startsWith('sk_test') ? 'TEST' : 'LIVE'} mode`);

module.exports = stripe; 