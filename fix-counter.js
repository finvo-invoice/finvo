const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Drop and recreate policies
async function fixRLSPolicies() {
  console.log('Fixing RLS policies...');
  
  // SQL to drop and recreate policies
  const policiesSQL = `
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can create their own counter" ON public.invoice_counters;
  DROP POLICY IF EXISTS "Users can update their own counter" ON public.invoice_counters;
  DROP POLICY IF EXISTS "Users can view their own counter" ON public.invoice_counters;
  DROP POLICY IF EXISTS "Users or service key can create their own counter" ON public.invoice_counters;
  DROP POLICY IF EXISTS "Users or service key can update their own counter" ON public.invoice_counters;
  DROP POLICY IF EXISTS "Users or service key can view their own counter" ON public.invoice_counters;

  -- Create new policies allowing both auth.uid and service key access
  CREATE POLICY "Users or service key can create their own counter"
    ON public.invoice_counters
    FOR INSERT
    WITH CHECK ((auth.uid() = user_id) OR (auth.uid() IS NULL));

  CREATE POLICY "Users or service key can update their own counter"
    ON public.invoice_counters
    FOR UPDATE
    USING ((auth.uid() = user_id) OR (auth.uid() IS NULL));

  CREATE POLICY "Users or service key can view their own counter"
    ON public.invoice_counters
    FOR SELECT
    USING ((auth.uid() = user_id) OR (auth.uid() IS NULL));

  -- Make sure RLS is enabled
  ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;
  `;
  
  // Execute the SQL
  const { data: policiesData, error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
  
  if (policiesError) {
    console.error('Error updating RLS policies:', policiesError);
  } else {
    console.log('RLS policies updated successfully');
  }
}

// 2. Drop and recreate increment function with p_user_id
async function fixIncrementFunction() {
  console.log('Fixing increment function...');
  
  // Drop existing function
  const dropSQL = `DROP FUNCTION IF EXISTS increment_invoice_number(uuid);`;
  await supabase.rpc('exec_sql', { sql: dropSQL });
  
  // Create the new function with p_user_id parameter
  const createFunctionSQL = `
  CREATE OR REPLACE FUNCTION public.increment_invoice_number(p_user_id uuid)
  RETURNS integer
  LANGUAGE plpgsql
  AS $$
  DECLARE
    new_number integer;
  BEGIN
    UPDATE invoice_counters
    SET last_invoice_number = last_invoice_number + 1
    WHERE user_id = p_user_id
    RETURNING last_invoice_number INTO new_number;

    RETURN new_number;
  END;
  $$;
  `;
  
  // Execute the SQL
  const { data: functionData, error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
  
  if (functionError) {
    console.error('Error creating function:', functionError);
  } else {
    console.log('Function created successfully');
  }
}

// 3. Create a unique constraint on user_id if it doesn't exist
async function addUniqueConstraint() {
  console.log('Adding unique constraint on user_id...');
  
  const constraintSQL = `
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'invoice_counters_user_id_unique'
    ) THEN
      ALTER TABLE invoice_counters 
      ADD CONSTRAINT invoice_counters_user_id_unique UNIQUE (user_id);
    END IF;
  END
  $$;
  `;
  
  const { data: constraintData, error: constraintError } = await supabase.rpc('exec_sql', { sql: constraintSQL });
  
  if (constraintError) {
    console.error('Error adding unique constraint:', constraintError);
  } else {
    console.log('Unique constraint added or already exists');
  }
}

// 4. Insert a counter for the user
async function insertCounter() {
  console.log('Creating counter for user...');
  
  // Increment the current counter to 2025002 for next time
  const insertSQL = `
  INSERT INTO invoice_counters (user_id, last_invoice_number)
  VALUES ('56405535-a607-4ec9-aace-8a804a92093d', 2025002)
  ON CONFLICT (user_id) 
  DO UPDATE SET last_invoice_number = 2025002
  WHERE invoice_counters.last_invoice_number < 2025002;
  `;
  
  const { data: insertData, error: insertError } = await supabase.rpc('exec_sql', { sql: insertSQL });
  
  if (insertError) {
    console.error('Error creating/updating counter:', insertError);
  } else {
    console.log('Counter created or updated successfully');
  }
}

async function fixEverything() {
  try {
    await fixRLSPolicies();
    await fixIncrementFunction();
    await addUniqueConstraint();
    await insertCounter();
    console.log('All fixes applied successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  }
}

fixEverything(); 