const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the test .env file
const envPath = path.resolve(process.cwd(), '.env.test');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl ? '✓ Present' : '✗ Missing',
  key: supabaseKey ? '✓ Present' : '✗ Missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.test file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Email and password for testing - REPLACE THESE WITH YOUR ACTUAL CREDENTIALS
const email = process.env.TEST_EMAIL || 'test@example.com';
const password = process.env.TEST_PASSWORD || 'password';

async function testAuthentication() {
  try {
    console.log('Attempting to sign in with:', email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }

    console.log('Successfully authenticated!');
    console.log('User:', authData.user.email);
    console.log('Session:', authData.session ? 'Valid' : 'Invalid');
    
    // Test the dashboard stats endpoint
    if (authData.session) {
      console.log('Testing dashboard stats endpoint...');
      console.log('Using token:', authData.session.access_token.substring(0, 10) + '...');
      
      const response = await axios.get('http://localhost:5001/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });
      
      console.log('Dashboard stats response status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAuthentication(); 