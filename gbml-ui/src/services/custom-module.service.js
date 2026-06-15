/**
 * Custom Module Registry API Service
 * Handles all API calls to the Custom Module Registry endpoints
 */

import axios from 'axios';
import { API_BASE_URL } from '../config';

const CUSTOM_MODULES_BASE = `${API_BASE_URL}/custom-modules`;

/**
 * Register a new custom module definition
 * @param {Object} moduleData - Custom module configuration
 * @returns {Promise<Object>} Registered module
 */
export const registerCustomModule = async (moduleData) => {
  const response = await axios.post(CUSTOM_MODULES_BASE, moduleData);
  return response.data;
};

/**
 * Get a specific custom module by ID
 * @param {string} moduleId - Module ID
 * @returns {Promise<Object>} Module definition
 */
export const getCustomModule = async (moduleId) => {
  const response = await axios.get(`${CUSTOM_MODULES_BASE}/${moduleId}`);
  return response.data;
};

/**
 * List all custom modules
 * @param {Object} filters - { moduleType?, createdBy? }
 * @returns {Promise<Object>} { modules: [], count: number }
 */
export const listCustomModules = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.moduleType) params.append('moduleType', filters.moduleType);
  if (filters.createdBy) params.append('createdBy', filters.createdBy);
  
  const response = await axios.get(`${CUSTOM_MODULES_BASE}?${params.toString()}`);
  return response.data;
};

/**
 * Update a custom module definition
 * @param {string} moduleId - Module ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated module
 */
export const updateCustomModule = async (moduleId, updates) => {
  const response = await axios.put(`${CUSTOM_MODULES_BASE}/${moduleId}`, updates);
  return response.data;
};

/**
 * Add contracts to an existing custom module
 * @param {string} moduleId - Module ID
 * @param {Array} contracts - Array of contract definitions to add
 * @returns {Promise<Object>} Updated module
 */
export const addContractsToCustomModule = async (moduleId, contracts) => {
  const response = await axios.post(`${CUSTOM_MODULES_BASE}/${moduleId}/contracts`, { contracts });
  return response.data;
};

/**
 * Deploy additional contracts to an already-enabled module
 * @param {string} moduleId - Module ID
 * @param {Array} contractDefinitions - Array of contract definitions to deploy
 * @returns {Promise<Object>} Deployment result
 */
export const deployAdditionalContracts = async (moduleId, contractDefinitions) => {
  const response = await axios.post(`${API_BASE_URL}/blockchain-modules/${moduleId}/contracts`, { contractDefinitions });
  return response.data;
};

/**
 * Disable a custom module
 * @param {string} moduleId - Module ID
 * @returns {Promise<Object>} Result
 */
export const disableCustomModule = async (moduleId) => {
  const response = await axios.delete(`${CUSTOM_MODULES_BASE}/${moduleId}`);
  return response.data;
};

/**
 * Enable a custom module (deploy it)
 * This calls the blockchain enablement endpoint with the custom module type
 * @param {Object} data - { moduleId, serviceId, constructorParams?, contractDefinitions? }
 * @returns {Promise<Object>} Enablement result
 */
export const enableCustomModule = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/enable-blockchain`, data);
  return response.data;
};

/**
 * Get all active modules (both predefined and custom)
 * Combines data from both endpoints
 * @returns {Promise<Object>} { modules: [], count: number }
 */
export const getAllActiveModules = async () => {
  const [customModules, blockchainModules] = await Promise.all([
    listCustomModules(),
    axios.get(`${API_BASE_URL}/blockchain-modules`)
  ]);

  // Merge and format modules
  const allModules = [
    ...(customModules.modules || []).map(m => ({
      ...m,
      isCustom: true,
      source: 'custom'
    })),
    ...(blockchainModules.data.modules || []).map(m => ({
      ...m,
      isCustom: m.moduleType?.startsWith('CUSTOM_'),
      source: 'blockchain'
    }))
  ];

  return {
    modules: allModules,
    count: allModules.length
  };
};

/**
 * Get module navigation items
 * Returns formatted navigation items for the sidebar
 * @returns {Promise<Array>} Array of navigation items
 */
export const getModuleNavigationItems = async () => {
  const { modules } = await getAllActiveModules();
  
  return modules
    .filter(m => m.enabled)
    .map(m => ({
      moduleId: m.moduleId,
      displayName: m.moduleName || m.moduleId,
      icon: m.uiProperties?.icon || getIconForModuleType(m.moduleType),
      path: `/modules/${m.moduleId}`,
      enabled: m.enabled,
      moduleType: m.moduleType,
      isCustom: m.isCustom
    }));
};

/**
 * Get dynamic endpoint bindings for a deployed module
 * @param {string} moduleId - Module ID
 * @returns {Promise<Object>} Bindings with endpoints, capabilities, switchable flags
 */
export const getModuleBindings = async (moduleId) => {
  const response = await axios.get(`${API_BASE_URL}/blockchain-modules/${moduleId}/bindings`);
  return response.data;
};

/**
 * Toggle a switchable feature for a module
 * @param {string} moduleId - Module ID
 * @param {string} feature - Feature name (analytics, transactions, compliance, governance)
 * @param {boolean} enabled - Whether to enable the feature
 */
export const toggleModuleFeature = async (moduleId, feature, enabled) => {
  const response = await axios.patch(
    `${API_BASE_URL}/blockchain-modules/${moduleId}/switchable/${feature}`,
    { enabled }
  );
  return response.data;
};

/**
 * Get icon for module type
 * @param {string} moduleType - Module type
 * @returns {string} Icon emoji
 */
const getIconForModuleType = (moduleType) => {
  const iconMap = {
    'FUND': '💰',
    'TREASURY': '🏦',
    'GRANT': '🎁',
    'REGISTRY': '📋',
    'PAYMENT': '💳',
    'TOKEN': '🪙',
    'NFT': '🖼️',
    'ROUTER': '🔀'
  };
  
  if (moduleType?.startsWith('CUSTOM_')) {
    return '🚀';
  }
  
  return iconMap[moduleType] || '📦';
};
