import { ethers } from 'ethers';
import { v4 as uuid } from 'uuid';
import { WalletRepository } from './wallet.repository.js';
import { BlockchainService } from './blockchain.service.js';
import { ContractsService } from '../contracts/contracts.service.js';
import { Wallet } from './entities/wallet.entity.js';

export class WalletService {
  constructor() {
    this.walletRepository = new WalletRepository();
    this.blockchainService = new BlockchainService();
    this.contractsService = new ContractsService();
  }

  /**
   * GBML module wallet user id namespace
   */
  static moduleUserId(moduleId) {
    return `module:${moduleId}`;
  }

  /**
   * Create or return existing wallet bound to a GBML module (for enable-blockchain flow)
   * @param {string} moduleId - Module identifier
   * @returns {Promise<Object>} { walletAddress, created }
   */
  async createOrGetModuleWallet(moduleId) {
    const userId = WalletService.moduleUserId(moduleId);
    const existing = await this.walletRepository.findWalletByUserId(userId);
    if (existing) {
      return { walletAddress: existing.walletAddress, created: false };
    }

    const randomWallet = ethers.Wallet.createRandom();
    const walletData = {
      id: uuid(),
      userId,
      walletAddress: randomWallet.address,
      privateKey: randomWallet.privateKey
    };

    const saved = await this.walletRepository.saveWallet(walletData);
    return {
      walletAddress: saved.walletAddress,
      created: true
    };
  }

  /**
   * Resolve module-bound wallet address if present
   */
  async getModuleWalletAddress(moduleId) {
    const wallet = await this.walletRepository.findWalletByUserId(
      WalletService.moduleUserId(moduleId)
    );
    return wallet?.walletAddress || null;
  }

  /**
   * Create a random wallet for a user and store its address in the DB
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Object containing address and private key
   */
  async createWallet(userId) {
    // Check if wallet already exists for this user
    const existing = await this.walletRepository.findWalletByUserId(userId);
    if (existing) {
      throw new Error(`Wallet already exists for user ${userId}`);
    }

    // Generate new random ethers wallet
    const randomWallet = ethers.Wallet.createRandom();

    const walletData = {
      id: uuid(),
      userId: userId,
      walletAddress: randomWallet.address,
      privateKey: randomWallet.privateKey
    };

    // Save in database repository
    const saved = await this.walletRepository.saveWallet(walletData);
    return saved.toCreationResponse();
  }

  /**
   * Retrieve wallet address by user ID
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Wallet address payload
   */
  async getWallet(userId) {
    const wallet = await this.walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      throw new Error(`No wallet found for user ${userId}`);
    }
    return wallet.toResponse();
  }

  /**
   * Get JVD (native) and all registered ERC20 token balances for a wallet
   * @param {string} address - Wallet address
   * @returns {Promise<Object>} Balances payload
   */
  async getBalances(address) {
    // 1. Fetch native JVD balance
    const jvdBalance = await this.blockchainService.getBalance('native', address);

    // 2. Fetch all token contracts from registry to check their balances
    const registryTokens = await this.contractsService.listContracts();
    const ownedTokens = [];

    for (const token of registryTokens) {
      // Exclude JVD Router itself from balance check
      if (token.contractType === 'JVD_ROUTER') continue;

      try {
        const balance = await this.blockchainService.getBalance(token.contractAddress, address);
        // Connect to token contract to query symbol dynamically
        const tokenAbi = ['function symbol() view returns (string)'];
        const tokenContract = new ethers.Contract(token.contractAddress, tokenAbi, provider);
        const symbol = await tokenContract.symbol().catch(() => token.contractType);

        ownedTokens.push({
          name: token.contractName,
          symbol: symbol,
          balance: balance,
          address: token.contractAddress
        });
      } catch (err) {
        console.error(`Failed to load balance for token ${token.contractName}:`, err.message);
      }
    }

    return {
      jvdBalance,
      ownedTokens
    };
  }

  /**
   * Retrieve transaction history of a wallet address
   * @param {string} address - Wallet address
   * @returns {Promise<Object[]>} Array of transactions
   */
  async getTransactions(address) {
    const list = await this.walletRepository.findTransactionsByAddress(address);
    return list.map(tx => tx.toResponse());
  }

  /**
   * Execute token transfer through the JVD Router settlement contract
   * @param {Object} dto - Validated TransferDto data
   * @returns {Promise<Object>} Result containing txHash
   */
  async transfer(dto) {
    const { from, to, tokenAddress, amount } = dto;

    // Load from address record to fetch private key
    const senderWallet = await this.walletRepository.findWalletByAddress(from);
    if (!senderWallet) {
      throw new Error(`Sender wallet ${from} not found in database registry. Transactions can only be initiated from wallets created in this system.`);
    }

    const txId = uuid();

    // Broadcast transfer synchronously to retrieve transaction hash immediately
    const { txHash, transaction } = await this.blockchainService.transferThroughRouter(
      senderWallet.privateKey,
      to,
      tokenAddress,
      amount
    );

    // Save transaction in DB with status PROCESSING and transaction hash
    await this.walletRepository.saveTransaction({
      id: txId,
      walletAddress: from,
      txHash: txHash,
      tokenAddress: tokenAddress,
      amount: amount,
      status: 'PROCESSING'
    });

    // Wait for block confirmation asynchronously in background
    transaction.wait(1).then(() => {
      this.walletRepository.updateTransactionStatus(txHash, 'SUCCESS');
      console.log(`[WalletService] Transfer transaction ${txHash} confirmed success.`);
    }).catch(err => {
      this.walletRepository.updateTransactionStatus(txHash, 'FAILED');
      console.error(`[WalletService] Transfer transaction ${txHash} reverted/failed:`, err.message);
    });

    return {
      txHash
    };
  }


  async executeTransferInBackground(txId, privateKey, to, tokenAddress, amount) {
    // Left as fallback or helper
  }
}

// Global provider import helper
import { provider } from '../blockchain/provider.js';
