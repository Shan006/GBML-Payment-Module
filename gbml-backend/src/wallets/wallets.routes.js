import express from 'express';
import { create, getByUserId, getBalances, getTransactions, transfer } from './wallets.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Wallet Routes
 * Protected by authenticate and authorize (allows admin and user roles)
 */
router.post('/', authenticate, authorize(['admin', 'user']), create);
router.get('/:userId', authenticate, authorize(['admin', 'user']), getByUserId);
router.get('/:address/balances', authenticate, authorize(['admin', 'user']), getBalances);
router.get('/:address/transactions', authenticate, authorize(['admin', 'user']), getTransactions);
router.post('/transfer', authenticate, authorize(['admin', 'user']), transfer);

export default router;
