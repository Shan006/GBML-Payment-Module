# GBML Payments Module - Setup Guide

This guide will help you set up and run the GBML Payments Module.

## Prerequisites

- Node.js 18+ (for ES modules support)
- npm or yarn
- Access to Juvidoe RPC endpoint
- Treasury wallet private key

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd gbml-backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# On Windows PowerShell:
Copy-Item .env.example .env
# On Linux/Mac:
# cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - JUVIDOE_RPC_URL: Your Juvidoe RPC endpoint
# - TREASURY_PRIVATE_KEY: Private key for treasury wallet (0x prefix optional)
# - PORT: Server port (default: 3000)
```

### 2. Compile Smart Contract

Before you can deploy contracts, you need to compile the JRC-20 contract:

**Option A: Using Hardhat (Recommended)**

```bash
cd gbml-backend

# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat (if needed)
npx hardhat init

# Compile contract
npx hardhat compile

# Copy the compiled bytecode from artifacts/contracts/JRC20.sol/JRC20.json
# to src/blockchain/contracts/JRC20.json (replace the bytecode field)
```

**Option B: Using Remix IDE**

1. Go to https://remix.ethereum.org
2. Create a new file `JRC20.sol`
3. Paste the contract code from `contracts/JRC20.sol`
4. Compile the contract (Solidity 0.8.20)
5. Copy the ABI and bytecode from the compilation artifact
6. Update `src/blockchain/contracts/JRC20.json` with the bytecode

See `gbml-backend/CONTRACT_COMPILATION.md` for more details.

### 3. Start Backend Server

```bash
cd gbml-backend

# Start server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd gbml-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port).

### 5. Test the Application

1. Open the frontend in your browser (`http://localhost:5173`)
2. Click "Enable Blockchain Payments" to deploy a new JRC-20 token
3. Once enabled, use the "Send Payment" form to send tokens
4. Check transaction hashes on the Juvidoe blockchain explorer

## Configuration

### Backend Environment Variables

Create a `.env` file in `gbml-backend/`:

```env
# Juvidoe RPC Configuration
JUVIDOE_RPC_URL=https://rpc.juvidoe.com

# Treasury Wallet Private Key (NEVER commit this to version control)
TREASURY_PRIVATE_KEY=your_private_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Frontend API URL

The frontend connects to the backend at `http://localhost:3000/gbml` by default.

To change this, update the `API_BASE_URL` constant in:
- `gbml-ui/src/components/EnablePayments.jsx`
- `gbml-ui/src/components/SendPayment.jsx`

## Troubleshooting

### Backend Issues

1. **"JUVIDOE_RPC_URL is required" error**
   - Make sure your `.env` file exists and contains `JUVIDOE_RPC_URL`
   - Check that the RPC URL is correct and accessible

2. **"TREASURY_PRIVATE_KEY is required" error**
   - Make sure your `.env` file contains `TREASURY_PRIVATE_KEY`
   - The private key should be a valid Ethereum private key (with or without 0x prefix)

3. **Contract deployment fails**
   - Ensure the contract bytecode is compiled and updated in `JRC20.json`
   - Check that the treasury wallet has sufficient funds for deployment
   - Verify the RPC endpoint is working

4. **JSON import assertion error**
   - Make sure you're using Node.js 17.5+ (required for JSON import assertions)
   - Alternatively, you can modify the import to use `fs.readFileSync` and `JSON.parse`

### Frontend Issues

1. **CORS errors**
   - Make sure the backend is running
   - Check that CORS is enabled in the backend (it should be by default)
   - Verify the API URL in the frontend components

2. **Network errors**
   - Verify the backend server is running on the correct port
   - Check the browser console for detailed error messages

## Production Deployment

Before deploying to production:

1. **Security**
   - Use AWS KMS / HSM for private key management
   - Implement authentication and authorization
   - Add rate limiting
   - Use HTTPS
   - Validate all inputs

2. **Database**
   - Replace in-memory storage with a real database (PostgreSQL, MongoDB, etc.)
   - Implement proper data persistence

3. **Monitoring**
   - Add logging service (Winston, Pino, etc.)
   - Set up error tracking (Sentry, etc.)
   - Monitor blockchain transactions

4. **Testing**
   - Write unit tests
   - Write integration tests
   - Test on testnet before mainnet

## Next Steps

- Integrate with JVD Router for advanced routing
- Add more payment features (batch transfers, scheduled payments)
- Implement user authentication
- Add transaction history
- Create admin dashboard

