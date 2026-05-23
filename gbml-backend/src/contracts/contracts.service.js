import { v4 as uuid } from 'uuid';
import { ContractsRepository } from './contracts.repository.js';

const contractsRepository = new ContractsRepository();

/**
 * Service class handling business logic for the Smart Contract Registry
 */
export class ContractsService {
  /**
   * Register a new deployed contract in the registry
   * @param {Object} dto - Validated CreateContractDto data
   * @returns {Promise<Object>} Created contract response
   */
  async createContract(dto) {
    const contractData = {
      id: uuid(),
      serviceId: dto.serviceId.trim(),
      contractName: dto.contractName.trim(),
      contractType: dto.contractType.toUpperCase(),
      contractAddress: dto.contractAddress.toLowerCase(),
      abi: dto.abi
    };

    const contract = await contractsRepository.save(contractData);
    return contract.toResponse();
  }

  /**
   * Retrieve a contract by its blockchain address
   * @param {string} address - Contract blockchain address
   * @returns {Promise<Object>} Contract response with name and address
   */
  async getContractByAddress(address) {
    const contract = await contractsRepository.findByAddress(address);
    if (!contract) return null;

    return {
      contractName: contract.contractName,
      contractAddress: contract.contractAddress
    };
  }

  /**
   * Retrieve the latest contract registered for a given service ID
   * @param {string} serviceId - Service identifier
   * @returns {Promise<Object>} Contract response with serviceId and address
   */
  async getContractByServiceId(serviceId) {
    const contract = await contractsRepository.findByServiceId(serviceId);
    if (!contract) return null;

    return {
      serviceId: contract.serviceId,
      contractAddress: contract.contractAddress
    };
  }

  /**
   * List all registered contracts
   * @returns {Promise<Object[]>} Array of all contract response objects
   */
  async listContracts() {
    const contracts = await contractsRepository.listAll();
    return contracts.map(c => c.toResponse());
  }
}
