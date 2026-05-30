import { supabase } from '../config/supabase.js';
import { Wallet } from './entities/wallet.entity.js';
import { Transaction } from './entities/transaction.entity.js';

export class WalletRepository {
  /**
   * Save a newly generated wallet
   * @param {Object} walletData - Wallet properties
   * @returns {Promise<Wallet>}
   */
  async saveWallet(walletData) {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        id: walletData.id,
        user_id: walletData.userId,
        wallet_address: walletData.walletAddress.toLowerCase(),
        private_key: walletData.privateKey,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving wallet in repository:', error);
      throw error;
    }

    return Wallet.fromDatabase(data);
  }

  /**
   * Find wallet by user ID
   * @param {string} userId - User identifier
   * @returns {Promise<Wallet|null>}
   */
  async findWalletByUserId(userId) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(`Error finding wallet for user ${userId}:`, error);
      throw error;
    }

    return Wallet.fromDatabase(data);
  }

  /**
   * Find wallet by blockchain address
   * @param {string} address - Wallet address
   * @returns {Promise<Wallet|null>}
   */
  async findWalletByAddress(address) {
    const cleanAddress = address.toLowerCase();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('wallet_address', cleanAddress)
      .maybeSingle();

    if (error) {
      console.error(`Error finding wallet by address ${address}:`, error);
      throw error;
    }

    return Wallet.fromDatabase(data);
  }

  /**
   * Insert a transaction record
   * @param {Object} txData - Transaction properties
   * @returns {Promise<Transaction>}
   */
  async saveTransaction(txData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id: txData.id,
        wallet_address: txData.walletAddress.toLowerCase(),
        tx_hash: txData.txHash,
        token_address: txData.tokenAddress.toLowerCase(),
        amount: txData.amount,
        status: txData.status.toUpperCase(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving transaction in repository:', error);
      throw error;
    }

    return Transaction.fromDatabase(data);
  }

  /**
   * Retrieve transaction history of a wallet address
   * @param {string} address - Wallet address
   * @returns {Promise<Transaction[]>}
   */
  async findTransactionsByAddress(address) {
    const cleanAddress = address.toLowerCase();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_address', cleanAddress)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error finding transactions for address ${address}:`, error);
      throw error;
    }

    return (data || []).map(row => Transaction.fromDatabase(row));
  }

  /**
   * Update the status of a transaction
   * @param {string} txHash - Transaction hash
   * @param {string} status - New status (e.g. SUCCESS, FAILED)
   * @returns {Promise<void>}
   */
  async updateTransactionStatus(txHash, status) {
    const { error } = await supabase
      .from('transactions')
      .update({ status: status.toUpperCase() })
      .eq('tx_hash', txHash);

    if (error) {
      console.error(`Error updating transaction status for ${txHash}:`, error);
      throw error;
    }
  }
}
