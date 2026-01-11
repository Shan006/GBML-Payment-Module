# JRC-20 Contract Compilation

The JRC-20 contract needs to be compiled to generate the bytecode for deployment.

## Compilation Steps

1. Install Hardhat or use Remix IDE
2. Compile the contract: `contracts/JRC20.sol`
3. Copy the compiled ABI and bytecode to `src/blockchain/contracts/JRC20.json`

## Using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat (if not already initialized)
npx hardhat init

# Compile
npx hardhat compile

# Copy artifacts/contracts/JRC20.sol/JRC20.json to src/blockchain/contracts/JRC20.json
```

## Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create a new file `JRC20.sol` with the contract code
3. Compile the contract
4. Copy the ABI and bytecode from the compilation artifact
5. Update `src/blockchain/contracts/JRC20.json` with the bytecode

## Current Status

The `JRC20.json` file contains a placeholder bytecode. Replace it with the actual compiled bytecode before deployment.

