import { v4 as uuid } from 'uuid';
import { DeploymentService } from '../deployment/deployment.service.js';
import { EnablementRepository } from './enablement.repository.js';

export class EnablementService {
  constructor() {
    this.deploymentService = new DeploymentService();
    this.enablementRepository = new EnablementRepository();
  }

  /**
   * Convert a normal application module into a blockchain-enabled module
   * @param {Object} dto - Validated EnableBlockchainDto data
   * @returns {Promise<Object>} Enablement response matching specification
   */
  async enableBlockchain(dto) {
    const { serviceId, moduleType, constructorParams } = dto;

    console.log(`[EnablementService] Enabling blockchain for service: ${serviceId}, module: ${moduleType}`);

    // 1. Trigger deployment using the Deployment Engine
    // Note: DeploymentService internally registers the contract in the contracts registry database too
    const deployment = await this.deploymentService.deploy({
      contractType: moduleType.toUpperCase(),
      constructorParams,
      serviceId
    });

    const contractAddress = deployment.address;
    console.log(`[EnablementService] Deployed contract address: ${contractAddress}`);

    // 2. Persist the enablement mapping in the database
    const mappingData = {
      id: uuid(),
      serviceId: serviceId.trim(),
      moduleType: moduleType.toUpperCase(),
      contractAddress: contractAddress,
      blockchainEnabled: true
    };

    const savedRecord = await this.enablementRepository.save(mappingData);
    console.log(`[EnablementService] Blockchain enablement saved with ID: ${savedRecord.id}`);

    // 3. Return the specified response structure
    return {
      serviceId: savedRecord.serviceId,
      blockchainEnabled: savedRecord.blockchainEnabled,
      contractAddress: savedRecord.contractAddress
    };
  }
}
