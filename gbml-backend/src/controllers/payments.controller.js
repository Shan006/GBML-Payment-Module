import { deployJRC20, attachJRC20 } from "../services/token.service.js";
import { sendPayment, getBalance } from "../services/router.service.js";
import { logModuleEnable, logPaymentTransaction, logError } from "../services/audit.service.js";
import { isValidAddress } from "../services/wallet.service.js";
import { storeModule, getModule, getModulesByTenant } from "../db/index.js";
import { treasurySigner } from "../blockchain/signer.js";
import { v4 as uuid } from "uuid";

/**
 * Enable payments module
 * POST /gbml/modules/payments/enable
 */
export async function enablePayments(req, res) {
  const config = req.body;

  try {
    let tokenAddress;

    if (config.token.mode === "DEPLOY") {
      // Validate token metadata for DEPLOY mode
      if (!config.token.name || !config.token.symbol || config.token.decimals === undefined || !config.token.initialSupply) {
        return res.status(400).json({ error: "Token name, symbol, decimals, and initialSupply are required for DEPLOY mode" });
      }

      // Ensure decimals is a valid number
      const decimals = parseInt(config.token.decimals, 10);
      if (isNaN(decimals) || decimals < 0 || decimals > 255) {
        return res.status(400).json({ error: `Invalid decimals value: ${config.token.decimals}. Must be between 0 and 255.` });
      }
      config.token.decimals = decimals;

      // Use treasury address from signer if not provided
      if (!config.token.treasuryAddress) {
        config.token.treasuryAddress = treasurySigner.address;
      }

      tokenAddress = await deployJRC20(config);
    } else if (config.token.mode === "ATTACH") {
      const token = attachJRC20(config.token.address);
      tokenAddress = token.target;
    } else {
      return res.status(400).json({ error: "Invalid token mode. Use 'DEPLOY' or 'ATTACH'" });
    }

    // Persist module state (DB)
    const moduleId = uuid();
    storeModule(moduleId, {
      moduleId,
      tenantId: config.tenantId,
      tokenAddress,
      tokenMode: config.token.mode,
      tokenConfig: config.token,
    });

    // Log module enable event
    await logModuleEnable({
      moduleId,
      tenantId: config.tenantId,
      tokenAddress,
      mode: config.token.mode,
    });

    return res.json({
      status: "enabled",
      moduleId,
      tokenAddress,
    });
  } catch (err) {
    console.error("Error enabling payments:", err);
    await logError({
      error: err.message,
      context: { config },
    });
    res.status(500).json({ error: "Payment module enable failed", message: err.message });
  }
}

/**
 * Send payment
 * POST /gbml/payments/send
 */
export async function sendPaymentController(req, res) {
  const { tokenAddress, to, amount, moduleId } = req.body;

  try {
    // Validate inputs
    if (!tokenAddress || !to || !amount) {
      return res.status(400).json({ error: "Missing required fields: tokenAddress, to, amount" });
    }

    // Validate addresses
    if (!isValidAddress(tokenAddress)) {
      return res.status(400).json({ error: "Invalid tokenAddress format" });
    }

    if (!isValidAddress(to)) {
      return res.status(400).json({ error: "Invalid recipient address (to) format. Expected Ethereum address (0x...)" });
    }

    // Get module to verify it exists and get token decimals
    const module = moduleId ? getModule(moduleId) : null;
    if (moduleId && !module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Get token decimals from module config, default to 18
    const tokenDecimals = module?.tokenConfig?.decimals || 18;

    // Send payment (using treasury signer)
    const receipt = await sendPayment(tokenAddress, to, amount, tokenDecimals);

    // Log transaction
    await logPaymentTransaction({
      txHash: receipt.hash,
      tokenAddress,
      from: receipt.from,
      to,
      amount,
      moduleId: moduleId || null,
      blockNumber: receipt.blockNumber,
    });

    return res.json({
      status: "success",
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokenAddress,
      to,
      amount,
    });
  } catch (err) {
    console.error("Error sending payment:", err);
    await logError({
      error: err.message,
      context: { tokenAddress, to, amount, moduleId },
    });
    res.status(500).json({ error: "Payment failed", message: err.message });
  }
}

/**
 * Get token balance
 * GET /gbml/payments/balance/:tokenAddress/:address
 */
export async function getTokenBalance(req, res) {
  const { tokenAddress, address } = req.params;

  try {
    const balance = await getBalance(tokenAddress, address);
    return res.json({
      tokenAddress,
      address,
      balance,
    });
  } catch (err) {
    console.error("Error getting balance:", err);
    res.status(500).json({ error: "Failed to get balance", message: err.message });
  }
}

/**
 * Get module status
 * GET /gbml/modules/payments/:moduleId
 */
export async function getModuleStatus(req, res) {
  const { moduleId } = req.params;

  try {
    const module = getModule(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    return res.json({
      status: "enabled",
      module,
    });
  } catch (err) {
    console.error("Error getting module status:", err);
    res.status(500).json({ error: "Failed to get module status", message: err.message });
  }
}

/**
 * List all modules for a tenant
 * GET /gbml/modules/payments?tenantId=tenant-001
 */
export async function listModules(req, res) {
  const { tenantId } = req.query;

  try {
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId query parameter is required" });
    }

    const modules = getModulesByTenant(tenantId);
    return res.json({
      modules,
      count: modules.length,
    });
  } catch (err) {
    console.error("Error listing modules:", err);
    res.status(500).json({ error: "Failed to list modules", message: err.message });
  }
}
