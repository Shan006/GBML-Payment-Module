# GBML Orchestrator - Quick Start Guide

## 🚀 Enable Blockchain in 3 Steps

### Step 1: Start the Server

```bash
cd gbml-backend
npm install
npm start
```

### Step 2: Enable Blockchain for Your Module

```bash
curl -X POST http://localhost:3000/gbml/enable-blockchain \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "moduleId": "fund-001",
    "moduleType": "FUND"
  }'
```

### Step 3: Verify Enablement

```bash
curl http://localhost:3000/gbml/blockchain-modules/fund-001 \
  -H "x-api-key: your-api-key"
```

That's it! Your module is now blockchain-enabled. 🎉

## What Just Happened?

The orchestrator automatically:

1. ✅ **Deployed** a JRC20 token contract
2. ✅ **Registered** the contract in the registry
3. ✅ **Enabled** wallet support
4. ✅ **Configured** settlement layer
5. ✅ **Activated** fiat conversion (for payment modules)

## Module Types

Choose the right module type for your use case:

| Module Type | Use Case | Contract | Services |
|-------------|----------|----------|----------|
| `FUND` | Fund management | JRC20 Token | Wallet + Settlement + Conversion |
| `TREASURY` | Treasury operations | Treasury | Wallet + Settlement |
| `GRANT` | Grant distribution | JRC20 Token | Wallet |
| `PAYMENT` | Payment processing | JRC20 Token | Wallet + Settlement + Conversion |
| `TOKEN` | Generic tokens | JRC20 Token | Wallet |
| `NFT` | Non-fungible tokens | JRC721 NFT | Wallet |
| `ROUTER` | Settlement routing | Router | Wallet + Settlement |
| `REGISTRY` | Registry management | JRC20 Token | Wallet |

## Common Operations

### List All Enabled Modules

```bash
curl http://localhost:3000/gbml/blockchain-modules \
  -H "x-api-key: your-api-key"
```

### Filter by Module Type

```bash
curl "http://localhost:3000/gbml/blockchain-modules?moduleType=FUND" \
  -H "x-api-key: your-api-key"
```

### Get Statistics

```bash
curl http://localhost:3000/gbml/blockchain-modules/stats \
  -H "x-api-key: your-api-key"
```

### Update Services

```bash
curl -X PATCH http://localhost:3000/gbml/blockchain-modules/fund-001/services \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "settlementEnabled": true,
    "conversionEnabled": false
  }'
```

### Disable Blockchain

```bash
curl -X POST http://localhost:3000/gbml/blockchain-modules/fund-001/disable \
  -H "x-api-key: your-api-key"
```

## JavaScript/Node.js Example

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
async function enableBlockchain() {
  const response = await client.post('/enable-blockchain', {
    moduleId: 'fund-001',
    moduleType: 'FUND'
  });
  
  console.log('✅ Blockchain enabled!');
  console.log('Contract Address:', response.data.contractAddress);
  console.log('Services:', response.data.services);
  
  return response.data;
}

// Check status
async function checkStatus(moduleId) {
  const response = await client.get(`/blockchain-modules/${moduleId}`);
  
  console.log('Module Status:', response.data.status);
  console.log('Enabled:', response.data.enabled);
  console.log('Services:', response.data.services);
  
  return response.data;
}

// List all modules
async function listModules() {
  const response = await client.get('/blockchain-modules');
  
  console.log(`Found ${response.data.count} modules`);
  response.data.modules.forEach(module => {
    console.log(`- ${module.moduleId} (${module.moduleType}): ${module.contractAddress}`);
  });
  
  return response.data;
}

// Run example
async function main() {
  await enableBlockchain();
  await checkStatus('fund-001');
  await listModules();
}

main();
```

## Python Example

```python
import requests

BASE_URL = 'http://localhost:3000/gbml'
API_KEY = 'your-api-key'

headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
}

# Enable blockchain
def enable_blockchain(module_id, module_type):
    response = requests.post(
        f'{BASE_URL}/enable-blockchain',
        headers=headers,
        json={
            'moduleId': module_id,
            'moduleType': module_type
        }
    )
    
    data = response.json()
    print(f"✅ Blockchain enabled!")
    print(f"Contract Address: {data['contractAddress']}")
    print(f"Services: {data['services']}")
    
    return data

# Check status
def check_status(module_id):
    response = requests.get(
        f'{BASE_URL}/blockchain-modules/{module_id}',
        headers=headers
    )
    
    data = response.json()
    print(f"Module Status: {data['status']}")
    print(f"Enabled: {data['enabled']}")
    print(f"Services: {data['services']}")
    
    return data

# List all modules
def list_modules():
    response = requests.get(
        f'{BASE_URL}/blockchain-modules',
        headers=headers
    )
    
    data = response.json()
    print(f"Found {data['count']} modules")
    
    for module in data['modules']:
        print(f"- {module['moduleId']} ({module['moduleType']}): {module['contractAddress']}")
    
    return data

# Run example
if __name__ == '__main__':
    enable_blockchain('fund-001', 'FUND')
    check_status('fund-001')
    list_modules()
```

## Testing

Run the comprehensive test suite:

```bash
node test-orchestrator.js
```

This will test all orchestrator functionality including:
- Enabling blockchain for different module types
- Checking module status
- Listing and filtering modules
- Getting statistics
- Updating services

## Troubleshooting

### "Validation failed" Error

**Problem:** Invalid request parameters

**Solution:** Check that:
- `moduleId` is a non-empty string
- `moduleType` is one of the valid types (FUND, TREASURY, etc.)

### "Contract deployment failed" Error

**Problem:** Blockchain deployment issue

**Solution:** Check that:
- RPC URL is correct in `.env`
- Deployer wallet has sufficient funds
- Network is accessible

### "Module already enabled" Response

**Problem:** Module was previously enabled

**Solution:** This is expected behavior. The orchestrator returns the existing record. To re-enable, first disable the module:

```bash
curl -X POST http://localhost:3000/gbml/blockchain-modules/fund-001/disable \
  -H "x-api-key: your-api-key"
```

## Next Steps

1. **Read the full API documentation:** [ORCHESTRATOR_API.md](./ORCHESTRATOR_API.md)
2. **Explore the architecture:** [src/enablement/README.md](./src/enablement/README.md)
3. **Review the implementation spec:** [BLOCKCHAIN_ORCHESTRATOR_IMPLEMENTATION_PART1.md](../BLOCKCHAIN_ORCHESTRATOR_IMPLEMENTATION_PART1.md)
4. **Check the database schema:** [migration_blockchain_modules_enhanced.sql](./migration_blockchain_modules_enhanced.sql)

## Support

For issues or questions:
- Check the logs in the console
- Review the database records in `blockchain_modules` table
- Verify your `.env` configuration
- Test with the provided test script

## Benefits Recap

✅ **5 Steps → 1 API Call** - Simplified enablement process

✅ **Automatic Configuration** - Smart defaults based on module type

✅ **Consistent Setup** - Standardized across all modules

✅ **Error Handling** - Graceful failure with status tracking

✅ **Audit Trail** - Complete enablement history

✅ **Flexible Services** - Enable/disable services as needed

---

**Ready to enable blockchain for your modules? Start with Step 1 above!** 🚀
