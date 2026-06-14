/**
 * DTO class for validating contract deployment request payload
 */
export class DeployContractDto {
  constructor({ contractType, constructorParams }) {
    this.contractType = contractType;
    this.constructorParams = constructorParams;
  }

  /**
   * Validate the input object against the DTO constraints
   * @param {Object} data - Input payload
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    const validTypes = ['TOKEN', 'NFT', 'BUNDLE', 'COMPOSABLE', 'TREASURY', 'ROUTER', 'GOVERNANCE', 'JVD_ROUTER'];
    if (!data.contractType || !validTypes.includes(data.contractType.toUpperCase())) {
      errors.push(`contractType is required and must be one of: ${validTypes.join(', ')}`);
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
