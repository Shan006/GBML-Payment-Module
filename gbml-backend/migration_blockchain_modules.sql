-- Migration to create the blockchain_modules table
CREATE TABLE IF NOT EXISTS public.blockchain_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id VARCHAR(255) NOT NULL,
    module_type VARCHAR(100) NOT NULL,
    contract_address VARCHAR(255) UNIQUE NOT NULL,
    blockchain_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (if desired, though service role key bypasses it)
ALTER TABLE public.blockchain_modules ENABLE ROW LEVEL SECURITY;
