import axiosInstance from './axiosConfig';

/**
 * Redirects the user to Stripe Checkout for the specified plan
 * @param {string} planType - The type of plan ('pro' or 'enterprise')
 * @param {string} email - Optional customer email to pre-fill
 * @returns {Promise} - Promise that resolves with the session creation response
 */
export const redirectToCheckout = async (planType, email = null) => {
  try {
    console.log(`Creating checkout session for plan: ${planType}, email: ${email || 'not provided'}`);
    
    // Base URLs for success and cancel redirects (using window.location)
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/subscribe`;
    
    // Create checkout session on the server
    const response = await axiosInstance.post('/api/stripe/create-checkout-session', {
      planType,
      successUrl,
      cancelUrl,
      email,
    });
    
    console.log('Checkout session response:', response.data);
    
    if (response.data.success && response.data.url) {
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
      return response.data;
    } else {
      console.error('Invalid response format:', response.data);
      throw new Error(response.data.message || 'Failed to create checkout session');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Add more context to the error
    if (!error.message && error.response && error.response.data) {
      error.message = `Server error: ${error.response.data.message || JSON.stringify(error.response.data)}`;
    } else if (!error.message && error.request) {
      error.message = 'Network error: No response received from server';
    } else if (!error.message) {
      error.message = 'Unknown error occurred during checkout';
    }
    
    throw error;
  }
};

/**
 * Retrieves a checkout session using the session ID
 * @param {string} sessionId - The ID of the checkout session
 * @returns {Promise} - Promise that resolves with the session details
 */
export const retrieveCheckoutSession = async (sessionId) => {
  try {
    const response = await axiosInstance.get(`/api/stripe/checkout-session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}; 