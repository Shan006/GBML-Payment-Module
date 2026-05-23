-- Create contracts table in public schema
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id VARCHAR(255) NOT NULL,
    contract_name VARCHAR(255) NOT NULL,
    contract_type VARCHAR(100) NOT NULL,
    contract_address VARCHAR(255) UNIQUE NOT NULL,
    abi JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Since the backend uses SUPABASE_SERVICE_ROLE_KEY, it bypasses RLS automatically.
-- No explicit policies are required for backend functionality.
