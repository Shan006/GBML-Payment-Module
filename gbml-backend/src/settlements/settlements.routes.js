import express from 'express';
import { create, getById } from './settlements.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Settlements Routes
 * 
 * POST /settlements     - Request a payment token settlement (admin, payment_service, treasury_service keys allowed)
 * GET  /settlements/:id - Retrieve settlement status and details (authenticated)
 */
router.post('/', authenticate, authorize(['admin', 'payment_service', 'treasury_service']), create);
router.get('/:id', authenticate, getById);

export default router;
