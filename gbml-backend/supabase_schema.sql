-- Profiles table to store user roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Fix: Use a function or a simpler check to avoid recursion
-- For now, let's allow admins to be defined by a specific check that doesn't loop
-- Or simpler: just let users read their own role (which they are doing)
-- and for the backend use service_role. 
-- If you need admins to see all, use a more complex setup or just allow it for now.
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT (auth.jwt() ->> 'role')) = 'admin' -- Only if you use custom claims
    OR 
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') -- This is still likely recursive
  );

-- BETTER FIX: Remove the recursive policy and just stick to "Users can view their own profile" 
-- for the frontend. The backend (using service role) can already see everything.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;


-- Modules table
CREATE TABLE IF NOT EXISTS public.modules (
  module_id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  token_address TEXT,
  token_mode TEXT,
  token_config JSONB,
  exchange_rates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fiat Transactions table
CREATE TABLE IF NOT EXISTS public.fiat_transactions (
  payment_intent_id TEXT PRIMARY KEY,
  module_id UUID REFERENCES public.modules(module_id),
  token_symbol TEXT,
  token_address TEXT,
  recipient_address TEXT,
  fiat_amount NUMERIC,
  currency TEXT,
  token_decimals INTEGER,
  status TEXT,
  blockchain_tx_hash TEXT,
  block_number INTEGER,
  token_amount TEXT,
  token_amount_wei TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Pause States table to track emergency pauses
CREATE TABLE IF NOT EXISTS public.pause_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL', 'MODULE', 'TOKEN')),
  target_id TEXT DEFAULT 'ALL', -- Module ID, Token Address, or 'ALL' for GLOBAL
  is_paused BOOLEAN DEFAULT TRUE,
  reason TEXT,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (scope, target_id)
);

-- Enable RLS on pause_states
ALTER TABLE public.pause_states ENABLE ROW LEVEL SECURITY;
