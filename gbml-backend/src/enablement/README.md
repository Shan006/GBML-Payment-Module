# GBML Blockchain Orchestrator

## Overview

The GBML Blockchain Orchestrator is the core enablement system that transforms normal modules into blockchain-enabled modules through a single unified API call.

## Purpose

Instead of manually:
1. ✅ Deploy Contract
2. ✅ Register Contract
3. ✅ Configure Wallets
4. ✅ Configure Settlement
5. ✅ Configure Conversion

You only need to:
```javascript
POST /gbml/enable-blockchain
{
  "moduleId": "fund-001",
  "moduleType": "FUND"
}
```

And the orchestrator handles everything automatically.

## Architecture

### Components

```
enablement/
├── enablement.controller.js    # HTTP request handlers
├── enablement.service.js       # High-level business logic
├── orchestrator.service.js     # Core orchestration engine
├── enablement.repository.js    # Database operations
├── blockchain-module.entity.js # Data model
├── enablement.routes.js        # API route definitions
└── dto/
    └── enable-blockchain.dto.js # Request validation
```

### Flow Diagram

```
User Request
     │
     ▼
Controller (validation)
     │
     ▼
Enablement Service
     │
     ▼
Orchestrator Service
     │
     ├─► 1. Validate Module Type
     │
     ├─► 2. Check If Already Enabled
     │
     ├─► 3. Deploy Contract
     │        └─► Deployment Service
     │
     ├─► 4. Register Contract
     │        └─► Contracts Service
     │
     ├─► 5. Attach Platform Services
     │        ├─► Wallet Support
     │        ├─► Settlement Support
     │        └─► Conversion Support
     │
     └─► 6. Save Enablement Record
              └─► Repository
```

## Module Type Mapping

The orchestrator maps module types to smart contract templates:

```javascript
MODULE_CONTRACTS = {
  FUND: 'TOKEN',        // JRC20 fungible token
  TREASURY: 'TREASURY', // Treasury contract
  GRANT: 'TOKEN',       // JRC20 for grants
  REGISTRY: 'TOKEN',    // JRC20 for registry
  PAYMENT: 'TOKEN',     // JRC20 for payments
  TOKEN: 'TOKEN',       // Generic JRC20
  NFT: 'NFT',          // JRC721 non-fungible
  ROUTER: 'ROUTER'     // Settlement router
}
```

## Service Enablement Logic

### Wallet Support
- **Always enabled** for all modules
- Provides blockchain wallet functionality

### Settlement Support
- **Enabled for:** PAYMENT, FUND, TREASURY
- Provides automated settlement processing

### Fiat Conversion Support
- **Enabled for:** PAYMENT, FUND
- Provides fiat-to-crypto conversion

## API Endpoints

### 1. Enable Blockchain
```
POST /gbml/enable-blockchain
POST /gbml/blockchain-modules
```

### 2. Get Module Status
```
GET /gbml/blockchain-modules/:moduleId
```

### 3. List Enabled Modules
```
GET /gbml/blockchain-modules
GET /gbml/blockchain-modules?moduleType=FUND
GET /gbml/blockchain-modules?status=ACTIVE
```

### 4. Get Statistics
```
GET /gbml/blockchain-modules/stats
```

### 5. Update Services
```
PATCH /gbml/blockchain-modules/:moduleId/services
```

### 6. Disable Blockchain
```
POST /gbml/blockchain-modules/:moduleId/disable
```

## Usage Examples

### Enable Blockchain for a Fund

```javascript
const response = await fetch('http://localhost:3000/gbml/enable-blockchain', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    moduleId: 'fund-001',
    moduleType: 'FUND'
  })
});

const result = await response.json();
console.log('Contract Address:', result.contractAddress);
```

### Check Module Status

```javascript
const response = await fetch('http://localhost:3000/gbml/blockchain-modules/fund-001', {
  headers: {
    'x-api-key': 'your-api-key'
  }
});

const status = await response.json();
console.log('Enabled:', status.enabled);
console.log('Services:', status.services);
```

### List All Enabled Modules

```javascript
const response = await fetch('http://localhost:3000/gbml/blockchain-modules', {
  headers: {
    'x-api-key': 'your-api-key'
  }
});

const { modules, count } = await response.json();
console.log(`Found ${count} enabled modules`);
```

## Database Schema

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

## Error Handling

