# GBML Backend - Global Blockchain Middleware Layer

Node.js + Express backend for GBML (Global Blockchain Middleware Layer) - A unified platform for enabling blockchain functionality across any module through a single orchestrated workflow.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
JUVIDOE_RPC_URL=https://rpc.juvidoe.com
TREASURY_PRIVATE_KEY=your_private_key_here
PORT=3000
```

⚠️ **Security Warning**: Never commit `.env` file to version control. Keep private keys secure.

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Core Features

### 🚀 Blockchain Orchestrator (MVP)
Enable blockchain for any module with a single API call:

```bash
POST /gbml/enable-blockchain
{
  "moduleId": "fund-001",
  "moduleType": "FUND"
}
```

The orchestrator automatically:
- ✅ Deploys smart contracts
- ✅ Registers contracts in the registry
- ✅ Enables wallet support
- ✅ Configures settlement layer
- ✅ Enables fiat conversion (for payment modules)

**Supported Module Types:**
- `FUND` - Fund management
- `TREASURY` - Treasury operations
- `GRANT` - Grant distribution
- `REGISTRY` - Registry management
- `PAYMENT` - Payment processing
- `TOKEN` - Generic tokens
- `NFT` - Non-fungible tokens
- `ROUTER` - Settlement routing

### 📚 API Endpoints

#### Blockchain Enablement
```bash
# Enable blockchain for a module
POST /gbml/enable-blockchain

# Get module status
GET /gbml/blockchain-modules/:moduleId

# List all enabled modules
GET /gbml/blockchain-modules

# Get statistics
GET /gbml/blockchain-modules/stats

# Update module services
PATCH /gbml/blockchain-modules/:moduleId/services

# Disable blockchain
POST /gbml/blockchain-modules/:moduleId/disable
```

#### Contract Management
```bash
# Deploy a contract
POST /gbml/deploy

# Register a contract
POST /gbml/contracts

# Get contract by address
GET /gbml/contracts/address/:address

# Get contract by service ID
GET /gbml/contracts/service/:serviceId

# List all contracts
GET /gbml/contracts
```

#### Wallet Operations
```bash
# Create wallet
POST /gbml/wallets

# Get wallet by user ID
GET /gbml/wallets/:userId

# Get balances
GET /gbml/wallets/:address/balances

# Get transactions
GET /gbml/wallets/:address/transactions

# Transfer tokens
POST /gbml/wallets/transfer
```

#### Settlement Layer
```bash
# Create settlement
POST /gbml/settlements

# Get settlement status
GET /gbml/settlements/:settlementId
```

#### Payments
```bash
# Send payment
POST /gbml/payments/send

# Get token balance
GET /gbml/payments/balance/:tokenAddress/:address

# Get module status
GET /gbml/modules/payments/:moduleId
```

#### Fiat Gateway
```bash
# Create fiat transaction
POST /gbml/fiat/transactions

# Get transaction status
GET /gbml/fiat/transactions/:transactionId

