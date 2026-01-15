-- RBAC Migration: API Keys and Advanced Audit Logs

-- API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 4 characters for identification
  tenant_id TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{PROGRAM}', -- Array of roles: PROGRAM, TREASURY, COMPLIANCE
  name TEXT, -- Friendly name for the key
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Advanced Audit Logs Table (Expanding on previous logging)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id),
  admin_id UUID REFERENCES auth.users(id), -- If action was done via UI
  tenant_id TEXT,
  action TEXT NOT NULL,
  resource TEXT, -- e.g., 'TREASURY', 'MINT', 'DISBURSEMENT'
  payload JSONB,
  status TEXT, -- 'SUCCESS', 'FAILED'
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Disbursement Requests Table
CREATE TABLE IF NOT EXISTS public.disbursement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  amount TEXT NOT NULL, -- Wei or numeric string
  token_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  reason TEXT,
  requested_by_api_key UUID REFERENCES public.api_keys(id),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'EXECUTED', 'REJECTED', 'FAILED')),
  approved_by_id UUID REFERENCES auth.users(id), -- Admin approval
  executed_by_api_key UUID REFERENCES public.api_keys(id), -- Treasury execution
  blockchain_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on disbursement_requests
ALTER TABLE public.disbursement_requests ENABLE ROW LEVEL SECURITY;
