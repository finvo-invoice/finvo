-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to create the project_metadata table
CREATE OR REPLACE FUNCTION create_project_metadata_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'project_metadata'
  ) THEN
    -- Create the project_metadata table
    CREATE TABLE public.project_metadata (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID NOT NULL,
      user_id UUID NOT NULL,
      notes TEXT DEFAULT '',
      links TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(project_id, user_id)
    );

    -- Add foreign key constraint
    ALTER TABLE public.project_metadata 
    ADD CONSTRAINT fk_project_metadata_project_id 
    FOREIGN KEY (project_id) 
    REFERENCES public.projects(id) 
    ON DELETE CASCADE;

    -- Add indexes for performance
    CREATE INDEX idx_project_metadata_project_id ON public.project_metadata(project_id);
    CREATE INDEX idx_project_metadata_user_id ON public.project_metadata(user_id);
    
    RAISE NOTICE 'Created project_metadata table';
  ELSE
    RAISE NOTICE 'project_metadata table already exists';
  END IF;
END;
$$; 