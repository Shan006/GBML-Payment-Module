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

