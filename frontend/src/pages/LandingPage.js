import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  ArrowForward, 
  Speed, 
  DevicesOutlined, 
  Code, 
  ShowChart
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import PricingPlans from '../components/pricing/PricingPlans';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log("Landing page - Auth status:", !!user);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Check for hash in URL and scroll to that section on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const sectionId = hash.substring(1); // Remove the # character
      console.log('Looking for section with ID:', sectionId);
      
      // Use a longer timeout to ensure the page is fully rendered
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        console.log('Found element after timeout:', !!element);
        
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          console.log('Scrolled to element:', sectionId);
        } else {
          console.log('Element still not found with ID:', sectionId);
          
          // Try again with a longer timeout as a fallback
          setTimeout(() => {
            const retryElement = document.getElementById(sectionId);
            console.log('Retry found element:', !!retryElement);
            if (retryElement) {
              retryElement.scrollIntoView({ behavior: 'smooth' });
              console.log('Scrolled to element on retry:', sectionId);
            }
          }, 500);
        }
      }, 300);
    }
  }, []);

  // Add and remove landing-page-active class on body
  useEffect(() => {
    document.body.classList.add('landing-page-active');
    
    return () => {
      document.body.classList.remove('landing-page-active');
    };
  }, []);

  // Handle primary CTA click - go to client profiles if logged in, otherwise login
  const handlePrimaryCTA = () => {
    if (user) {
      navigate('/client-profiles');
    } else {
      navigate('/login');
    }
  };

  const handleSecondaryCTA = () => {
    navigate('/subscribe');
  };

  return (
    <Box className="landing-page" sx={{ overflowX: 'hidden' }}>
      {/* Hero Section - Dark */}
      <Box className="landing-section dark" sx={{ 
        backgroundColor: '#000', 
        color: '#fff',
        py: { xs: 10, md: 15 },
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                Your site should do more than look good
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 4,
                  opacity: 0.8
                }}
              >
                Build a professional invoicing platform that helps you track clients, manage projects, and get paid faster.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={handlePrimaryCTA}
                sx={{ 
                  backgroundColor: '#fff', 
                  color: '#000',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  }
                }}
              >
                Get Started Free
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative',
                minHeight: { xs: 300, md: 400 },
                width: '100%'
              }}>
                <Box
                  component="img"
                  src="/images/dashboard-preview.png"
                  alt="Finvo Dashboard Preview"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: { xs: 0, md: -50 },
                    maxWidth: { xs: '100%', md: '130%' },
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Launch Pixel-Perfect Sites Section - White */}
      <Box className="landing-section light" sx={{ 
        backgroundColor: '#fff', 
        color: '#000',
        py: { xs: 10, md: 15 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                Launch pixel-perfect sites
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 4,
                  opacity: 0.7
                }}
              >
                Get full control over your invoicing workflow. With Finvo, you can easily create, send, and track invoices for all your clients. Our intuitive interface makes it simple to manage your finances.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={handlePrimaryCTA}
                sx={{ 
                  backgroundColor: '#2970ff', 
                  color: '#fff',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#1a5feb',
                  }
                }}
              >
                Start Now
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative',
                minHeight: 300,
                width: '100%'
              }}>
                <Box
                  component="img"
                  src="/images/invoice-preview.png"
                  alt="Finvo Invoice Preview"
                  sx={{
                    width: '100%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Responsive Design Section - Dark */}
      <Box className="landing-section dark" sx={{ 
        backgroundColor: '#000', 
        color: '#fff',
        py: { xs: 10, md: 15 },
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 1,
                lineHeight: 1.2
              }}
            >
              The best companies <br />build on Finvooo
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Box 
              component="img" 
              src="/images/dashboard-wide.png"
              alt="Finvo Dashboard"
              sx={{ 
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
            />
            <Box sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(5px)',
              p: 4,
              borderRadius: 2,
              width: { xs: '80%', md: '50%' },
              textAlign: 'center'
            }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Ready to transform your business?
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={handlePrimaryCTA}
                sx={{ 
                  backgroundColor: '#2970ff', 
                  color: '#fff',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#1a5feb',
                  }
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" className="landing-section light" sx={{ 
        backgroundColor: '#fff', 
        color: '#000',
        py: { xs: 10, md: 15 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Powerful Features
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.1rem' },
                maxWidth: 700,
                mx: 'auto',
                opacity: 0.7
              }}
            >
              Everything you need to manage your business in one place
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Feature 1 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 3,
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#eef5ff',
                      borderRadius: '50%',
                      width: 70,
                      height: 70,
                      mb: 3
                    }}
                  >
                    <Speed sx={{ color: '#2970ff', fontSize: 32 }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2 
                    }}
                  >
                    Invoicing & Payments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create professional invoices in seconds and get paid faster with integrated payment options. Track payment status and send automated reminders.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Feature 2 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 3,
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#eef5ff',
                      borderRadius: '50%',
                      width: 70,
                      height: 70,
                      mb: 3
                    }}
                  >
                    <ShowChart sx={{ color: '#2970ff', fontSize: 32 }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2 
                    }}
                  >
                    Project Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage all your projects in one place. Set milestones, track progress, and collaborate with team members. Generate reports and stay on top of deadlines.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Feature 3 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 3,
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#eef5ff',
                      borderRadius: '50%',
                      width: 70,
                      height: 70,
                      mb: 3
                    }}
                  >
                    <DevicesOutlined sx={{ color: '#2970ff', fontSize: 32 }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2 
                    }}
                  >
                    Client Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Organize client information, track communication history, and manage contacts. Build stronger relationships with detailed client profiles and activity logs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={handlePrimaryCTA}
              endIcon={<ArrowForward />}
              sx={{ 
                color: '#2970ff', 
                borderColor: '#2970ff',
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#1a5feb',
                  backgroundColor: 'rgba(41, 112, 255, 0.04)',
                }
              }}
            >
              Explore All Features
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section - Light */}
      <Box className="landing-section light" sx={{ 
        backgroundColor: '#f9fafb', 
        py: { xs: 10, md: 15 }
      }}>
        <PricingPlans />
      </Box>

      {/* Manage Content Section - Dark */}
      <Box className="landing-section dark" sx={{ 
        backgroundColor: '#000', 
        color: '#fff',
        py: { xs: 10, md: 15 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                Manage content visually, publish anywhere
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 4,
                  opacity: 0.8
                }}
              >
                Create professional invoices in minutes and manage all your clients in one place. Get detailed insights into your business financials and track payments with ease.
              </Typography>
              <Button 
                variant="outlined" 
                size="large"
                onClick={handleSecondaryCTA}
                sx={{ 
                  ml: 2, 
                  borderColor: '#2970ff',
                  color: '#2970ff',
                  px: 4,
                  py: 1.5, 
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#1a5feb',
                    backgroundColor: 'rgba(41, 112, 255, 0.04)',
                  }
                }}
              >
                Learn More
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative',
                minHeight: 300,
                width: '100%',
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                p: 2
              }}>
                <Box
                  component="img"
                  src="/images/content-management.png"
                  alt="Content Management"
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* AI at Webflow Section - Dark with gradient */}
      <Box className="landing-section dark" sx={{ 
        background: 'linear-gradient(180deg, #000 0%, #1a1a1a 100%)', 
        color: '#fff',
        py: { xs: 10, md: 15 },
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Box 
            component="img" 
            src="/images/ai-icon.png"
            alt="AI Icon"
            sx={{ 
              width: 80,
              height: 80,
              mb: 4
            }}
          />
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              lineHeight: 1.2
            }}
          >
            AI at Finvooo
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: '1rem', md: '1.1rem' },
              mb: 6,
              opacity: 0.8,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Our AI-powered system helps you create invoices faster, predict payment timelines, and suggest optimal pricing for your services.
          </Typography>
        </Container>
      </Box>

      {/* Drive Real Business Results - Light */}
      <Box className="landing-section light" sx={{ 
        backgroundColor: '#fff', 
        color: '#000',
        py: { xs: 10, md: 15 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                Drive real business results, fast
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 4,
                  opacity: 0.7
                }}
              >
                With powerful analytics and reporting, Finvo helps you understand your financial health at a glance. Make data-driven decisions to grow your business.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={handlePrimaryCTA}
                sx={{ 
                  backgroundColor: '#2970ff', 
                  color: '#fff',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#1a5feb',
                  }
                }}
              >
                Start Free
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative',
                minHeight: 300,
                width: '100%'
              }}>
                <Box
                  component="img"
                  src="/images/analytics-dashboard.png"
                  alt="Analytics Dashboard"
                  sx={{
                    width: '100%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Scale Your Site - White with split design */}
      <Box className="landing-section light" sx={{ 
        backgroundColor: '#fff', 
        color: '#000',
        py: { xs: 10, md: 15 }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={0}>
            <Grid item xs={12} md={6} sx={{ 
              backgroundColor: '#000', 
              color: '#fff',
              p: { xs: 4, md: 8 },
              borderRadius: { xs: '16px 16px 0 0', md: '16px 0 0 16px' }
            }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.2
                }}
              >
                Scale your site and business
              </Typography>
              <Box sx={{ height: { xs: 300, md: 600 } }}>
                {/* Dark section image */}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ 
              backgroundColor: '#f5f5f5', 
              p: { xs: 4, md: 8 },
              borderRadius: { xs: '0 0 16px 16px', md: '0 16px 16px 0' }
            }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Collaboration and access
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    Invite team members to collaborate on projects and invoices with customizable permission levels.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Secure by default
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    Enterprise-grade security ensures your data and your clients' information remains protected.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    API and integrations
                  </Typography>
                  <Typography variant="body2">
                    Connect with your favorite tools through our robust API and pre-built integrations.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Try For Free - Dark */}
      <Box className="landing-section dark" sx={{ 
        backgroundColor: '#000', 
        color: '#fff',
        py: { xs: 10, md: 15 },
        textAlign: 'center'
      }}>
        <Container maxWidth="sm">
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              lineHeight: 1.2
            }}
          >
            Try it for free
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: '1rem', md: '1.1rem' },
              mb: 4,
              opacity: 0.8
            }}
          >
            Get started with Finvo today. No credit card required.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handlePrimaryCTA}
            sx={{ 
              backgroundColor: '#2970ff', 
              color: '#fff',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#1a5feb',
              }
            }}
          >
            {user ? 'Go to Dashboard' : 'Start For Free'}
          </Button>
        </Container>

        {/* Footer links - Just decorative */}
        <Container maxWidth="lg" sx={{ mt: 10 }}>
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Product</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Features</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Pricing</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Enterprise</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Security</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Company</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>About</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Careers</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Blog</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Legal</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Resources</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Documentation</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Guides</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Support</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>API</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Connect</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Contact Us</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Twitter</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>LinkedIn</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Facebook</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © {new Date().getFullYear()} Finvooo. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 