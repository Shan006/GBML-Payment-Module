/**
 * Dynamic Module Configuration Types
 * Defines the structure for custom and predefined modules in the GBML system
 */

/**
 * Contract Definition within a module
 */
export const ContractDefinition = {
  contractName: 'string',
  contractType: 'string', // TOKEN, NFT, CUSTOM, etc.
  abi: 'array',
  bytecode: 'string'
};

/**
 * Service Configuration for a module
 */
export const ServiceConfig = {
  wallet: 'boolean',
  settlement: 'boolean',
  conversion: 'boolean'
};

/**
 * Compliance Configuration for a module
 */
export const ComplianceConfig = {
  kycRequired: 'boolean',
  amlRequired: 'boolean'
};

/**
 * Switchable feature flags for custom module routes
 */
export const SwitchableConfig = {
  enabled: 'boolean',
  analytics: 'boolean',
  transactions: 'boolean',
  compliance: 'boolean',
  governance: 'boolean'
};

/**
 * UI Properties for a module (user-defined)
 */
export const UIProperties = {
  icon: 'string', // emoji or icon identifier
  primaryColor: 'string', // hex color
  displayName: 'string'
};

/**
 * Module Capability Flags
 * Determines what features are available for a module
 */
export const ModuleCapabilities = {
  hasToken: 'boolean',
  hasNFT: 'boolean',
  hasGovernance: 'boolean',
  hasAnalytics: 'boolean',
  hasCompliance: 'boolean'
};

/**
 * Full Module Configuration
 * This is the complete structure expected from the GBML backend
 */
export const ModuleConfig = {
  // Core identifiers
  moduleId: 'string',
  moduleName: 'string',
  moduleType: 'string', // FUND, TREASURY, GRANT, REGISTRY, PAYMENT, TOKEN, NFT, ROUTER, or CUSTOM_*
  
  // Metadata
  description: 'string',
  enabled: 'boolean',
  status: 'string', // ACTIVE, INACTIVE, PENDING, FAILED
  
  // Contract composition
  contracts: 'array', // Array of ContractDefinition
  
  // Service bindings
  services: ServiceConfig,
  
  // Compliance settings
  compliance: ComplianceConfig,

  // Switchable feature flags
  switchable: SwitchableConfig,
  
  // UI properties (user-defined for custom modules)
  uiProperties: UIProperties,

  // Cross-platform integrations
  platformIntegrations: 'array',
  
  // Capabilities (derived from contract composition)
  capabilities: ModuleCapabilities,
  
  // Deployment info
  deployedAt: 'string', // ISO timestamp
  contractsDeployed: 'array', // Array of deployed contract addresses
  
  // Analytics data
  analytics: {
    totalTransactions: 'number',
    totalVolume: 'string', // wei/ether
    activeUsers: 'number',
    lastActivity: 'string' // ISO timestamp
  }
};

/**
 * Module Navigation Item
 * Used for dynamic sidebar navigation
 */
export const ModuleNavItem = {
  moduleId: 'string',
  displayName: 'string',
  icon: 'string',
  path: 'string',
  enabled: 'boolean',
  moduleType: 'string'
};

/**
 * Custom Module Form Data
 * Structure for the custom module builder form
 */
export const CustomModuleFormData = {
  moduleId: 'string',
  moduleName: 'string',
  description: 'string',
  moduleType: 'string',
  
  // UI properties
  icon: 'string',
  primaryColor: 'string',
  
  // Contract composition
  selectedContracts: 'array', // Array of contract types to include
  
  // Service selections
  services: ServiceConfig,
  
  // Compliance settings
  compliance: ComplianceConfig,
  
  // Contract definitions (if custom contracts)
  customContracts: 'array' // Array of ContractDefinition
};

/**
 * Predefined Module Types
 * Standard GBML module types
 */
export const PREDEFINED_MODULE_TYPES = [
  { value: 'FUND', label: 'Fund Management', icon: '💰', description: 'Fund management with token support' },
  { value: 'TREASURY', label: 'Treasury', icon: '🏦', description: 'Treasury operations and management' },
  { value: 'GRANT', label: 'Grant Distribution', icon: '🎁', description: 'Grant distribution system' },
  { value: 'REGISTRY', label: 'Registry', icon: '📋', description: 'Registry management with tokens' },
  { value: 'PAYMENT', label: 'Payment Processing', icon: '💳', description: 'Payment processing system' },
  { value: 'TOKEN', label: 'Generic Token', icon: '🪙', description: 'Generic fungible token' },
  { value: 'NFT', label: 'NFT Collection', icon: '🖼️', description: 'Non-fungible token collection' },
  { value: 'ROUTER', label: 'Settlement Router', icon: '🔀', description: 'Settlement routing system' }
];

/**
 * Available Contract Types for Custom Modules
 */
export const AVAILABLE_CONTRACT_TYPES = [
  { value: 'TOKEN', label: 'Token (JRC-20)', icon: '🪙', description: 'Fungible token standard' },
  { value: 'NFT', label: 'NFT (JRC-721)', icon: '🖼️', description: 'Non-fungible token standard' },
  { value: 'BUNDLE', label: 'Bundle NFT (JRC-998)', icon: '📦', description: 'Composable NFT standard' },
  { value: 'GOVERNANCE', label: 'Governance/DAO', icon: '🗳️', description: 'DAO governance contract' },
  { value: 'JOB_ESCROW', label: 'Job Escrow', icon: '💰', description: 'Escrow-based job payment and dispute management' },
  { value: 'REPUTATION', label: 'Reputation Ledger', icon: '⭐', description: 'On-chain reputation and ratings tracking' },
  { value: 'CUSTOM', label: 'Custom Contract', icon: '⚙️', description: 'Custom smart contract' }
];

/**
 * Icon Options for Custom Modules
 */
export const ICON_OPTIONS = [
  '🚀', '💡', '🔮', '🌟', '⚡', '🔥', '💎', '🎯', 
  '🏆', '🌍', '🔗', '📊', '🎨', '🛡️', '⚙️', '🔬',
  '🏗️', '🌐', '📱', '💼', '🎪', '🎭', '🎬', '🎮'
];

/**
 * Color Options for Custom Modules
 */
export const COLOR_OPTIONS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
  '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140',
  '#30cfd0', '#330867', '#a8edea', '#fed6e3', '#ff9a9e'
];

/**
 * Dashboard Widget Configuration
 * Defines what widgets to show for a module based on capabilities
 */
export const DashboardWidgetConfig = {
  widgetType: 'string', // 'balance', 'transactions', 'nft', 'governance', 'compliance'
  enabled: 'boolean',
  position: 'number', // 0-based index
  size: 'string' // 'small', 'medium', 'large'
};
