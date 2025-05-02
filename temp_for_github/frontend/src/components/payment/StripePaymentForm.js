import React, { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import { stripePromise } from '../../utils/stripeConfig';
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Link,
  Fade,
  Alert,
  useTheme,
  CircularProgress,
  styled
} from '@mui/material';
import { createSubscription } from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import visaIcon from '../../assets/visa.svg';
import mastercardIcon from '../../assets/mastercard.svg';
import amexIcon from '../../assets/amex.svg';
import jcbIcon from '../../assets/jcb.svg';

// Create styled components to match Stripe's form styling
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 4,
    fontSize: '14px',
    backgroundColor: '#f9fafb',
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px #0570de',
    }
  },
  '& .MuiInputBase-input': {
    padding: '10px 12px',
    height: '20px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E7EB',
    borderWidth: '1px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 400,
    transform: 'translate(14px, 14px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    }
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 4,
  fontSize: '14px',
  backgroundColor: '#f9fafb',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E7EB',
    borderWidth: '1px',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0570de',
    borderWidth: 1,
    boxShadow: '0 0 0 2px #0570de',
  },
  '& .MuiSelect-select': {
    padding: '10px 12px',
    height: '20px',
  }
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: 400,
  transform: 'translate(14px, 14px) scale(1)',
  '&.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  }
}));

const CardContainer = styled(Box)(({ theme }) => ({
  padding: '10px 12px',
  border: '1px solid #E5E7EB',
  borderRadius: 4,
  backgroundColor: '#f9fafb',
  '&:focus-within': {
    boxShadow: '0 0 0 2px #0570de',
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: 4,
  padding: '10px 0',
  height: '40px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#333',
  },
  '&.Mui-disabled': {
    backgroundColor: '#a1a1aa',
    color: '#fff',
  }
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginBottom: '6px',
  '& .MuiFormControlLabel-label': {
    fontSize: '14px',
    color: '#4b5563',
  }
}));

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#4b5563',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      lineHeight: '20px',
      '::placeholder': {
        color: '#a1a1aa',
      },
    },
    invalid: {
      color: '#f87171',
      iconColor: '#f87171',
    },
  },
  hidePostalCode: true
};

