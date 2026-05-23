import express from 'express';
import { deploy } from './deployment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Deployment Routes
 * 
 * POST /deploy - Deploy a smart contract based on a template type and parameters (admin only)
 */
router.post('/', authenticate, authorize(['admin']), deploy);

export default router;
