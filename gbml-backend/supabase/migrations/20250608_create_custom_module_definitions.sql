-- Create custom_module_definitions table
-- This table stores custom module definitions with contract compositions

CREATE TABLE IF NOT EXISTS custom_module_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id VARCHAR(255) UNIQUE NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  module_type VARCHAR(100) NOT NULL DEFAULT 'CUSTOM',
  description TEXT,
  contracts JSONB NOT NULL, -- Array of contract definitions
  services JSONB NOT NULL DEFAULT '{"wallet": true, "settlement": true, "conversion": false}'::jsonb,
  compliance JSONB NOT NULL DEFAULT '{"kycRequired": true, "amlRequired": true}'::jsonb,
  enabled BOOLEAN DEFAULT true,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_module_definitions_module_id ON custom_module_definitions(module_id);
CREATE INDEX IF NOT EXISTS idx_custom_module_definitions_module_type ON custom_module_definitions(module_type);
CREATE INDEX IF NOT EXISTS idx_custom_module_definitions_enabled ON custom_module_definitions(enabled);
CREATE INDEX IF NOT EXISTS idx_custom_module_definitions_created_by ON custom_module_definitions(created_by);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_module_definitions_updated_at
  BEFORE UPDATE ON custom_module_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE custom_module_definitions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read enabled custom modules
CREATE POLICY "Anyone can read enabled custom modules"
  ON custom_module_definitions
  FOR SELECT
  USING (enabled = true);

-- Policy: Admins can insert custom modules
CREATE POLICY "Admins can insert custom modules"
  ON custom_module_definitions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update custom modules
CREATE POLICY "Admins can update custom modules"
  ON custom_module_definitions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete custom modules
CREATE POLICY "Admins can delete custom modules"
  ON custom_module_definitions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
