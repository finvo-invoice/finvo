import axios from 'axios';
import { API_URL } from '../config';

// Create API with auth token
const createAuthAPI = (token) => {
  return axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// Create subscription
export const createSubscription = async (paymentMethodId, planType, email, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/subscriptions`,
      {
        paymentMethodId,
        planType,
        email
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Simulate creating a subscription without a backend
export const simulateSubscription = async (paymentMethodId, planType, email) => {
  // This is a mock function that simulates a successful subscription creation
  // In a real implementation, this would make a request to your backend
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        subscription: {
          id: `sub_${Math.random().toString(36).substr(2, 9)}`,
          planType,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          customer: {
            email,
            name: email.split('@')[0]
          }
        },
        clientSecret: 'mock_client_secret'
      });
    }, 1000);
  });
};

// Get available plans
export const getPlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/plans`);
    return response.data;
  } catch (error) {
    // Fallback to predefined plans if API call fails
    return {
      plans: [
        {
          id: 'free',
          name: 'Free Plan',
          price: 0,
          interval: 'month',
          features: [
            'Basic expense tracking',
            '5 categories',
            'Monthly reports',
            'Email support'
          ]
        },
        {
          id: 'pro',
          name: 'Pro Plan',
          price: 9.99,
          interval: 'month',
          features: [
            'Unlimited expense tracking',
            'Unlimited categories',
            'Weekly and monthly reports',
            'Priority email support',
            'Budget planning tools',
            'Data export'
          ]
        },
        {
          id: 'enterprise',
          name: 'Enterprise Plan',
          price: 29.99,
          interval: 'month',
          features: [
            'Everything in Pro',
            'Multiple users',
            'Role-based access control',
            'Advanced analytics',
            'Dedicated account manager',
            'Custom integrations',
            'API access'
          ]
        }
      ]
    };
  }
};

// Confirm subscription payment
export const confirmSubscriptionPayment = async (subscriptionId, paymentIntentId, token) => {
  try {
    const api = createAuthAPI(token);
    const response = await api.post('/stripe/confirm-payment', {
      subscriptionId,
      paymentIntentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || 'Failed to confirm payment';
  }
};

// Get customer subscription status
export const getSubscriptionStatus = async (token) => {
  try {
    const api = createAuthAPI(token);
    const response = await api.get('/stripe/subscription-status');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || 'Failed to get subscription status';
  }
};

// Cancel subscription
export const cancelSubscription = async (token) => {
  try {
    const response = await axios.post(
      `${API_URL}/cancel-subscription`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Update payment method
export const updatePaymentMethod = async (paymentMethodId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/update-payment-method`,
      {
        paymentMethodId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
}; 