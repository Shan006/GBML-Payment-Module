-- Migration to create settlements table
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    token_address VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    tx_hash VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (if desired)
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
