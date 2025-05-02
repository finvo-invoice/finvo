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

// Initialize database tables
async function initDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Check if projects table exists
    const { data: projectsExists, error: projectsExistsError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    if (projectsExistsError && projectsExistsError.code === '42P01') {
      console.log('Creating projects table...');
      
      // Create projects table
      const { error: createProjectsError } = await supabase.rpc('create_projects_table');
      
      if (createProjectsError) {
        console.error('Error creating projects table:', createProjectsError);
        
        // Try direct SQL approach
        const { error: sqlError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            project_name TEXT NOT NULL,
            client_name TEXT,
            number_of_files INTEGER DEFAULT 0,
            unit_price DECIMAL(10, 2) DEFAULT 0,
            total DECIMAL(10, 2) DEFAULT 0,
            project_status TEXT DEFAULT 'Not Started',
            payment_status TEXT DEFAULT 'Pending',
            notes TEXT,
            links TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        if (sqlError) {
          console.error('Error creating projects table with SQL:', sqlError);
        } else {
          console.log('Projects table created successfully with SQL');
        }
      } else {
        console.log('Projects table created successfully');
      }
    } else {
      console.log('Projects table already exists');
      
      // Add notes and links columns if they don't exist
      console.log('Checking and adding missing columns to projects table...');
      
      try {
        // Try to add notes column with direct SQL
        console.log('Adding notes column if it does not exist...');
        try {
          const { error: notesError } = await supabase.rpc('execute_sql', {
            sql_statement: 'ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes TEXT;'
          });
          
          if (notesError) {
            console.error('Failed to add notes column:', notesError.message);
          } else {
            console.log('Notes column added or already exists');
          }
        } catch (err) {
          console.error('Error executing notes column SQL:', err.message);
        }
        
        // Try to add links column with direct SQL
        console.log('Adding links column if it does not exist...');
        try {
          const { error: linksError } = await supabase.rpc('execute_sql', {
            sql_statement: 'ALTER TABLE projects ADD COLUMN IF NOT EXISTS links TEXT;'
          });
          
          if (linksError) {
            console.error('Failed to add links column:', linksError.message);
          } else {
            console.log('Links column added or already exists');
          }
        } catch (err) {
          console.error('Error executing links column SQL:', err.message);
        }
        
        console.log('Column check/add completed');
      } catch (error) {
        console.error('Error adding columns to projects table:', error);
      }
    }
    
    // Check if companies table exists
    const { data: companiesExists, error: companiesExistsError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    if (companiesExistsError && companiesExistsError.code === '42P01') {
      console.log('Creating companies table...');
      
      // Create companies table
      const { error: createCompaniesError } = await supabase.rpc('create_companies_table');
      
      if (createCompaniesError) {
        console.error('Error creating companies table:', createCompaniesError);
        
        // Try direct SQL approach
        const { error: sqlError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS companies (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            name TEXT NOT NULL,
            address TEXT,
            email TEXT,
            phone TEXT,
            gst TEXT,
            logo_url TEXT,
            bank_details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        if (sqlError) {
          console.error('Error creating companies table with SQL:', sqlError);
        } else {
          console.log('Companies table created successfully with SQL');
        }
      } else {
        console.log('Companies table created successfully');
      }
    } else {
      console.log('Companies table already exists');
    }
    
    // Check if clients table exists
    const { data: clientsExists, error: clientsExistsError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (clientsExistsError && clientsExistsError.code === '42P01') {
      console.log('Creating clients table...');
      
      // Create clients table
      const { error: createClientsError } = await supabase.rpc('create_clients_table');
      
      if (createClientsError) {
        console.error('Error creating clients table:', createClientsError);
        
        // Try direct SQL approach
        const { error: sqlError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS clients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            name TEXT NOT NULL,
            company_details TEXT,
            has_gst BOOLEAN DEFAULT FALSE,
            gst_number TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        if (sqlError) {
          console.error('Error creating clients table with SQL:', sqlError);
        } else {
          console.log('Clients table created successfully with SQL');
        }
      } else {
        console.log('Clients table created successfully');
      }
    } else {
      console.log('Clients table already exists');
    }
    
    // Check if invoices table exists
    const { data: invoicesExists, error: invoicesExistsError } = await supabase
      .from('invoices')
      .select('id')
      .limit(1);
    
    if (invoicesExistsError && invoicesExistsError.code === '42P01') {
      console.log('Creating invoices table...');
      
      // Create invoices table
      const { error: createInvoicesError } = await supabase.rpc('create_invoices_table');
      
      if (createInvoicesError) {
        console.error('Error creating invoices table:', createInvoicesError);
        
        // Try direct SQL approach
        const { error: sqlError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS invoices (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            invoice_number TEXT NOT NULL,
            bill_number TEXT,
            bill_to TEXT,
            bill_date TIMESTAMP WITH TIME ZONE,
            date TEXT,
            company_id UUID,
            client_id UUID,
            company_name TEXT,
            client_name TEXT,
            items JSONB,
            subtotal DECIMAL(10, 2) DEFAULT 0,
            gst DECIMAL(10, 2) DEFAULT 0,
            total DECIMAL(10, 2) DEFAULT 0,
            company_logo TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        if (sqlError) {
          console.error('Error creating invoices table with SQL:', sqlError);
        } else {
          console.log('Invoices table created successfully with SQL');
        }
      } else {
        console.log('Invoices table created successfully');
      }
    } else {
      console.log('Invoices table already exists');
    }
    
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initDatabase()
  .then(() => console.log('Database initialization completed'))
  .catch(err => console.error('Database initialization failed:', err))
  .finally(() => process.exit(0)); 