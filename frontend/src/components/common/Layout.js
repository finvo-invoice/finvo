import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from './NavBar';
import Footer from './Footer';

const ContentWrapper = styled('div')(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  marginTop: 0,
  backgroundColor: '#ffffff',
  borderTop: 'none',
  width: '100%',
  marginBottom: theme.spacing(6),
}));

const PageHeader = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export default function Layout({ hideNavbar = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/landing' || location.pathname === '/';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      {!hideNavbar && <NavBar isLandingPage={isLandingPage} />}
      
      <ContentWrapper>
        <Box sx={{ 
          width: '100%', 
          flexGrow: 1, 
          backgroundColor: '#ffffff',
        }}>
          <Outlet />
        </Box>
      </ContentWrapper>
      
      {!isLandingPage && <Footer />}
    </Box>
  );
} 