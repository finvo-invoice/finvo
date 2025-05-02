# Stripe Checkout Integration for Finvo

This document outlines how the Stripe Checkout integration is implemented in the Finvo application for handling subscription payments.

## Overview

The application uses Stripe Checkout, a pre-built, hosted payment page that handles the payment process securely. This implementation:

1. Redirects users to Stripe's hosted checkout page when they select a subscription plan
2. Processes subscription creation on successful payment
3. Redirects users back to the application with confirmation details

## Prerequisites

To use this integration, you need:

1. A Stripe account
2. Stripe API keys (publishable and secret)
3. Stripe products and prices set up for your subscription plans

## Configuration

### 1. Environment Variables

Add the following environment variables to your backend `.env` file:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_PRO_PRICE_ID=price_123456789
STRIPE_ENTERPRISE_PRICE_ID=price_987654321
```

### 2. Stripe Dashboard Setup

1. **Create Products and Prices**:
   - Go to Stripe Dashboard > Products
   - Create products for each subscription plan (e.g., "Pro Plan", "Enterprise Plan")
   - For each product, create a recurring price with the appropriate amount and billing interval
   - Note the Price IDs to use in your environment variables

2. **Configure Webhook (Optional but recommended)**:
   - Set up a webhook endpoint in Stripe Dashboard > Developers > Webhooks
   - Add endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select events to listen for (recommended: `checkout.session.completed`, `customer.subscription.created`, etc.)
   - Get the webhook signing secret and add it to your environment variables:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
     ```

## Implementation Details

### Backend Endpoints

The application includes these Stripe-related endpoints:

1. `POST /api/stripe/create-checkout-session` - Creates a Checkout session for a subscription plan
2. `GET /api/stripe/checkout-session/:sessionId` - Retrieves details about a completed Checkout session
3. `POST /api/stripe/webhook` - Handles Stripe webhook events (optional)

### Frontend Components

The implementation includes these components:

1. `CheckoutRedirect.js` - Redirects users to Stripe Checkout when they select a plan
2. `PaymentSuccess.js` - Handles the success redirect after payment completion
3. `PricingPlans.js` - Displays subscription plans and initiates the checkout process

### Flow

1. User selects a subscription plan on the pricing page
2. User is redirected to `/subscribe?plan=pro` or `/subscribe?plan=enterprise`
3. The `CheckoutRedirect` component creates a Checkout session via the backend API
4. User is redirected to Stripe's hosted checkout page
5. User completes payment on Stripe's page
6. Stripe redirects user back to `/payment-success?session_id=xxx`
7. The `PaymentSuccess` component verifies the payment and displays confirmation

## Customization

### Checkout Page Appearance

You can customize the appearance of the Stripe Checkout page in the backend code:

```javascript
const session = await stripe.checkout.sessions.create({
  // ... other options
  
  // Customize appearance
  payment_method_types: ['card'],
  allow_promotion_codes: true,
  billing_address_collection: 'required',
  
  // Add custom data
  metadata: {
    plan_type: planType
  }
});
```

### Success Page

The success page can be customized in `PaymentSuccess.js` to display different information or take different actions based on the subscription status.

## Testing

Use Stripe's test cards to test the checkout flow:

- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

## Troubleshooting

Common issues:

1. **Redirect not working**: Check the success and cancel URLs in the checkout session creation
2. **Invalid Price ID**: Ensure you've correctly set up products and prices in Stripe
3. **Webhook failures**: Check the webhook endpoint is accessible and the signing secret is correct

## Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/checkout/quickstart)
- [Stripe Subscription Integration](https://stripe.com/docs/billing/subscriptions/quickstart)
- [Stripe Testing Documentation](https://stripe.com/docs/testing) 