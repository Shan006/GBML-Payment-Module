import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';
import { supabase } from '../config/supabase.js';

const STANDARD_CONTRACT_TYPES = ['TOKEN', 'NFT', 'BUNDLE', 'TREASURY', 'ROUTER', 'GOVERNANCE'];

/**
 * Module Registry Service
 * Manages custom module definitions and contract compositions
 * Allows users to register custom modules with GBML capabilities
 */
export class ModuleRegistryService {
  constructor() {
    this.tableName = 'custom_module_definitions';
  }

  /**
   * Register a new custom module definition
   * @param {Object} moduleDef - Module definition
   * @returns {Promise<Object>} Registered module
   */
  async registerModule(moduleDef) {
    const {
      moduleId,
      moduleName,
      moduleType,
      description,
      contracts,
      services,
      compliance,
      switchable,
      uiProperties,
      platformIntegrations,
      createdBy
    } = moduleDef;

    // Validate contract definitions
    if (!contracts || contracts.length === 0) {
      throw new Error('At least one contract must be defined for a custom module');
    }

    const artifactBackedTypes = ['TOKEN', 'NFT', 'BUNDLE', 'TREASURY', 'ROUTER'];

    for (const contract of contracts) {
      if (!contract.contractName || !contract.contractType) {
        throw new Error('Each contract must have contractName and contractType');
      }

      const isArtifactBacked = artifactBackedTypes.includes(contract.contractType?.toUpperCase());
      if (!isArtifactBacked && (!contract.abi || !contract.bytecode)) {
        throw new Error(`Contract ${contract.contractName} (${contract.contractType}) requires abi and bytecode`);
      }
    }

    const moduleRecord = {
      id: uuid(),
      module_id: moduleId,
      module_name: moduleName,
      module_type: moduleType || 'CUSTOM',
      description: description || '',
      contracts: JSON.stringify(contracts),
      services: JSON.stringify(services || { wallet: true, settlement: true, conversion: false }),
      compliance: JSON.stringify(compliance || { kycRequired: true, amlRequired: true }),
      switchable: JSON.stringify(switchable || { enabled: true, analytics: true, transactions: true, compliance: true, governance: false }),
      ui_properties: JSON.stringify(uiProperties || {}),
      platform_integrations: JSON.stringify(platformIntegrations || []),
      enabled: true,
      created_by: createdBy || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([moduleRecord])
      .select()
      .single();

    if (error) {
      console.error('[ModuleRegistryService] Error registering module:', error);
      throw new Error(`Failed to register module: ${error.message}`);
    }

    return this.formatModuleResponse(data);
  }

  /**
   * Get a custom module definition by ID
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} Module definition
   */
  async getModule(moduleId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('module_id', moduleId)
      .eq('enabled', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Module not found
      }
      console.error('[ModuleRegistryService] Error getting module:', error);
      throw new Error(`Failed to get module: ${error.message}`);
    }

    return this.formatModuleResponse(data);
  }

  /**
   * List all custom modules
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of modules
   */
  async listModules(filters = {}) {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('enabled', true);

    if (filters.moduleType) {
      query = query.eq('module_type', filters.moduleType);
    }

    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[ModuleRegistryService] Error listing modules:', error);
      throw new Error(`Failed to list modules: ${error.message}`);
    }

