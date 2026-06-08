import { v4 as uuid } from 'uuid';
import { supabase } from '../config/supabase.js';

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
      moduleType, // 'CUSTOM' or custom type
      description,
      contracts, // Array of contract definitions
      services, // { wallet: true, settlement: true, conversion: false }
      compliance, // { kycRequired: true, amlRequired: true }
      createdBy
    } = moduleDef;

    // Validate contract definitions
    if (!contracts || contracts.length === 0) {
      throw new Error('At least one contract must be defined for a custom module');
    }

    // Validate each contract definition
    for (const contract of contracts) {
      if (!contract.contractName || !contract.contractType || !contract.abi) {
        throw new Error('Each contract must have contractName, contractType, and abi');
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
    const module = await this.getModule(moduleType);
    return module !== null;
  }

  /**
   * Format module response from database record
   * @param {Object} record - Database record
   * @returns {Object} Formatted module
   */
  formatModuleResponse(record) {
    return {
      id: record.id,
      moduleId: record.module_id,
      moduleName: record.module_name,
      moduleType: record.module_type,
      description: record.description,
      contracts: JSON.parse(record.contracts),
      services: JSON.parse(record.services),
      compliance: JSON.parse(record.compliance),
      enabled: record.enabled,
      createdBy: record.created_by,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }
}
