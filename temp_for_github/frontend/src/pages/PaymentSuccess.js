import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, Container, Divider } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { retrieveCheckoutSession } from '../utils/stripeUtils';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  // Extract session ID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        setError('No session ID found. Please contact support if you believe this is an error.');
        setLoading(false);
        return;
      }

      try {
        const response = await retrieveCheckoutSession(sessionId);
        
        if (response.success && response.session) {
          setSessionData(response.session);
          
          // If user is not authenticated, you could potentially auto-login here
          // or store subscription info for when they do login
          
        } else {
          setError('Unable to verify your payment. Please contact support.');
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError('Failed to verify your payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Handle navigation to dashboard or account setup
  const handleContinue = () => {
    if (isAuthenticated) {
      navigate('/client-profiles');
    } else {
      // If user is not yet authenticated, redirect to account setup or login
      navigate('/login', { 
        state: { 
          message: 'Please complete your account setup to access your subscription.',
          subscriptionData: sessionData
        } 
      });
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          mb: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2,
            textAlign: 'center' 
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Verifying your payment...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body1" paragraph>
                {error}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/subscribe')}
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            </Box>
          ) : (
            <Box>
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Payment Successful!
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Thank you for your subscription. Your payment has been successfully processed.
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ textAlign: 'left', mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Subscription Details
                </Typography>
                {sessionData?.subscriptionId && (
                  <Typography variant="body2">
                    Subscription ID: {sessionData.subscriptionId}
                  </Typography>
                )}
                {sessionData?.customerEmail && (
                  <Typography variant="body2">
                    Email: {sessionData.customerEmail}
                  </Typography>
                )}
                {sessionData?.subscriptionStatus && (
                  <Typography variant="body2">
                    Status: {sessionData.subscriptionStatus}
                  </Typography>
                )}
                {sessionData?.metadata?.plan_type && (
                  <Typography variant="body2">
                    Plan: {sessionData.metadata.plan_type.charAt(0).toUpperCase() + sessionData.metadata.plan_type.slice(1)}
                  </Typography>
                )}
              </Box>
              
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={handleContinue}
                sx={{ mt: 2 }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Complete Account Setup'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentSuccess; 