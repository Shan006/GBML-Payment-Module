/**
 * Database abstraction layer using Supabase
 */

import { supabase } from '../config/supabase.js';

/**
 * Store module configuration
 * @param {string} moduleId - Module ID
 * @param {Object} moduleData - Module data
 */
export async function storeModule(moduleId, moduleData) {
  const { data, error } = await supabase
    .from('modules')
    .upsert({
      module_id: moduleId,
      tenant_id: moduleData.tenantId,
      token_address: moduleData.tokenAddress,
      token_mode: moduleData.tokenMode,
      token_config: moduleData.tokenConfig,
      exchange_rates: moduleData.exchangeRates || {},
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Error storing module ${moduleId}:`, error);
    throw error;
  }
}

/**
 * Get module by ID
 * @param {string} moduleId - Module ID
 * @returns {Object|null} Module data or null
 */
export async function getModule(moduleId) {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('module_id', moduleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error(`Error getting module ${moduleId}:`, error);
    throw error;
  }

  return {
    ...data,
    moduleId: data.module_id,
    tenantId: data.tenant_id,
    tokenAddress: data.token_address,
    tokenMode: data.token_mode,
    tokenConfig: data.token_config,
    exchangeRates: data.exchange_rates
  };
}

/**
 * Get all modules for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Array} Array of module data
 */
export async function getModulesByTenant(tenantId) {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error(`Error getting modules for tenant ${tenantId}:`, error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    moduleId: item.module_id,
    tenantId: item.tenant_id,
    tokenAddress: item.token_address,
    tokenMode: item.token_mode,
    tokenConfig: item.token_config,
    exchangeRates: item.exchange_rates
  }));
}

/**
 * Get module by token symbol
 * @param {string} tokenSymbol - Token symbol
 * @returns {Object|null} Module data or null
 */
export async function getModuleByTokenSymbol(tokenSymbol) {
  // We need to query the JSONB field
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .filter('token_config->>symbol', 'eq', tokenSymbol.toUpperCase());

  if (error) {
    console.error(`Error getting module by symbol ${tokenSymbol}:`, error);
    throw error;
  }

  if (!data || data.length === 0) return null;
  if (data.length > 1) {
    throw new Error(`Multiple modules found with token symbol: ${tokenSymbol}`);
  }

  const module = data[0];
  return {
    ...module,
    moduleId: module.module_id,
    tenantId: module.tenant_id,
    tokenAddress: module.token_address,
    tokenMode: module.token_mode,
    tokenConfig: module.token_config,
    exchangeRates: module.exchange_rates
  };
}

/**
 * Get all available tokens
 * @returns {Array} Array of token information
 */
export async function getAllTokens() {
  const { data, error } = await supabase
    .from('modules')
    .select('*');

  if (error) {
    console.error('Error getting all tokens:', error);
    throw error;
  }

  return data.map(module => ({
    symbol: module.token_config?.symbol,
    name: module.token_config?.name,
    address: module.token_address,
    decimals: module.token_config?.decimals,
    moduleId: module.module_id,
  }));
}

/**
 * Update module exchange rates
 * @param {string} moduleId - Module ID
 * @param {Object} exchangeRates - Exchange rates object
 */
export async function updateModuleExchangeRates(moduleId, exchangeRates) {
  const { error } = await supabase
    .from('modules')
    .update({
      exchange_rates: exchangeRates,
      updated_at: new Date().toISOString()
    })
    .eq('module_id', moduleId);

  if (error) {
    console.error(`Error updating rates for ${moduleId}:`, error);
    throw error;
  }
}

/**
 * Store fiat transaction
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {Object} txData - Transaction data
 */
export async function storeFiatTransaction(paymentIntentId, txData) {
  const { error } = await supabase
    .from('fiat_transactions')
    .upsert({
      payment_intent_id: paymentIntentId,
      module_id: txData.moduleId,
      token_symbol: txData.tokenSymbol,
      token_address: txData.tokenAddress,
      recipient_address: txData.recipientAddress,
      fiat_amount: txData.fiatAmount,
      currency: txData.currency,
      token_decimals: txData.tokenDecimals,
      status: txData.status,
      blockchain_tx_hash: txData.blockchainTxHash,
      block_number: txData.blockNumber,
      token_amount: txData.tokenAmount,
      token_amount_wei: txData.tokenAmountWei,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Error storing fiat transaction ${paymentIntentId}:`, error);
    throw error;
  }
}

/**
 * Get fiat transaction by payment intent ID
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Object|null} Transaction data or null
 */
export async function getFiatTransaction(paymentIntentId) {
  const { data, error } = await supabase
    .from('fiat_transactions')
    .select('*')
    .eq('payment_intent_id', paymentIntentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error(`Error getting fiat transaction ${paymentIntentId}:`, error);
    throw error;
  }

  return {
    ...data,
    paymentIntentId: data.payment_intent_id,
    moduleId: data.module_id,
    tokenSymbol: data.token_symbol,
    tokenAddress: data.token_address,
    recipientAddress: data.recipient_address,
    fiatAmount: data.fiat_amount,
    tokenDecimals: data.token_decimals,
    blockchainTxHash: data.blockchain_tx_hash,
    blockNumber: data.block_number,
    tokenAmount: data.token_amount,
    tokenAmountWei: data.token_amount_wei
  };
}

/**
 * Update fiat transaction
 * @param {string} paymentIntentId - Payment intent ID
 * @param {Object} updates - Updates to apply
 */
export async function updateFiatTransaction(paymentIntentId, updates) {
  const dbUpdates = {};
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.blockchainTxHash) dbUpdates.blockchain_tx_hash = updates.blockchainTxHash;
  if (updates.blockNumber) dbUpdates.block_number = updates.blockNumber;
  if (updates.tokenAmount) dbUpdates.token_amount = updates.tokenAmount;
  if (updates.tokenAmountWei) dbUpdates.token_amount_wei = updates.tokenAmountWei;
  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('fiat_transactions')
    .update(dbUpdates)
    .eq('payment_intent_id', paymentIntentId);

  if (error) {
    console.error(`Error updating fiat transaction ${paymentIntentId}:`, error);
    throw error;
  }
}

/**
 * Get fiat transactions by module ID
 * @param {string} moduleId - Module ID
 * @returns {Array} Array of fiat transactions
 */
export async function getFiatTransactionsByModule(moduleId) {
  const { data, error } = await supabase
    .from('fiat_transactions')
    .select('*')
    .eq('module_id', moduleId);

  if (error) {
    console.error(`Error getting fiat transactions for module ${moduleId}:`, error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    paymentIntentId: item.payment_intent_id,
    moduleId: item.module_id,
    tokenSymbol: item.token_symbol,
    tokenAddress: item.token_address,
    recipientAddress: item.recipient_address,
    fiatAmount: item.fiat_amount,
    tokenDecimals: item.token_decimals,
    blockchainTxHash: item.blockchain_tx_hash,
    blockNumber: item.block_number,
    tokenAmount: item.token_amount,
    tokenAmountWei: item.token_amount_wei
  }));
}
