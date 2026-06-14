import fs from 'fs/promises';
import path from 'path';
import { syncModuleToDashboard } from './dashboard.service.js';
import { logAudit } from '../services/audit.service.js';

const SCHEMA_PATH = path.join(process.cwd(), 'config', 'gbml-module-schema.json');

const CAPABILITY_MAP = {
  TOKEN: 'hasToken',
  NFT: 'hasNFT',
  BUNDLE: 'hasNFT',
  COMPOSABLE: 'hasNFT',
  GOVERNANCE: 'hasGovernance',
  TREASURY: 'hasTreasury',
  ROUTER: 'hasRouter'
};

/**
 * Module Binding Service
 * Dynamically binds deployed contract addresses and ABIs to API endpoints,
 * compliance hooks, and frontend discovery (dashboard.json).
 */
export class ModuleBindingService {
  constructor() {
    this.bindings = new Map();
    this.schema = null;
  }

  async loadSchema() {
    if (this.schema) return this.schema;

    try {
      const raw = await fs.readFile(SCHEMA_PATH, 'utf8');
      this.schema = JSON.parse(raw);
    } catch {
      this.schema = { defaultEndpointBindings: {}, contractTypeMapping: {} };
    }

    return this.schema;
  }

  /**
   * Derive module capabilities from deployed contract composition
   */
  deriveCapabilities(deployments) {
    const capabilities = {
      hasToken: false,
      hasNFT: false,
      hasGovernance: false,
      hasAnalytics: true,
      hasCompliance: false,
      hasTreasury: false,
      hasRouter: false
    };

    for (const deployment of deployments) {
      const flag = CAPABILITY_MAP[deployment.contractType?.toUpperCase()];
      if (flag) {
        capabilities[flag] = true;
      }
    }

    return capabilities;
  }

  /**
   * Build endpoint bindings from contract types and deployed addresses
   */
  async buildEndpointBindings(moduleId, deployments, switchable = {}) {
    const schema = await this.loadSchema();
    const bindings = [];

    for (const deployment of deployments) {
      const type = deployment.contractType?.toUpperCase();
      const templates = schema.defaultEndpointBindings?.[type] || [];

      for (const template of templates) {
        const feature = template.feature || 'transactions';
        if (switchable[feature] === false) continue;

        bindings.push({
          path: template.path.replace(':moduleId', moduleId),
          method: template.method,
          contractRef: deployment.contractName,
          contractAddress: deployment.contractAddress,
          contractType: type,
          feature,
          enabled: switchable.enabled !== false
        });
      }
    }

    return bindings;
  }

  /**
   * Bind a deployed module to endpoints, dashboard, and in-memory registry
   */
  async bindModule({
    moduleId,
    moduleType,
    moduleName,
    deployments,
    services = {},
    compliance = {},
    switchable = {},
    walletAddress,
    jvdRouterAddress,
    uiProperties = {},
    platformIntegrations = []
  }, identity = {}) {
    const capabilities = this.deriveCapabilities(deployments);
    if (compliance.kycRequired || compliance.amlRequired) {
      capabilities.hasCompliance = true;
    }

    const endpoints = await this.buildEndpointBindings(moduleId, deployments, {
      enabled: true,
      analytics: true,
      transactions: true,
      compliance: compliance.kycRequired || compliance.amlRequired,
      governance: capabilities.hasGovernance,
      ...switchable
    });

    const bindingRecord = {
      moduleId,
      moduleType,
      moduleName: moduleName || moduleId,
      isCustom: moduleType?.startsWith('CUSTOM_'),
      contracts: deployments.map((d) => ({
        contractName: d.contractName,
        contractType: d.contractType,
        contractAddress: d.contractAddress,
        txHash: d.txHash
      })),
      services,
      compliance,
      switchable: {
        enabled: switchable.enabled !== false,
        analytics: switchable.analytics !== false,
        transactions: switchable.transactions !== false,
        compliance: switchable.compliance !== false,
        governance: switchable.governance === true || capabilities.hasGovernance,
        ...switchable
      },
      capabilities,
      endpoints,
      platformIntegrations,
      uiProperties,
      walletAddress,
      jvdRouterAddress,
      boundAt: new Date().toISOString()
    };

    this.bindings.set(moduleId, bindingRecord);

    await syncModuleToDashboard({
      moduleId,
      contractType: moduleType,
      contractAddress: deployments[0]?.contractAddress,
      enabled: bindingRecord.switchable.enabled,
      walletAddress,
      jvdRouterAddress,
      ...bindingRecord
    });

    await logAudit({
      action: 'MODULE_BIND',
      resource: 'BLOCKCHAIN_MODULE',
      payload: {
        moduleId,
        moduleType,
        contractCount: deployments.length,
        endpointCount: endpoints.length,
        capabilities
      }
    }, identity);

    return bindingRecord;
  }

  getBindings(moduleId) {
    return this.bindings.get(moduleId) || null;
  }

  /**
   * Toggle a switchable feature for a module route
   */
  async toggleFeature(moduleId, featureName, enabled) {
    const binding = this.bindings.get(moduleId);
    if (!binding) {
      throw new Error(`No bindings found for module ${moduleId}`);
    }

    binding.switchable[featureName] = enabled;
    binding.endpoints = binding.endpoints.map((ep) =>
      ep.feature === featureName ? { ...ep, enabled } : ep
    );

    await syncModuleToDashboard({
      moduleId,
      contractType: binding.moduleType,
      contractAddress: binding.contracts[0]?.contractAddress,
      enabled: binding.switchable.enabled,
      walletAddress: binding.walletAddress,
      jvdRouterAddress: binding.jvdRouterAddress,
      ...binding
    });

    return binding;
  }
}

export const moduleBindingService = new ModuleBindingService();
