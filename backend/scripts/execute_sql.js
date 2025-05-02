const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
const envPath = path.resolve(process.cwd(), '../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Also try loading from current directory as fallback
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl ? '✓ Present' : '✗ Missing',
  key: supabaseKey ? '✓ Present' : '✗ Missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create_metadata_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('SQL to execute:');
    console.log(sql);
    
    // Try to create the table by inserting a test record
    console.log('\nAttempting to create project_metadata table...');
    
    try {
      // First check if the table exists
      const { data: checkData, error: checkError } = await supabase
        .from('project_metadata')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Table does not exist. Please create it manually using the SQL script.');
        console.log('You can run this SQL in the Supabase SQL editor:');
        console.log(sql);
      } else if (checkError) {
        console.error('Error checking table:', checkError);
      } else {
        console.log('Table already exists!');
      }
    } catch (error) {
      console.error('Error executing check:', error);
    }
    
    console.log('\nScript completed.');
  } catch (error) {
    console.error('Error in script execution:', error);
    process.exit(1);
  }
}

executeSQL(); 