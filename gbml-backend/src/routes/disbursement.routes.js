import express from 'express';
import {
    requestDisbursement,
    executeDisbursement,
    listDisbursements
} from '../controllers/disbursement.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Disbursement Routes

// Request disbursement (PROGRAM role or Admin)
router.post('/program/disbursements', authenticate, authorize(['PROGRAM', 'admin']), requestDisbursement);

// Execute disbursement (TREASURY role or Admin)
router.post('/treasury/disbursements/:requestId/execute', authenticate, authorize(['TREASURY', 'admin']), executeDisbursement);

// List disbursements
router.get('/disbursements', authenticate, listDisbursements);

export default router;
