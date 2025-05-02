import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  console.log('PrivateRoute - Path:', location.pathname);
  console.log('PrivateRoute - User:', user ? 'Authenticated' : 'Not authenticated');
  console.log('PrivateRoute - Loading:', loading);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} />;
};

export default PrivateRoute; 