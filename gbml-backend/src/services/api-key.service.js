import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to manage API Keys for tenants
 */
export class APIKeyService {
    /**
     * Generate a new API key for a tenant
     * @param {string} tenantId - The tenant ID
     * @param {Array<string>} roles - Roles assigned to this key (PROGRAM, TREASURY, COMPLIANCE)
     * @param {string} name - Friendly name for the key
     * @returns {Promise<Object>} The raw key (to be shown once) and its database record
     */
    static async generateKey(tenantId, roles = ['PROGRAM'], name = 'Default Key') {
        const rawKey = `gbml_${crypto.randomBytes(32).toString('hex')}`;
        const keyHash = this.hashKey(rawKey);
        const keyPrefix = rawKey.substring(0, 9); // 'gbml_' + first 4 chars of hex

        const { data, error } = await supabase
            .from('api_keys')
            .insert([
                {
                    key_hash: keyHash,
                    key_prefix: keyPrefix,
                    tenant_id: tenantId,
                    roles: roles,
                    name: name,
                    is_active: true
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating API key:', error);
            throw new Error(`Failed to create API key: ${error.message}`);
        }

        return {
            rawKey,
            ...data
        };
    }

    /**
     * Hash an API key for storage or lookup
     * @param {string} key - The raw API key
     * @returns {string} The SHA-256 hash
     */
    static hashKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    /**
     * Validate an API key and return associated info
     * @param {string} rawKey - The raw API key from header
     * @returns {Promise<Object|null>} Key info or null if invalid
     */
    static async validateKey(rawKey) {
        if (!rawKey || !rawKey.startsWith('gbml_')) {
            return null;
        }

        const keyHash = this.hashKey(rawKey);

        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('key_hash', keyHash)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return null;
        }

        // Check expiration if set
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return null;
        }

        return data;
    }

    /**
     * Revoke an API key
     * @param {string} id - The UUID of the key record
     */
    static async revokeKey(id) {
        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to revoke API key: ${error.message}`);
        }
    }

    /**
     * List keys for a tenant
     * @param {string} tenantId 
     */
    static async listKeys(tenantId) {
        const { data, error } = await supabase
            .from('api_keys')
            .select('id, key_prefix, roles, name, is_active, expires_at, created_at')
            .eq('tenant_id', tenantId);

        if (error) {
            throw new Error(`Failed to list API keys: ${error.message}`);
        }

        return data;
    }
}
