-- Comprehensive fix for bill_number column issues

-- 1. Add bill_number column if it doesn't exist
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_number TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
COMMIT;

-- 2. Make bill_number column nullable
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ALTER COLUMN bill_number DROP NOT NULL;
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;
COMMIT;

-- 3. Set a default value for bill_number
BEGIN;
  DO $$ 
  BEGIN 
    ALTER TABLE invoices ALTER COLUMN bill_number SET DEFAULT '';
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;
COMMIT;

-- 4. Update existing records to copy invoice_number to bill_number if bill_number is null
BEGIN;
  DO $$ 
  BEGIN
    UPDATE invoices SET bill_number = invoice_number WHERE bill_number IS NULL;
    EXCEPTION WHEN undefined_column THEN NULL;
  END $$;
COMMIT;

-- 5. Create a trigger to automatically copy invoice_number to bill_number on insert
BEGIN;
  DO $$ 
  BEGIN
    -- Create a function to copy invoice_number to bill_number
    CREATE OR REPLACE FUNCTION copy_invoice_to_bill_number()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.bill_number IS NULL THEN
        NEW.bill_number = NEW.invoice_number;
      END IF;
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
COMMIT; 