# GBML Blockchain Orchestrator API Documentation

## Overview

The GBML Blockchain Orchestrator provides a unified API to transform normal modules into blockchain-enabled modules with a single action. Instead of manually deploying contracts, registering them, and configuring services, you can simply call the enablement API.

## Base URL

```
http://localhost:3000/gbml
```

## Authentication

All endpoints require API key authentication via the `x-api-key` header.

```
x-api-key: your-api-key-here
```

## Endpoints

### 1. Enable Blockchain for a Module

Transform a normal module into a blockchain-enabled module.

**Endpoint:** `POST /enable-blockchain` or `POST /blockchain-modules`

**Request Body:**
```json
{
  "moduleId": "fund-001",
  "moduleType": "FUND"
}
```

**Parameters:**
- `moduleId` (string, required): Unique identifier for the module
- `moduleType` (string, required): Type of module. Valid values:
  - `FUND` - Fund management module
  - `TREASURY` - Treasury module
  - `GRANT` - Grant management module
  - `REGISTRY` - Registry module
  - `PAYMENT` - Payment module
  - `TOKEN` - Generic token module
  - `NFT` - NFT module
  - `ROUTER` - Router module
- `constructorParams` (array, optional): Custom constructor parameters for contract deployment

**Response (201 Created):**
```json
{
  "enabled": true,
  "moduleId": "fund-001",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "status": "ACTIVE",
  "services": {
    "wallet": true,
    "settlement": true,
    "conversion": true
  },
  "alreadyEnabled": false,
  "deployment": {
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "txHash": "0x123abc..."
  }
}
```

**What the Orchestrator Does:**
1. ✅ Validates module type
2. ✅ Determines appropriate contract template
3. ✅ Deploys smart contract
4. ✅ Registers contract in registry
5. ✅ Enables wallet support
6. ✅ Enables settlement support (for payment modules)
7. ✅ Enables fiat conversion (for payment modules)
8. ✅ Saves enablement record

### 2. Get Module Status

Retrieve the blockchain enablement status of a specific module.

**Endpoint:** `GET /blockchain-modules/:moduleId`