# Stripe webhook
POST /gbml/fiat/webhook
```

For detailed API documentation, see [ORCHESTRATOR_API.md](./ORCHESTRATOR_API.md)

## Project Structure

```
gbml-backend/
├─ src/
│  ├─ app.js                      # Express app setup
│  ├─ server.js                   # Server entry point
│  ├─ enablement/                 # 🚀 Blockchain Orchestrator (NEW)
│  │  ├─ orchestrator.service.js  # Core orchestration engine
│  │  ├─ enablement.service.js    # High-level business logic
│  │  ├─ enablement.controller.js # HTTP request handlers
│  │  ├─ enablement.repository.js # Database operations
│  │  ├─ enablement.routes.js     # API routes
│  │  ├─ blockchain-module.entity.js # Data model
│  │  ├─ dto/                     # Request validation
│  │  └─ README.md                # Orchestrator documentation
│  ├─ deployment/                 # Dynamic contract deployment
│  │  ├─ deployment.service.js
│  │  ├─ contract-factory.service.js
│  │  └─ deployment.controller.js
│  ├─ contracts/                  # Smart contract registry
│  │  ├─ contracts.service.js
│  │  ├─ contracts.repository.js
│  │  └─ contracts.controller.js
│  ├─ wallets/                    # Wallet management
│  │  ├─ blockchain.service.js
│  │  ├─ wallet.repository.js
│  │  └─ wallets.controller.js
│  ├─ settlements/                # Settlement layer
│  │  ├─ settlements.service.js
│  │  ├─ router.service.js
│  │  └─ settlements.controller.js
│  ├─ services/                   # Business logic
│  │  ├─ fiat-gateway.service.js
│  │  ├─ currency.service.js
│  │  ├─ token.service.js
│  │  └─ wallet.service.js
│  ├─ blockchain/                 # Blockchain integration
│  │  ├─ provider.js
│  │  └─ signer.js
│  ├─ config/                     # Configuration
│  │  ├─ env.js
│  │  ├─ supabase.js
│  │  └─ fiat-config.js
│  ├─ middleware/                 # Authentication & authorization
│  │  ├─ auth.js
│  │  └─ api-key.js
│  └─ db/                         # Database abstraction
├─ contracts/                     # Solidity smart contracts
│  ├─ JRC20.sol                   # Fungible token
│  ├─ JRC721.sol                  # Non-fungible token
│  ├─ Treasury.sol                # Treasury management
│  ├─ Router.sol                  # Settlement router
│  └─ JvdRouter.sol               # JVD router
├─ artifacts/                     # Compiled contract artifacts
├─ scripts/                       # Deployment scripts
├─ data/                          # Static data
├─ test-orchestrator.js           # Orchestrator test script
├─ ORCHESTRATOR_API.md            # API documentation
└─ package.json
```

## Testing

### Test the Orchestrator

Run the comprehensive test script:

```bash
node test-orchestrator.js
```

This will test:
1. Enabling blockchain for a FUND module
2. Checking module status
3. Enabling blockchain for a TREASURY module
4. Listing all enabled modules
5. Getting statistics
6. Filtering modules by type
7. Updating module services

### Manual Testing

```bash
# Enable blockchain for a fund
curl -X POST http://localhost:3000/gbml/enable-blockchain \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"moduleId": "fund-001", "moduleType": "FUND"}'

# Check status
curl http://localhost:3000/gbml/blockchain-modules/fund-001 \
  -H "x-api-key: your-api-key"

# List all modules
curl http://localhost:3000/gbml/blockchain-modules \
  -H "x-api-key: your-api-key"
```

## Database Migrations

Run the database migrations to set up the required tables:

```bash
# Core blockchain modules table
psql -f migration_blockchain_modules.sql

# Enhanced features (status tracking, service flags)
psql -f migration_blockchain_modules_enhanced.sql

# Other migrations
psql -f migration_contracts.sql
psql -f migration_wallets.sql
psql -f migration_settlements.sql
psql -f migration_rbac.sql
```

## Documentation

- **[ORCHESTRATOR_API.md](./ORCHESTRATOR_API.md)** - Complete API documentation
- **[src/enablement/README.md](./src/enablement/README.md)** - Orchestrator architecture and usage
- **[CONTRACT_COMPILATION.md](./CONTRACT_COMPILATION.md)** - Smart contract compilation guide
- **[BLOCKCHAIN_ORCHESTRATOR_IMPLEMENTATION_PART1.md](../BLOCKCHAIN_ORCHESTRATOR_IMPLEMENTATION_PART1.md)** - Implementation specification

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              GBML Enablement API                         │
│         POST /gbml/enable-blockchain                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              GBML Orchestrator                           │
│  • Validates module type                                 │
│  • Determines contract template                          │
│  • Coordinates all enablement steps                      │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │Deploy  │ │Registry│ │Wallet  │ │Settle  │
   │ment    │ │        │ │        │ │ment    │
   └────────┘ └────────┘ └────────┘ └────────┘
       │          │          │          │
       └──────────┴──────────┴──────────┘
                      │
                      ▼
              ┌──────────────┐
              │  Blockchain  │
              │  (Juvidoe)   │
              └──────────────┘
```

## Key Benefits

✅ **Single API Call** - Enable blockchain with one request instead of 5+ manual steps

✅ **Automatic Configuration** - Smart defaults based on module type

✅ **Consistent Setup** - Standardized enablement across all modules

✅ **Error Handling** - Graceful failure handling with status tracking

✅ **Audit Trail** - Complete record of enablement history

✅ **Flexible Services** - Enable/disable individual platform services

## Security Notes

- Private keys are never exposed to the frontend
- All blockchain transactions are signed server-side
- Use AWS KMS / HSM in production for key management
- Implement proper authentication and authorization
- Add rate limiting and input validation
- API key authentication required for all endpoints
- Role-based access control (RBAC) for admin operations

