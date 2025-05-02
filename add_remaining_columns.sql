-- Add all potentially missing columns to the invoices table
BEGIN;
  DO $$ 
  BEGIN 
    -- Add items column if it doesn't exist
    ALTER TABLE invoices ADD COLUMN items JSONB;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

BEGIN;
  DO $$ 
  BEGIN 
    -- Add subtotal column if it doesn't exist
    ALTER TABLE invoices ADD COLUMN subtotal DECIMAL;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

BEGIN;
  DO $$ 
  BEGIN 
    -- Add gst column if it doesn't exist
    ALTER TABLE invoices ADD COLUMN gst DECIMAL;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

BEGIN;
  DO $$ 
  BEGIN 
    -- Add total column if it doesn't exist
    ALTER TABLE invoices ADD COLUMN total DECIMAL;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

BEGIN;
  DO $$ 
  BEGIN 
    -- Add created_at column if it doesn't exist
    ALTER TABLE invoices ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

BEGIN;
  DO $$ 
  BEGIN 
    -- Add updated_at column if it doesn't exist
    ALTER TABLE invoices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT; 