**Response (200 OK):**
```json
{
  "moduleId": "fund-001",
  "moduleType": "FUND",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "enabled": true,
  "status": "ACTIVE",
  "services": {
    "wallet": true,
    "settlement": true,
    "conversion": true
  },
  "deploymentTxHash": "0x123abc...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (200 OK - Not Enabled):**
```json
{
  "moduleId": "fund-002",
  "enabled": false,
  "status": "NOT_ENABLED"
}
```

### 3. List All Enabled Modules

Get a list of all blockchain-enabled modules with optional filtering.

**Endpoint:** `GET /blockchain-modules`

**Query Parameters:**
- `moduleType` (string, optional): Filter by module type (e.g., `FUND`, `TREASURY`)
- `status` (string, optional): Filter by status (e.g., `ACTIVE`, `INACTIVE`)
- `enabled` (boolean, optional): Filter by enablement status (`true` or `false`)

**Examples:**
```
GET /blockchain-modules
GET /blockchain-modules?moduleType=FUND
GET /blockchain-modules?status=ACTIVE
GET /blockchain-modules?enabled=true
```

**Response (200 OK):**
```json
{
  "modules": [
    {
      "moduleId": "fund-001",
      "moduleType": "FUND",
      "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "enabled": true,
      "status": "ACTIVE",
      "services": {
        "wallet": true,
        "settlement": true,
        "conversion": true
      },
      "deploymentTxHash": "0x123abc...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "moduleId": "treasury-001",
      "moduleType": "TREASURY",
      "contractAddress": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      "enabled": true,
      "status": "ACTIVE",
      "services": {
        "wallet": true,
        "settlement": true,
        "conversion": false
      },
      "deploymentTxHash": "0x456def...",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "count": 2
}
```

### 4. Get Enablement Statistics

Retrieve statistics about blockchain-enabled modules.

**Endpoint:** `GET /blockchain-modules/stats`

**Response (200 OK):**
```json
{
  "total": 10,
  "enabled": 8,
  "disabled": 2,
  "byType": {
    "FUND": 3,
    "TREASURY": 2,
    "GRANT": 2,
    "PAYMENT": 3
  },
  "byStatus": {
    "ACTIVE": 8,
    "INACTIVE": 1,
    "FAILED": 1
  }
}
```

### 5. Update Module Services

Enable or disable specific platform services for a module.

**Endpoint:** `PATCH /blockchain-modules/:moduleId/services`

**Request Body:**
```json
{
  "walletEnabled": true,
  "settlementEnabled": true,
  "conversionEnabled": false
}
```

**Response (200 OK):**
```json
{
  "moduleId": "fund-001",
  "moduleType": "FUND",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "enabled": true,
  "status": "ACTIVE",
  "services": {
    "wallet": true,
    "settlement": true,
    "conversion": false
  },
  "deploymentTxHash": "0x123abc...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 6. Disable Blockchain for a Module

Disable blockchain functionality for a module (soft delete).

**Endpoint:** `POST /blockchain-modules/:moduleId/disable`

**Response (200 OK):**
```json
{
  "success": true,
  "moduleId": "fund-001",
  "status": "INACTIVE"
}
```

## Module Type to Contract Mapping

The orchestrator automatically maps module types to appropriate smart contract templates:

| Module Type | Contract Template | Description |
|-------------|------------------|-------------|
| FUND | JRC20 (Token) | Fungible token for fund management |
| TREASURY | Treasury | Treasury management contract |
| GRANT | JRC20 (Token) | Token for grant distribution |
| REGISTRY | JRC20 (Token) | Registry with token support |
| PAYMENT | JRC20 (Token) | Payment processing token |
| TOKEN | JRC20 (Token) | Generic fungible token |
| NFT | JRC721 (NFT) | Non-fungible token |
| ROUTER | Router | Settlement routing contract |

## Service Enablement Rules

The orchestrator automatically enables platform services based on module type:

### Wallet Support
- **Always enabled** for all module types
- Provides blockchain wallet functionality

### Settlement Support
- **Enabled for:** PAYMENT, FUND, TREASURY
- **Disabled for:** GRANT, REGISTRY, TOKEN, NFT, ROUTER
- Provides automated settlement processing

### Fiat Conversion Support
- **Enabled for:** PAYMENT, FUND
- **Disabled for:** TREASURY, GRANT, REGISTRY, TOKEN, NFT, ROUTER
- Provides fiat-to-crypto conversion

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    "moduleId or serviceId is required and must be a non-empty string",
    "moduleType is required and must be one of: TOKEN, NFT, TREASURY, ROUTER, FUND, GRANT, REGISTRY, PAYMENT"
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to enable blockchain",
  "message": "Contract deployment failed: insufficient funds"
}
```

## Example Usage

### cURL

```bash
# Enable blockchain for a fund module
curl -X POST http://localhost:3000/gbml/enable-blockchain \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "moduleId": "fund-001",
    "moduleType": "FUND"
  }'

# Get module status
curl -X GET http://localhost:3000/gbml/blockchain-modules/fund-001 \
  -H "x-api-key: your-api-key"

# List all enabled modules
curl -X GET http://localhost:3000/gbml/blockchain-modules \
  -H "x-api-key: your-api-key"
```

### JavaScript/Node.js

```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/gbml',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  }
});

// Enable blockchain
const response = await client.post('/enable-blockchain', {
  moduleId: 'fund-001',
  moduleType: 'FUND'
});

console.log('Contract Address:', response.data.contractAddress);
```

## Database Schema

The orchestrator stores enablement records in the `blockchain_modules` table:

```sql
CREATE TABLE blockchain_modules (
  id UUID PRIMARY KEY,
  module_id VARCHAR(255) NOT NULL,
  service_id VARCHAR(255),
  module_type VARCHAR(100) NOT NULL,
  contract_address VARCHAR(255) NOT NULL,
  blockchain_enabled BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  wallet_enabled BOOLEAN DEFAULT FALSE,
  settlement_enabled BOOLEAN DEFAULT FALSE,
  conversion_enabled BOOLEAN DEFAULT FALSE,
  deployment_tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Architecture

```
Admin Dashboard
      │
      ▼
GBML Enablement API
      │
      ▼
GBML Orchestrator
      │
  ┌───┼────────────┐
  │   │            │
  ▼   ▼            ▼
Deployment  Registry  Wallet
  │         │        │
  ▼         ▼        ▼
Settlement  Conversion
```

## Benefits

✅ **Single API Call** - Enable blockchain with one request instead of multiple manual steps

✅ **Automatic Configuration** - Smart defaults based on module type

✅ **Consistent Setup** - Standardized enablement process across all modules

✅ **Error Handling** - Graceful failure handling with status tracking

✅ **Audit Trail** - Complete record of enablement history

✅ **Flexible Services** - Enable/disable individual platform services as needed
