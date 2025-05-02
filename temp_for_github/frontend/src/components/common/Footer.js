import React from 'react';
import { Box, Typography, Link, Divider, Grid, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#001a13',
  color: '#ffffff',
  padding: theme.spacing(4, 0),
  paddingBottom: theme.spacing(4),
  marginTop: 'auto',
  marginBottom: 0,
  width: '100%',
  position: 'relative',
  borderTop: 'none',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 0),
    paddingBottom: theme.spacing(3),
  },
  '&::before, &::after': {
    display: 'none',
  }
}));

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterWrapper className="FooterWrapper">
      <Box sx={{ 
        width: '100%', 
        maxWidth: '100%', 
        px: { xs: 3, md: 4 },
        backgroundColor: '#001a13',
        position: 'relative',
        marginBottom: 0,
        paddingBottom: 0,
        '&::before, &::after': {
          content: '""',
          display: 'none',
        }
      }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                  Finvo
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                A modern financial management platform for tracking invoices, clients, and projects.
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffffff', mb: 2 }}>
                  Product
                </Typography>
                <Stack spacing={1}>
                  <Link href="/features" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>Features</Link>
                  <Link href="/pricing" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>Pricing</Link>
                  <Link href="/blog" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>Blog</Link>
                </Stack>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffffff', mb: 2 }}>
                  Support
                </Typography>
                <Stack spacing={1}>
                  <Link href="/help" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>Help Center</Link>
                  <Link href="/contact" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>Contact Us</Link>
                </Stack>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffffff', mb: 2 }}>
                  Legal
                </Typography>
                <Stack spacing={1}>
                  <Link href="/terms" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>Terms of Service</Link>
                  <Link href="/privacy" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>Privacy Policy</Link>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          pb: 3,
          mb: 0 
        }}>
          <Typography variant="body2" sx={{ color: '#ffffff' }}>
            © {currentYear} Finvo. All rights reserved.
          </Typography>
          
          <Stack direction="row" spacing={2} mt={{ xs: 2, sm: 0 }}>
            <Link href="#" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>
              <i className="fab fa-twitter"></i>
            </Link>
            <Link href="#" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>
              <i className="fab fa-linkedin"></i>
            </Link>
            <Link href="#" underline="hover" sx={{ color: '#ffffff', '&:hover': { color: '#4CAF50' } }}>
              <i className="fab fa-facebook"></i>
            </Link>
          </Stack>
        </Box>
      </Box>
    </FooterWrapper>
  );
};

export default Footer; 