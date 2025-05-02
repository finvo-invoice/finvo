-- Add missing columns to the invoices table if they don't exist
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