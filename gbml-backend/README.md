# GBML Backend - Payments Module (JRC-20)

Node.js + Express backend for GBML Payments Module using Juvidoe blockchain.

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

## API Endpoints

### Enable Payments Module
```
POST /gbml/modules/payments/enable
Body: {
  "tenantId": "tenant-001",
  "token": {
    "mode": "DEPLOY",
    "name": "Acme USD",
    "symbol": "aUSD",
    "decimals": 18,
    "initialSupply": "1000000000000000000000000",
    "treasuryAddress": "0x..."
  }
}
```

### Send Payment
```
POST /gbml/payments/send
Body: {
  "tokenAddress": "0x...",
  "to": "0x...",
  "amount": "1000000000000000000",
  "moduleId": "module-id"
}
```

### Get Token Balance
```
GET /gbml/payments/balance/:tokenAddress/:address
```

### Get Module Status
```
GET /gbml/modules/payments/:moduleId
```

## Project Structure

```
gbml-backend/
├─ src/
│  ├─ app.js                 # Express app setup
│  ├─ server.js              # Server entry point
│  ├─ routes/                # API routes
│  ├─ controllers/           # Request handlers
│  ├─ services/              # Business logic
│  ├─ blockchain/            # Blockchain integration
│  ├─ config/                # Configuration
│  └─ db/                    # Database abstraction
├─ contracts/                # Smart contracts
└─ package.json
```

## Security Notes

- Private keys are never exposed to the frontend
- All blockchain transactions are signed server-side
- Use AWS KMS / HSM in production for key management
- Implement proper authentication and authorization
- Add rate limiting and input validation

