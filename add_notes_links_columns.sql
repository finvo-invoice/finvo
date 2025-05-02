-- Add notes and links columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS links TEXT;

-- Update existing projects to have empty notes and links
UPDATE projects SET notes = '' WHERE notes IS NULL;
UPDATE projects SET links = '' WHERE links IS NULL; 