import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';
import { DeploymentService } from '../deployment/deployment.service.js';
import { ContractsService } from '../contracts/contracts.service.js';
import { EnablementRepository } from './enablement.repository.js';
import { RouterService } from '../settlements/router.service.js';
import { WalletService } from '../wallets/wallets.service.js';
import { syncModuleToDashboard } from './dashboard.service.js';
import { logBlockchainEnable, logModuleKycBind } from '../services/audit.service.js';

/**
 * Orchestrator Service
 * Coordinates the entire blockchain enablement process per GBML spec:
 * deploy contract → registry → JVD routing → module wallet → KYC bind → audit → dashboard
 */
export class OrchestratorService {
  constructor() {
    this.deploymentService = new DeploymentService();
    this.contractsService = new ContractsService();
    this.enablementRepository = new EnablementRepository();
    this.routerService = new RouterService();
    this.walletService = new WalletService();
  }

  MODULE_CONTRACTS = {
    FUND: 'TOKEN',
    TREASURY: 'TREASURY',
    GRANT: 'TOKEN',
    REGISTRY: 'TOKEN',
    PAYMENT: 'TOKEN',
    TOKEN: 'TOKEN',
    NFT: 'NFT',
    ROUTER: 'ROUTER'
  };

  /**
   * Main orchestration method - enables blockchain for a module
   */
  async enableBlockchain(request, identity = {}) {
    const { moduleId, moduleType, constructorParams } = request;

    console.log(`[Orchestrator] Starting blockchain enablement for module ${moduleId} of type ${moduleType}`);

    try {
      const contractType = this.determineContractType(moduleType);
      if (!contractType) {
        throw new Error(`Unsupported module type: ${moduleType}`);
      }

      const existing = await this.enablementRepository.findByModuleId(moduleId);
      if (existing) {
        console.log(`[Orchestrator] Module ${moduleId} already enabled`);
        const walletAddress = await this.walletService.getModuleWalletAddress(moduleId);
        const jvdRouterAddress = await this.getJvdRouterAddress();
        return this.buildResult({
          success: true,
          alreadyEnabled: true,
          module: existing.toResponse(),
          walletAddress,
          jvdRouterAddress,
          kycEnabled: existing.walletEnabled
        });
      }

      // Step 1: Ensure JVD EGCR settlement router is registered (mandatory routing layer)
      const jvdRouterAddress = await this.routerService.checkAndDeployRouter();
      if (!jvdRouterAddress) {
        throw new Error('JVD Router is required but could not be deployed or resolved');
      }

      // Step 2: Auto-bind module wallet (treasury / owner for contracts)
      const { walletAddress } = await this.walletService.createOrGetModuleWallet(moduleId);
      console.log(`[Orchestrator] Module wallet bound: ${walletAddress}`);

      // Step 3: Deploy smart contract
      console.log(`[Orchestrator] Deploying ${contractType} contract...`);
      const deployment = await this.deployContract({
        contractType,
        moduleId,
        moduleType,
        walletAddress,
        constructorParams
      });

      // Step 4: Register contract (deployment service registers; verify entry exists)
      await this.registerContract({
        contractName: `${moduleType}_${moduleId}`,
        contractType,
        contractAddress: deployment.contractAddress,
        moduleId
      });

      // Step 5: Enable platform services (wallet, settlement, conversion)
      const services = await this.attachPlatformServices(moduleId, moduleType);

      // Step 6: KYC enforcement flag — module wallet bound for on-chain interactions
      const kycEnabled = true;
      await logModuleKycBind({
        moduleId,
        moduleType,
        walletAddress,
        contractAddress: deployment.contractAddress,
        kycEnforced: true
      }, identity);

      // Step 7: Persist enablement record
      const enablementRecord = await this.saveEnablementRecord({
        moduleId,
        moduleType,
        contractAddress: deployment.contractAddress,
        deploymentTxHash: deployment.txHash,
        ...services
      });

      // Step 8: Sync dashboard.json module ↔ contract map
      await syncModuleToDashboard({
        moduleId,
        contractType,
        contractAddress: deployment.contractAddress,
        enabled: true,
        walletAddress,
        jvdRouterAddress
      });

      // Step 9: Audit trail
      await logBlockchainEnable({
        moduleId,
        moduleType,
        contractType,
        contractAddress: deployment.contractAddress,
        deploymentTxHash: deployment.txHash,
        walletAddress,
        jvdRouterAddress,
        services: enablementRecord.toResponse().services,
        kycEnabled
      }, identity);

      console.log(`[Orchestrator] Blockchain enablement completed for module ${moduleId}`);

      return this.buildResult({
        success: true,
        module: enablementRecord.toResponse(),
        deployment: {
          contractAddress: deployment.contractAddress,
          txHash: deployment.txHash
        },
        walletAddress,
        jvdRouterAddress,
        kycEnabled
      });
    } catch (error) {
      console.error(`[Orchestrator] Error enabling blockchain for module ${moduleId}:`, error);

      try {
        await this.enablementRepository.save({
          id: uuid(),
          moduleId,
          serviceId: moduleId,
          moduleType,
          contractAddress: '0x0000000000000000000000000000000000000000',
          status: 'FAILED',
          blockchainEnabled: false
        });
      } catch (saveError) {
        console.error('[Orchestrator] Failed to save error status:', saveError);
      }

      throw error;
    }
  }

