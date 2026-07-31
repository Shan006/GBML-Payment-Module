import { ethers } from 'ethers';
import { provider } from '../blockchain/provider.js';
import { config } from '../config/env.js';
import { ContractsService } from '../contracts/contracts.service.js';
import path from 'path';
import fs from 'fs';

export class RouterService {
  constructor() {
    this.wallet = new ethers.Wallet(config.deployerPrivateKey, provider);
    this.contractsService = new ContractsService();
    this.routerContract = null;
  }

  /**
   * Check if JVD Router is registered. If not, automatically deploy it and register it.
   */
  async checkAndDeployRouter() {
    try {
      const entry = await this.contractsService.getContractByServiceId('JVD_ROUTER');
      if (entry && entry.contractAddress) {
        console.log(`[RouterService] JVD Router is already registered at address: ${entry.contractAddress}`);
        return entry.contractAddress;
      }

      console.log('[RouterService] JVD Router not found in Contract Registry. Deploying JVD Router contract...');

      // Dynamically import DeploymentService to avoid circular dependency
      const { DeploymentService } = await import('../deployment/deployment.service.js');
      const deploymentService = new DeploymentService();

      const result = await deploymentService.deploy({
        contractType: 'JVD_ROUTER',
        constructorParams: [],
        serviceId: 'JVD_ROUTER',
        contractName: 'JvdRouter'
      });

      console.log(`[RouterService] JVD Router auto-deployed and registered at: ${result.address}`);
      return result.address;
    } catch (err) {
      console.error('[RouterService] Error checking/deploying JVD Router on startup:', err.message);
      throw new Error(`Failed to check or deploy JVD Router: ${err.message}`);
    }
  }


  /**
   * Resolve JVD Router ABI
   */
  async getAbi() {
    try {
      const artifactPath = path.join(
        process.cwd(),
        'artifacts',
        'contracts',
        'JvdEgcrRouter.sol',
        'JvdEgcrRouter.json'
      );
      const data = await fs.promises.readFile(artifactPath, 'utf8');
      const artifact = JSON.parse(data);
      return artifact.abi;
    } catch (err) {
      console.warn('[RouterService] Warning: Could not load JvdEgcrRouter JSON artifact. Using minimal ABI fallback.', err.message);
      return [
        'function settle(address token, address recipient, uint256 amount) external',
        'function route(address from, address to, uint256 amount, address token) external returns (bool)',
        'function route721(address from, address to, uint256 tokenId, address token) external returns (bool)',
        'function route998(address from, address to, uint256 tokenId, address token) external returns (bool)',
        'function settleWithJvdEgcr(address token, address recipient, uint256 amount, string orderId) external returns (bool)',
        'event SettlementExecuted(address indexed recipient, address indexed token, uint256 amount, string orderId)',
        'event RouteERC20(address indexed from, address indexed to, uint256 amount, address token)',
        'event RouteERC721(address indexed from, address indexed to, uint256 tokenId, address token)',
        'event RouteERC998(address indexed from, address indexed to, uint256 tokenId, address token)'
      ];
    }
  }

  /**
   * Initialize JVD Router contract instance
   */
  async getRouterInstance() {
    if (this.routerContract) {
      return this.routerContract;
    }

    // Load JVD Router Address from Contract Registry
    const registryEntry = await this.contractsService.getContractByServiceId('JVD_ROUTER');
    if (!registryEntry || !registryEntry.contractAddress) {
      throw new Error('JVD Router is not registered in the Contract Registry (serviceId: JVD_ROUTER). Please deploy and register it first.');
    }

    const routerAddress = registryEntry.contractAddress;
    console.log(`[RouterService] Loaded JVD Router Address from Registry: ${routerAddress}`);

    const abi = await this.getAbi();
    this.routerContract = new ethers.Contract(routerAddress, abi, this.wallet);
    return this.routerContract;
  }

  /**
   * Execute settlement transaction on the blockchain
   * @param {string} token - ERC20 token address
   * @param {string} recipient - Recipient address
   * @param {string|number|bigint} amount - Token amount to settle
   * @returns {Promise<string>} Transaction hash
   */
  async settle(token, recipient, amount) {
    const router = await this.getRouterInstance();

    console.log(`[RouterService] Executing settle via contract. Token: ${token}, Recipient: ${recipient}, Amount: ${amount}`);
    
    // Call contract method
    const bigAmount = typeof amount === 'bigint' ? amount : BigInt(amount);
    
    const tx = await router.settle(token, recipient, bigAmount);
    console.log(`[RouterService] Settlement tx broadcasted: ${tx.hash}`);

    // Wait for transaction confirmation (1 block)
    await tx.wait(1);
    console.log(`[RouterService] Settlement tx confirmed: ${tx.hash}`);

    return tx.hash;
  }
}
