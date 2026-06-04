/**
 * Blockchain Orchestrator API Service
 * Handles all API calls to the GBML Blockchain Orchestrator
 */

import axios from 'axios';
import { API_BASE_URL } from '../config';

const ORCHESTRATOR_BASE = `${API_BASE_URL}/blockchain-modules`;
const ENABLE_BASE = `${API_BASE_URL}/enable-blockchain`;

/**
 * Enable blockchain for a module
 * @param {Object} data - { moduleId, moduleType, constructorParams? }
 * @returns {Promise<Object>} Enablement result
 */
export const enableBlockchain = async (data) => {
  const response = await axios.post(ENABLE_BASE, data);
  return response.data;
};

/**
 * Get module status
 * @param {string} moduleId - Module ID
 * @returns {Promise<Object>} Module status
 */
export const getModuleStatus = async (moduleId) => {
  const response = await axios.get(`${ORCHESTRATOR_BASE}/${moduleId}`);
  return response.data;
};

/**
 * List all enabled modules
 * @param {Object} filters - { moduleType?, status?, enabled? }
 * @returns {Promise<Object>} { modules: [], count: number }
 */
export const listModules = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.moduleType) params.append('moduleType', filters.moduleType);
  if (filters.status) params.append('status', filters.status);
  if (filters.enabled !== undefined) params.append('enabled', filters.enabled);
  
  const response = await axios.get(`${ORCHESTRATOR_BASE}?${params.toString()}`);
  return response.data;
};

/**
 * Get enablement statistics
 * @returns {Promise<Object>} Statistics
 */
export const getStats = async () => {
  const response = await axios.get(`${ORCHESTRATOR_BASE}/stats`);
  return response.data;
};

/**
 * Update module services
 * @param {string} moduleId - Module ID
 * @param {Object} services - { walletEnabled?, settlementEnabled?, conversionEnabled? }
 * @returns {Promise<Object>} Updated module
 */
export const updateServices = async (moduleId, services) => {
  const response = await axios.patch(`${ORCHESTRATOR_BASE}/${moduleId}/services`, services);
  return response.data;
};

/**
 * Disable blockchain for a module
 * @param {string} moduleId - Module ID
 * @returns {Promise<Object>} Result
 */
export const disableBlockchain = async (moduleId) => {
  const response = await axios.post(`${ORCHESTRATOR_BASE}/${moduleId}/disable`);
  return response.data;
};

/**
 * Module type options for the UI
 */
export const MODULE_TYPES = [
  { value: 'FUND', label: 'Fund Management', description: 'Fund management with token support' },
  { value: 'TREASURY', label: 'Treasury', description: 'Treasury operations and management' },
  { value: 'GRANT', label: 'Grant Distribution', description: 'Grant distribution system' },
  { value: 'REGISTRY', label: 'Registry', description: 'Registry management with tokens' },
  { value: 'PAYMENT', label: 'Payment Processing', description: 'Payment processing system' },
  { value: 'TOKEN', label: 'Generic Token', description: 'Generic fungible token' },
  { value: 'NFT', label: 'NFT Collection', description: 'Non-fungible token collection' },
  { value: 'ROUTER', label: 'Settlement Router', description: 'Settlement routing system' }
];

/**
 * Get module type info
 * @param {string} type - Module type
 * @returns {Object} Type info
 */
export const getModuleTypeInfo = (type) => {
  return MODULE_TYPES.find(t => t.value === type) || { value: type, label: type, description: '' };
};
