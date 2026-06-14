/**
 * DTO class for validating contract creation request payload
 */
export class CreateContractDto {
  constructor({ serviceId, contractName, contractType, contractAddress, abi }) {
    this.serviceId = serviceId;
    this.contractName = contractName;
    this.contractType = contractType;
    this.contractAddress = contractAddress;
    this.abi = abi;
  }

  /**
   * Validate the input object against the DTO constraints
   * @param {Object} data - Input payload
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.serviceId || typeof data.serviceId !== 'string' || data.serviceId.trim() === '') {
      errors.push('serviceId is required and must be a non-empty string');
    }

    if (!data.contractName || typeof data.contractName !== 'string' || data.contractName.trim() === '') {
      errors.push('contractName is required and must be a non-empty string');
    }

    const validTypes = ['TOKEN', 'NFT', 'BUNDLE', 'COMPOSABLE', 'TREASURY', 'ROUTER', 'GOVERNANCE', 'FUND', 'GRANT', 'REGISTRY', 'PAYMENT', 'CUSTOM', 'JVD_ROUTER'];
    if (!data.contractType || !validTypes.includes(data.contractType.toUpperCase())) {
      errors.push(`contractType is required and must be one of: ${validTypes.join(', ')}`);
    }


    if (!data.contractAddress || typeof data.contractAddress !== 'string') {
      errors.push('contractAddress is required and must be a string');
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.contractAddress)) {
      errors.push('contractAddress must be a valid Ethereum address (0x followed by 40 hex characters)');
    }

    if (data.abi === undefined || data.abi === null) {
      errors.push('abi is required');
    } else if (typeof data.abi !== 'object') {
      errors.push('abi must be a valid JSON object or array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
