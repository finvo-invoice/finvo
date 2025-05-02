-- Create the project_metadata table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS project_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notes TEXT DEFAULT '',
  links TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_metadata_project_id ON project_metadata(project_id);
CREATE INDEX IF NOT EXISTS idx_project_metadata_user_id ON project_metadata(user_id);

-- Grant permissions if needed
-- GRANT ALL PRIVILEGES ON TABLE project_metadata TO authenticated;
-- GRANT ALL PRIVILEGES ON TABLE project_metadata TO service_role;

-- Add comment
COMMENT ON TABLE project_metadata IS 'Stores additional metadata for projects like notes and links'; 