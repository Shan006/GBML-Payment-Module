/**
 * DTO class for validating blockchain enablement requests
 */
export class EnableBlockchainDto {
  constructor({ moduleId, serviceId, moduleType, constructorParams }) {
    this.moduleId = moduleId || serviceId;
    this.serviceId = serviceId || moduleId;
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

    // Accept either moduleId or serviceId
    if ((!data.moduleId && !data.serviceId) || 
        (data.moduleId && typeof data.moduleId !== 'string') ||
        (data.serviceId && typeof data.serviceId !== 'string') ||
        ((data.moduleId || data.serviceId || '').trim() === '')) {
      errors.push('moduleId or serviceId is required and must be a non-empty string');
    }

    const validTypes = ['TOKEN', 'NFT', 'TREASURY', 'ROUTER', 'FUND', 'GRANT', 'REGISTRY', 'PAYMENT'];
    if (!data.moduleType || !validTypes.includes(data.moduleType.toUpperCase())) {
      errors.push(`moduleType is required and must be one of: ${validTypes.join(', ')}`);
    }

    // constructorParams is optional - will be auto-generated if not provided
    if (data.constructorParams !== undefined && data.constructorParams !== null && !Array.isArray(data.constructorParams)) {
      errors.push('constructorParams must be a valid array if provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
