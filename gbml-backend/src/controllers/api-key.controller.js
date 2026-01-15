import { APIKeyService } from '../services/api-key.service.js';

export const createApiKey = async (req, res) => {
    try {
        const { tenantId, roles, name } = req.body;
        // Only admins can create API keys
        const result = await APIKeyService.generateKey(tenantId, roles, name);

        res.status(201).json({
            success: true,
            data: {
                rawKey: result.rawKey, // Only shown once
                id: result.id,
                keyPrefix: result.key_prefix,
                roles: result.roles,
                name: result.name,
                tenantId: result.tenant_id
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const listApiKeys = async (req, res) => {
    try {
        const { tenantId } = req.query;
        const keys = await APIKeyService.listKeys(tenantId);

        res.json({
            success: true,
            data: keys
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const revokeApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        await APIKeyService.revokeKey(id);

        res.json({
            success: true,
            message: 'API key revoked successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
