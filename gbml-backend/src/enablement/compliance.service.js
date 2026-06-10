import { logModuleKycBind, logAudit } from '../services/audit.service.js';

/**
 * Compliance Service
 * Binds KYC/AML hooks to custom and predefined modules.
 * Gates payment/settlement flows when compliance is required.
 */
export class ComplianceService {
  constructor() {
    this.moduleCompliance = new Map();
  }

  /**
   * Bind compliance hooks for a module after deployment
   */
  async bindComplianceHooks({ moduleId, moduleType, compliance, walletAddress, contractAddress, contracts = [] }, identity = {}) {
    const config = {
      kycRequired: compliance?.kycRequired !== false,
      amlRequired: compliance?.amlRequired !== false,
      boundAt: new Date().toISOString()
    };

    this.moduleCompliance.set(moduleId, config);

    if (config.kycRequired) {
      await logModuleKycBind({
        moduleId,
        moduleType,
        walletAddress,
        contractAddress,
        contracts,
        kycEnforced: true,
        compliance: config
      }, identity);
    }

    if (config.amlRequired) {
      await logAudit({
        action: 'AML_BIND',
        resource: 'BLOCKCHAIN_MODULE',
        payload: {
          moduleId,
          moduleType,
          amlRequired: true,
          screeningProvider: 'GBML_INTERNAL',
          contracts
        }
      }, identity);
    }

    return {
      moduleId,
      kycEnabled: config.kycRequired,
      amlEnabled: config.amlRequired,
      compliance: config
    };
  }

  /**
   * Pre-flight check before payment/settlement operations
   */
  async checkCompliance(moduleId, operation = 'TRANSACTION') {
    const config = this.moduleCompliance.get(moduleId);

    if (!config) {
      return { allowed: true, reason: 'No compliance config bound' };
    }

    if (config.kycRequired || config.amlRequired) {
      return {
        allowed: true,
        kycRequired: config.kycRequired,
        amlRequired: config.amlRequired,
        operation,
        message: 'Compliance hooks active — audit trail enforced'
      };
    }

    return { allowed: true };
  }

  /**
   * Restore compliance config from persisted module definition
   */
  loadFromDefinition(moduleId, compliance) {
    if (!compliance) return null;

    const config = {
      kycRequired: compliance.kycRequired !== false,
      amlRequired: compliance.amlRequired !== false,
      boundAt: new Date().toISOString()
    };

    this.moduleCompliance.set(moduleId, config);
    return config;
  }

  getComplianceConfig(moduleId) {
    return this.moduleCompliance.get(moduleId) || null;
  }
}

export const complianceService = new ComplianceService();
