/**
 * Database abstraction layer
 * In production, this would connect to a real database (PostgreSQL, MongoDB, etc.)
 * For MVP, using file-based JSON storage for persistence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory for storing JSON files
const DATA_DIR = path.join(__dirname, '../../data');
const MODULES_FILE = path.join(DATA_DIR, 'modules.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// In-memory cache (loaded from files)
let modules = new Map();
let transactions = new Map();

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load data from JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Map} Map of data
 */
function loadFromFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return new Map(Object.entries(data));
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
  }
  return new Map();
}

/**
 * Save data to JSON file
 * @param {string} filePath - Path to JSON file
 * @param {Map} dataMap - Map of data to save
 */
function saveToFile(filePath, dataMap) {
  try {
    const data = Object.fromEntries(dataMap);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
}

/**
 * Initialize database - load existing data from files
 */
function initializeDatabase() {
  ensureDataDir();
  modules = loadFromFile(MODULES_FILE);
  transactions = loadFromFile(TRANSACTIONS_FILE);
  console.log(`Database initialized: ${modules.size} modules, ${transactions.size} transactions loaded`);
}

// Initialize on module load
initializeDatabase();

/**
 * Store module configuration
 * @param {string} moduleId - Module ID
 * @param {Object} moduleData - Module data
 */
export function storeModule(moduleId, moduleData) {
  modules.set(moduleId, {
    ...moduleData,
    createdAt: new Date().toISOString(),
  });
  saveToFile(MODULES_FILE, modules);
}

/**
 * Get module by ID
 * @param {string} moduleId - Module ID
 * @returns {Object|null} Module data or null
 */
export function getModule(moduleId) {
  return modules.get(moduleId) || null;
}

/**
 * Store transaction record
 * @param {string} txHash - Transaction hash
 * @param {Object} txData - Transaction data
 */
export function storeTransaction(txHash, txData) {
  transactions.set(txHash, {
    ...txData,
    createdAt: new Date().toISOString(),
  });
  saveToFile(TRANSACTIONS_FILE, transactions);
}

/**
 * Get transaction by hash
 * @param {string} txHash - Transaction hash
 * @returns {Object|null} Transaction data or null
 */
export function getTransaction(txHash) {
  return transactions.get(txHash) || null;
}

/**
 * Get all modules for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Array} Array of module data
 */
export function getModulesByTenant(tenantId) {
  return Array.from(modules.values()).filter(
    (module) => module.tenantId === tenantId
  );
}

/**
 * Get module by token symbol
 * @param {string} tokenSymbol - Token symbol (e.g., "JD", "AUSD")
 * @returns {Object|null} Module data or null
 */
export function getModuleByTokenSymbol(tokenSymbol) {
  const symbolUpper = tokenSymbol.toUpperCase();
  const matchingModules = Array.from(modules.values()).filter(
    (module) => module.tokenConfig?.symbol?.toUpperCase() === symbolUpper
  );

  if (matchingModules.length === 0) {
    return null;
  }

  if (matchingModules.length > 1) {
    throw new Error(`Multiple modules found with token symbol: ${tokenSymbol}. Token symbols must be unique.`);
  }

  return matchingModules[0];
}

/**
 * Get all available tokens
 * @returns {Array} Array of token information
 */
export function getAllTokens() {
  return Array.from(modules.values()).map((module) => ({
    symbol: module.tokenConfig?.symbol,
    name: module.tokenConfig?.name,
    address: module.tokenAddress,
    decimals: module.tokenConfig?.decimals,
    moduleId: module.moduleId,
  }));
}

/**
 * Update module exchange rates
 * @param {string} moduleId - Module ID
 * @param {Object} exchangeRates - Exchange rates object
 */
export function updateModuleExchangeRates(moduleId, exchangeRates) {
  const module = modules.get(moduleId);
  if (!module) {
    throw new Error(`Module not found: ${moduleId}`);
  }

  modules.set(moduleId, {
    ...module,
    exchangeRates,
    updatedAt: new Date().toISOString(),
  });
  saveToFile(MODULES_FILE, modules);
}

// Fiat transactions storage
const FIAT_TRANSACTIONS_FILE = path.join(DATA_DIR, 'fiat-transactions.json');
let fiatTransactions = new Map();

// Load fiat transactions on initialization
function initializeFiatTransactions() {
  fiatTransactions = loadFromFile(FIAT_TRANSACTIONS_FILE);
  console.log(`Fiat transactions initialized: ${fiatTransactions.size} transactions loaded`);
}

// Initialize fiat transactions
initializeFiatTransactions();

/**
 * Store fiat transaction
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {Object} txData - Transaction data
 */
export function storeFiatTransaction(paymentIntentId, txData) {
  fiatTransactions.set(paymentIntentId, {
    ...txData,
    createdAt: new Date().toISOString(),
  });
  saveToFile(FIAT_TRANSACTIONS_FILE, fiatTransactions);
}

/**
 * Get fiat transaction by payment intent ID
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Object|null} Transaction data or null
 */
export function getFiatTransaction(paymentIntentId) {
  return fiatTransactions.get(paymentIntentId) || null;
}

/**
 * Update fiat transaction
 * @param {string} paymentIntentId - Payment intent ID
 * @param {Object} updates - Updates to apply
 */
export function updateFiatTransaction(paymentIntentId, updates) {
  const existing = fiatTransactions.get(paymentIntentId);
  if (!existing) {
    throw new Error(`Fiat transaction not found: ${paymentIntentId}`);
  }

  fiatTransactions.set(paymentIntentId, {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  saveToFile(FIAT_TRANSACTIONS_FILE, fiatTransactions);
}

/**
 * Get fiat transactions by module ID
 * @param {string} moduleId - Module ID
 * @returns {Array} Array of fiat transactions
 */
export function getFiatTransactionsByModule(moduleId) {
  return Array.from(fiatTransactions.values()).filter(
    (tx) => tx.moduleId === moduleId
  );
}

