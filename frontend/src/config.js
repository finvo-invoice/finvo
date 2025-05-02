// API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'https://api.finvo.app/api';

// Application configuration
export const APP_CONFIG = {
  appName: 'Finvo',
  appDescription: 'Modern financial management for businesses',
  appVersion: '1.0.0',
  // Default currency formatting
  currencyFormat: {
    locale: 'en-US',
    options: {
      style: 'currency',
      currency: 'USD'
    }
  },
  // Notification settings
  notifications: {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  },
  // Date format settings
  dateFormat: 'MM/DD/YYYY',
  // Support email
  supportEmail: 'support@finvo.app',
  // Terms and privacy links
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  // Social media links
  socialLinks: {
    twitter: 'https://twitter.com/finvoapp',
    linkedin: 'https://linkedin.com/company/finvo',
    facebook: 'https://facebook.com/finvoapp'
  }
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_EXPORT: true
};

// Routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/subscribe',
  '/reset-password',
  '/terms',
  '/privacy',
  '/about',
  '/contact'
];

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat(
    APP_CONFIG.currencyFormat.locale, 
    APP_CONFIG.currencyFormat.options
  ).format(amount);
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}; 