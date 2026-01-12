import { ethers } from "ethers";
import { attachJRC20 } from "./token.service.js";

/**
 * Send payment (JRC-20 transfer or mint)
 * @param {string} tokenAddress - Token contract address
 * @param {string} to - Recipient address
 * @param {string} amount - Amount to transfer (as string, in token units or wei)
 * @param {number} decimals - Token decimals (optional)
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt
 */
export async function sendPayment(tokenAddress, to, amount, decimals = 18) {
  const token = attachJRC20(tokenAddress);

  // 1. Determine decimals
  let tokenDecimals = decimals;
  if (!tokenDecimals || tokenDecimals === 18) {
    try {
      tokenDecimals = await token.decimals();
    } catch (err) {
      tokenDecimals = decimals || 18;
    }
  }

  // 2. Convert amount to BigInt (wei units)
  let amountBN;
  if (amount.toString().includes('.')) {
    amountBN = ethers.parseUnits(amount.toString(), tokenDecimals);
  } else {
    amountBN = BigInt(amount.toString());
  }

  // 3. Check treasury balance
  const treasuryAddress = await token.treasury();
  const balance = await token.balanceOf(treasuryAddress);

  let tx;
  if (balance >= amountBN) {
    // Sufficient balance - Transfer from treasury
    console.log(`[Router] Sufficient treasury balance. Transferring ${amountBN} to ${to}`);
    tx = await token.transfer(to, amountBN);
  } else {
    // Insufficient balance - Attempt to mint
    console.log(`[Router] Insufficient treasury balance (${balance} < ${amountBN}). Attempting to mint.`);
    try {
      tx = await token.mint(to, amountBN);
    } catch (err) {
      console.error(`[Router] Minting failed: ${err.message}. Trying transfer anyway (might fail).`);
      tx = await token.transfer(to, amountBN);
    }
  }

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

