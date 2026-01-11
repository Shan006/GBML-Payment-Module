import { ethers } from "ethers";
import { attachJRC20 } from "./token.service.js";

/**
 * Send payment (JRC-20 transfer)
 * @param {string} tokenAddress - Token contract address
 * @param {string} to - Recipient address
 * @param {string} amount - Amount to transfer (as string, in token units)
 * @param {number} decimals - Token decimals (optional, defaults to 18)
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt
 */
export async function sendPayment(tokenAddress, to, amount, decimals = 18) {
  const token = attachJRC20(tokenAddress);
  
  // If decimals not provided, read from contract
  let tokenDecimals = decimals;
  if (!tokenDecimals || tokenDecimals === 18) {
    try {
      tokenDecimals = await token.decimals();
    } catch (err) {
      // Fallback to provided decimals or 18
      tokenDecimals = decimals || 18;
    }
  }
  
  // Convert amount to BigNumber
  // Amount can be either:
  // - Decimal string (e.g., "0.001", "1.5") - will be converted using parseUnits with token decimals
  // - Integer string in wei (e.g., "1000000000000000") - will be parsed as BigInt
  let amountBN;
  if (amount.toString().includes('.')) {
    // Decimal format - convert using parseUnits with token decimals
    amountBN = ethers.parseUnits(amount.toString(), tokenDecimals);
  } else {
    // Already in wei format - convert to BigInt
    amountBN = BigInt(amount.toString());
  }
  
  // For MVP, we'll use the treasury signer directly
  // In production, you might want to check authorization
  const tx = await token.transfer(to, amountBN);
  
  return await tx.wait();
}

/**
 * Get token balance for an address
 * @param {string} tokenAddress - Token contract address
 * @param {string} address - Address to check balance
 * @returns {Promise<string>} Balance as string
 */
export async function getBalance(tokenAddress, address) {
  const token = attachJRC20(tokenAddress);
  const balance = await token.balanceOf(address);
  return balance.toString();
}

