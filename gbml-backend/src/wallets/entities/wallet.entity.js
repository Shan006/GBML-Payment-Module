/**
 * Entity class representing a Wallet record
 */
export class Wallet {
  constructor({ id, user_id, wallet_address, private_key, created_at }) {
    this.id = id;
    this.userId = user_id;
    this.walletAddress = wallet_address;
    this.privateKey = private_key;
    this.createdAt = created_at;
  }

  /**
   * Instantiates a Wallet entity from database row data
   * @param {Object} dbRow - Database row object
   * @returns {Wallet|null}
   */
  static fromDatabase(dbRow) {
    if (!dbRow) return null;
    return new Wallet(dbRow);
  }

  /**
   * Converts the entity instance into a standard response object without the private key
   * @returns {Object}
   */
  toResponse() {
    return {
      walletAddress: this.walletAddress
    };
  }

  /**
   * Converts the entity instance into a creation response including the private key
   * @returns {Object}
   */
  toCreationResponse() {
    return {
      walletAddress: this.walletAddress,
      privateKey: this.privateKey
    };
  }
}
