import { ethers } from "ethers";
import { provider } from "./provider.js";
import { config } from "../config/env.js";

/**
 * Treasury wallet signer for signing transactions
 * ⚠️ Never expose private keys to frontend
 * 
 * In production:
 * - Use AWS KMS / HSM
 * - Abstract signing behind a service
 */
export const treasurySigner = new ethers.Wallet(config.treasuryPrivateKey, provider);

