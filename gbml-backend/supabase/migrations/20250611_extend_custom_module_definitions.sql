-- Extend custom_module_definitions for full GBML binding schema

ALTER TABLE custom_module_definitions
ADD COLUMN IF NOT EXISTS switchable JSONB DEFAULT '{"enabled": true, "analytics": true, "transactions": true, "compliance": true, "governance": false}'::jsonb,
ADD COLUMN IF NOT EXISTS ui_properties JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS platform_integrations JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN custom_module_definitions.switchable IS 'Per-feature on/off toggles for custom module routes';
COMMENT ON COLUMN custom_module_definitions.ui_properties IS 'Frontend display properties (icon, color, displayName)';
COMMENT ON COLUMN custom_module_definitions.platform_integrations IS 'Cross-platform ecosystems (GRANTS, PAYMENTS, SAAS, CREDIT, MARKETPLACE)';
