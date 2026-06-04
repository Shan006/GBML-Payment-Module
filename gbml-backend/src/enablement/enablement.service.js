import { OrchestratorService } from './orchestrator.service.js';
import { EnablementRepository } from './enablement.repository.js';

/**
 * Enablement Service
 * High-level service that wraps the orchestrator
 */
export class EnablementService {
  constructor() {
    this.orchestrator = new OrchestratorService();
    this.repository = new EnablementRepository();
  }

  formatApiResponse(result, targetModuleId) {
    const module = result.module || {};
    return {
      enabled: result.success,
      moduleId: targetModuleId,
      contractAddress: module.contractAddress,
      status: module.status,
      services: module.services,
      walletAddress: result.walletAddress,
      jvdRouterAddress: result.jvdRouterAddress,
      kycEnabled: result.kycEnabled,
      alreadyEnabled: result.alreadyEnabled || false,
      deployment: result.deployment
    };
  }

  /**
   * Enable blockchain for a module
   */
  async enableBlockchain(request, identity = {}) {
    const { moduleId, moduleType, serviceId, constructorParams } = request;
    const targetModuleId = moduleId || serviceId;

    if (!targetModuleId || !moduleType) {
      throw new Error('moduleId and moduleType are required');
    }

    console.log(`[EnablementService] Enabling blockchain for module: ${targetModuleId}, type: ${moduleType}`);

    const result = await this.orchestrator.enableBlockchain(
      {
        moduleId: targetModuleId,
        moduleType,
        constructorParams
      },
      identity
    );

    return this.formatApiResponse(result, targetModuleId);
  }

  async getModuleStatus(moduleId) {
    return await this.orchestrator.getModuleStatus(moduleId);
  }

  async listModules(filters = {}) {
    return await this.orchestrator.listEnabledModules(filters);
  }

  async getStats() {
    return await this.orchestrator.getStats();
  }

  async disableBlockchain(moduleId, identity = {}) {
    const result = await this.orchestrator.disableBlockchain(moduleId);
    return result;
  }

  async updateServices(moduleId, services) {
    const updated = await this.repository.update(moduleId, services);
    return updated.toResponse();
  }
}
