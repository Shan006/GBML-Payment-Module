/**
 * Entity class representing a Wallet Transaction record
 */
export class Transaction {
  constructor({ id, wallet_address, tx_hash, token_address, amount, status, created_at }) {
    this.id = id;
    this.walletAddress = wallet_address;
    this.txHash = tx_hash;
    this.tokenAddress = token_address;
    this.amount = typeof amount === 'string' ? parseFloat(amount) : amount;
    this.status = status;
    this.createdAt = created_at;
  }

  /**
   * Instantiates a Transaction entity from database row data
   * @param {Object} dbRow - Database row object
   * @returns {Transaction|null}
   */
  static fromDatabase(dbRow) {
    if (!dbRow) return null;
    return new Transaction(dbRow);
  }

  /**
   * Converts the entity instance into a standard response object
   * @returns {Object}
   */
  toResponse() {
    return {
      id: this.id,
      walletAddress: this.walletAddress,
      txHash: this.txHash,
      tokenAddress: this.tokenAddress,
      amount: this.amount,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}