const PaymentForm = ({ planType, planPrice, onSuccess, onCancel, simplified = false }) => {
  const stripe = useStripe();
  const elements = useElements();
  const theme = useTheme();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [country, setCountry] = useState('US');
  const [pin, setPin] = useState('');
  const [businessPurchase, setBusinessPurchase] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const url = `/api/stripe/create-subscription`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planType,
            email: email || 'temporary@example.com',
            amount: planPrice * 100,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
        setCustomerId(data.customerId);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError(error.message || 'Failed to initialize payment. Please try again.');
      }
    };

    if (planType && planPrice > 0) {
      createPaymentIntent();
    }
  }, [planType, planPrice]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!email || !cardholderName) {
        throw new Error('Please fill in all required fields');
      }

      if (pin && pin.length !== 4) {
        throw new Error('PIN must be 4 digits');
      }

      const url = clientSecret 
        ? `/api/stripe/update-subscription` 
        : `/api/stripe/create-subscription`;

      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          email: email,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
          receipt_email: email,
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      } else {
        const subscriptionResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            planType,
            email,
            name: cardholderName,
          }),
        });

        const subscriptionData = await subscriptionResponse.json();

        if (!subscriptionData.success) {
          throw new Error(subscriptionData.message || 'Failed to process subscription');
        }

        if (subscriptionData.clientSecret) {
          const { error: confirmError } = await stripe.confirmCardPayment(subscriptionData.clientSecret);
          if (confirmError) {
            throw new Error(confirmError.message);
          }
        }

        setCustomerId(subscriptionData.customerId);
      }

      if (onSuccess) {
        onSuccess({
          email,
          name: cardholderName,
          customerId,
          planType,
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && !simplified && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ width: '100%', mb: 1.5 }}>
            {error}
          </Alert>
        </Fade>
      )}

      <Box sx={{ mb: 0 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
          Email *
        </Typography>
        <StyledTextField
          variant="outlined"
          fullWidth
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          InputProps={{ 
            sx: { 
              fontSize: '0.85rem',
              height: '40px',
              padding: 0
            } 
          }}
        />
      </Box>

      <Box sx={{ mt: 0 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
          Card information
        </Typography>
        <CardContainer sx={{ height: '40px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <CardElement options={{
              ...CARD_ELEMENT_OPTIONS,
              style: {
                ...CARD_ELEMENT_OPTIONS.style,
                base: {
                  ...CARD_ELEMENT_OPTIONS.style.base,
                  fontSize: '14px',
                  lineHeight: '40px',
                }
              }
            }} />
            <Box sx={{ display: 'flex', gap: 0.5, mr: 0.75 }}>
              <img src={visaIcon || "/visa.svg"} alt="Visa" style={{ height: 14 }} />
              <img src={mastercardIcon || "/mastercard.svg"} alt="Mastercard" style={{ height: 14 }} />
              <img src={amexIcon || "/amex.svg"} alt="American Express" style={{ height: 14 }} />
              <img src={jcbIcon || "/jcb.svg"} alt="JCB" style={{ height: 14 }} />
            </Box>
          </Box>
        </CardContainer>
      </Box>

      <Box sx={{ mt: 0 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
          Cardholder name *
        </Typography>
        <StyledTextField
          variant="outlined"
          fullWidth
          required
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Full name on card"
          InputProps={{ 
            sx: { 
              fontSize: '0.85rem',
              height: '40px',
              padding: 0
            } 
          }}
        />
      </Box>

      <Box sx={{ mt: 0 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
          Country or region
        </Typography>
        <StyledSelect
          fullWidth
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          sx={{ height: '40px' }}
        >
          <MenuItem value="US">United States</MenuItem>
          <MenuItem value="CA">Canada</MenuItem>
          <MenuItem value="UK">United Kingdom</MenuItem>
          <MenuItem value="AU">Australia</MenuItem>
          <MenuItem value="IN">India</MenuItem>
          <MenuItem value="OTHER">Other</MenuItem>
        </StyledSelect>
      </Box>

      <Box sx={{ mt: 0 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
          PIN
        </Typography>
        <StyledTextField
          variant="outlined"
          fullWidth
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          inputProps={{ maxLength: 4 }}
          placeholder="••••"
          InputProps={{ 
            sx: { 
              fontSize: '0.85rem',
              height: '40px',
              padding: 0
            } 
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        <StyledFormControlLabel
          control={
            <Checkbox
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              color="primary"
              size="small"
              sx={{
                color: '#9ca3af',
                '&.Mui-checked': {
                  color: '#000',
                }
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.75rem' }}>
              Securely save my information for 1-click checkout
            </Typography>
          }
          sx={{ m: 0 }}
        />
        
        {saveInfo && (
          <Typography variant="body2" color="#6b7280" sx={{ ml: 3.5, fontSize: '0.7rem' }}>
            Pay faster on Finvo and everywhere Link is accepted.
          </Typography>
        )}

        <StyledFormControlLabel
          control={
            <Checkbox
              checked={businessPurchase}
              onChange={(e) => setBusinessPurchase(e.target.checked)}
              color="primary"
              size="small"
              sx={{
                color: '#9ca3af',
                '&.Mui-checked': {
                  color: '#000',
                }
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.75rem' }}>
              I'm purchasing as a business
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Box>

      <SubmitButton
        variant="contained"
        fullWidth
        type="submit"
        disabled={!stripe || loading}
        sx={{ 
          mt: 3, 
          mb: 0,
          height: '42px'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            Processing...
          </Box>
        ) : (
          `Subscribe`
        )}
      </SubmitButton>
    </Box>
  );
};

// Wrapper component that provides the Stripe context
const StripePaymentForm = (props) => {
  if (props.noWrapper) {
    return <PaymentForm {...props} />;
  }
  
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm; 