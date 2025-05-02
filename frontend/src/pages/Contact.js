import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Send as SendIcon, Email as EmailIcon } from '@mui/icons-material';
import './Contact.css';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    // In a real application, send data to backend API
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="contact-header-content">
          <h1>Get in Touch</h1>
          <p>Have questions about our services or need assistance? Our team is here to help. Fill out the form and we'll get back to you as soon as possible.</p>
        </div>
      </div>
      
      <div className="contact-container">
        {/* Left Side - Contact Information */}
        <div className="contact-info">
          <div className="contact-info-card email">
            <div className="contact-icon">
              <EmailIcon />
            </div>
            <div className="contact-detail">
              <h3>Email</h3>
              <p>support@finvo.com</p>
            </div>
          </div>
        </div>
        
        {/* Right Side - Contact Form */}
        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={formErrors.name ? 'error' : ''}
                  required
                />
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'error' : ''}
                  required
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={formErrors.subject ? 'error' : ''}
                required
              />
              {formErrors.subject && <div className="error-message">{formErrors.subject}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Your Message *</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className={formErrors.message ? 'error' : ''}
                required
              ></textarea>
              {formErrors.message && <div className="error-message">{formErrors.message}</div>}
            </div>
            
            <button type="submit" className="send-message-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-text">Sending...</span>
                  <span className="btn-icon loading"></span>
                </>
              ) : (
                <>
                  <span className="btn-text">Send Message</span>
                  <span className="btn-icon">
                    <SendIcon />
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Success/Error Notifications */}
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar}>
          Your message has been sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Contact; 