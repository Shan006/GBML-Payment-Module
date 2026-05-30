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
        service_id: moduleData.serviceId,
        module_type: moduleData.moduleType.toUpperCase(),
        contract_address: moduleData.contractAddress.toLowerCase(),
        blockchain_enabled: moduleData.blockchainEnabled,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving blockchain module in Supabase repository:', error);
      throw error;
    }

    return BlockchainModule.fromDatabase(data);
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

    return BlockchainModule.fromDatabase(data);
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

    return (data || []).map(row => BlockchainModule.fromDatabase(row));
  }
}
