import { supabase } from '../config/supabase.js';
import { logError, logPauseAction } from './audit.service.js';

// Simple in-memory cache for pause states
const pauseCache = {
    global: null,
    modules: new Map(),
    tokens: new Map(),
    lastUpdated: 0
};

const CACHE_TTL = 30000; // 30 seconds

/**
 * Check if a specific scope and target is paused
 * @param {string} scope - GLOBAL, MODULE, or TOKEN
 * @param {string} targetId - Module ID, Token Address, or null for GLOBAL
 * @returns {Promise<boolean>}
 */
export async function isPaused(scope, targetId = 'ALL') {
    const finalTargetId = targetId || 'ALL';
    try {
        // 1. Refresh cache if expired
        if (Date.now() - pauseCache.lastUpdated > CACHE_TTL) {
            await refreshPauseCache();
        }

        // 2. Check Global pause first (applies to everything)
        if (pauseCache.global) return true;

        // 3. Check specific scope
        if (scope === 'GLOBAL') return pauseCache.global;
        if (scope === 'MODULE') return pauseCache.modules.get(finalTargetId) || false;
        if (scope === 'TOKEN') return pauseCache.tokens.get(finalTargetId?.toLowerCase()) || false;

        return false;
    } catch (error) {
        console.error('[Pause Service] Error checking pause state:', error);
        return false; // Default to not paused on error, but log it
    }
}

/**
 * Refresh the in-memory pause cache from the database
 */
async function refreshPauseCache() {
    try {
        const { data, error } = await supabase
            .from('pause_states')
            .select('*')
            .eq('is_paused', true);

        if (error) throw error;

        // Reset cache
        pauseCache.global = false;
        pauseCache.modules.clear();
        pauseCache.tokens.clear();

        if (data) {
            data.forEach(pause => {
                if (pause.scope === 'GLOBAL') pauseCache.global = true;
                if (pause.scope === 'MODULE') pauseCache.modules.set(pause.target_id, true);
                if (pause.scope === 'TOKEN') pauseCache.tokens.set(pause.target_id?.toLowerCase(), true);
            });
        }

        pauseCache.lastUpdated = Date.now();
    } catch (error) {
        console.error('[Pause Service] Error refreshing pause cache:', error);
        await logError({
            error: error.message,
            context: { service: 'pause-service', action: 'refresh-cache' }
        });
    }
}

/**
 * Set pause state
 * @param {Object} params
 * @param {string} params.scope - GLOBAL, MODULE, TOKEN
 * @param {string} params.targetId - Target identifier
 * @param {boolean} params.isPaused - Pause or unpause
 * @param {string} params.reason - Reason for pause
 * @param {string} params.adminId - Admin UUID
 */
export async function setPauseState({ scope, targetId = 'ALL', isPaused = true, reason = '', adminId }) {
    const finalTargetId = targetId || 'ALL';
    try {
        const { error } = await supabase
            .from('pause_states')
            .upsert({
                scope,
                target_id: finalTargetId,
                is_paused: isPaused,
                reason,
                admin_id: adminId,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'scope,target_id'
            });

        if (error) throw error;

        // Immediately update local cache for responsiveness
        if (isPaused) {
            if (scope === 'GLOBAL') pauseCache.global = true;
            if (scope === 'MODULE') pauseCache.modules.set(finalTargetId, true);
            if (scope === 'TOKEN') pauseCache.tokens.set(finalTargetId?.toLowerCase(), true);
        } else {
            if (scope === 'GLOBAL') pauseCache.global = false;
            if (scope === 'MODULE') pauseCache.modules.delete(finalTargetId);
            if (scope === 'TOKEN') pauseCache.tokens.delete(finalTargetId?.toLowerCase());
        }

        // Audit the action
        await logPauseAction({
            scope,
            targetId,
            isPaused,
            reason,
            adminId
        });

        return { success: true };
    } catch (error) {
        console.error('[Pause Service] Error setting pause state:', error);
        throw error;
    }
}
