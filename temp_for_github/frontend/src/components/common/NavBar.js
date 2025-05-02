import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Button,
  ClickAwayListener,
  Popper,
  Grow,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Menu,
  AppBar,
  Toolbar,
  Container,
  Hidden,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as ProjectsIcon,
  Business as CompanyIcon,
  People as ClientIcon,
  Receipt as InvoiceIcon,
  List as InvoiceListIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ContactSupport as ContactSupportIcon,
  Book as BlogIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  AttachMoney as PricingIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  BarChart as BarChartIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationMenu from './NotificationMenu';
import { Link } from 'react-router-dom';

// Define menu items for all pages (consistent navigation)
const menuItems = [
  { text: 'Projects', icon: <ProjectsIcon />, path: '/projects', requiresAuth: true },
  { text: 'Timeline', icon: <TimelineIcon />, path: '/project-timeline', requiresAuth: true },
  { text: 'Companies', icon: <CompanyIcon />, path: '/company-profiles', requiresAuth: true },
  { text: 'Clients', icon: <ClientIcon />, path: '/client-profiles', requiresAuth: true },
  { text: 'New Invoice', icon: <InvoiceIcon />, path: '/create-invoice', requiresAuth: true },
  { text: 'Invoices', icon: <InvoiceListIcon />, path: '/invoices', requiresAuth: true },
  { 
    text: 'Messages', 
    icon: <ContactSupportIcon />, 
    path: '/admin/contact-messages',
    admin: true, // Only show for admin users
    requiresAuth: true
  }
];

// Define menu items for public landing page
const publicMenuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Features', icon: <DashboardIcon />, path: '/#features' },
  { text: 'Pricing', icon: <PricingIcon />, path: '/#pricing' },
  { text: 'Blog', icon: <BlogIcon />, path: '/blog' },
  { text: 'Contact', icon: <ContactSupportIcon />, path: '/contact' }
];

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#fff',
  backdropFilter: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  height: '64px',
  width: '100%',
  transform: 'none !important',
  '& *': {
    transform: 'none !important'
  }
}));

// Styled Nav Item Button
const NavItem = styled(Button)(({ theme, active }) => ({
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(0.8, 1),
  whiteSpace: 'nowrap',
  borderRadius: 4,
  textTransform: 'none',
  fontWeight: active ? 600 : 500,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  '& .MuiButton-startIcon': {
    marginRight: '4px',
    '& svg': {
      fontSize: '1.2rem',
    }
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
  })
}));

// User display in navbar
const UserDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1),
  borderRadius: 24,
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.divider, 0.2),
  }
}));

