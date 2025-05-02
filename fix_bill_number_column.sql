-- Option 1: Make bill_number column nullable
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ALTER COLUMN bill_number DROP NOT NULL;
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;
COMMIT;

-- Option 2: Add a default value to bill_number column
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ALTER COLUMN bill_number SET DEFAULT '';
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;
COMMIT;

-- Option 3: If bill_number doesn't exist, add it with a default value
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_number TEXT DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT; 