/**
 * Dynamic Modules Hook
 * Manages state for dynamic module configuration and navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getAllActiveModules, 
  getModuleNavigationItems,
  enableCustomModule,
  disableCustomModule 
} from '../services/custom-module.service';
import { listModules } from '../services/orchestrator.service';

/**
 * Hook for managing dynamic modules
 * @returns {Object} Module state and actions
 */
export const useDynamicModules = () => {
  const [modules, setModules] = useState([]);
  const [navigationItems, setNavigationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all active modules
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllActiveModules();
      setModules(data.modules || []);
      
      // Also fetch navigation items
      const navItems = await getModuleNavigationItems();
      setNavigationItems(navItems);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh modules
  const refreshModules = useCallback(() => {
    fetchModules();
  }, [fetchModules]);

  // Enable a module
  const enableModule = useCallback(async (moduleId, enableData) => {
    try {
      const result = await enableCustomModule(enableData);
      await fetchModules(); // Refresh after enabling
      return result;
    } catch (err) {
      console.error('Error enabling module:', err);
      throw err;
    }
  }, [fetchModules]);

  // Disable a module
  const disableModule = useCallback(async (moduleId) => {
    try {
      const result = await disableCustomModule(moduleId);
      await fetchModules(); // Refresh after disabling
      return result;
    } catch (err) {
      console.error('Error disabling module:', err);
      throw err;
    }
  }, [fetchModules]);

  // Get module by ID
  const getModuleById = useCallback((moduleId) => {
    return modules.find(m => m.moduleId === moduleId);
  }, [modules]);

  // Get enabled modules only
  const getEnabledModules = useCallback(() => {
    return modules.filter(m => m.enabled);
  }, [modules]);

  // Get custom modules only
  const getCustomModules = useCallback(() => {
    return modules.filter(m => m.isCustom);
  }, [modules]);

  // Get predefined modules only
  const getPredefinedModules = useCallback(() => {
    return modules.filter(m => !m.isCustom);
  }, [modules]);

  // Check if a module is enabled
  const isModuleEnabled = useCallback((moduleId) => {
    const module = getModuleById(moduleId);
    return module?.enabled || false;
  }, [getModuleById]);

  // Initial fetch
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    // State
    modules,
    navigationItems,
    loading,
    error,
    
    // Actions
    fetchModules,
    refreshModules,
    enableModule,
    disableModule,
    
    // Getters
    getModuleById,
    getEnabledModules,
    getCustomModules,
    getPredefinedModules,
    isModuleEnabled
  };
};

/**
 * Hook for managing a single module's state
 * @param {string} moduleId - Module ID
 * @returns {Object} Module state and actions
 */
export const useModule = (moduleId) => {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { modules } = useDynamicModules();

  useEffect(() => {
    const foundModule = modules.find(m => m.moduleId === moduleId);
    setModule(foundModule || null);
    setLoading(false);
  }, [moduleId, modules]);

  return {
    module,
    loading,
    error
  };
};

/**
 * Hook for managing module feature flags
 * @returns {Object} Feature flag state and actions
 */
export const useModuleFeatureFlags = () => {
  const [featureFlags, setFeatureFlags] = useState({});
  const [loading, setLoading] = useState(true);

  // Load feature flags from localStorage or API
  useEffect(() => {
    const loadFeatureFlags = () => {
      try {
        const saved = localStorage.getItem('moduleFeatureFlags');
        if (saved) {
          setFeatureFlags(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading feature flags:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeatureFlags();
  }, []);

  // Toggle feature flag for a module
  const toggleFeatureFlag = useCallback((moduleId, flagName) => {
    setFeatureFlags(prev => {
      const updated = {
        ...prev,
        [moduleId]: {
          ...(prev[moduleId] || {}),
          [flagName]: !prev[moduleId]?.[flagName]
        }
      };
      
      // Save to localStorage
      localStorage.setItem('moduleFeatureFlags', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Check if a feature flag is enabled for a module
  const isFeatureEnabled = useCallback((moduleId, flagName) => {
    return featureFlags[moduleId]?.[flagName] || false;
  }, [featureFlags]);

  // Enable all features for a module
  const enableAllFeatures = useCallback((moduleId) => {
    setFeatureFlags(prev => {
      const updated = {
        ...prev,
        [moduleId]: {
          analytics: true,
          transactions: true,
          compliance: true,
          governance: true
        }
      };
      
      localStorage.setItem('moduleFeatureFlags', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Disable all features for a module
  const disableAllFeatures = useCallback((moduleId) => {
    setFeatureFlags(prev => {
      const updated = {
        ...prev,
        [moduleId]: {
          analytics: false,
          transactions: false,
          compliance: false,
          governance: false
        }
      };
      
      localStorage.setItem('moduleFeatureFlags', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  return {
    featureFlags,
    loading,
    toggleFeatureFlag,
    isFeatureEnabled,
    enableAllFeatures,
    disableAllFeatures
  };
};
