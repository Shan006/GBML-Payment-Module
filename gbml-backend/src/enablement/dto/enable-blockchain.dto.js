/**
 * DTO class for validating blockchain enablement requests
 */
export class EnableBlockchainDto {
  constructor({ moduleId, serviceId, moduleType, constructorParams, contractDefinitions, services, compliance, switchable }) {
    this.moduleId = moduleId || serviceId;
    this.serviceId = serviceId || moduleId;
    this.moduleType = moduleType;
    this.constructorParams = constructorParams;
    this.contractDefinitions = contractDefinitions;
    this.services = services;
    this.compliance = compliance;
    this.switchable = switchable;
  }

  /**
   * Validate the input object against the DTO constraints
   * @param {Object} data - Input payload
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    // Accept either moduleId or serviceId
    if ((!data.moduleId && !data.serviceId) || 
        (data.moduleId && typeof data.moduleId !== 'string') ||
        (data.serviceId && typeof data.serviceId !== 'string') ||
        ((data.moduleId || data.serviceId || '').trim() === '')) {
      errors.push('moduleId or serviceId is required and must be a non-empty string');
    }

    // Support both predefined and custom module types
    const predefinedTypes = ['TOKEN', 'NFT', 'BUNDLE', 'COMPOSABLE', 'TREASURY', 'ROUTER', 'FUND', 'GRANT', 'REGISTRY', 'PAYMENT'];
    if (!data.moduleType || typeof data.moduleType !== 'string' || data.moduleType.trim() === '') {
      errors.push('moduleType is required and must be a non-empty string');
    } else if (!predefinedTypes.includes(data.moduleType.toUpperCase()) && !data.moduleType.startsWith('CUSTOM_')) {
      errors.push(`moduleType must be one of: ${predefinedTypes.join(', ')} or a custom type starting with 'CUSTOM_'`);
    }

    // constructorParams is optional - will be auto-generated if not provided
    if (data.constructorParams !== undefined && data.constructorParams !== null && !Array.isArray(data.constructorParams)) {
      errors.push('constructorParams must be a valid array if provided');
    }

    // For custom modules, contractDefinitions can be omitted if module is pre-registered in /gbml/custom-modules
    // (orchestrator resolves from registry by moduleId)

    // Validate contractDefinitions if provided
    if (data.contractDefinitions) {
      if (!Array.isArray(data.contractDefinitions)) {
        errors.push('contractDefinitions must be an array');
      } else {
        data.contractDefinitions.forEach((contract, index) => {
          if (!contract.contractName || typeof contract.contractName !== 'string') {
            errors.push(`contractDefinitions[${index}].contractName is required`);
          }
          if (!contract.contractType || typeof contract.contractType !== 'string') {
            errors.push(`contractDefinitions[${index}].contractType is required`);
          }
          
          // For standard contract types (TOKEN, NFT, etc.), ABI and bytecode can be empty
          // as they will be loaded from standard templates
          // For CUSTOM contract type, ABI and bytecode are required
          const standardContractTypes = ['TOKEN', 'NFT', 'TREASURY', 'ROUTER', 'FUND', 'GRANT', 'REGISTRY', 'PAYMENT', 'BUNDLE', 'COMPOSABLE', 'GOVERNANCE'];
          const isStandardType = standardContractTypes.includes(contract.contractType?.toUpperCase());
          
          if (!isStandardType) {
            // Custom contracts require ABI and bytecode
            if (!contract.abi || !Array.isArray(contract.abi) || contract.abi.length === 0) {
              errors.push(`contractDefinitions[${index}].abi must be a valid non-empty ABI array for custom contracts`);
            }
            if (!contract.bytecode || typeof contract.bytecode !== 'string' || contract.bytecode.trim() === '') {
              errors.push(`contractDefinitions[${index}].bytecode is required for custom contracts`);
            }
          } else {
            // Standard contracts: ABI and bytecode are optional (will be loaded from templates)
            // But if provided, validate the format
            if (contract.abi !== undefined && contract.abi !== null && !Array.isArray(contract.abi)) {
              errors.push(`contractDefinitions[${index}].abi must be a valid array if provided`);
            }
            if (contract.bytecode !== undefined && contract.bytecode !== null && typeof contract.bytecode !== 'string') {
              errors.push(`contractDefinitions[${index}].bytecode must be a string if provided`);
            }
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
