import { ModuleRegistryService } from './module-registry.service.js';

const moduleRegistryService = new ModuleRegistryService();

/**
 * Register a new custom module definition
 * POST /custom-modules
 */
export async function registerCustomModule(req, res) {
  try {
    const moduleDef = req.body;
    
    // Add creator from auth
    const identity = req.apiKeyIdentity || req.user || {};
    moduleDef.createdBy = identity.id || identity.email || 'system';

    const result = await moduleRegistryService.registerModule(moduleDef);

    return res.status(201).json({
      success: true,
      module: result
    });
  } catch (err) {
    console.error('Error registering custom module:', err);
    return res.status(500).json({
      error: 'Failed to register custom module',
      message: err.message
    });
  }
}

/**
 * Get a custom module definition by ID
 * GET /custom-modules/:moduleId
 */
export async function getCustomModule(req, res) {
  try {
    const { moduleId } = req.params;
    const module = await moduleRegistryService.getModule(moduleId);

    if (!module) {
      return res.status(404).json({
        error: 'Custom module not found'
      });
    }

    return res.json({
      success: true,
      module
    });
  } catch (err) {
    console.error('Error getting custom module:', err);
    return res.status(500).json({
      error: 'Failed to get custom module',
      message: err.message
    });
  }
}

/**
 * List all custom modules
 * GET /custom-modules
 */
export async function listCustomModules(req, res) {
  try {
    const filters = {};
    
    if (req.query.moduleType) {
      filters.moduleType = req.query.moduleType;
    }
    
    if (req.query.createdBy) {
      filters.createdBy = req.query.createdBy;
    }

    const modules = await moduleRegistryService.listModules(filters);

    return res.json({
      success: true,
      modules,
      count: modules.length
    });
  } catch (err) {
    console.error('Error listing custom modules:', err);
    return res.status(500).json({
      error: 'Failed to list custom modules',
      message: err.message
    });
  }
}

/**
 * Update a custom module definition
 * PUT /custom-modules/:moduleId
 */
export async function updateCustomModule(req, res) {
  try {
    const { moduleId } = req.params;
    const updates = req.body;

    const result = await moduleRegistryService.updateModule(moduleId, updates);

    return res.json({
      success: true,
      module: result
    });
  } catch (err) {
    console.error('Error updating custom module:', err);
    return res.status(500).json({
      error: 'Failed to update custom module',
      message: err.message
    });
  }
}

/**
 * Add contracts to an existing custom module
 * POST /custom-modules/:moduleId/contracts
 */
export async function addContractsToCustomModule(req, res) {
  try {
    const { moduleId } = req.params;
    const { contracts } = req.body;

    if (!contracts || !Array.isArray(contracts) || contracts.length === 0) {
      return res.status(400).json({
        error: 'Contracts array is required and must contain at least one contract'
      });
    }

    const result = await moduleRegistryService.addContractsToModule(moduleId, contracts);

    return res.json({
      success: true,
      module: result
    });
  } catch (err) {
    console.error('Error adding contracts to custom module:', err);
    const status = err.message.includes('not found') ? 404
      : err.message.includes('already exists') ? 409
      : 500;
    return res.status(status).json({
      error: 'Failed to add contracts to custom module',
      message: err.message
    });
  }
}

/**
 * Disable a custom module
 * DELETE /custom-modules/:moduleId
 */
export async function disableCustomModule(req, res) {
  try {
    const { moduleId } = req.params;
    const result = await moduleRegistryService.disableModule(moduleId);

    return res.json({
      success: true,
      module: result
    });
  } catch (err) {
    console.error('Error disabling custom module:', err);
    return res.status(500).json({
      error: 'Failed to disable custom module',
      message: err.message
    });
  }
}
