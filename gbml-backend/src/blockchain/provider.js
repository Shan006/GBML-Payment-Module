import { ethers } from "ethers";
import { config } from "../config/env.js";

// Create provider for blockchain RPC connection
export const provider = new ethers.JsonRpcProvider(config.juvidoeRpcUrl);

