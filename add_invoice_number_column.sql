-- Add invoice_number column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT; 