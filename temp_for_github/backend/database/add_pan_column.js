const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl ? '✓ Present' : '✗ Missing',
  key: supabaseKey ? '✓ Present' : '✗ Missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file at:', envPath);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPanColumn() {
  try {
    console.log('Adding PAN column to companies table...');
    
    // Add PAN column if it doesn't exist
    const { error: rpcError } = await supabase.rpc('execute_sql', {
      sql_query: `
        DO $$
        BEGIN
          -- Add the column if it doesn't exist
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'companies' 
            AND column_name = 'pan'
          ) THEN
            ALTER TABLE companies ADD COLUMN pan TEXT;
          END IF;
          
          -- Update existing records
          UPDATE companies SET pan = '' WHERE pan IS NULL;
        END $$;
      `
    });
    
    if (rpcError) {
      console.error('Error executing SQL:', rpcError);
      process.exit(1);
    }
    
    console.log('Successfully added PAN column to companies table');
    process.exit(0);
  } catch (error) {
    console.error('Error in addPanColumn:', error);
    process.exit(1);
  }
}

addPanColumn(); 