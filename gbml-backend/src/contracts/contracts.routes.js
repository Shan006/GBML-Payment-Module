import express from 'express';
import { register, getByAddress, getByService, listAll } from './contracts.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Contract Registry Routes
 *
 * POST   /contracts                    - Register a new contract (admin only)
 * GET    /contracts                    - List all contracts (admin only)
 * GET    /contracts/service/:serviceId - Get contract by service ID (authenticated)
 * GET    /contracts/:address           - Get contract by address (authenticated)
 *
 * NOTE: /contracts/service/:serviceId MUST be declared before /contracts/:address
 * to prevent Express from treating "service" as an address param.
 */

// Register a new deployed contract — admin only
router.post('/', authenticate, authorize(['admin']), register);

// List all contracts — admin only
router.get('/', authenticate, authorize(['admin']), listAll);

// Get contract by service ID — any authenticated caller
router.get('/service/:serviceId', authenticate, getByService);

// Get contract by blockchain address — any authenticated caller
router.get('/:address', authenticate, getByAddress);

export default router;