    return data.map(this.formatModuleResponse);
  }

  /**
   * Update a custom module definition
   * @param {string} moduleId - Module ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated module
   */
  async updateModule(moduleId, updates) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Convert objects to JSON strings if needed
    if (updates.contracts) {
      updateData.contracts = JSON.stringify(updates.contracts);
    }
    if (updates.services) {
      updateData.services = JSON.stringify(updates.services);
    }
    if (updates.compliance) {
      updateData.compliance = JSON.stringify(updates.compliance);
    }
    if (updates.switchable) {
      updateData.switchable = JSON.stringify(updates.switchable);
    }
    if (updates.uiProperties) {
      updateData.ui_properties = JSON.stringify(updates.uiProperties);
    }
    if (updates.platformIntegrations) {
      updateData.platform_integrations = JSON.stringify(updates.platformIntegrations);
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('module_id', moduleId)
      .select()
      .single();

    if (error) {
      console.error('[ModuleRegistryService] Error updating module:', error);
      throw new Error(`Failed to update module: ${error.message}`);
    }

    return this.formatModuleResponse(data);
  }

  /**
   * Disable a custom module
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} Disabled module
   */
  async disableModule(moduleId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq('module_id', moduleId)
      .select()
      .single();

    if (error) {
      console.error('[ModuleRegistryService] Error disabling module:', error);
      throw new Error(`Failed to disable module: ${error.message}`);
    }

    return this.formatModuleResponse(data);
  }

  /**
   * Check if a module type is a custom module
   * @param {string} moduleType - Module type
   * @returns {Promise<boolean>} True if custom module
   */
  async isCustomModule(moduleType) {
    return moduleType?.startsWith('CUSTOM_');
  }

  /**
   * Auto-generate constructor params for standard JRC contract types
   */
  buildConstructorParams(contractType, { moduleId, contractName, walletAddress, routerAddress }) {
    const safeId = (moduleId || 'MOD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    const name = contractName || `Module ${moduleId}`;
    const type = contractType?.toUpperCase();

    switch (type) {
      case 'TOKEN':
        return [
          name,
          `MTK${safeId}`,
          18,
          ethers.parseEther('1000000'),
          walletAddress,
          routerAddress
        ];
      case 'NFT':
      case 'BUNDLE':
        return [name, `NFT${safeId}`, routerAddress];
      case 'TREASURY':
        return [walletAddress];
      case 'ROUTER':
        return [walletAddress];
      default:
        return [];
    }
  }

  /**
   * Enrich contract definitions with auto-generated constructor params
   */
  enrichContractDefinitions(contracts, context = {}) {
    return contracts.map((contract) => {
      const type = contract.contractType?.toUpperCase();
      const isStandard = STANDARD_CONTRACT_TYPES.includes(type) && type !== 'GOVERNANCE';

      let constructorParams = contract.constructorParams;
      if ((!constructorParams || constructorParams.length === 0) && isStandard) {
        constructorParams = this.buildConstructorParams(type, {
          moduleId: context.moduleId,
          contractName: contract.contractName,
          walletAddress: context.walletAddress || '{{walletAddress}}',
          routerAddress: context.routerAddress || '{{routerAddress}}'
        }).map((param) =>
          typeof param === 'string' ? param : param.toString()
        );
      }

      return {
        ...contract,
        constructorParams: constructorParams || [],
        routeThroughJvdEgcr: contract.routeThroughJvdEgcr !== false && ['TOKEN', 'NFT', 'BUNDLE'].includes(type)
      };
    });
  }

  /**
   * Resolve full enablement payload from a registered custom module definition
   */
  async resolveEnablementPayload(moduleId, overrides = {}) {
    const definition = await this.getModule(moduleId);
    if (!definition) {
      throw new Error(`Custom module definition not found for moduleId: ${moduleId}`);
    }

    const contractDefinitions = overrides.contractDefinitions
      || this.enrichContractDefinitions(definition.contracts, { moduleId });

    return {
      moduleId,
      moduleType: overrides.moduleType || definition.moduleType,
      moduleName: definition.moduleName,
      description: definition.description,
      contractDefinitions,
      services: overrides.services || definition.services,
      compliance: overrides.compliance || definition.compliance,
      switchable: overrides.switchable || definition.switchable || {},
      uiProperties: definition.uiProperties || {},
      platformIntegrations: definition.platformIntegrations || []
    };
  }

  /**
   * Derive service flags for custom modules from registry definition
   */
  deriveServiceFlags(services = {}) {
    return {
      walletEnabled: services.wallet !== false,
      settlementEnabled: services.settlement !== false,
      conversionEnabled: services.conversion === true
    };
  }

  /**
   * Format module response from database record
   * @param {Object} record - Database record
   * @returns {Object} Formatted module
   */
  formatModuleResponse(record) {
    const contracts = typeof record.contracts === 'string'
      ? JSON.parse(record.contracts)
      : record.contracts;
    const services = typeof record.services === 'string'
      ? JSON.parse(record.services)
      : record.services;
    const compliance = typeof record.compliance === 'string'
      ? JSON.parse(record.compliance)
      : record.compliance;

    return {
      id: record.id,
      moduleId: record.module_id,
      moduleName: record.module_name,
      moduleType: record.module_type,
      description: record.description,
      contracts,
      services,
      compliance,
      switchable: record.switchable
        ? (typeof record.switchable === 'string' ? JSON.parse(record.switchable) : record.switchable)
        : { enabled: true, analytics: true, transactions: true, compliance: true, governance: false },
      uiProperties: record.ui_properties
        ? (typeof record.ui_properties === 'string' ? JSON.parse(record.ui_properties) : record.ui_properties)
        : {},
      platformIntegrations: record.platform_integrations
        ? (typeof record.platform_integrations === 'string' ? JSON.parse(record.platform_integrations) : record.platform_integrations)
        : [],
      enabled: record.enabled,
      createdBy: record.created_by,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }
}
