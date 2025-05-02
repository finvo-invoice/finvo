import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import SmoothScroll from './components/SmoothScroll';

// Auth Components
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/auth/RequireAuth';
import OAuthCallback from './components/auth/OAuthCallback';

// Pages
import LandingPage from './pages/LandingPage';
import Projects from './pages/Projects';
import ProjectTimeline from './pages/ProjectTimeline';
import CompanyProfiles from './pages/CompanyProfiles';
import ClientProfiles from './pages/ClientProfiles';
import CreateInvoice from './pages/CreateInvoice';
import AllInvoices from './pages/AllInvoices';
import InvoiceDetail from './pages/InvoiceDetail';
import EditInvoice from './pages/EditInvoice';
import About from './pages/About';
import Contact from './pages/Contact';
import ContactMessages from './pages/admin/ContactMessages';
import AdminDashboard from './pages/admin/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Register from './pages/Register';
import Timeline from './pages/Timeline';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import PrivateRoute from './components/PrivateRoute';
import ProjectProfiles from './pages/ProjectProfiles';
import './App.css';

// Components
import AppNavigation from './components/navigation/AppNavigation';
import RegularLayout from './components/layouts/RegularLayout';
import ProtectedLayout from './components/layouts/ProtectedLayout';
import CheckoutRedirect from './components/payment/CheckoutRedirect';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <Box sx={{ 
      width: '100vw', 
      maxWidth: '100vw', 
      overflow: 'hidden', 
      margin: 0, 
      padding: 0,
      backgroundColor: '#ffffff'
    }}>
      <ThemeContextProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="app-container" style={{ width: '100vw', margin: 0, padding: 0 }}>
                <AppContent />
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeContextProvider>
    </Box>
  );
}

// AppContent component to use router hooks
const AppContent = () => {
  return (
    <Box sx={{ 
      width: '100vw', 
      maxWidth: '100vw', 
      overflow: 'hidden', 
      margin: 0, 
      padding: 0,
      backgroundColor: '#ffffff'
    }}>
      <SmoothScroll />
      <AppNavigation />
      
      <Routes>
        {/* Landing Page - No wrapper */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<Home />} />
        
        {/* Full page routes - no layout */}
        <Route path="/subscribe" element={<CheckoutRedirect />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* Public Routes - With scaling */}
        <Route element={<RegularLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/register" element={<Register />} />
        </Route>
          
        {/* Protected Routes - With Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          <Route path="/project-timeline" element={<PrivateRoute><ProjectTimeline /></PrivateRoute>} />
          <Route path="/company-profiles" element={<PrivateRoute><CompanyProfiles /></PrivateRoute>} />
          <Route path="/client-profiles" element={<PrivateRoute><ClientProfiles /></PrivateRoute>} />
          <Route path="/project-profiles" element={<PrivateRoute><ProjectProfiles /></PrivateRoute>} />
          <Route path="/create-invoice" element={<PrivateRoute><CreateInvoice /></PrivateRoute>} />
          <Route path="/all-invoices" element={<PrivateRoute><AllInvoices /></PrivateRoute>} />
          <Route path="/invoices/:id" element={<PrivateRoute><InvoiceDetail /></PrivateRoute>} />
          <Route path="/edit-invoice/:id" element={<PrivateRoute><EditInvoice /></PrivateRoute>} />
          <Route path="/timeline" element={<PrivateRoute><Timeline /></PrivateRoute>} />
          <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
          <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
        </Route>
        
        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/messages" element={<ContactMessages />} />
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
};

export default App;
