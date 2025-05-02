-- Fix the bill_number column issue
BEGIN;
  -- First, check if bill_number exists and make it nullable if it does
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ALTER COLUMN bill_number DROP NOT NULL;
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;

  -- Set a default value for bill_number if it exists
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ALTER COLUMN bill_number SET DEFAULT '';
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;

  -- If invoice_number exists but bill_number doesn't, create a trigger to copy invoice_number to bill_number
  DO $$ 
  BEGIN
    -- Create a function to copy invoice_number to bill_number
    CREATE OR REPLACE FUNCTION copy_invoice_to_bill_number()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.bill_number = NEW.invoice_number;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create a trigger to call the function before insert
    DROP TRIGGER IF EXISTS copy_invoice_to_bill_number_trigger ON invoices;
    CREATE TRIGGER copy_invoice_to_bill_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION copy_invoice_to_bill_number();
    
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;

  -- Update existing records to copy invoice_number to bill_number if bill_number is null
  DO $$ 
  BEGIN
    UPDATE invoices SET bill_number = invoice_number WHERE bill_number IS NULL;
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;
COMMIT;

-- Add bill_number column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_number TEXT DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT; 