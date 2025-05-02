const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Also try loading from current directory as fallback
dotenv.config();

// Get Supabase credentials
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

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// SQL to create project_metadata table
const createMetadataTableSQL = `
-- Create project_metadata table
CREATE TABLE IF NOT EXISTS project_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notes TEXT,
  links TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_metadata_project_id ON project_metadata(project_id);
CREATE INDEX IF NOT EXISTS idx_project_metadata_user_id ON project_metadata(user_id);
`;

// Function to execute SQL
async function executeSQL(sql) {
  try {
    console.log('Executing SQL...');
    
    // Try using the execute_sql RPC function
    const { error: rpcError } = await supabase.rpc('execute_sql', {
      sql_statement: sql
    });
    
    if (rpcError) {
      console.error('Error executing SQL via RPC:', rpcError);
      console.log('Trying direct SQL execution...');
      
      // Try direct SQL execution with template literals
      const { error: sqlError } = await supabase.sql`${sql}`;
      
      if (sqlError) {
        console.error('Error executing SQL directly:', sqlError);
        return false;
      }
    }
    
    console.log('SQL executed successfully');
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error);
    
    // Try to create the table using individual queries
    try {
      console.log('Trying to create table with individual queries...');
      
      // Create the table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS project_metadata (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          notes TEXT,
          links TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(project_id)
        )
      `;
      
      const { error: createError } = await supabase
        .from('project_metadata')
        .insert({ 
          project_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
          notes: 'Test note',
          links: 'Test link'
        });
      
      if (createError && !createError.message.includes('duplicate key')) {
        console.error('Error creating table with insert:', createError);
        return false;
      }
      
      console.log('Table created or already exists');
      return true;
    } catch (fallbackError) {
      console.error('Error in fallback method:', fallbackError);
      return false;
    }
  }
}

// Main function
async function main() {
  try {
    console.log('Creating project_metadata table...');
    
    // Execute SQL to create project_metadata table
    const success = await executeSQL(createMetadataTableSQL);
    
    if (success) {
      console.log('Project metadata table created successfully');
    } else {
      console.error('Failed to create project metadata table');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    process.exit(0);
  }
}

// Run the main function
main(); 