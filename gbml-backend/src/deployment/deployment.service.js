import { ContractFactoryService } from './contract-factory.service.js';
import { ContractsService } from '../contracts/contracts.service.js';
import { CreateContractDto } from '../contracts/dto/create-contract.dto.js';

const CONTRACTS = {
  TOKEN: 'JRC20',
  NFT: 'JRC721',
  TREASURY: 'Treasury',
  ROUTER: 'Router'
};

export class DeploymentService {
  constructor() {
    this.factoryService = new ContractFactoryService();
    this.contractsService = new ContractsService();
  }

  /**
   * Deploy a contract and save it in the registry
   * @param {Object} deployData - Validated deployment data
   * @returns {Promise<Object>} Deployment result
   */
  async deploy(deployData) {
    const { contractType, constructorParams, serviceId, contractName } = deployData;

    // 1. Resolve contract template name
    const templateName = CONTRACTS[contractType.toUpperCase()];
    if (!templateName) {
      throw new Error(`Unsupported contract type: ${contractType}`);
    }

    // 2. Load compiled Hardhat artifact
    const artifact = await this.factoryService.loadArtifact(contractType);

    // 3. Create Contract Factory and Deploy
    const factory = this.factoryService.getContractFactory(artifact);
    
    console.log(`[DeploymentService] Deploying ${templateName} with params:`, constructorParams);
    
    // Ethers.js deploy expects arguments passed individually, which we do via spread operator
    const contract = await factory.deploy(...constructorParams);

    // 4. Wait for deployment confirmation (Ethers v6 syntax)
    const deployTx = contract.deploymentTransaction();
    if (!deployTx) {
      throw new Error('Deployment transaction not found');
    }

    const txHash = deployTx.hash;
    console.log(`[DeploymentService] Broadcasted transaction: ${txHash}. Waiting for deployment...`);
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`[DeploymentService] ${templateName} deployed successfully at address: ${contractAddress}`);

    // 5. Determine names for registry registration
    const finalServiceId = serviceId || `deployment_${contractType.toLowerCase()}`;
    
    let finalContractName = contractName;
    if (!finalContractName) {
      if (contractType.toUpperCase() === 'TOKEN' && constructorParams.length > 0 && typeof constructorParams[0] === 'string') {
        finalContractName = constructorParams[0];
      } else {
        finalContractName = templateName;
      }
    }

    // 6. Register Contract in Contract Registry
    console.log(`[DeploymentService] Registering contract in registry...`);
    try {
      const registerDto = new CreateContractDto({
        serviceId: finalServiceId,
        contractName: finalContractName,
        contractType: contractType.toUpperCase(),
        contractAddress: contractAddress,
        abi: artifact.abi
      });

      // Run validation before registering
      const validation = CreateContractDto.validate(registerDto);
      if (!validation.isValid) {
        throw new Error(`Registry validation failed: ${validation.errors.join(', ')}`);
      }

      await this.contractsService.createContract(registerDto);
      console.log(`[DeploymentService] Contract successfully registered.`);
    } catch (regErr) {
      // Log registry failure but do not fail the deployment response
      console.error(`[DeploymentService] Warning: Failed to register contract in registry:`, regErr);
    }

    // 7. Return specification-matching result
    return {
      address: contractAddress,
      contractType: contractType.toUpperCase(),
      txHash: txHash
    };
  }
}
