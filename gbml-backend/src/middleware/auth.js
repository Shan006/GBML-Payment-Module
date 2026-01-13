import { supabase } from '../config/supabase.js';

/**
 * Middleware to authenticate requests using Supabase Auth
 */
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.error('Auth debug - Token error:', error?.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
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
        if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
