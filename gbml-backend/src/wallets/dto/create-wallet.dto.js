/**
 * DTO class for validating wallet creation request payload
 */
export class CreateWalletDto {
  constructor({ userId }) {
    this.userId = userId;
  }

  /**
   * Validate the input object against the DTO constraints
   * @param {Object} data - Input payload
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.userId || typeof data.userId !== 'string' || data.userId.trim() === '') {
      errors.push('userId is required and must be a non-empty string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
