const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Create a dedicated supabase client for auth middleware
const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Middleware to authenticate user and attach user data to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth middleware - Processing request');
    
    // 1. Extract the token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Auth middleware - No authorization header provided');
      // Try to use token from query parameter for easier debugging
      const tokenParam = req.query.token;
      if (!tokenParam) {
        return res.status(401).json({ 
          message: 'No authorization header provided' 
        });
      }
      req.headers.authorization = `Bearer ${tokenParam}`;
    }

    // 2. Get the token (remove 'Bearer ' prefix)
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ 
        message: 'No token provided' 
      });
    }

    console.log(`Auth middleware - Token received: ${token.substring(0, 10)}...`);

    // 3. Create a fresh Supabase client
    const supabase = createSupabaseClient();

    // 4. Verify the token and get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Token verification error:', userError);
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        error: userError
      });
    }

    // 5. Create a new Supabase client with the user's session
    const userClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_KEY || supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // 6. Attach user and Supabase client to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    req.supabase = userClient;

    // Debug log
    console.log('Auth middleware - User authenticated:', {
      userId: user.id,
      email: user.email,
      tokenPreview: token.substring(0, 10) + '...'
    });

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

/**
 * Middleware to require authentication for protected routes
 * This is an alias for authMiddleware for better semantic naming
 */
const requireAuth = authMiddleware;

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is required' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Bearer token is required' });
    }
    
    // Create a fresh Supabase client
    const supabase = createSupabaseClient();
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Set the user in the request object
    req.user = data.user;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = {
  authMiddleware,
  requireAuth,
  createSupabaseClient,
  authenticateToken
}; 