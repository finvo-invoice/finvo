const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { supabase } = require('./config/supabase');
const projectRoutes = require('./routes/projectRoutes');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const stripeRoutes = require('./routes/stripe');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from the root .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Also try loading from current directory as fallback
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Import routes
const apiRoutes = require('./routes/api');
const contactRoutes = require('./routes/contactRoutes');
const blogRoutes = require('./routes/blogRoutes');

// Authentication middleware
const authMiddleware = require('./middleware/auth').authMiddleware;

// Create Express app
const app = express();

// Supabase middleware - attach client to all requests
app.use((req, res, next) => {
  req.supabaseAdmin = supabaseClient;
  next();
});

// Middleware
app.use(cors());
app.use(helmet());

// Special raw body parser for Stripe webhooks
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Standard body parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    console.log('Companies count:', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// Ensure tables exist
async function ensureTables() {
  try {
    console.log('Verifying database tables...');
    
    // Check if project_metadata table exists
    const { data, error } = await supabaseClient
      .from('project_metadata')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Project metadata table may not exist, attempting to create...');
      
      // Direct SQL approach instead of RPC
      const { error: sqlError } = await supabaseClient
        .from('project_metadata')
        .insert([{ 
          project_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
          notes: 'System test entry',
          links: ''
        }])
        .select();
        
      if (sqlError && sqlError.code === '42P01') {
        console.log('Table does not exist, creating directly...');
        
        // Create the table with direct SQL
        const { error: createError } = await supabaseClient.sql`
          CREATE TABLE IF NOT EXISTS project_metadata (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID NOT NULL,
            user_id UUID NOT NULL,
            notes TEXT DEFAULT '',
            links TEXT DEFAULT '',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        if (createError) {
          console.error('Error creating table:', createError);
        } else {
          console.log('Successfully created project_metadata table');
        }
      } else if (sqlError) {
        console.error('Error checking table:', sqlError);
      } else {
        console.log('Table verification was successful');
      }
    } else {
      console.log('project_metadata table already exists');
    }
  } catch (error) {
    console.error('Error verifying database tables:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5001;

// Start the server and test Supabase connection
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    const connected = await testSupabaseConnection();
    if (connected) {
      console.log('✅ Server is ready to accept requests with Supabase connection');
    } else {
      console.log('⚠️ Server is running but Supabase connection failed');
      console.log('⚠️ Please check your Supabase URL and key in the .env file');
      console.log('⚠️ The server will continue to run, but database operations will fail');
    }
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error);
    console.log('⚠️ Server is running but Supabase connection failed');
  }

  // Ensure database tables exist
  await ensureTables();
}); 