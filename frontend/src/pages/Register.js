import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/images/finvo-logo.svg';
import './Register.css';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Container, 
  Alert, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress, 
  InputAdornment, 
  IconButton, 
  Grid, 
  Divider,
  useTheme
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon
} from '@mui/icons-material';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  useEffect(() => {
    // Check if there's a plan parameter in the URL
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan');
    if (planParam) {
      setSelectedPlan(planParam);
    }
  }, [location]);
  
  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError("Passwords do not match");
    }
    
    if (!acceptTerms) {
      return setError("You must accept the terms and conditions");
    }

    try {
      setError("");
      setLoading(true);
      await signup(email, password);
      
      // Navigate based on selected plan
      if (selectedPlan === 'free') {
        navigate("/dashboard"); // Free trial - direct to dashboard
      } else if (selectedPlan) {
        navigate(`/payment?plan=${selectedPlan}`);
      } else {
        navigate("/dashboard"); // Default - go to dashboard
      }
    } catch (err) {
      setError("Failed to create an account: " + err.message);
    }
    setLoading(false);
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignUp = async (e) => {
    e.preventDefault();
    if (googleLoading) return;
    
    setGoogleLoading(true);
    
    try {
      console.log("Initiating Google sign-up...");
      
      // Now that Supabase is active again, we'll use the signInWithGoogle function directly
      await signInWithGoogle();
      
      // Set a timeout to reset loading state in case the redirect doesn't happen
      setTimeout(() => {
        setGoogleLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to initiate Google sign-up:', error);
      setError('Could not connect to Google. Please try again.');
      setGoogleLoading(false);
    }
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
      <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '360px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={logoImage}
                  alt="Finvo Logo"
                  style={{
                    height: '35px',
                    width: 'auto',
                  }}
                />
              </Box>
            </Box>

            <Typography
              component="h1"
              variant="h5"
              align="center"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 3, maxWidth: 260 }}
            >
              Join Finvo today to manage your invoices and clients with ease.
            </Typography>
            
            {selectedPlan && (
              <Alert severity="info" sx={{ width: '100%', mb: 2, fontSize: '0.85rem' }}>
                {selectedPlan === 'free' 
                  ? 'You are signing up for a free 1-month trial. No credit card required.' 
                  : `You're signing up for the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan.`}
              </Alert>
            )}
            
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}
          
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
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(240, 245, 255, 0.4)',
                    '&:hover': {
                      backgroundColor: 'rgba(240, 245, 255, 0.6)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(240, 245, 255, 0.6)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.9rem',
                  },
                }}
                size="small"
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(240, 245, 255, 0.4)',
                    '&:hover': {
                      backgroundColor: 'rgba(240, 245, 255, 0.6)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(240, 245, 255, 0.6)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.9rem',
                  },
                }}
                size="small"
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="passwordConfirm"
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                id="passwordConfirm"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(240, 245, 255, 0.4)',
                    '&:hover': {
                      backgroundColor: 'rgba(240, 245, 255, 0.6)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(240, 245, 255, 0.6)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.9rem',
                  },
                }}
                size="small"
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    value="acceptTerms" 
                    color="primary" 
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    I agree to the{" "}
                    <Link to="/terms" style={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" style={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      Privacy Policy
                    </Link>
                    {selectedPlan === 'free' && (
                      <>
                        {". I understand that after the 1-month free trial, I will need to upgrade to continue using all features."}
                      </>
                    )}
                  </Typography>
                }
                sx={{ mb: 2 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1,
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                  },
                }}
                size="small"
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, fontSize: '0.85rem' }}>
                  OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={googleLoading ? null : <GoogleIcon fontSize="small" />}
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                sx={{
                  py: 1,
                  borderRadius: 1.5,
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  backgroundColor: '#fff',
                  color: theme.palette.text.primary,
                  border: '1px solid #dadce0',
                  position: 'relative',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                    borderColor: '#dadce0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                }}
                size="small"
              >
                {googleLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress 
                      size={14} 
                      thickness={4}
                      sx={{ 
                        color: theme.palette.primary.main,
                        mr: 1
                      }} 
                    />
                    Connecting...
                  </Box>
                ) : (
                  'Sign up with Google'
                )}
              </Button>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    style={{ 
                      color: theme.palette.primary.main, 
                      fontWeight: 600,
                      textDecoration: 'none' 
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 