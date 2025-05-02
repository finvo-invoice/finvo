import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Snackbar, Alert, CircularProgress, Link, Grid, IconButton, Divider } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import StripePaymentForm from './StripePaymentForm';
import { stripePromise, elementsOptions } from '../../utils/stripeConfig';
import visaIcon from '../../assets/images/visa.svg';
import mastercardIcon from '../../assets/images/mastercard.svg';
import amexIcon from '../../assets/images/amex.svg';
import jcbIcon from '../../assets/images/jcb.svg';

const DirectPaymentPage = () => {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentEmail, setPaymentEmail] = useState('');
  const navigate = useNavigate();

  // Hide the navbar
  useEffect(() => {
    document.body.classList.add('hide-navbar');
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  const plan = {
    id: 'creator',
    name: 'Creator',
    price: 22.00,
    discountedPrice: 11.00,
    billingCycle: 'monthly',
    features: [
      'Unlimited invoices',
      'Premium templates',
      'Multi-currency support',
      'Advanced tracking',
      'Custom branding',
      'Priority support'
    ]
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      setProcessing(true);
      
      // In a real implementation, you would make an API call to your backend here
      // to create a user account and store the subscription information
      // Example:
      /*
      const response = await fetch('/api/users/register-with-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: paymentDetails.email,
          name: paymentDetails.name,
          stripeCustomerId: paymentDetails.customerId,
          subscriptionPlan: paymentDetails.planType,
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create account');
      }
      */
      
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setSuccess(true);
      setPaymentEmail(paymentDetails.email);
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Your account has been created! Please check your email for login instructions.' 
          } 
        });
      }, 3000);
    } catch (error) {
      console.error('Account creation error:', error);
      setError(error.message || 'Failed to complete registration after payment.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Track impressions and page view (in a real implementation)
  useEffect(() => {
    // Analytics tracking code would go here
    document.title = "Subscribe to Finvooo";
    
    // Add a class to the body to hide the navbar
    document.body.classList.add('hide-navbar');
    
    // Clean up when unmounting
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  if (success) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          zIndex: 9999,
        }}
      >
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <CircularProgress color="success" sx={{ mb: 1.5 }} />
          <Typography variant="h5" gutterBottom>Payment Successful!</Typography>
          <Typography variant="body2">
            Thank you for subscribing to our {plan.name} Plan. You'll be redirected to login shortly...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {/* Left Panel - Black */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: '35%', md: '100%' },
          bgcolor: 'black',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2.5, md: 4 },
          overflow: 'auto',
        }}
      >
        {/* Content container to create black space around */}
        <Box sx={{ 
          maxWidth: '400px', 
          width: '100%',
          mx: 'auto',
          my: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 48px)',
        }}>
          {/* Header with back button and company info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, md: 2 } }}>
            <IconButton 
              onClick={handleBackToHome} 
              sx={{ 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.3)', 
                p: 0.4,
                mr: 1.5,
                width: 28,
                height: 28
              }}
            >
              <ArrowBackIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: 'white',
                color: 'black',
                mr: 1,
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              F
            </Box>
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                fontWeight: 600, 
                letterSpacing: 0.5,
                fontSize: '0.9rem'
              }}
            >
              Finvooo
            </Typography>
          </Box>
          
          {/* Subscription info section with more compact spacing */}
          <Box sx={{ 
            flex: '1 1 auto', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            py: 0.5,
            gap: { xs: 1.5, md: 2 }
          }}>
            {/* First section: Price and subscription info */}
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem',
                  mb: 1,
                  opacity: 0.9,
                }}
              >
                Subscribe to {plan.name} and 1 more
              </Typography>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography 
                    variant="h3" 
                    component="div" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '2rem', md: '2.25rem' },
                      lineHeight: 1
                    }}
                  >
                    US${plan.discountedPrice.toFixed(2)}
                  </Typography>
                  <Typography 
                    component="span" 
                    sx={{ 
                      ml: 0.75,
                      fontSize: '0.7rem',
                      opacity: 0.8,
                      display: 'inline-block'
                    }}
                  >
                    due<br />today
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 0.75,
                    opacity: 0.7,
                    fontSize: '0.75rem',
                  }}
                >
                  Then starting at US${plan.price.toFixed(2)} per month
                </Typography>
              </Box>
            </Box>

            {/* Second section: Plan details */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                  {plan.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                  US${plan.price.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.75rem', mb: 0.75 }}>
                Qty 1, Billed monthly
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'inline-block',
                    width: 5, 
                    height: 5, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255,255,255,0.5)', 
                    mr: 0.75
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
                  {plan.name} First Month 50% Off (-$11.00)
                </Typography>
              </Box>
            </Box>

            {/* Third section: Credit usage */}
            <Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                  Credit Usage
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
                  Price varies
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
                Billed monthly based on usage
              </Typography>
            </Box>

            {/* Fourth section: Subtotal with discount */}
            <Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', mb: 1 }}>
                Subtotal
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  p: 1,
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    component="span" 
                    sx={{ 
                      px: 0.75, 
                      py: 0.2, 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      borderRadius: 0.5,
                      mr: 0.75,
                      fontSize: '0.65rem'
                    }}
                  >
                    {plan.name} First Month 50% Off
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
                    50% off for a month
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  -$11.00
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Total due section at bottom */}
          <Box sx={{ 
            mt: 'auto',
            pt: 1, 
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                Total due today
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                US${plan.discountedPrice.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Panel - White */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: '65%', md: '100%' },
          bgcolor: 'white',
          overflow: 'auto',
          boxShadow: { xs: '0 -5px 10px rgba(0,0,0,0.05)', md: 'none' },
          zIndex: { xs: 2, md: 1 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ 
          maxWidth: 460, 
          width: '100%', 
          mx: 'auto', 
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          py: { xs: 1, md: 2.5 }
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              fontSize: '1.25rem'
            }}
          >
            Pay with card
          </Typography>

          {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
              <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Snackbar>
          )}

          {/* Stripe Elements integration */}
          <Elements stripe={stripePromise} options={elementsOptions}>
            <StripePaymentForm 
              planType={plan.id}
              planPrice={plan.discountedPrice}
              onSuccess={handlePaymentSuccess} 
              onCancel={handleBackToHome}
              simplified={true}
            />
          </Elements>

          {/* Payment terms & policy */}
          <Box sx={{ 
            mt: 'auto', 
            pt: 3, 
            pb: 2, 
            borderTop: '1px solid #eee', 
            textAlign: 'center' 
          }}>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.7rem' }}>
              By confirming your subscription, you allow Finvooo to charge your card for future payments in accordance with their terms. You can always cancel your subscription.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              By placing your order, you agree to our <Link color="primary" underline="hover" href="#">Terms of Service</Link> and <Link color="primary" underline="hover" href="#">Privacy Policy</Link>.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', mr: 1 }}>
                Powered by
              </Typography>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                alt="Stripe" 
                style={{ height: 16 }} 
              />
              <Typography 
                component={Link} 
                color="primary" 
                underline="hover" 
                href="#" 
                sx={{ ml: 1.5, fontSize: '0.7rem' }}
              >
                Legal
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DirectPaymentPage; 