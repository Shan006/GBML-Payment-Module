/**
 * Entity class representing a Blockchain Module mapping record
 */
export class BlockchainModule {
  constructor({ id, service_id, module_type, contract_address, blockchain_enabled, created_at }) {
    this.id = id;
    this.serviceId = service_id;
    this.moduleType = module_type;
    this.contractAddress = contract_address;
    this.blockchainEnabled = blockchain_enabled;
    this.createdAt = created_at;
  }

  /**
   * Instantiates a BlockchainModule entity from database row data
   * @param {Object} dbRow - Database row object
   * @returns {BlockchainModule|null}
   */
  static fromDatabase(dbRow) {
    if (!dbRow) return null;
    return new BlockchainModule(dbRow);
  }

  /**
   * Converts the entity instance into a standard response object
   * @returns {Object}
   */
  toResponse() {
    return {
      id: this.id,
      serviceId: this.serviceId,
      moduleType: this.moduleType,
      contractAddress: this.contractAddress,
      blockchainEnabled: this.blockchainEnabled,
      createdAt: this.createdAt
    };
  }
}
