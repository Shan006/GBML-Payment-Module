import { setPauseState, isPaused } from '../services/pause.service.js';
import { logError } from '../services/audit.service.js';

/**
 * Admin: Pause/Unpause a scope
 * POST /gbml/admin/pause
 */
export async function togglePause(req, res) {
    const { scope, targetId, isPaused, reason } = req.body;
    const adminId = req.user?.id; // Assumes authenticate middleware sets req.user

    try {
        if (!scope || !['GLOBAL', 'MODULE', 'TOKEN'].includes(scope)) {
            return res.status(400).json({ error: 'Invalid scope. Must be GLOBAL, MODULE, or TOKEN.' });
        }

        await setPauseState({
            scope,
            targetId,
            isPaused: isPaused !== false, // Default to true if not provided
            reason,
            adminId
        });

        return res.json({
            status: 'success',
            message: `${scope} ${targetId || ''} is now ${isPaused !== false ? 'PAUSED' : 'UNPAUSED'}`,
            data: { scope, targetId, isPaused: isPaused !== false, reason }
        });
    } catch (error) {
        console.error('[Pause Controller] Error toggling pause:', error);
        res.status(500).json({ error: 'Failed to update pause state', message: error.message });
    }
}

/**
 * Check current pause status (Admin/Internal use)
 * GET /gbml/admin/pause/status
 */
export async function getPauseStatus(req, res) {
    const { scope, targetId } = req.query;

    try {
        const paused = await isPaused(scope, targetId);
        return res.json({ scope, targetId, isPaused: paused });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get pause status' });
    }
}
