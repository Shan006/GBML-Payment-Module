/**
 * Entity class representing a Smart Contract record
 */
export class Contract {
  constructor({ id, service_id, contract_name, contract_type, contract_address, abi, created_at }) {
    this.id = id;
    this.serviceId = service_id;
    this.contractName = contract_name;
    this.contractType = contract_type;
    this.contractAddress = contract_address;
    this.abi = abi;
    this.createdAt = created_at;
  }

  /**
   * Instantiates a Contract entity from database row data
   * @param {Object} dbRow - Database row object
   * @returns {Contract|null}
   */
  static fromDatabase(dbRow) {
    if (!dbRow) return null;
    return new Contract(dbRow);
  }

  /**
   * Converts the entity instance into a standard response object
   * @returns {Object}
   */
  toResponse() {
    return {
      id: this.id,
      serviceId: this.serviceId,
      contractName: this.contractName,
      contractType: this.contractType,
      contractAddress: this.contractAddress,
      abi: this.abi,
      createdAt: this.createdAt
    };
  }
}
