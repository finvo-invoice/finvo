-- Create invoice_counters table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  last_invoice_number INTEGER NOT NULL DEFAULT 1001,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS invoice_counters_user_id_idx ON invoice_counters(user_id);

-- Enable Row Level Security
ALTER TABLE invoice_counters ENABLE ROW LEVEL SECURITY;

-- Create policies to control access
CREATE POLICY "Users can view their own invoice counters"
  ON invoice_counters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice counters"
  ON invoice_counters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice counters"
  ON invoice_counters FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_invoice_counters_updated_at
  BEFORE UPDATE ON invoice_counters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 