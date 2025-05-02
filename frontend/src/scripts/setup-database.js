const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or Service Role Key not found in environment variables.');
  console.error('Please make sure you have a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Read the SQL file
    const sqlFilePath = path.resolve(__dirname, '../migrations/create_profiles_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`Error executing SQL: ${error.message}`);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Migrations completed successfully!');
    
    // Verify the profiles table exists
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('Error verifying profiles table:', error.message);
    } else {
      console.log(`Profiles table exists with ${data.count} rows.`);
    }
    
    // Verify the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error verifying avatars bucket:', bucketsError.message);
    } else {
      const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
      if (avatarsBucket) {
        console.log('Avatars bucket exists.');
      } else {
        console.error('Avatars bucket not found!');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error running migrations:', error);
  }
}

runMigrations()
  .then(() => {
    console.log('Setup complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  }); 