import express from 'express';
import { 
  enableBlockchain, 
  getModuleStatus, 
  listModules, 
  getStats,
  disableBlockchain,
  updateServices
} from './enablement.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Blockchain Enablement Routes
 */

// Enable blockchain for a module (admin only)
router.post('/', authenticate, authorize(['admin']), enableBlockchain);

// Get statistics (must be before /:moduleId route)
router.get('/stats', authenticate, getStats);

// List all enabled modules
router.get('/', authenticate, listModules);

// Get module status
router.get('/:moduleId', authenticate, getModuleStatus);

// Disable blockchain for a module (admin only)
router.post('/:moduleId/disable', authenticate, authorize(['admin']), disableBlockchain);

// Update module services (admin only)
router.patch('/:moduleId/services', authenticate, authorize(['admin']), updateServices);

export default router;