const NavBar = ({ isLandingPage = false }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const anchorRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuId, setMobileMenuId] = useState(null);
  const { unreadCount } = useNotifications();
  
  // State for menu anchors
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  // Handle user menu open
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle mobile menu open
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      await signOut();
      console.log('Sign out successful');
      handleMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleUserMenuToggle = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle navigation with smooth scrolling to section IDs on landing page
  const handleNavigation = (path) => {
    console.log('Navigation requested to:', path);
    
    if (path === '/logout') {
      handleSignOut();
      return;
    }
    
    // Check if the path is a section ID on the landing page (contains '#')
    if (path.includes('#')) {
      const isOnLandingPage = location.pathname === '/' || location.pathname === '/landing';
      const sectionId = path.split('#')[1];
      console.log('Section ID detected:', sectionId, 'Is on landing page:', isOnLandingPage);
      
      if (isOnLandingPage) {
        // If already on landing page, scroll to the section
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
          const section = document.getElementById(sectionId);
          console.log('Found section element after timeout:', !!section);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            console.log('Scrolling to section');
            
            // Update URL without causing a navigation
            window.history.pushState(null, '', `/#${sectionId}`);
          } else {
            console.log('Section element not found after timeout');
          }
        }, 100);
      } else {
        // If not on landing page, navigate to landing page with the hash
        console.log('Navigating to landing page with hash');
        
        // Use navigate and then handle scrolling after navigation completes
        navigate('/');
        
        // Set a timeout to wait for navigation to complete and then scroll
        setTimeout(() => {
          const section = document.getElementById(sectionId);
          console.log('Section found after navigation:', !!section);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            
            // Update URL without causing a navigation
            window.history.pushState(null, '', `/#${sectionId}`);
          }
        }, 500);
      }
    } else {
      // Regular navigation for non-section links
      console.log('Regular navigation');
      navigate(path);
    }
    
    // Close menus
    setOpen(false);
    handleMenuClose();
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    
    // If path contains a hash (for section navigation)
    if (path.includes('#')) {
      // Check if we're on the landing page and the hash matches
      const isOnLandingPage = location.pathname === '/' || location.pathname === '/landing';
      const hash = window.location.hash;
      return isOnLandingPage && hash === path.substring(path.indexOf('#'));
    }
    
    // For other paths
    return location.pathname.startsWith(path);
  };

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'admin@finvo.com';

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => !item.admin || isAdmin);

  // Get user display name and avatar URL from user metadata
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return 'User';
  };

  const getUserAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || '';
  };

  // Get initials from name for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuClick = (event) => {
    setIsMobileMenuOpen(true);
    setMobileMoreAnchorEl(event.currentTarget);
    setMobileMenuId(event.currentTarget.id);
  };

  // Mobile menu
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      id="mobile-menu"
      open={mobileMenuOpen}
      onClose={handleMenuClose}
      onClick={handleMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {user && (
        <MenuItem onClick={() => {
          handleMenuClose();
          setTimeout(() => {
            const notificationButton = document.querySelector('[aria-label="Notifications"]');
            if (notificationButton) notificationButton.click();
          }, 100);
        }}>
          <ListItemIcon>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon color="primary" fontSize="medium" sx={{ display: 'block', fontSize: '1.5rem' }} />
            </Badge>
          </ListItemIcon>
          <Typography>Notifications</Typography>
        </MenuItem>
      )}
      
      {/* Show appropriate menu items based on authentication status */}
      {user ? (
        // Show authenticated menu items for logged in users
        menuItems
          .filter(item => !item.admin || isAdmin)
          .map((item) => (
            <MenuItem key={item.text} onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <Typography>{item.text}</Typography>
            </MenuItem>
          ))
      ) : (
        // Show public menu items for visitors
        publicMenuItems.map((item) => (
          <MenuItem key={item.text} onClick={() => handleNavigation(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <Typography>{item.text}</Typography>
          </MenuItem>
        ))
      )}
      
      {!user && (
        <>
          <MenuItem onClick={() => handleNavigation('/login')}>
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <Typography>Login</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/subscribe')}>
            <ListItemIcon><RegisterIcon /></ListItemIcon>
            <Typography>Register</Typography>
          </MenuItem>
        </>
      )}
      
      {user && (
        <MenuItem onClick={handleSignOut} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <LogoutIcon />
          </ListItemIcon>
          <Typography>Sign Out</Typography>
        </MenuItem>
      )}

      {isAdmin && (
        <MenuItem onClick={() => { navigate('/admin/dashboard'); setMobileMoreAnchorEl(null); }}>
          <ListItemIcon>
            <AdminPanelSettingsIcon />
          </ListItemIcon>
          <Typography>Admin Dashboard</Typography>
        </MenuItem>
      )}
    </Menu>
  );

  // Render different navbar based on if we're on landing page or not
  return (
    <>
      <AppBarStyled position="sticky" color="transparent" elevation={0}>
        <Toolbar sx={{ minHeight: '64px', px: { xs: 1, sm: 2 } }}>
          <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', px: { xs: 1, sm: 1 } }}>
            {/* Logo */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 2 }} 
              onClick={() => navigate('/')}
            >
              <Typography
                variant="h6"
                noWrap
                sx={{ fontWeight: 700, color: '#4CAF50' }}
              >
                Finvo
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center',
                flex: 1,
                justifyContent: 'flex-start',
                ml: 2
              }}
            >
              {user ? (
                // Show authenticated menu items for logged in users
                menuItems
                  .filter(item => !item.admin || isAdmin)
                  .map((item) => (
                    <NavItem
                      key={item.text}
                      onClick={() => handleNavigation(item.path)}
                      startIcon={item.icon}
                      active={isActive(item.path)}
                      size="small"
                    >
                      {item.text}
                    </NavItem>
                  ))
              ) : (
                // Show public menu items for visitors
                publicMenuItems.map((item) => (
                  <NavItem
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    active={isActive(item.path)}
                    size="small"
                  >
                    {item.text}
                  </NavItem>
                ))
              )}
            </Box>

            {/* Right Section - User or Auth Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              {/* Login/Register buttons for non-authenticated users */}
              {!user && (
                <Hidden smDown>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    startIcon={<LoginIcon />}
                    sx={{ 
                      color: '#2970ff', 
                      borderColor: '#2970ff',
                      mr: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      '&:hover': {
                        borderColor: '#2970ff',
                        backgroundColor: alpha('#2970ff', 0.04),
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/subscribe')}
                    startIcon={<RegisterIcon />}
                    sx={{ 
                      backgroundColor: '#2970ff', 
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      padding: '6px 16px',
                      '&:hover': {
                        backgroundColor: '#2461d8',
                      }
                    }}
                  >
                    Register
                  </Button>
                </Hidden>
              )}

              {/* Notification Bell */}
              {user && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mr: 2,
                    marginLeft: { xs: 'auto', md: 0 },
                    position: 'relative',
                    zIndex: 1001,
                    height: '40px'
                  }}
                >
                  <NotificationMenu />
                </Box>
              )}

              {/* For Dashboard - User Avatar with Name */}
              {user && (
                <UserDisplay onClick={handleUserMenuToggle}>
                  <Box sx={{ mr: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
                      {getUserDisplayName()}
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: theme.palette.primary.main,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {getInitials(getUserDisplayName())}
                  </Avatar>
                </UserDisplay>
              )}
              
              {/* Mobile Menu Button */}
              <Hidden mdUp>
                <IconButton
                  size="medium"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              </Hidden>
            </Box>
          </Container>
        </Toolbar>
      </AppBarStyled>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={getUserAvatarUrl()}
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: theme.palette.primary.main,
              fontSize: '1rem',
              fontWeight: 'bold',
              mr: 1.5
            }}
          >
            {!getUserAvatarUrl() && getInitials(getUserDisplayName())}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {getUserDisplayName()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate('/profile');
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            handleMenuClose();
            handleSignOut();
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      {renderMobileMenu}
    </>
  );
};

export default NavBar; 