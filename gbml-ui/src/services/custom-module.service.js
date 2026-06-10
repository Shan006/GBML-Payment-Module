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
