import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  juvidoeRpcUrl: process.env.JUVIDOE_RPC_URL,
  treasuryPrivateKey: process.env.TREASURY_PRIVATE_KEY,
};

// Validate required environment variables
if (!config.juvidoeRpcUrl) {
  throw new Error("JUVIDOE_RPC_URL is required");
}

if (!config.treasuryPrivateKey) {
  throw new Error("TREASURY_PRIVATE_KEY is required");
}

