import { WalletService } from './wallets.service.js';
import { CreateWalletDto } from './dto/create-wallet.dto.js';
import { TransferDto } from './dto/transfer.dto.js';

const walletService = new WalletService();

/**
 * Create a new random wallet for a user
 * POST /wallets
 */
export async function create(req, res) {
  try {
    const { isValid, errors } = CreateWalletDto.validate(req.body);
    if (!isValid) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { userId } = req.body;
    const result = await walletService.createWallet(userId);
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error creating wallet:', err);
    return res.status(500).json({ error: 'Failed to create wallet', message: err.message });
  }
}

/**
 * Get wallet details by user ID
 * GET /wallets/:userId
 */
export async function getByUserId(req, res) {
  const { userId } = req.params;
  try {
    if (!userId || userId.trim() === '') {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const result = await walletService.getWallet(userId);
    return res.json(result);
  } catch (err) {
    console.error(`Error retrieving wallet for user ${userId}:`, err);
    return res.status(404).json({ error: 'Wallet not found', message: err.message });
  }
}

/**
 * Fetch native JVD and registered ERC20 token balances for a wallet
 * GET /wallets/:address/balances
 */
export async function getBalances(req, res) {
  const { address } = req.params;
  try {
    if (!address || address.trim() === '') {
      return res.status(400).json({ error: 'wallet address is required' });
    }

    const result = await walletService.getBalances(address);
    return res.json(result);
  } catch (err) {
    console.error(`Error retrieving balances for wallet ${address}:`, err);
    return res.status(500).json({ error: 'Failed to retrieve balances', message: err.message });
  }
}

/**
 * Retrieve transaction history of a wallet
 * GET /wallets/:address/transactions
 */
export async function getTransactions(req, res) {
  const { address } = req.params;
  try {
    if (!address || address.trim() === '') {
      return res.status(400).json({ error: 'wallet address is required' });
    }

    const result = await walletService.getTransactions(address);
    return res.json(result);
  } catch (err) {
    console.error(`Error fetching transactions for wallet ${address}:`, err);
    return res.status(500).json({ error: 'Failed to fetch transaction history', message: err.message });
  }
}

/**
 * Transfer tokens through the JVD Router
 * POST /wallets/transfer
 */
export async function transfer(req, res) {
  try {
    const { isValid, errors } = TransferDto.validate(req.body);
    if (!isValid) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const dto = new TransferDto(req.body);
    const result = await walletService.transfer(dto);
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error executing transfer:', err);
    return res.status(500).json({ error: 'Transfer execution failed', message: err.message });
  }
}
