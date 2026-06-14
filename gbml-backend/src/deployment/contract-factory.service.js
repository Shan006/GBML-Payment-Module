import { ethers } from 'ethers';
import { provider } from '../blockchain/provider.js';
import { config } from '../config/env.js';
import path from 'path';
import fs from 'fs';

const CONTRACTS = {
  TOKEN: 'JRC20WithJvdRouter',
  NFT: 'JRC721WithJvdRouter',
  BUNDLE: 'JRC721WithJvdRouter',
  COMPOSABLE: 'JRC998WithJvdRouter',
  TREASURY: 'Treasury',
  ROUTER: 'Router',
  GOVERNANCE: 'Governance',
  JVD_ROUTER: 'JvdEgcrRouter'
};


export class ContractFactoryService {
  constructor() {
    this.wallet = new ethers.Wallet(config.deployerPrivateKey, provider);
  }

  /**
   * Load compiled Hardhat artifact for the contract type
   * @param {string} contractType 
   * @returns {Promise<Object>} The parsed artifact JSON
   */
  async loadArtifact(contractType) {
    const contractName = CONTRACTS[contractType.toUpperCase()];
    if (!contractName) {
      throw new Error(`Unsupported contract type: ${contractType}`);
    }

    const artifactPath = path.join(
      process.cwd(),
      'artifacts',
      'contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );

    try {
      const data = await fs.promises.readFile(artifactPath, 'utf8');
      const artifact = JSON.parse(data);
      console.log(`[ContractFactoryService] Loaded artifact for ${contractType} (${contractName}):`, {
        hasAbi: !!artifact.abi,
        abiLength: artifact.abi?.length || 0,
        hasBytecode: !!artifact.bytecode,
        bytecodeLength: artifact.bytecode?.length || 0
      });
      return artifact;
    } catch (err) {
      console.error(`Failed to load artifact at path: ${artifactPath}`, err);
      throw new Error(`Compiled artifact for contract type ${contractType} (${contractName}) not found. Please ensure 'npx hardhat compile' has run successfully.`);
    }
  }

  /**
   * Load artifact from custom contract definition (for custom modules)
   * @param {Object} contractDef - Contract definition with abi and bytecode
   * @returns {Object} The artifact object
   */
  loadCustomArtifact(contractDef) {
    if (!contractDef.abi || !contractDef.bytecode) {
      throw new Error('Custom contract definition must include abi and bytecode');
    }

    return {
      abi: contractDef.abi,
      bytecode: contractDef.bytecode
    };
  }

  /**
   * Create an ethers.js ContractFactory from the artifact
   * @param {Object} artifact 
   * @returns {ethers.ContractFactory}
   */
  getContractFactory(artifact) {
    // Ensure ABI is an array and bytecode is a string
    const abi = Array.isArray(artifact.abi) ? artifact.abi : [];
    // Use deployedBytecode if bytecode is empty, as ethers.js v6 sometimes requires it
    const bytecode = (typeof artifact.bytecode === 'string' && artifact.bytecode) 
      ? artifact.bytecode 
      : (artifact.deployedBytecode || '');
    
    // Log for debugging
    console.log('[ContractFactoryService] Creating ContractFactory with ABI length:', abi.length, 'bytecode length:', bytecode.length);
    
    try {
      // Try standard ContractFactory creation
      return new ethers.ContractFactory(abi, bytecode, this.wallet);
    } catch (error) {
      console.error('[ContractFactoryService] ContractFactory creation failed:', error.message);
      console.error('[ContractFactoryService] Error stack:', error.stack);
      
      // Try with Interface constructor as alternative
      try {
        const iface = new ethers.Interface(abi);
        return new ethers.ContractFactory(iface, bytecode, this.wallet);
      } catch (ifaceError) {
        console.error('[ContractFactoryService] Interface creation also failed:', ifaceError.message);
        console.error('[ContractFactoryService] Interface error stack:', ifaceError.stack);
        
        // Last resort: try with minimal ABI (constructor only)
        try {
          const minimalAbi = abi.filter(item => item.type === 'constructor');
          console.log('[ContractFactoryService] Trying minimal ABI with', minimalAbi.length, 'entries');
          const minimalIface = new ethers.Interface(minimalAbi);
          return new ethers.ContractFactory(minimalIface, bytecode, this.wallet);
        } catch (minimalError) {
          console.error('[ContractFactoryService] Minimal ABI also failed:', minimalError.message);
          console.error('[ContractFactoryService] Minimal error stack:', minimalError.stack);
          throw new Error(`Failed to create contract factory: ${error.message}`);
        }
      }
    }
  }

  /**
   * Deploy multiple contracts for a custom module
   * @param {Array} contractDefinitions - Array of contract definitions
   * @param {Object} sharedParams - Shared parameters (walletAddress, routerAddress, etc.)
   * @returns {Promise<Array>} Array of deployed contract results
   */
  async deployCustomContracts(contractDefinitions, sharedParams = {}) {
    const deployments = [];

    for (const contractDef of contractDefinitions) {
      try {
        console.log(`[ContractFactoryService] Deploying contract: ${contractDef.contractName} (type: ${contractDef.contractType})`);
        
        // Determine if this is a standard contract type or custom
        const type = contractDef.contractType?.toUpperCase();
        const artifactBackedTypes = ['TOKEN', 'NFT', 'BUNDLE', 'COMPOSABLE', 'TREASURY', 'ROUTER', 'GOVERNANCE', 'FUND', 'GRANT', 'REGISTRY', 'PAYMENT'];
        const isStandardType = artifactBackedTypes.includes(type);
        
        let artifact;
        
        if (isStandardType) {
          // Load from standard artifact templates
          console.log(`[ContractFactoryService] Loading standard artifact for ${contractDef.contractType}`);
          artifact = await this.loadArtifact(contractDef.contractType);
        } else {
          // Load from custom definition
          console.log(`[ContractFactoryService] Loading custom artifact for ${contractDef.contractName}`);
          artifact = this.loadCustomArtifact(contractDef);
        }
        
        // Resolve constructor parameters
        const constructorParams = this.resolveConstructorParams(
          contractDef.constructorParams,
          sharedParams
        );

        // Create factory and deploy
        const factory = this.getContractFactory(artifact);
        const contract = await factory.deploy(...constructorParams);
        
        // Wait for deployment
        const deployTx = contract.deploymentTransaction();
        if (!deployTx) {
          throw new Error('Deployment transaction not found');
        }

        const txHash = deployTx.hash;
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log(`[ContractFactoryService] Custom contract ${contractDef.contractName} deployed at: ${contractAddress}`);

        deployments.push({
          contractName: contractDef.contractName,
          contractType: contractDef.contractType,
          contractAddress,
          txHash,
          abi: artifact.abi
        });
      } catch (err) {
        console.error(`[ContractFactoryService] Error deploying custom contract ${contractDef.contractName}:`, err);
        throw new Error(`Failed to deploy custom contract ${contractDef.contractName}: ${err.message}`);
      }
    }

    return deployments;
  }

  /**
   * Resolve constructor parameters with shared context
   * @param {Array} params - Constructor parameter definitions
   * @param {Object} sharedParams - Shared parameters (walletAddress, routerAddress, etc.)
   * @returns {Array} Resolved constructor parameters
   */
  resolveConstructorParams(params, sharedParams) {
    if (!params || !Array.isArray(params)) {
      return [];
    }

    return params.map(param => {
      // If parameter is a string with placeholders, resolve them
      if (typeof param === 'string') {
        return param
          .replace('{{walletAddress}}', sharedParams.walletAddress || '')
          .replace('{{routerAddress}}', sharedParams.routerAddress || '')
          .replace('{{treasuryAddress}}', sharedParams.treasuryAddress || '')
          .replace('{{moduleId}}', sharedParams.moduleId || '');
      }
      return param;
    });
  }
}
