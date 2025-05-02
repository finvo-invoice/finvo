import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Finvo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          The modern financial management platform designed for businesses of all sizes.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              At Finvo, we believe that financial management should be accessible, intuitive, and powerful. Our mission is to simplify complex financial processes and empower businesses to make informed decisions.
            </Typography>
            <Typography variant="body1">
              We're dedicated to providing a platform that not only meets but exceeds the expectations of modern businesses, helping them thrive in an increasingly competitive landscape.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Our Story
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2023, Finvo was born out of the frustration with existing financial management tools that were either too complex or too simplistic for real business needs.
            </Typography>
            <Typography variant="body1">
              Our team of financial experts and technology enthusiasts came together to create a solution that balances powerful functionality with user-friendly design, making financial management accessible to everyone.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Our Values
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h6">Innovation</Typography>
                  <Typography variant="body2" color="text.secondary">
                    We continuously seek new ways to improve our platform and deliver cutting-edge solutions.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h6">Reliability</Typography>
                  <Typography variant="body2" color="text.secondary">
                    We build robust systems that our customers can depend on for their critical financial operations.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h6">Transparency</Typography>
                  <Typography variant="body2" color="text.secondary">
                    We believe in honest communication and clear, straightforward pricing.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About; 