const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Signup error:', error);
      return res.status(400).json({ message: error.message });
    }
    
    res.status(201).json({ 
      message: 'Signup successful. Please check your email for verification.',
      user: data.user
    });
  } catch (error) {
    console.error('Error in POST /auth/signup:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ message: error.message });
    }
    
    res.json({ 
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Error in POST /auth/login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// User logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: error.message });
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error in POST /auth/logout:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Error in GET /auth/me:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 