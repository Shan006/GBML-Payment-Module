/**
 * Blockchain Module Entity
 * Represents a module that has been enabled for blockchain functionality
 */
export class BlockchainModule {
  constructor(data) {
    this.id = data.id
    this.moduleId = data.module_id || data.moduleId
    this.serviceId = data.service_id || data.serviceId
    this.moduleType = data.module_type || data.moduleType
    this.contractAddress = data.contract_address || data.contractAddress
    this.blockchainEnabled = data.blockchain_enabled !== undefined ? data.blockchain_enabled : true
    this.status = data.status || 'ACTIVE'
    this.walletEnabled = data.wallet_enabled || false
    this.settlementEnabled = data.settlement_enabled || false
    this.conversionEnabled = data.conversion_enabled || false
    this.deploymentTxHash = data.deployment_tx_hash || data.deploymentTxHash
    this.createdAt = data.created_at || data.createdAt
    this.updatedAt = data.updated_at || data.updatedAt
  }

  toJSON() {
    return {
      id: this.id,
      moduleId: this.moduleId,
      serviceId: this.serviceId,
      moduleType: this.moduleType,
      contractAddress: this.contractAddress,
      blockchainEnabled: this.blockchainEnabled,
      status: this.status,
      walletEnabled: this.walletEnabled,
      settlementEnabled: this.settlementEnabled,
      conversionEnabled: this.conversionEnabled,
      deploymentTxHash: this.deploymentTxHash,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  toResponse() {
    return {
      moduleId: this.moduleId,
      moduleType: this.moduleType,
      contractAddress: this.contractAddress,
      enabled: this.blockchainEnabled,
      status: this.status,
      services: {
        wallet: this.walletEnabled,
        settlement: this.settlementEnabled,
        conversion: this.conversionEnabled
      },
      kycEnabled: this.walletEnabled,
      deploymentTxHash: this.deploymentTxHash,
      createdAt: this.createdAt
    }
  }
}
