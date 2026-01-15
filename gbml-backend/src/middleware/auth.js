import { supabase } from '../config/supabase.js';

/**
 * Middleware to authenticate requests using Supabase Auth
 */
export const authenticate = async (req, res, next) => {
    // If already authenticated via API Key, skip Supabase auth
    if (req.apiKeyIdentity) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    // Skip if it looks like an API Key (handled by authenticateApiKey)
    if (authHeader.includes('gbml_')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        // Only error if we didn't already authenticate via API key
        if (!req.apiKeyIdentity) {
            console.error('Auth debug - Token error:', error?.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        return next();
    }

    console.log('Auth debug - Authenticated user:', user.email);


    req.user = user;

    // Fetch user role from profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        req.user.role = 'user'; // Default role
    } else {
        req.user.role = profile.role;
    }

    next();
};

/**
 * Middleware to authorize based on roles
 * @param {Array} roles - Allowed roles
 */
export const authorize = (roles = []) => {
    return (req, res, next) => {
        // If authenticated via Supabase user
        if (req.user) {
            if (req.user.role === 'admin') return next();
            if (roles.length > 0 && roles.includes(req.user.role)) return next();
        }

        // If authenticated via API Key
        if (req.apiKeyIdentity) {
            const { roles: apiRoles } = req.apiKeyIdentity;
            // Map treasury/program roles to permissions if needed, 
            // but for now we check if any required role matches
            const hasRole = roles.some(role => apiRoles.includes(role.toUpperCase()));
            if (hasRole) return next();
        }

        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    };
};

