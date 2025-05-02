const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Also try loading from current directory as fallback
dotenv.config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl ? '✓ Present' : '✗ Missing',
  key: supabaseKey ? '✓ Present' : '✗ Missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file at:', envPath);
  throw new Error('Missing Supabase credentials');
}

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    global: {
      headers: { 'x-application-name': 'finvo-invoice-app' }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error creating Supabase client:', error);
  throw error;
}

// Export both the client directly and as a property of an object
module.exports = supabase; // Direct export for backward compatibility
module.exports.supabase = supabase; // Named export
module.exports.createClient = createClient; // Also export the createClient function 