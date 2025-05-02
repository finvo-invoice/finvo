const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Also try loading from current directory as fallback
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl ? '✓ Present' : '✗ Missing',
  key: supabaseKey ? '✓ Present' : '✗ Missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Creating or verifying tables...');

    // Check if project_metadata table exists
    try {
      const { data, error } = await supabase
        .from('project_metadata')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist, create it
          console.log('project_metadata table does not exist. Creating it...');
          
          // Create the project_metadata table using rpc
          console.log('Attempting to create table via REST API...');
          
          // First, try to create the table using the REST API
          const { error: createError } = await supabase
            .from('project_metadata')
            .insert({
              project_id: '00000000-0000-0000-0000-000000000000', // Dummy value
              user_id: '00000000-0000-0000-0000-000000000000',    // Dummy value
              notes: 'Table creation test',
              links: 'Table creation test'
            });
            
          if (createError && createError.code === '42P01') {
            console.log('Could not create table via REST API. Please create the table manually with the following SQL:');
            console.log(`
              CREATE TABLE IF NOT EXISTS project_metadata (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                notes TEXT DEFAULT '',
                links TEXT DEFAULT '',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(project_id, user_id)
              );
            `);
          } else if (createError) {
            console.error('Error creating table:', createError);
          } else {
            console.log('Successfully created project_metadata table');
            
            // Clean up the dummy record
            await supabase
              .from('project_metadata')
              .delete()
              .eq('project_id', '00000000-0000-0000-0000-000000000000');
          }
        } else {
          // Some other error
          console.error('Error checking if table exists:', error);
          process.exit(1);
        }
      } else {
        console.log('project_metadata table already exists');
      }
    } catch (error) {
      console.error('Error checking if table exists:', error);
      process.exit(1);
    }

    console.log('Table verification complete');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables(); 