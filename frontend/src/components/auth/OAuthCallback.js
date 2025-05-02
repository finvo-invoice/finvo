import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/images/finvo-logo.svg';

const OAuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('OAuth callback: Processing auth redirect');
        setLoading(true);
        
        // Supabase automatically handles the OAuth callback
        // Just need to wait for the session to be established
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          setError('Authentication failed: ' + error.message);
          return;
        }
        
        if (data?.session) {
          console.log('OAuth callback: Successfully authenticated user');
          
          // Store token for API requests
          localStorage.setItem('authToken', data.session.access_token);
          
          // Redirect to client profiles after successful auth
          setTimeout(() => {
            navigate('/client-profiles');
          }, 1000);
        } else {
          console.error('OAuth callback: No session established');
          setError('No session was established after authentication');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication error: ' + err.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafc',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <img
              src={logoImage}
              alt="Finvo Logo"
              style={{
                height: '45px',
                width: 'auto',
              }}
            />
          </Box>

          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            {error ? 'Authentication Error' : 'Authenticating...'}
          </Typography>

          {loading && !error && (
            <CircularProgress size={40} sx={{ mb: 2, mt: 2 }} />
          )}

          <Typography variant="body1" color="text.secondary">
            {error
              ? error
              : loading
              ? "We're signing you in. You'll be redirected shortly."
              : "Authentication successful! Redirecting to client profiles..."}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default OAuthCallback; 