The orchestrator implements comprehensive error handling:

### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": [
    "moduleId or serviceId is required",
    "moduleType must be one of: FUND, TREASURY, ..."
  ]
}
```

### Deployment Errors (500)
```json
{
  "error": "Failed to enable blockchain",
  "message": "Contract deployment failed: insufficient funds"
}
```

### Already Enabled (200)
```json
{
  "enabled": true,
  "alreadyEnabled": true,
  "moduleId": "fund-001",
  "contractAddress": "0x..."
}
```

## Testing

Run the test script to verify orchestrator functionality:

```bash
cd gbml-backend
node test-orchestrator.js
```

The test script will:
1. Enable blockchain for a FUND module
2. Try to enable the same module again
3. Get module status
4. Enable blockchain for a TREASURY module
5. List all enabled modules
6. Get statistics
7. Filter modules by type
8. Update module services

## Integration Points

### Deployment Service
- Used to deploy smart contracts
- Automatically registers contracts in the registry

### Contracts Service
- Stores contract metadata
- Provides contract lookup by address or service ID

### Wallet Service
- Validates addresses
- Checks balances

### Settlement Service
- Processes settlements for enabled modules
- Routes transactions through the Router contract

### Fiat Gateway Service
- Handles fiat-to-crypto conversions
- Integrates with payment providers

## Configuration

No additional configuration required. The orchestrator uses:
- Existing blockchain provider configuration
- Existing database connection
- Existing contract artifacts

## Monitoring

Track orchestrator performance through:

### Statistics Endpoint
```bash
curl http://localhost:3000/gbml/blockchain-modules/stats \
  -H "x-api-key: your-api-key"
```

### Database Queries
```sql
-- Count enabled modules by type
SELECT module_type, COUNT(*) 
FROM blockchain_modules 
WHERE blockchain_enabled = true 
GROUP BY module_type;

-- Recent enablements
SELECT module_id, module_type, created_at 
FROM blockchain_modules 
ORDER BY created_at DESC 
LIMIT 10;

-- Failed enablements
SELECT module_id, module_type, created_at 
FROM blockchain_modules 
WHERE status = 'FAILED';
```

## Best Practices

### 1. Use Descriptive Module IDs
```javascript
// Good
{ moduleId: "fund-retirement-2024", moduleType: "FUND" }

// Bad
{ moduleId: "f1", moduleType: "FUND" }
```

### 2. Check Status Before Re-enabling
```javascript
const status = await getModuleStatus('fund-001');
if (!status.enabled) {
  await enableBlockchain({ moduleId: 'fund-001', moduleType: 'FUND' });
}
```

### 3. Handle Errors Gracefully
```javascript
try {
  const result = await enableBlockchain(request);
  console.log('Success:', result.contractAddress);
} catch (error) {
  if (error.response?.status === 400) {
    console.error('Validation error:', error.response.data.details);
  } else {
    console.error('Deployment failed:', error.message);
  }
}
```

### 4. Monitor Statistics
```javascript
const stats = await getStats();
if (stats.byStatus.FAILED > 0) {
  console.warn(`${stats.byStatus.FAILED} modules failed to enable`);
}
```

## Troubleshooting

### Module Already Enabled
**Symptom:** Response shows `alreadyEnabled: true`

**Solution:** This is expected behavior. The orchestrator returns the existing record.

### Contract Deployment Failed
**Symptom:** 500 error with "Contract deployment failed"

**Possible Causes:**
- Insufficient funds in deployer wallet
- Network connectivity issues
- Invalid constructor parameters

**Solution:** Check deployer wallet balance and network status

### Database Connection Error
**Symptom:** 500 error with database-related message

**Solution:** Verify Supabase connection in `.env` file

### Invalid Module Type
**Symptom:** 400 error with "moduleType must be one of..."

**Solution:** Use a valid module type from the supported list

## Future Enhancements

- [ ] Batch enablement for multiple modules
- [ ] Custom contract templates per module
- [ ] Rollback functionality for failed enablements
- [ ] Webhook notifications on enablement completion
- [ ] Advanced service configuration options
- [ ] Multi-chain support
- [ ] Contract upgrade management

## Support

For issues or questions:
1. Check the API documentation: `ORCHESTRATOR_API.md`
2. Review the test script: `test-orchestrator.js`
3. Check database records in `blockchain_modules` table
4. Review application logs for error details
