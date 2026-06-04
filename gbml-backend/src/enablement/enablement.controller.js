import { EnablementService } from './enablement.service.js';
import { EnableBlockchainDto } from './dto/enable-blockchain.dto.js';

const enablementService = new EnablementService();

/**
 * Enable blockchain for an existing service module
 * POST /enable-blockchain
 */
export async function enableBlockchain(req, res) {
  try {
    // 1. Validate request payload
    const { isValid, errors } = EnableBlockchainDto.validate(req.body);
    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // 2. Perform blockchain enablement
    const dto = new EnableBlockchainDto(req.body);
    const identity = req.apiKeyIdentity || req.user || {};
    const result = await enablementService.enableBlockchain(dto, identity);

    // 3. Return response
    return res.status(result.alreadyEnabled ? 200 : 201).json(result);
  } catch (err) {
    console.error('Error in enablement controller:', err);
    return res.status(500).json({
      error: 'Failed to enable blockchain',
      message: err.message
    });
  }
}

/**
 * Get module status
 * GET /blockchain-modules/:moduleId
 */
export async function getModuleStatus(req, res) {
  try {
    const { moduleId } = req.params;
    const status = await enablementService.getModuleStatus(moduleId);

    return res.json(status);
  } catch (err) {
    console.error('Error getting module status:', err);
    return res.status(500).json({
      error: 'Failed to get module status',
      message: err.message
    });
  }
}

/**
 * List all enabled modules
 * GET /blockchain-modules
 */
export async function listModules(req, res) {
  try {
    const filters = {};
    
    if (req.query.moduleType) {
      filters.moduleType = req.query.moduleType;
    }
    
    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.enabled !== undefined) {
      filters.blockchainEnabled = req.query.enabled === 'true';
    }

    const modules = await enablementService.listModules(filters);

    return res.json({
      modules,
      count: modules.length
    });
  } catch (err) {
    console.error('Error listing modules:', err);
    return res.status(500).json({
      error: 'Failed to list modules',
      message: err.message
    });
  }
}

/**
 * Get enablement statistics
 * GET /blockchain-modules/stats
 */
export async function getStats(req, res) {
  try {
    const stats = await enablementService.getStats();
    return res.json(stats);
  } catch (err) {
    console.error('Error getting stats:', err);
    return res.status(500).json({
      error: 'Failed to get statistics',
      message: err.message
    });
  }
}

/**
 * Disable blockchain for a module
 * POST /blockchain-modules/:moduleId/disable
 */
export async function disableBlockchain(req, res) {
  try {
    const { moduleId } = req.params;
    const result = await enablementService.disableBlockchain(moduleId);

    return res.json(result);
  } catch (err) {
    console.error('Error disabling blockchain:', err);
    return res.status(500).json({
      error: 'Failed to disable blockchain',
      message: err.message
    });
  }
}

/**
 * Update module services
 * PATCH /blockchain-modules/:moduleId/services
 */
export async function updateServices(req, res) {
  try {
    const { moduleId } = req.params;
    const { walletEnabled, settlementEnabled, conversionEnabled } = req.body;

    const services = {};
    if (walletEnabled !== undefined) services.walletEnabled = walletEnabled;
    if (settlementEnabled !== undefined) services.settlementEnabled = settlementEnabled;
    if (conversionEnabled !== undefined) services.conversionEnabled = conversionEnabled;

    const result = await enablementService.updateServices(moduleId, services);

    return res.json(result);
  } catch (err) {
    console.error('Error updating services:', err);
    return res.status(500).json({
      error: 'Failed to update services',
      message: err.message
    });
  }
}
