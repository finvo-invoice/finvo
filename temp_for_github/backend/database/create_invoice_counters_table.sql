-- Create the invoice_counters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invoice_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    last_invoice_number INTEGER NOT NULL DEFAULT 1001,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS invoice_counters_user_id_idx ON public.invoice_counters(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view only their own counter
CREATE POLICY "Users can view their own counter"
    ON public.invoice_counters
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to update only their own counter
CREATE POLICY "Users can update their own counter"
    ON public.invoice_counters
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert their own counter
CREATE POLICY "Users can create their own counter"
    ON public.invoice_counters
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_invoice_counters_updated_at
    BEFORE UPDATE ON public.invoice_counters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 