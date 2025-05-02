-- Add gstRate column to invoices table if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gstRate DECIMAL DEFAULT 18;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT; 