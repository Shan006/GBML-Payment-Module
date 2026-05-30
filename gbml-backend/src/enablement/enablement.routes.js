import express from 'express';
import { enableBlockchain } from './enablement.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Blockchain Enablement Routes
 * 
 * POST /enable-blockchain - Enable blockchain for a specific module by deploying it and saving the mapping (admin only)
 */
router.post('/', authenticate, authorize(['admin']), enableBlockchain);

export default router;
