const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const auth = require('../middleware/auth');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route POST /api/stripe/create-payment-intent
 * @desc Create a payment intent for a one-time payment
 * @access Public - but can be restricted with auth if needed
 */
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', email, metadata = {} } = req.body;
        
        if (!amount || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Amount and email are required' 
            });
        }

        // Check if customer already exists
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        let customer;
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: email,
                metadata: {
                    source: 'Finvooo Platform'
                }
            });
        }

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            customer: customer.id,
            receipt_email: email,
            metadata: {
                ...metadata,
                customer_email: email
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            customerId: customer.id
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create payment intent' 
        });
    }
});

/**
 * @route POST /api/stripe/create-subscription
 * @desc Create a new subscription
 * @access Public - but can be restricted with auth if needed
 */
router.post('/create-subscription', async (req, res) => {
    try {
        const { 
            paymentMethodId, 
            planType, 
            email, 
            name,
            trialDays = 0, 
            couponCode = null 
        } = req.body;
        
        if (!planType || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Plan type and email are required' 
            });
        }

        // Define pricing based on plan type - ideally these would be stored as products/prices in Stripe
        // and referenced by price IDs instead of hardcoding
        const prices = {
            free: 0,
            pro: 1100,  // $11.00
            enterprise: 2200  // $22.00
        };

        // Create or get customer
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
            
            // Update customer if name was provided
            if (name) {
                customer = await stripe.customers.update(customer.id, {
                    name: name
                });
            }
        } else {
            const customerData = {
                email: email,
                metadata: {
                    source: 'Finvooo Platform'
                }
            };
            
            if (name) customerData.name = name;
            if (paymentMethodId) {
                customerData.payment_method = paymentMethodId;
                customerData.invoice_settings = {
                    default_payment_method: paymentMethodId,
                };
            }
            
            customer = await stripe.customers.create(customerData);
        }

        // If it's a free plan, just return success
        if (planType === 'free' || prices[planType] === 0) {
            return res.json({
                success: true,
                message: 'Free plan activated',
                customerId: customer.id
            });
        }

        // If payment method provided, attach it
        if (paymentMethodId) {
            try {
                // Attach payment method to customer
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: customer.id,
                });

                // Set as default payment method
                await stripe.customers.update(customer.id, {
                    invoice_settings: {
                        default_payment_method: paymentMethodId,
                    },
                });
            } catch (attachError) {
                console.error('Error attaching payment method:', attachError);
                // Continue with subscription creation if this fails
                // The payment might still work with the client-provided method
            }
        }

        // Build subscription parameters
        const subscriptionParams = {
            customer: customer.id,
            items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: planType === 'pro' ? 'Pro Plan' : 'Enterprise Plan',
                            description: `Finvooo ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
                            metadata: {
                                plan_type: planType
                            }
                        },
                        unit_amount: prices[planType],
                        recurring: {
                            interval: 'month',
                        },
                    },
                },
            ],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                plan_type: planType
            }
        };

        // Add trial days if specified
        if (trialDays > 0) {
            const trialEnd = Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60);
            subscriptionParams.trial_end = trialEnd;
        }

        // Add coupon if specified
        if (couponCode) {
            try {
                const coupons = await stripe.coupons.list({
                    limit: 1,
                    code: couponCode
                });
                
                if (coupons.data.length > 0) {
                    subscriptionParams.coupon = coupons.data[0].id;
                }
            } catch (couponError) {
                console.error('Error applying coupon:', couponError);
                // Continue without the coupon if it fails
            }
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create(subscriptionParams);

        // Return success with subscription details
        res.json({
            success: true,
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            customerId: customer.id,
            status: subscription.status,
            subscriptionItems: subscription.items.data.map(item => ({
                id: item.id,
                priceId: item.price.id,
                productId: item.price.product,
                unitAmount: item.price.unit_amount,
                currency: item.price.currency
            }))
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create subscription',
            error: error.type ? {
                type: error.type,
                code: error.code,
                param: error.param
            } : null
        });
    }
});

/**
 * @route GET /api/stripe/subscription/:id
 * @desc Get subscription details
 * @access Private
 */
router.get('/subscription/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const subscription = await stripe.subscriptions.retrieve(id, {
            expand: ['customer', 'default_payment_method']
        });
        
        res.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                currentPeriodEnd: subscription.current_period_end,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                customer: {
                    id: subscription.customer.id,
                    email: subscription.customer.email,
                    name: subscription.customer.name
                },
                items: subscription.items.data.map(item => ({
                    id: item.id,
                    priceId: item.price.id,
                    productId: item.price.product,
                    unitAmount: item.price.unit_amount,
                    currency: item.price.currency
                }))
            }
        });
    } catch (error) {
        console.error('Error retrieving subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to retrieve subscription' 
        });
    }
});

/**
 * @route POST /api/stripe/cancel-subscription
 * @desc Cancel a subscription
 * @access Private
 */
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
    try {
        const { subscriptionId, cancelImmediately = false } = req.body;
        
        if (!subscriptionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Subscription ID is required' 
            });
        }
        
        let subscription;
        
        if (cancelImmediately) {
            // Cancel immediately
            subscription = await stripe.subscriptions.del(subscriptionId);
        } else {
            // Cancel at period end
            subscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true
            });
        }
        
        res.json({
            success: true,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to cancel subscription' 
        });
    }
});

/**
 * @route POST /api/stripe/webhook
 * @desc Handle Stripe webhook events
 * @access Public
 */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // TODO: Implement business logic for successful payment
            // - Update order status
            // - Send confirmation email
            // - Update user's features/access
            break;
            
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('Payment succeeded for invoice:', invoice.id);
            // TODO: Implement business logic for successful invoice payment
            // - Update subscription status in your database
            // - Provision resources for the customer
            break;
            
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            console.log('Payment failed for invoice:', failedInvoice.id);
            // TODO: Implement business logic for failed invoice payment
            // - Notify customer
            // - Attempt to recover payment
            break;
            
        case 'customer.subscription.created':
            const newSubscription = event.data.object;
            console.log('New subscription created:', newSubscription.id);
            // TODO: Implement business logic for new subscription
            // - Store subscription details in your database
            // - Set up user's account with appropriate features
            break;
            
        case 'customer.subscription.updated':
            const updatedSubscription = event.data.object;
            console.log('Subscription updated:', updatedSubscription.id, 'Status:', updatedSubscription.status);
            // TODO: Implement business logic for updated subscription
            // - Update subscription status in your database
            // - Adjust user's features based on new subscription status
            break;
            
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            console.log('Subscription canceled:', deletedSubscription.id);
            // TODO: Implement business logic for canceled subscription
            // - Update subscription status in your database
            // - Adjust user's features based on cancellation
            // - Send confirmation email
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
});

/**
 * @route POST /api/stripe/create-checkout-session
 * @desc Create a Stripe Checkout Session for subscription
 * @access Public
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { planType, successUrl, cancelUrl } = req.body;
        
        console.log(`Creating checkout session for plan: ${planType}`);
        
        if (!planType || !successUrl || !cancelUrl) {
            return res.status(400).json({
                success: false,
                message: 'Plan type, success URL, and cancel URL are required'
            });
        }
        
        // Define the price IDs for each plan - Should be stored in environment variables or database
        const priceIds = {
            pro: process.env.STRIPE_PRO_PRICE_ID || 'price_1PXWwTDvFbptpRp6RiRMZukc',
            enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_1PXWxWDvFbptpRp6ojXLN30L'
        };
        
        // Make sure requested plan type exists
        if (!priceIds[planType]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan type'
            });
        }
        
        // Log the price ID being used
        console.log(`Using price ID: ${priceIds[planType]} for plan: ${planType}`);
        
        // Create the checkout session
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceIds[planType],
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl,
                allow_promotion_codes: true,
                billing_address_collection: 'required',
                customer_email: req.body.email || undefined,
                metadata: {
                    plan_type: planType
                },
                subscription_data: {
                    metadata: {
                        plan_type: planType
                    }
                }
            });
            
            console.log(`Checkout session created: ${session.id}`);
            
            res.json({
                success: true,
                sessionId: session.id,
                url: session.url
            });
        } catch (stripeError) {
            console.error('Stripe error creating session:', stripeError);
            
            // Send a more detailed error response
            return res.status(400).json({
                success: false,
                message: 'Error creating Stripe checkout session',
                error: {
                    type: stripeError.type,
                    code: stripeError.code,
                    message: stripeError.message,
                    param: stripeError.param
                }
            });
        }
    } catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create checkout session',
            error: error.toString()
        });
    }
});

/**
 * @route GET /api/stripe/checkout-session/:sessionId
 * @desc Retrieve a Stripe Checkout Session
 * @access Public
 */
router.get('/checkout-session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        console.log(`Retrieving checkout session: ${sessionId}`);
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }
        
        // Retrieve the session with expanded subscription and customer data
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer']
        });
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Checkout session not found'
            });
        }
        
        console.log(`Successfully retrieved session: ${session.id}, status: ${session.status}`);
        
        res.json({
            success: true,
            session: {
                id: session.id,
                status: session.status,
                customerEmail: session.customer_email,
                customerId: session.customer ? session.customer.id : null,
                customerDetails: session.customer_details,
                subscriptionId: session.subscription ? session.subscription.id : null,
                subscriptionStatus: session.subscription ? session.subscription.status : null,
                paymentStatus: session.payment_status,
                metadata: session.metadata
            }
        });
    } catch (error) {
        console.error('Session retrieval error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve checkout session'
        });
    }
});

module.exports = router; 