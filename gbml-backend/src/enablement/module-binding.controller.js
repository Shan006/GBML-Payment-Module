import { moduleBindingService } from './module-binding.service.js';
import { complianceService } from './compliance.service.js';

/**
 * Get dynamic endpoint bindings for a module
 * GET /blockchain-modules/:moduleId/bindings
 */
export async function getModuleBindings(req, res) {
  try {
    const { moduleId } = req.params;
    const bindings = moduleBindingService.getBindings(moduleId);

    if (!bindings) {
      return res.status(404).json({
        error: 'Module bindings not found',
        message: `No bindings registered for module ${moduleId}. Enable the module first.`
      });
    }

    return res.json({
      success: true,
      moduleId,
      bindings
    });
  } catch (err) {
    console.error('Error getting module bindings:', err);
    return res.status(500).json({
      error: 'Failed to get module bindings',
      message: err.message
    });
  }
}

/**
 * Toggle a switchable feature for a module
 * PATCH /blockchain-modules/:moduleId/switchable/:feature
 */
export async function toggleModuleFeature(req, res) {
  try {
    const { moduleId, feature } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'enabled (boolean) is required in request body'
      });
    }

    const binding = await moduleBindingService.toggleFeature(moduleId, feature, Boolean(enabled));

    return res.json({
      success: true,
      moduleId,
      feature,
      enabled: Boolean(enabled),
      switchable: binding.switchable
    });
  } catch (err) {
    console.error('Error toggling module feature:', err);
    return res.status(500).json({
      error: 'Failed to toggle module feature',
      message: err.message
    });
  }
}

/**
 * Get compliance config for a module
 * GET /blockchain-modules/:moduleId/compliance
 */
export async function getModuleCompliance(req, res) {
  try {
    const { moduleId } = req.params;
    const config = complianceService.getComplianceConfig(moduleId);

    return res.json({
      success: true,
      moduleId,
      compliance: config || { kycRequired: false, amlRequired: false }
    });
  } catch (err) {
    console.error('Error getting module compliance:', err);
    return res.status(500).json({
      error: 'Failed to get module compliance',
      message: err.message
    });
  }
}
