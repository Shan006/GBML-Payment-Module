/**
 * DTO class for validating blockchain enablement requests
 */
export class EnableBlockchainDto {
  constructor({ serviceId, moduleType, constructorParams }) {
    this.serviceId = serviceId;
    this.moduleType = moduleType;
    this.constructorParams = constructorParams;
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

    const validTypes = ['TOKEN', 'NFT', 'TREASURY', 'ROUTER'];
    if (!data.moduleType || !validTypes.includes(data.moduleType.toUpperCase())) {
      errors.push(`moduleType is required and must be one of: ${validTypes.join(', ')}`);
    }

    if (data.constructorParams === undefined || data.constructorParams === null) {
      errors.push('constructorParams is required');
    } else if (!Array.isArray(data.constructorParams)) {
      errors.push('constructorParams must be a valid array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
