-- Add company_id column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN company_id TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

-- Add client_id column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN client_id TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

-- Add company_name column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN company_name TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

-- Add client_name column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN client_name TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT; 