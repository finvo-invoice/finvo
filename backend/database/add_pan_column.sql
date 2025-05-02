-- Add PAN column to companies table
ALTER TABLE companies 
ADD COLUMN pan TEXT;
 
-- Update existing records to have empty string as pan value
UPDATE companies
SET pan = ''
WHERE pan IS NULL; 