/**
 * DTO class for validating settlement requests
 */
export class CreateSettlementDto {
  constructor({ recipient, tokenAddress, amount }) {
    this.recipient = recipient;
    this.tokenAddress = tokenAddress;
    this.amount = amount;
  }

  /**
   * Validate the input object against the DTO constraints
   * @param {Object} data - Input payload
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.recipient || typeof data.recipient !== 'string') {
      errors.push('recipient is required and must be a string');
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.recipient)) {
      errors.push('recipient must be a valid Ethereum address (0x followed by 40 hex characters)');
    }

    if (!data.tokenAddress || typeof data.tokenAddress !== 'string') {
      errors.push('tokenAddress is required and must be a string');
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.tokenAddress)) {
      errors.push('tokenAddress must be a valid Ethereum address (0x followed by 40 hex characters)');
    }

    if (data.amount === undefined || data.amount === null) {
      errors.push('amount is required');
    } else if (typeof data.amount !== 'number' && typeof data.amount !== 'string') {
      errors.push('amount must be a number or a numeric string');
    } else {
      const num = Number(data.amount);
      if (isNaN(num) || num <= 0) {
        errors.push('amount must be a positive number greater than 0');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
