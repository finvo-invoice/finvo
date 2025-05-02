import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * RequireAuth component
 * 
 * A wrapper component that checks if the user is authenticated.
 * If authenticated, renders the child components.
 * If not authenticated, redirects to the login page with a return URL.
 */
const RequireAuth = ({ children }) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Verifying your session...
        </Typography>
      </Box>
    );
  }

  if (!user || !session) {
    // Redirect to the login page but save the current location
    console.log('RequireAuth: No authenticated session found, redirecting to login');
    
    // Clear any potentially corrupted auth tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('supabase.auth.token');
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected route
  console.log('RequireAuth: User authenticated, rendering protected content');
  return children;
};

export default RequireAuth; 