import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Container, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { redirectToCheckout } from '../../utils/stripeUtils';

const CheckoutRedirect = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extract plan type from query parameters or state
  const queryParams = new URLSearchParams(location.search);
  const planType = queryParams.get('plan') || (location.state && location.state.planType) || 'pro';
  const email = queryParams.get('email') || (location.state && location.state.email) || '';

  // Handle the checkout process
  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    setDetailedError('');
    
    try {
      console.log(`Initiating checkout for plan: ${planType}`);
      await redirectToCheckout(planType, email);
      // The page will redirect to Stripe, so we don't need to do anything else here
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Failed to redirect to checkout. Please try again.');
      
      // Capture detailed error information
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        setDetailedError(`Server Error: ${error.response.status} - ${error.response.data ? JSON.stringify(error.response.data) : 'No response data'}`);
      } else if (error.request) {
        // The request was made but no response was received
        setDetailedError('Network Error: No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setDetailedError(`Request Error: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  // Automatically redirect to checkout when component mounts
  useEffect(() => {
    handleCheckout();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Redirecting to Secure Checkout
        </Typography>
        
        {loading && !error && (
          <>
            <CircularProgress sx={{ mt: 4, mb: 2 }} />
            <Typography variant="body1">
              Please wait while we prepare your checkout session...
            </Typography>
          </>
        )}
        
        {error && (
          <>
            <Typography variant="body1" color="error" sx={{ mt: 4, mb: 2 }}>
              {error}
            </Typography>
            
            {detailedError && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left', width: '100%' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {detailedError}
                </Typography>
              </Alert>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                onClick={handleCheckout}
              >
                Try Again
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/landing')}
              >
                Return to Home
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default CheckoutRedirect; 