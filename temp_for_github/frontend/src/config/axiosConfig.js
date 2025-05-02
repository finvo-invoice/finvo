import axios from 'axios';
import { axiosInstance as authAxios } from '../contexts/AuthContext';

// Re-export the instance from AuthContext for backward compatibility
export default authAxios;

// Keep this comment to explain the change
// This file now re-exports the axios instance from AuthContext
// to ensure all API calls use the same authenticated instance.
// The original implementation is kept below for reference:

/* 
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth token to request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        console.log('Received 401 unauthorized response');
        
        // Clear authentication data
        localStorage.removeItem('authToken');
        
        // Check if we're already on an auth page to avoid loops
        const onAuthPage = 
          window.location.pathname.includes('/login') || 
          window.location.pathname.includes('/register') || 
          window.location.pathname.includes('/reset-password');
        
        // Only redirect if we're not already on an auth page
        if (!onAuthPage) {
          console.log('Redirecting to login page due to auth error');
          // Use replace to avoid breaking the back button
          window.location.replace('/login?session_expired=true');
        }
      } else if (error.response.status === 403) {
        console.error('Forbidden access:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
*/ 