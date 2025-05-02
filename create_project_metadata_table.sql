-- Create project_metadata table
CREATE TABLE IF NOT EXISTS project_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notes TEXT,
  links TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_metadata_project_id ON project_metadata(project_id);
CREATE INDEX IF NOT EXISTS idx_project_metadata_user_id ON project_metadata(user_id); 