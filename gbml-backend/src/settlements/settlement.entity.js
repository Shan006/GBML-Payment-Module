/**
 * Entity class representing a Settlement record
 */
export class Settlement {
  constructor({ id, recipient, token_address, amount, tx_hash, status, created_at }) {
    this.id = id;
    this.recipient = recipient;
    this.tokenAddress = token_address;
    // Keep amount as number/string representation depending on database content
    this.amount = typeof amount === 'string' ? parseFloat(amount) : amount;
    this.txHash = tx_hash;
    this.status = status;
    this.createdAt = created_at;
  }

  /**
   * Instantiates a Settlement entity from database row data
   * @param {Object} dbRow - Database row object
   * @returns {Settlement|null}
   */
  static fromDatabase(dbRow) {
    if (!dbRow) return null;
    return new Settlement(dbRow);
  }

  /**
   * Converts the entity instance into a standard response object
   * @returns {Object}
   */
  toResponse() {
    return {
      id: this.id,
      recipient: this.recipient,
      tokenAddress: this.tokenAddress,
      amount: this.amount,
      txHash: this.txHash,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}
