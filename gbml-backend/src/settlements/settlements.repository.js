import { supabase } from '../config/supabase.js';
import { Settlement } from './settlement.entity.js';

export class SettlementsRepository {
  /**
   * Insert a new settlement mapping record in Supabase
   * @param {Object} settlementData - Properties of settlement to save
   * @returns {Promise<Settlement>}
   */
  async save(settlementData) {
    const { data, error } = await supabase
      .from('settlements')
      .insert({
        id: settlementData.id,
        recipient: settlementData.recipient.toLowerCase(),
        token_address: settlementData.tokenAddress.toLowerCase(),
        amount: settlementData.amount,
        tx_hash: settlementData.txHash,
        status: settlementData.status.toUpperCase(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving settlement in Supabase repository:', error);
      throw error;
    }

    return Settlement.fromDatabase(data);
  }

  /**
   * Update settlement record's status and transaction hash
   * @param {string} id - Settlement identifier
   * @param {string} status - New status (e.g. SUCCESS, FAILED)
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Settlement>}
   */
  async updateStatusAndHash(id, status, txHash) {
    const { data, error } = await supabase
      .from('settlements')
      .update({
        status: status.toUpperCase(),
        tx_hash: txHash
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating settlement ${id}:`, error);
      throw error;
    }

    return Settlement.fromDatabase(data);
  }

  /**
   * Find a settlement record by its ID
   * @param {string} id - Settlement identifier
   * @returns {Promise<Settlement|null>}
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error finding settlement by ID ${id}:`, error);
      throw error;
    }

    return Settlement.fromDatabase(data);
  }
}
