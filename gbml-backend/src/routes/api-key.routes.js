import express from 'express';
import {
    createApiKey,
    listApiKeys,
    revokeApiKey
} from '../controllers/api-key.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// API Key Management Routes (Admin ONLY)
router.post('/admin/api-keys', authenticate, authorize(['admin']), createApiKey);
router.get('/admin/api-keys', authenticate, authorize(['admin']), listApiKeys);
router.delete('/admin/api-keys/:id', authenticate, authorize(['admin']), revokeApiKey);

export default router;
