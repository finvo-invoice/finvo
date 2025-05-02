import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Navbar from '../Navbar/Navbar';

const AppNavigation = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/landing' || location.pathname === '/';
  const [hideNavbar, setHideNavbar] = useState(false);
  
  // Check if we should hide the navbar
  useEffect(() => {
    const shouldHideNavbar = document.body.classList.contains('hide-navbar');
    setHideNavbar(shouldHideNavbar);
    
    // Set up a mutation observer to detect changes to the body class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const shouldHide = document.body.classList.contains('hide-navbar');
          setHideNavbar(shouldHide);
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);
  
  if (hideNavbar) {
    return null;
  }
  
  return (
    <Box sx={{ width: '100%', zIndex: 1100 }}>
      <Navbar />
    </Box>
  );
};

export default AppNavigation; 