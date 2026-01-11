import { ethers } from "ethers";
import { config } from "../config/env.js";

export const provider = new ethers.JsonRpcProvider(config.juvidoeRpcUrl);

