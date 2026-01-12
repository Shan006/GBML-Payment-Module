# GBML Payments Module (JRC-20)

Complete implementation of the Payments Module using JRC-20 tokens on the Juvidoe blockchain.

## Architecture

```
React (Vite) Frontend
  |
  | REST API (HTTP)
  v
Node.js + Express Backend
  |
  | ethers.js
  v
Juvidoe Blockchain
  ├─ JRC-20 Contract
  └─ JVD Router
```

**Important Rule:** React never talks to blockchain directly. Only the GBML backend signs and sends transactions.

## Project Structure

```
.
├── gbml-backend/          # Node.js + Express backend
│   ├── src/
│   │   ├── app.js         # Express app setup
│   │   ├── server.js      # Server entry point
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── blockchain/    # Blockchain integration
│   │   ├── config/        # Configuration
│   │   └── db/            # Database abstraction
│   ├── contracts/         # Smart contracts (Solidity)
│   └── package.json
│
└── gbml-ui/              # React frontend (Vite)
    ├── src/
    │   ├── components/    # React components
    │   ├── App.jsx        # Main app component
    │   └── main.jsx       # Entry point
    └── package.json
```

## Quick Start

### 1. Backend Setup

```bash
cd gbml-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - JUVIDOE_RPC_URL: Your Juvidoe RPC endpoint
# - TREASURY_PRIVATE_KEY: Private key for treasury wallet
# - PORT: Server port (default: 3000)

# Compile JRC-20 contract (see CONTRACT_COMPILATION.md)
# Update src/blockchain/contracts/JRC20.json with compiled bytecode

# Start server
npm start
# or for development with auto-reload
npm run dev
```

### 2. Frontend Setup

```bash
cd gbml-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port).
The backend should be running at `http://localhost:3000`.

## Features

### Backend API

- **Enable Payments Module**: Deploy or attach to a JRC-20 token
- **Send Payment**: Transfer JRC-20 tokens
- **Get Balance**: Check token balance for an address
- **Module Status**: Get module information
- **Fiat Gateway**: Convert Fiat (USD/EUR) to tokens via Stripe

### Frontend

- **Enable Payments**: Deploy a new JRC-20 token contract
- **Send Payment**: Send JRC-20 tokens to any address
- **Fiat Gateway**: Buy tokens using credit card (USD/EUR)
- **Transaction Tracking**: View transaction hashes and status

## API Endpoints

### Enable Payments Module
```
POST /gbml/modules/payments/enable
Content-Type: application/json

{
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
Content-Type: application/json

{
  "tokenAddress": "0x...",
  "to": "0x...",
  "amount": "1000000000000000000",
  "moduleId": "module-id"
}
```

### Fiat Gateway (USD/EUR)
```
POST /gbml/fiat/payment/create
Content-Type: application/json

{
  "token": "aUSD",
  "currency": "USD",
  "amount": 100,
  "recipientAddress": "0x..."
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

## Security Notes

⚠️ **Important Security Considerations:**

1. **Private Keys**: Never expose private keys to the frontend. All transactions are signed server-side.
2. **Environment Variables**: Never commit `.env` files to version control.
3. **Production**: Use AWS KMS / HSM for key management in production.
4. **Authentication**: Implement proper authentication and authorization before production use.
5. **Rate Limiting**: Add rate limiting and input validation.
6. **HTTPS**: Always use HTTPS in production.

## Development

### Contract Compilation

Before deploying contracts, you need to compile the JRC-20 contract. See `gbml-backend/CONTRACT_COMPILATION.md` for details.

### Testing

1. Start the backend server
2. Start the frontend development server
3. Open the frontend in your browser
4. Enable payments module
5. Send test payments

## Technology Stack

- **Frontend**: React 18, Vite, Axios
- **Backend**: Node.js, Express, ethers.js v6
- **Blockchain**: Juvidoe (EVM-compatible)
- **Smart Contracts**: Solidity 0.8.20

## License

MIT

