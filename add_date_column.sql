-- Add date column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN date TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT; 