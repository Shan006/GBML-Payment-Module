import { ethers } from 'ethers';
import { provider } from '../blockchain/provider.js';
import { config } from '../config/env.js';
import path from 'path';
import fs from 'fs';

const CONTRACTS = {
  TOKEN: 'JRC20',
  NFT: 'JRC721',
  TREASURY: 'Treasury',
  ROUTER: 'Router',
  JVD_ROUTER: 'JvdRouter'
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
      return JSON.parse(data);
    } catch (err) {
      console.error(`Failed to load artifact at path: ${artifactPath}`, err);
      throw new Error(`Compiled artifact for contract type ${contractType} (${contractName}) not found. Please ensure 'npx hardhat compile' has run successfully.`);
    }
  }

  /**
   * Create an ethers.js ContractFactory from the artifact
   * @param {Object} artifact 
   * @returns {ethers.ContractFactory}
   */
  getContractFactory(artifact) {
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, this.wallet);
  }
}