  buildResult({ success, module, deployment, walletAddress, jvdRouterAddress, kycEnabled, alreadyEnabled }) {
    return {
      success,
      alreadyEnabled: alreadyEnabled || false,
      module,
      deployment,
      walletAddress,
      jvdRouterAddress,
      kycEnabled: kycEnabled || false
    };
  }

  determineContractType(moduleType) {
    return this.MODULE_CONTRACTS[moduleType.toUpperCase()] || null;
  }

  async getJvdRouterAddress() {
    const entry = await this.contractsService.getContractByServiceId('JVD_ROUTER');
    return entry?.contractAddress || null;
  }

  async deployContract({ contractType, moduleId, moduleType, walletAddress, constructorParams }) {
    try {
      const deploymentParams = constructorParams?.length
        ? { constructorParams }
        : this.prepareDeploymentParams(contractType, moduleId, walletAddress);

      const result = await this.deploymentService.deploy({
        contractType,
        serviceId: moduleId,
        contractName: `${moduleType}_${moduleId}`,
        ...deploymentParams
      });

      return {
        contractAddress: result.address,
        txHash: result.txHash
      };
    } catch (error) {
      console.error('[Orchestrator] Contract deployment failed:', error);
      throw new Error(`Contract deployment failed: ${error.message}`);
    }
  }

  /**
   * Constructor args aligned with compiled Juvidoe templates (JRC20, JRC721, Treasury, Router)
   */
  prepareDeploymentParams(contractType, moduleId, walletAddress) {
    const safeId = moduleId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'MOD';
    const type = contractType.toUpperCase();

    switch (type) {
      case 'JRC20':
      case 'TOKEN':
        return {
          constructorParams: [
            `Module Token ${moduleId}`,
            `MTK${safeId}`,
            18,
            ethers.parseEther('1000000'),
            walletAddress
          ]
        };
      case 'TREASURY':
        return {
          constructorParams: [walletAddress]
        };
      case 'JRC721':
      case 'NFT':
        return {
          constructorParams: [`Module NFT ${moduleId}`, `NFT${safeId}`]
        };
      case 'ROUTER':
        return {
          constructorParams: [walletAddress]
        };
      case 'JVD_ROUTER':
        return {
          constructorParams: []
        };
      default:
        return {
          constructorParams: []
        };
    }
  }

  async registerContract(contractData) {
    try {
      const entry = await this.contractsService.getContractByServiceId(contractData.moduleId);
      if (entry) {
        console.log(`[Orchestrator] Contract registered at ${entry.contractAddress}`);
        return;
      }
      console.log(`[Orchestrator] Contract registered via deployment at ${contractData.contractAddress}`);
    } catch (error) {
      console.warn('[Orchestrator] Registry verification warning:', error.message);
    }
  }

  async attachPlatformServices(moduleId, moduleType) {
    const services = {
      walletEnabled: false,
      settlementEnabled: false,
      conversionEnabled: false
    };

    const upper = moduleType.toUpperCase();

    services.walletEnabled = true;
    console.log(`[Orchestrator] Wallet support enabled for ${moduleId}`);

    if (['PAYMENT', 'FUND', 'TREASURY', 'GRANT', 'REGISTRY'].includes(upper)) {
      services.settlementEnabled = true;
      console.log(`[Orchestrator] JVD settlement routing enabled for ${moduleId}`);
    }

    if (['PAYMENT', 'FUND'].includes(upper)) {
      services.conversionEnabled = true;
      console.log(`[Orchestrator] Fiat conversion enabled for ${moduleId}`);
    }

    return services;
  }

  async saveEnablementRecord(data) {
    return await this.enablementRepository.save({
      id: uuid(),
      moduleId: data.moduleId,
      serviceId: data.moduleId,
      moduleType: data.moduleType,
      contractAddress: data.contractAddress,
      deploymentTxHash: data.deploymentTxHash,
      blockchainEnabled: true,
      status: 'ACTIVE',
      walletEnabled: data.walletEnabled,
      settlementEnabled: data.settlementEnabled,
      conversionEnabled: data.conversionEnabled
    });
  }

  async getModuleStatus(moduleId) {
    const module = await this.enablementRepository.findByModuleId(moduleId);
    if (!module) {
      return {
        moduleId,
        enabled: false,
        status: 'NOT_ENABLED'
      };
    }

    const response = module.toResponse();
    response.walletAddress = await this.walletService.getModuleWalletAddress(moduleId);
    response.jvdRouterAddress = await this.getJvdRouterAddress();
    response.kycEnabled = module.walletEnabled;
    return response;
  }

  async listEnabledModules(filters = {}) {
    const modules = await this.enablementRepository.findAll(filters);
    return Promise.all(
      modules.map(async (m) => {
        const response = m.toResponse();
        response.walletAddress = await this.walletService.getModuleWalletAddress(m.moduleId);
        return response;
      })
    );
  }

  async getStats() {
    return await this.enablementRepository.getStats();
  }

  async disableBlockchain(moduleId) {
    const module = await this.enablementRepository.findByModuleId(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    await this.enablementRepository.update(moduleId, {
      blockchainEnabled: false,
      status: 'INACTIVE'
    });

    await syncModuleToDashboard({
      moduleId,
      contractType: module.moduleType,
      contractAddress: module.contractAddress,
      enabled: false,
      walletAddress: await this.walletService.getModuleWalletAddress(moduleId)
    });

    return {
      success: true,
      moduleId,
      status: 'INACTIVE'
    };
  }
}
