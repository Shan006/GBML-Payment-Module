import { supabase } from '../config/supabase.js';
import { Contract } from './contract.entity.js';

/**
 * Repository class handling database operations for the contracts table
 */
export class ContractsRepository {
  /**
   * Save a contract record in the database
   * @param {Object} contractData - Contract properties
   * @returns {Promise<Contract>}
   */
  async save(contractData) {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        id: contractData.id,
        service_id: contractData.serviceId,
        contract_name: contractData.contractName,
        contract_type: contractData.contractType.toUpperCase(),
        contract_address: contractData.contractAddress.toLowerCase(),
        abi: contractData.abi,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving contract in Supabase repository:', error);
      throw error;
    }

    return Contract.fromDatabase(data);
  }

  /**
   * Find contract by its address (case-insensitive query via lowercase comparison)
   * @param {string} address - Contract address
   * @returns {Promise<Contract|null>}
   */
  async findByAddress(address) {
    const cleanAddress = address.toLowerCase();
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('contract_address', cleanAddress)
      .maybeSingle();

    if (error) {
      console.error(`Error finding contract by address ${address}:`, error);
      throw error;
    }

    return Contract.fromDatabase(data);
  }

  /**
   * Find latest contract registered under a specific service ID
   * @param {string} serviceId - Service identifier
   * @returns {Promise<Contract|null>}
   */
  async findByServiceId(serviceId) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error(`Error finding contract by service ID ${serviceId}:`, error);
      throw error;
    }

    if (!data || data.length === 0) return null;
    return Contract.fromDatabase(data[0]);
  }

  /**
   * Retrieve all registered contracts
   * @returns {Promise<Contract[]>}
   */
  async listAll() {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing all contracts from Supabase:', error);
      throw error;
    }

    return (data || []).map(row => Contract.fromDatabase(row));
  }
}
