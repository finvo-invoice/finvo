import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
  useTheme,
  Alert,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const { resetPassword, error } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const theme = useTheme();

  const validateForm = () => {
    if (!email) {
      setFormError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Email is invalid');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const result = await resetPassword(email);
      if (result) {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setFormError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}10)`,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: { xs: 3, sm: 5 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  background: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                }}
              >
                <Typography variant="h5" component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                  Finvo
                </Typography>
              </Box>
            </Box>

            <Typography
              component="h1"
              variant="h4"
              align="center"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Forgot Password
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 4, maxWidth: 400 }}
            >
              {success
                ? 'Password reset instructions have been sent to your email.'
                : 'Enter your email address and we\'ll send you instructions to reset your password.'}
            </Typography>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {success ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <CheckCircleOutlineIcon
                    sx={{
                      fontSize: 80,
                      color: theme.palette.success.main,
                    }}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Check Your Email
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  We've sent password reset instructions to:
                </Typography>
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  {email}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  sx={{
                    mt: 3,
                    py: 1.2,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                    },
                  }}
                >
                  Return to Sign In
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleChange}
                  error={!!formError}
                  helperText={formError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                    },
                  }}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Back to Sign In
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword; 