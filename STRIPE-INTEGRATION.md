# Stripe Integration for Finvooo

This document outlines the Stripe integration in the Finvooo application, explaining how it works and how to configure it for different environments.

## Overview

The Stripe integration allows for:
- Processing one-time payments
- Creating and managing subscriptions
- Handling payment methods
- Webhook event handling for asynchronous payment events

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Subscription Pricing (in cents)
PRICE_PRO=1100
PRICE_ENTERPRISE=2200
```

### Stripe Dashboard Setup

1. **Create Products and Prices**:
   - Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
   - Go to Products > Create Product
   - Create products for each plan (Free, Pro, Enterprise)
   - Add prices for each product (monthly subscription)

2. **Configure Webhooks**:
   - Go to Developers > Webhooks
   - Add Endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **Get API Keys**:
   - Go to Developers > API Keys
   - Use the publishable key in your frontend
   - Use the secret key in your backend (keep this secure!)

## Integration Components

### Backend

The backend integration consists of several endpoints:

#### 1. `/api/stripe/create-payment-intent`
- Creates a payment intent for one-time payments
- Requires amount, currency, and email

#### 2. `/api/stripe/create-subscription`
- Creates a subscription for a customer
- Handles trial periods and coupon codes
- Returns client secret for payment confirmation

#### 3. `/api/stripe/subscription/:id`
- Retrieves information about a specific subscription

#### 4. `/api/stripe/cancel-subscription`
- Cancels a subscription either immediately or at period end

#### 5. `/api/stripe/webhook`
- Handles Stripe webhook events
- Processes payment confirmations, subscription updates, etc.

### Frontend

The frontend integration uses:

1. **StripeElements**: Provides secure payment form elements

2. **StripePaymentForm**: Custom component that:
   - Collects payment and customer information
   - Creates payment methods
   - Confirms payments
   - Handles success and error states

3. **DirectPaymentPage**: Page component that:
   - Shows subscription plans
   - Embeds the payment form
   - Handles successful payments and redirects

## Testing

### Test Cards

Use these test card numbers for testing:

- **Successful payment**: 4242 4242 4242 4242
- **Authentication required**: 4000 0025 0000 3155
- **Payment declined**: 4000 0000 0000 9995

### Test Webhooks

To test webhooks locally:
1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe listen --forward-to localhost:5000/api/stripe/webhook`
3. Use the provided webhook secret in your `.env` file

## Production Considerations

Before deploying to production:

1. **Switch to Live Mode**:
   - Get live API keys from the Stripe Dashboard
   - Update environment variables

2. **Configure Webhooks**:
   - Set up webhooks for your production environment
   - Update the webhook secret

3. **Error Handling**:
   - Implement comprehensive error handling
   - Set up notification systems for payment failures

4. **Compliance**:
   - Ensure your implementation meets PCI compliance requirements
   - Update privacy policy and terms of service

## Troubleshooting

### Common Issues

1. **Payment Fails**:
   - Check browser console for JavaScript errors
   - Verify card information is entered correctly
   - Ensure correct API keys are being used

2. **Webhook Events Not Processing**:
   - Verify webhook URL is accessible
   - Check webhook secret is correct
   - Look for errors in webhook request/response

3. **Subscription Not Created**:
   - Check Stripe Dashboard for customer and subscription status
   - Verify payment method was attached correctly

### Logging

The integration includes comprehensive logging. Check server logs for issues with:
- Payment intent creation
- Subscription creation/updating
- Webhook event processing 