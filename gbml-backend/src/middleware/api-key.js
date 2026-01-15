import { APIKeyService } from '../services/api-key.service.js';

/**
 * Middleware to authenticate requests using API Keys
 * This can be used alongside Supabase auth or as an alternative for programmatic access
 */
export const authenticateApiKey = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(); // Continue to next middleware (maybe Supabase auth)
    }

    // Check if it's an API Key (gbml_ prefix)
    if (authHeader.startsWith('Bearer gbml_') || authHeader.startsWith('gbml_')) {
        const rawKey = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        try {
            const keyInfo = await APIKeyService.validateKey(rawKey);

            if (!keyInfo) {
                return res.status(401).json({ error: 'Invalid or expired API key' });
            }

            // Attach RBAC info to request
            req.apiKeyIdentity = {
                id: keyInfo.id,
                tenantId: keyInfo.tenant_id,
                roles: keyInfo.roles || [],
                name: keyInfo.name
            };

            // Also set tenantId globally on req for convenience
            req.tenantId = keyInfo.tenant_id;

            return next();
        } catch (error) {
            console.error('API Key validation error:', error);
            return res.status(500).json({ error: 'Internal server error during authentication' });
        }
    }

    next();
};

/**
 * Middleware to require specific roles for an API key request
 * @param {Array<string>} requiredRoles - List of roles that are allowed to access
 */
export const requireApiKeyRole = (requiredRoles = []) => {
    return (req, res, next) => {
        // If it's a Supabase user, we might have different logic or allow admins
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        if (!req.apiKeyIdentity) {
            return res.status(401).json({ error: 'API key required for this endpoint' });
        }

        const { roles } = req.apiKeyIdentity;
        const hasRole = requiredRoles.some(role => roles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                error: 'Forbidden: API key lacks required roles',
                required: requiredRoles,
                current: roles
            });
        }

        next();
    };
};
