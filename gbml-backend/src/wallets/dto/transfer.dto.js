/**
 * DTO class for validating wallet transfer requests
 */
export class TransferDto {
  constructor({ from, to, tokenAddress, amount }) {
    this.from = from;
    this.to = to;
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

    if (!data.from || typeof data.from !== 'string') {
      errors.push('from address is required and must be a string');
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.from)) {
      errors.push('from address must be a valid Ethereum address (0x followed by 40 hex characters)');
    }

    if (!data.to || typeof data.to !== 'string') {
      errors.push('to address is required and must be a string');
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.to)) {
      errors.push('to address must be a valid Ethereum address (0x followed by 40 hex characters)');
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
