import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { treasurySigner } from "../blockchain/signer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JRC20 contract ABI and bytecode
const JRC20Path = join(__dirname, "../blockchain/contracts/JRC20.json");
const JRC20 = JSON.parse(readFileSync(JRC20Path, "utf-8"));

/**
 * Deploy a new JRC-20 token contract
 * @param {Object} config - Token configuration
 * @param {Object} config.token - Token parameters
 * @param {string} config.token.name - Token name
 * @param {string} config.token.symbol - Token symbol
 * @param {number} config.token.decimals - Token decimals
 * @param {string} config.token.initialSupply - Initial supply (as string)
 * @param {string} config.token.treasuryAddress - Treasury address
 * @returns {Promise<string>} Deployed token address
 */
export async function deployJRC20(config) {
  const factory = new ethers.ContractFactory(
    JRC20.abi,
    JRC20.bytecode,
    treasurySigner
  );

  // Ensure decimals is a number (uint8)
  const decimals = Number(config.token.decimals);
  if (isNaN(decimals) || decimals < 0 || decimals > 255) {
    throw new Error(`Invalid decimals value: ${config.token.decimals}. Must be between 0 and 255.`);
  }

  const contract = await factory.deploy(
    config.token.name,
    config.token.symbol,
    decimals,
    config.token.initialSupply,
    config.token.treasuryAddress
  );

  await contract.waitForDeployment();

  return contract.target; // token address
}

/**
 * Attach to an existing JRC-20 token contract
 * @param {string} address - Token contract address
 * @returns {ethers.Contract} Contract instance
 */
export function attachJRC20(address) {
  return new ethers.Contract(
    address,
    JRC20.abi,
    treasurySigner
  );
}

