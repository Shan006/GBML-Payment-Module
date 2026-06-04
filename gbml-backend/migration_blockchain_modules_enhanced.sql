-- Enhanced Blockchain Modules Migration
-- Adds status tracking and additional metadata

-- Add new columns if they don't exist
ALTER TABLE public.blockchain_modules 
ADD COLUMN IF NOT EXISTS module_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS settlement_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS conversion_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deployment_tx_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blockchain_modules_module_id ON public.blockchain_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_modules_status ON public.blockchain_modules(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_modules_enabled ON public.blockchain_modules(blockchain_enabled);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read blockchain modules" ON public.blockchain_modules;
CREATE POLICY "Allow authenticated users to read blockchain modules"
    ON public.blockchain_modules FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to manage blockchain modules" ON public.blockchain_modules;
CREATE POLICY "Allow admins to manage blockchain modules"
    ON public.blockchain_modules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE public.blockchain_modules IS 'Tracks blockchain-enabled modules with their contract addresses and enablement status';
COMMENT ON COLUMN public.blockchain_modules.module_id IS 'Reference to the module being enabled';
COMMENT ON COLUMN public.blockchain_modules.module_type IS 'Type of module (FUND, TREASURY, GRANT, REGISTRY, etc.)';
COMMENT ON COLUMN public.blockchain_modules.status IS 'Current status (ACTIVE, INACTIVE, PENDING, FAILED)';
COMMENT ON COLUMN public.blockchain_modules.wallet_enabled IS 'Whether wallet support is enabled';
COMMENT ON COLUMN public.blockchain_modules.settlement_enabled IS 'Whether settlement support is enabled';
COMMENT ON COLUMN public.blockchain_modules.conversion_enabled IS 'Whether fiat conversion is enabled';
