import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/images/finvo-logo.svg';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, handleGoogleLogin, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const theme = useTheme();

  // Get the path to redirect to after login
  const from = location.state?.from || '/client-profiles';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signIn(email, password);
      
      if (result.session) {
        console.log('Login successful, redirecting to:', from);
        
        // Store the token securely
        localStorage.setItem('authToken', result.session.access_token);
        
        // Add a slightly longer delay to ensure the auth state is updated
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        const errorMsg = result.error || 'Login failed. Please check your credentials.';
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Initiating Google sign-in');
      
      // Use the proper Supabase OAuth method
      if (signInWithGoogle) {
        await signInWithGoogle();
      } else {
        await handleGoogleLogin();
      }
      
      // We don't need to check the result here as it redirects to Google
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
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
              Sign In
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 3, maxWidth: 260 }}
            >
              Welcome back! Please enter your details to access your account.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                {error}
              </Alert>
            )}

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
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
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
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 0.5,
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Remember me</Typography>}
                />
                <Link
                  to="/forgot-password"
                  style={{
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

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
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                {loading ? 'Signing in...' : 'Sign In'}
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
                onClick={handleGoogleSignIn}
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
                  'Sign in with Google'
                )}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Sign Up
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

export default LoginPage; 