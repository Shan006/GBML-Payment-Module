import express from 'express';
import { 
  enableBlockchain, 
  getModuleStatus, 
  listModules, 
  getStats,
  disableBlockchain,
  updateServices,
  deployAdditionalContracts
} from './enablement.controller.js';
import {
  getModuleBindings,
  toggleModuleFeature,
  getModuleCompliance
} from './module-binding.controller.js';
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

// Module binding & compliance routes (must be before /:moduleId catch-all)
router.get('/:moduleId/bindings', authenticate, getModuleBindings);
router.get('/:moduleId/compliance', authenticate, getModuleCompliance);
router.patch('/:moduleId/switchable/:feature', authenticate, authorize(['admin']), toggleModuleFeature);

// Get module status
router.get('/:moduleId', authenticate, getModuleStatus);

// Disable blockchain for a module (admin only)
router.post('/:moduleId/disable', authenticate, authorize(['admin']), disableBlockchain);

// Update module services (admin only)
router.patch('/:moduleId/services', authenticate, authorize(['admin']), updateServices);

// Deploy additional contracts to an already-enabled module (admin only)
router.post('/:moduleId/contracts', authenticate, authorize(['admin']), deployAdditionalContracts);

export default router;
