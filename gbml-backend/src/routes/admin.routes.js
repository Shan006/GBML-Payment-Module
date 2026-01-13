import express from 'express';
import { togglePause, getPauseStatus } from '../controllers/pause.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Admin Pause Management Routes
 */

// Toggle pause (GLOBAL, MODULE, or TOKEN)
router.post('/admin/pause', authenticate, authorize(['admin']), togglePause);

// Check current pause status
router.get('/admin/pause/status', authenticate, authorize(['admin']), getPauseStatus);

export default router;
