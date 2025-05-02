import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSelectPlan = (plan) => {
    if (currentUser) {
      if (plan === 'free') {
        // For free plan, go straight to dashboard
        navigate('/dashboard');
      } else {
        // For paid plans, go to payment page
        navigate(`/payment?plan=${plan}`);
      }
    } else {
      // User needs to register first
      navigate(`/register?plan=${plan}`);
    }
  };

  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "Our free trial gives you full access to all Finvo features for 30 days. No credit card is required to start. At the end of your trial, you'll need to subscribe to continue using Finvo."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll still have access until the end of your current billing period."
    },
    {
      question: "Is the $9/month price permanent?",
      answer: "The $9/month Pro Plan is a special discounted price (regularly $15/month). When you subscribe now, you lock in this rate for as long as you maintain your subscription."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal. All payments are processed securely through Stripe."
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: '#f9fafc' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="700" 
            mb={2}
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            mb={3}
            sx={{ maxWidth: '800px', mx: 'auto' }}
          >
            Start for free and upgrade when you need more. All plans include core invoicing and client management features.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Free Trial Plan */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
                <Typography variant="h5" component="h2" fontWeight="600" gutterBottom>
                  Free Trial
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h3" component="p" fontWeight="700">
                    $0
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    for 1 month
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Try all Finvo features with no credit card required
                </Typography>
                <Divider sx={{ my: 3 }} />
                <List sx={{ mb: 2 }}>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited clients" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited invoices" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Expense tracking" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Basic reports" />
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Email support" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions sx={{ p: 4, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="large"
                  onClick={() => handleSelectPlan('free')}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 1,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Start Free Trial
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Pro Plan (Discounted) */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                position: 'relative',
                boxShadow: '0 8px 24px rgba(41, 112, 255, 0.2)',
                border: '2px solid #2970ff',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 28px rgba(41, 112, 255, 0.25)',
                }
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12,
                  bgcolor: '#ffab40',
                  color: '#000',
                  py: 0.5,
                  px: 2,
                  borderRadius: 1,
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                }}
              >
                40% OFF
              </Box>
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
                <Typography variant="h5" component="h2" fontWeight="600" gutterBottom>
                  Pro
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h3" component="p" fontWeight="700">
                      $9
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ textDecoration: 'line-through' }}
                    >
                      $15
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    per month
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Perfect for freelancers and small businesses
                </Typography>
                <Divider sx={{ my: 3 }} />
                <List sx={{ mb: 2 }}>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Everything in Free" primaryTypographyProps={{ fontWeight: 'bold' }} />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Client portal" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Recurring invoices" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Advanced reports" />
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Priority support" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions sx={{ p: 4, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  onClick={() => handleSelectPlan('pro')}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 1,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(41, 112, 255, 0.2)',
                  }}
                >
                  {currentUser ? 'Upgrade Now' : 'Get Started'}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Enterprise Plan */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
                <Typography variant="h5" component="h2" fontWeight="600" gutterBottom>
                  Enterprise
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h3" component="p" fontWeight="700">
                    Contact us
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    custom pricing
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  For larger businesses with custom needs
                </Typography>
                <Divider sx={{ my: 3 }} />
                <List sx={{ mb: 2 }}>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Everything in Pro" primaryTypographyProps={{ fontWeight: 'bold' }} />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Custom branding" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Team accounts" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="API access" />
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Dedicated support" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions sx={{ p: 4, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="large"
                  onClick={() => handleSelectPlan('enterprise')}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 1,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Contact Sales
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box mt={10} mb={8}>
          <Typography variant="h4" component="h2" fontWeight="600" textAlign="center" mb={5}>
            Frequently Asked Questions
          </Typography>
          
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight="600">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
        
        {/* Contact Support */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6, 
            px: 4, 
            bgcolor: '#f0f4ff', 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Typography variant="h5" fontWeight="600" mb={2}>
            Need help choosing the right plan?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4} sx={{ maxWidth: '600px', mx: 'auto' }}>
            Our team is ready to answer any questions you may have about our plans and help you choose the one that's right for your business.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/contact')}
            sx={{ 
              py: 1.5, 
              px: 4,
              borderRadius: 1,
              fontWeight: 600,
            }}
          >
            Contact Support
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing; 