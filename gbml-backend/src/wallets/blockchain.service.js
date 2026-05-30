import { ethers } from 'ethers';
import { provider } from '../blockchain/provider.js';
import { ContractsService } from '../contracts/contracts.service.js';

export class BlockchainService {
  constructor() {
    this.contractsService = new ContractsService();
  }

  /**
   * Fetch JVD (native) or ERC20 token balance for a wallet address
   * @param {string} tokenAddress - ERC20 token address or 'native' for JVD
   * @param {string} walletAddress - Target wallet address
   * @returns {Promise<string>} Balance formatted as string
   */
  async getBalance(tokenAddress, walletAddress) {
    const cleanTokenAddress = tokenAddress.toLowerCase();
    const cleanWalletAddress = walletAddress.toLowerCase();

    // If native token or zero address, fetch native JVD balance
    if (cleanTokenAddress === 'native' || cleanTokenAddress === '0x0000000000000000000000000000000000000000') {
      const balance = await provider.getBalance(cleanWalletAddress);
      return ethers.formatEther(balance);
    }

    // ERC20 token balance query
    const tokenAbi = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
    const tokenContract = new ethers.Contract(cleanTokenAddress, tokenAbi, provider);

    try {
      const decimals = await tokenContract.decimals().catch(() => 18);
      const balance = await tokenContract.balanceOf(cleanWalletAddress);
      return ethers.formatUnits(balance, decimals);
    } catch (err) {
      console.error(`Error querying ERC20 balance for token ${tokenAddress}:`, err.message);
      return '0';
    }
  }

  /**
   * Execute a token transfer through the JVD Router settlement contract
   * @param {string} fromPrivateKey - Sender's private key to sign transaction
   * @param {string} toAddress - Recipient address
   * @param {string} tokenAddress - Token address to settle
   * @param {string|number} amount - Amount to transfer
   * @returns {Promise<Object>} Object containing txHash
   */
  async transferThroughRouter(fromPrivateKey, toAddress, tokenAddress, amount) {
    // 1. Resolve JVD Router address from Contract Registry
    const registryEntry = await this.contractsService.getContractByServiceId('JVD_ROUTER');
    const routerAddress = registryEntry?.contractAddress || process.env.ROUTER_ADDRESS;

    if (!routerAddress) {
      throw new Error('JVD Router settlement contract is not registered in the Contract Registry (serviceId: JVD_ROUTER) and ROUTER_ADDRESS env is missing.');
    }

    // 2. Initialize signer with sender's private key
    const userWallet = new ethers.Wallet(fromPrivateKey, provider);

    // 3. Connect to JVD Router using minimal ABI
    const routerAbi = [
      'function settle(address token, address recipient, uint256 amount) external',
      'event SettlementExecuted(address indexed recipient, address indexed token, uint256 amount)'
    ];
    const routerContract = new ethers.Contract(routerAddress, routerAbi, userWallet);

    // 4. Resolve decimals if ERC20 to convert to unit decimals properly
    let formattedAmount;
    if (tokenAddress.toLowerCase() === 'native' || tokenAddress.toLowerCase() === '0x0000000000000000000000000000000000000000') {
      formattedAmount = ethers.parseEther(amount.toString());
    } else {
      const tokenAbi = ['function decimals() view returns (uint8)'];
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const decimals = await tokenContract.decimals().catch(() => 18);
      formattedAmount = ethers.parseUnits(amount.toString(), decimals);
    }

    console.log(`[BlockchainService] Invoking JVD Router settle(). From: ${userWallet.address}, To: ${toAddress}, Token: ${tokenAddress}, Amount: ${amount}`);

    const tx = await routerContract.settle(tokenAddress, toAddress, formattedAmount);
    console.log(`[BlockchainService] Transaction broadcasted. Tx Hash: ${tx.hash}`);

    return {
      txHash: tx.hash,
      transaction: tx
    };
  }
}
