import { supabase } from '../config/supabase.js';
import { BlockchainModule } from './blockchain-module.entity.js';

export class EnablementRepository {
  /**
   * Insert a blockchain module mapping in the database
   * @param {Object} moduleData - Properties to save
   * @returns {Promise<BlockchainModule>}
   */
  async save(moduleData) {
    const { data, error } = await supabase
      .from('blockchain_modules')
      .insert({
        id: moduleData.id,
        module_id: moduleData.moduleId || moduleData.serviceId,
        service_id: moduleData.serviceId,
        module_type: moduleData.moduleType.toUpperCase(),
        contract_address: moduleData.contractAddress.toLowerCase(),
        blockchain_enabled: moduleData.blockchainEnabled !== undefined ? moduleData.blockchainEnabled : true,
        status: moduleData.status || 'ACTIVE',
        wallet_enabled: moduleData.walletEnabled || false,
        settlement_enabled: moduleData.settlementEnabled || false,
        conversion_enabled: moduleData.conversionEnabled || false,
        deployment_tx_hash: moduleData.deploymentTxHash,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving blockchain module in Supabase repository:', error);
      throw error;
    }

    return new BlockchainModule(data);
  }

  /**
   * Find mapping by contract address
   * @param {string} address - Contract address
   * @returns {Promise<BlockchainModule|null>}
   */
  async findByAddress(address) {
    const cleanAddress = address.toLowerCase();
    const { data, error } = await supabase
      .from('blockchain_modules')
      .select('*')
      .eq('contract_address', cleanAddress)
      .maybeSingle();

    if (error) {
      console.error(`Error finding blockchain module by address ${address}:`, error);
      throw error;
    }

    return data ? new BlockchainModule(data) : null;
  }

  /**
   * Find mapping by service ID and module type
   * @param {string} serviceId - Service ID
   * @param {string} moduleType - Module type
   * @returns {Promise<BlockchainModule[]>}
   */
  async findByServiceIdAndType(serviceId, moduleType) {
    const { data, error } = await supabase
      .from('blockchain_modules')
      .select('*')
      .eq('service_id', serviceId)
      .eq('module_type', moduleType.toUpperCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error listing blockchain modules for service ${serviceId}:`, error);
      throw error;
    }

    return (data || []).map(row => new BlockchainModule(row));
  }

  /**
   * Find blockchain module by module ID
   */
  async findByModuleId(moduleId) {
    const { data, error } = await supabase
      .from('blockchain_modules')
      .select('*')
      .eq('module_id', moduleId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data ? new BlockchainModule(data) : null
  }

  /**
   * Get all blockchain modules
   */
  async findAll(filters = {}) {
    let query = supabase
      .from('blockchain_modules')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.moduleType) {
      query = query.eq('module_type', filters.moduleType.toUpperCase())
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.blockchainEnabled !== undefined) {
      query = query.eq('blockchain_enabled', filters.blockchainEnabled)
    }

    const { data, error } = await query

    if (error) throw error
    return data.map(item => new BlockchainModule(item))
  }

  /**
   * Update blockchain module
   */
  async update(moduleId, updateData) {
    const updates = {
      updated_at: new Date().toISOString()
    }

    if (updateData.status !== undefined) updates.status = updateData.status
    if (updateData.blockchainEnabled !== undefined) updates.blockchain_enabled = updateData.blockchainEnabled
    if (updateData.walletEnabled !== undefined) updates.wallet_enabled = updateData.walletEnabled
    if (updateData.settlementEnabled !== undefined) updates.settlement_enabled = updateData.settlementEnabled
    if (updateData.conversionEnabled !== undefined) updates.conversion_enabled = updateData.conversionEnabled

    const { data, error } = await supabase
      .from('blockchain_modules')
      .update(updates)
      .eq('module_id', moduleId)
      .select()
      .single()

    if (error) throw error
    return new BlockchainModule(data)
  }

  /**
   * Get statistics
   */
  async getStats() {
    const { data, error } = await supabase
      .from('blockchain_modules')
      .select('module_type, status, blockchain_enabled')

    if (error) throw error

    const stats = {
      total: data.length,
      enabled: 0,
      disabled: 0,
      byType: {},
      byStatus: {}
    }

    data.forEach(module => {
      if (module.blockchain_enabled) {
        stats.enabled++
      } else {
        stats.disabled++
      }

      stats.byType[module.module_type] = (stats.byType[module.module_type] || 0) + 1
      stats.byStatus[module.status] = (stats.byStatus[module.status] || 0) + 1
    })

    return stats
  }
}
