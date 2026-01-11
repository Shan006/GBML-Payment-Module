import { ethers } from "ethers";
import { provider } from "../blockchain/provider.js";

/**
 * Get balance of native token (JVD) for an address
 * @param {string} address - Address to check balance
 * @returns {Promise<string>} Balance in wei as string
 */
export async function getNativeBalance(address) {
  const balance = await provider.getBalance(address);
  return balance.toString();
}

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid address
 */
export function isValidAddress(address) {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format address to checksum format
 * @param {string} address - Address to format
 * @returns {string} Checksummed address
 */
export function toChecksumAddress(address) {
  return ethers.getAddress(address);
}

