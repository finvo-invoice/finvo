-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  invoice_number TEXT NOT NULL,
  date TEXT NOT NULL,
  company_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  company_name TEXT,
  client_name TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL NOT NULL,
  gst DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Check if the table has the correct columns, if not, add them
DO $$
BEGIN
    -- Check if client_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN client_id TEXT;
    END IF;

    -- Check if company_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN company_id TEXT;
    END IF;

    -- Check if company_name column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'company_name'
    ) THEN
        ALTER TABLE invoices ADD COLUMN company_name TEXT;
    END IF;

    -- Check if client_name column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'client_name'
    ) THEN
        ALTER TABLE invoices ADD COLUMN client_name TEXT;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices (user_id);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices (invoice_number);

-- Drop existing policies to recreate them (this is safer than checking if they exist)
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or can't be dropped, continue
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or can't be dropped, continue
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or can't be dropped, continue
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or can't be dropped, continue
    END;
END $$;

-- Create policies
CREATE POLICY "Users can view their own invoices" 
  ON invoices FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" 
  ON invoices FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" 
  ON invoices FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
  ON invoices FOR DELETE 
  USING (auth.uid() = user_id); 