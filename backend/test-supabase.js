const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Also try loading from current directory as fallback
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl ? '✓ Present' : '✗ Missing',
  key: supabaseKey ? '✓ Present' : '✗ Missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file at:', envPath);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Test function to check database connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check projects table
    console.log('\nTesting projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return;
    }
    
    console.log(`Found ${projects.length} projects:`, projects);
    
    // Check companies table
    console.log('\nTesting companies table...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return;
    }
    
    console.log(`Found ${companies.length} companies:`, companies);
    
    // Check clients table
    console.log('\nTesting clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return;
    }
    
    console.log(`Found ${clients.length} clients:`, clients);
    
    // Check invoices table
    console.log('\nTesting invoices table...');
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .limit(5);
    
    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return;
    }
    
    console.log(`Found ${invoices.length} invoices:`, invoices);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testConnection()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed with error:', err)); 