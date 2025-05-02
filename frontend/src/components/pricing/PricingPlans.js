import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Container,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const PricingPlans = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubscribe = (planType) => {
    navigate(`/subscribe?plan=${planType}`);
  };

  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '1 month',
      description: 'Try all features for free',
      features: [
        'Unlimited invoices',
        'Client management',
        'Project tracking',
        'Financial reports',
        'Email notifications',
        'Mobile app access',
        'API integration'
      ],
      color: '#2970ff',
      type: 'trial',
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Pro Plan',
      regularPrice: '$15',
      price: '$9',
      period: 'month',
      description: 'For individuals and small teams',
      features: [
        'Unlimited invoices',
        'Client management',
        'Project tracking',
        'Financial reports',
        'Email notifications',
        'Mobile app access',
        'API integration'
      ],
      color: '#2970ff',
      type: 'pro',
      featured: true,
      buttonText: 'Subscribe Now'
    },
    {
      name: 'Enterprise Plan',
      price: '$99',
      period: 'month',
      description: 'For large organizations',
      features: [
        'Everything in Pro Plan',
        'Dedicated account manager',
        'Multi-currency support',
        'Advanced tax management',
        'Team collaboration tools',
        'Client credit system',
        'Custom financial workflows',
        'Priority support with 4hr response',
        'White-label invoicing'
      ],
      color: '#ff5e62',
      type: 'enterprise',
      buttonText: 'Contact Sales'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '3rem' },
            mb: 2 
          }}
        >
          Simple, Transparent Pricing
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', maxWidth: '700px', mx: 'auto' }}>
          Choose the plan that works best for your business needs.
          All plans include core features with no hidden fees.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid 
            item 
            xs={12} 
            md={4} 
            key={index}
            sx={{ 
              display: 'flex',
              maxWidth: isTablet ? '100%' : '400px'
            }}
          >
            <Card 
              elevation={plan.featured ? 8 : 2}
              sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'visible',
                position: 'relative',
                border: plan.featured ? `2px solid ${plan.color}` : '1px solid rgba(0, 0, 0, 0.12)',
                ...(plan.featured && {
                  '&::before': {
                    content: '"Limited Time Offer"',
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    backgroundColor: plan.color,
                    color: '#fff',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    zIndex: 1
                  }
                })
              }}
            >
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
                <Typography 
                  variant="h5"
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: plan.color
                  }}
                >
                  {plan.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 3,
                    opacity: 0.7
                  }}
                >
                  {plan.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {plan.regularPrice && (
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 500,
                        textDecoration: 'line-through',
                        color: 'text.secondary',
                        mr: 2
                      }}
                    >
                      {plan.regularPrice}
                    </Typography>
                  )}
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700
                    }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography 
                    component="span" 
                    variant="body1"
                    sx={{ 
                      fontWeight: 400,
                      opacity: 0.7,
                      ml: 1
                    }}
                  >
                    / {plan.period}
                  </Typography>
                </Box>
                
                {plan.type === 'trial' && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Automatically upgrades to Pro Plan after trial period ends
                  </Typography>
                )}
                
                <Box sx={{ my: 4 }}>
                  {plan.features.map((feature, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        mb: 2
                      }}
                    >
                      <CheckCircleIcon 
                        sx={{ 
                          color: plan.color,
                          mr: 1.5,
                          fontSize: '1.2rem',
                          mt: '2px'
                        }} 
                      />
                      <Typography variant="body2">
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Button 
                  variant={plan.featured ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => handleSubscribe(plan.type)}
                  sx={{ 
                    mt: 2,
                    py: 1.5,
                    ...(plan.featured 
                      ? { 
                          bgcolor: plan.color,
                          '&:hover': {
                            bgcolor: theme.palette.augmentColor({ color: { main: plan.color }}).dark
                          }
                        } 
                      : { 
                          borderColor: plan.color,
                          color: plan.color,
                          '&:hover': {
                            borderColor: theme.palette.augmentColor({ color: { main: plan.color }}).dark,
                            color: theme.palette.augmentColor({ color: { main: plan.color }}).dark,
                          }
                        }
                    )
                  }}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="body2" color="text.secondary">
          All plans include secure payment processing via Stripe. 
          After your free trial ends, you'll be automatically subscribed to the Pro Plan.
        </Typography>
      </Box>
    </Container>
  );
};

export default PricingPlans; 