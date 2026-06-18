# Job Board — GBML Blockchain Integration Guide

> Turn your existing web2 job board into a blockchain-powered platform with tokenized escrow payments, on-chain dispute resolution, and verifiable reputation — **without writing a single line of Solidity**.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Register the Custom Module](#3-step-1-register-the-custom-module)
4. [Step 2: Deploy Contracts On-Chain](#4-step-2-deploy-contracts-on-chain)
5. [Step 3: Generate API Keys](#5-step-3-generate-api-keys)
6. [Step 4: Integrate Job Creation](#6-step-4-integrate-job-creation)
7. [Step 5: Integrate Job Assignment](#7-step-5-integrate-job-assignment)
8. [Step 6: Integrate Job Completion & Payment Release](#8-step-6-integrate-job-completion--payment-release)
9. [Step 7: Integrate Dispute Resolution](#9-step-7-integrate-dispute-resolution)
10. [Step 8: Integrate Reputation & Ratings](#10-step-8-integrate-reputation--ratings)
11. [Step 9: Webhook / Event Handling](#11-step-9-webhook--event-handling)
12. [Frontend Dashboard](#12-frontend-dashboard)
13. [API Reference](#13-api-reference)
14. [Testing Checklist](#14-testing-checklist)

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                   Your Web2 Job Board (Existing)                    │
│  Django / Rails / Laravel / Node.js / PHP / etc.                   │
│                                                                     │
│  - User management                     ┌───────────────────────┐   │
│  - Job posting / browsing              │  GBML REST API Calls   │   │
│  - Proposal submission                 │  (via API Key Auth)    │   │
│  - Messaging                           └───────────┬───────────┘   │
│  - Existing database                               │               │
└────────────────────────────────────────────────────┼───────────────┘
                                                     │
                                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                    GBML Backend (Your Infrastructure)               │
│                                                                     │
│  POST /gbml/custom-modules        — Register module definition     │
│  POST /gbml/enable-blockchain     — Deploy contracts               │
│  POST /gbml/jobs/:moduleId/...    — Job board operations           │
│  POST /gbml/reputation/:moduleId/... — Ratings & reputation        │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │  Wallet      │  │  Settlement  │  │  Compliance (KYC/AML)   │   │
│  │  Management  │  │  Router      │  │  Hooks                  │   │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Juvidoe Blockchain (EVM)                         │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │ PlatformToken│  │ JobEscrow    │  │ ReputationLedger       │   │
│  │ (JRC-20)     │  │ (Escrow +    │  │ (Ratings + History)    │   │
│  │              │  │  Disputes)   │  │                        │   │
│  └──────────────┘  └──────────────┘  └────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Why |
|---|---|
| **Your backend calls GBML APIs** | Your web2 app never talks to the blockchain directly. GBML handles all wallet signing, gas, and transaction submission. |
| **`metadataUri` links to your existing DB** | Each blockchain job record stores a URI/ID pointing to your existing database. Your job descriptions, proposals, and messages stay where they are. |
| **Escrow holds tokens, not fiat** | Employers deposit GBML platform tokens into escrow. These can be purchased via the fiat gateway or earned on-platform. |
| **Reputation is on-chain** | Ratings are immutable and verifiable. Users can prove their reputation across platforms. |

---

## 2. Prerequisites

Before starting, ensure you have:

- **GBML backend deployed and running** (the API endpoints must be accessible to your web2 backend)
- **Admin access** to the GBML system (to register modules and generate API keys)
- **Your existing job board** can make HTTP requests with API key authentication
- **Users have blockchain wallets** (GBML can create/manage these for you)

### Environment Variables (Your Backend)

```
GBML_API_URL=https://your-gbml-instance.com/gbml
GBML_API_KEY=gbml_your_generated_api_key_here
```

---

## 3. Step 1: Register the Custom Module

Register a module definition for your job board. This tells GBML what contracts you need and how to configure them.

### Request

```bash
curl -X POST https://your-gbml-instance.com/gbml/custom-modules \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "my-job-board",
    "moduleName": "My Job Board Platform",
    "moduleType": "CUSTOM_JOB_BOARD",
    "description": "Blockchain-powered freelance job board",
    "contracts": [
      {
        "contractName": "PlatformToken",
        "contractType": "TOKEN"
      },
      {
        "contractName": "JobEscrow",
        "contractType": "JOB_ESCROW",
        "constructorParams": ["{{routerAddress}}", "{{walletAddress}}"]
      },
      {
        "contractName": "ReputationLedger",
        "contractType": "REPUTATION",
        "constructorParams": ["{{walletAddress}}"]
      }
    ],
    "services": {
      "wallet": true,
      "settlement": true,
      "conversion": false
    },
    "compliance": {
      "kycRequired": true,
      "amlRequired": true
    },
    "switchable": {
      "enabled": true,
      "analytics": true,
      "transactions": true,
      "compliance": true,
      "governance": true
    },
    "uiProperties": {
      "icon": "💼",
      "primaryColor": "#4a90d9",
      "displayName": "My Job Board"
    },
    "platformIntegrations": ["PAYMENTS", "JOB_BOARD"]
  }'
```

### Example Response

```json
{
  "success": true,
  "module": {
    "moduleId": "my-job-board",
    "moduleName": "My Job Board Platform",
    "moduleType": "CUSTOM_JOB_BOARD",
    "contracts": [ ... ],
    "enabled": true,
    "createdAt": "2026-06-16T..."
  }
}
```

---

## 4. Step 2: Deploy Contracts On-Chain

This deploys all contracts (PlatformToken, JobEscrow, ReputationLedger) to the blockchain, creates a module wallet, and binds API endpoints.

### Request

```bash
curl -X POST https://your-gbml-instance.com/gbml/enable-blockchain \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "my-job-board",
    "serviceId": "my-job-board"
  }'
```

### Example Response

```json
{
  "enabled": true,
  "moduleId": "my-job-board",
  "contractAddress": "0x...",
  "deployments": [
    {
      "contractName": "PlatformToken",
      "contractType": "TOKEN",
      "contractAddress": "0x..."
    },
    {
      "contractName": "JobEscrow",
      "contractType": "JOB_ESCROW",
      "contractAddress": "0x..."
    },
    {
      "contractName": "ReputationLedger",
      "contractType": "REPUTATION",
      "contractAddress": "0x..."
    }
  ],
  "walletAddress": "0x...",
  "jvdRouterAddress": "0x..."
}
```

**Save these contract addresses** — you may need them for verification.

---

## 5. Step 3: Generate API Keys

Your web2 backend will authenticate via API keys. Generate one:

### Request

```bash
curl -X POST https://your-gbml-instance.com/gbml/admin/api-keys \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "job-board-backend",
    "roles": ["admin", "TREASURY"],
    "permissions": {
      "moduleId": "my-job-board",
      "actions": ["create:jobs", "assign:jobs", "complete:jobs", "rate:users"]
    }
  }'
```

Store the returned `apiKey` securely (e.g., environment variable).

---

## 6. Step 4: Integrate Job Creation

When an employer posts a job on your web2 platform, call GBML to create the on-chain escrow.

### Flow

```
Employer clicks "Post Job" on your site
    │
    ▼
Your backend validates the job (title, description, budget, etc.)
    │
    ▼
Your backend stores job metadata in your existing DB → gets `jobId` in your system
    │
    ▼
Your backend calls GBML to create on-chain escrow:
    POST /gbml/jobs/my-job-board/create
    │
    ▼
GBML mints tokens from employer's wallet into escrow
    │
    ▼
GBML returns on-chain jobId + transaction hash
    │
    ▼
Your backend stores on-chain jobId alongside your internal jobId
```

### Code Example (Python)

```python
import requests, os

GBML_API = os.environ['GBML_API_URL']
API_KEY = os.environ['GBML_API_KEY']
MODULE_ID = 'my-job-board'

def create_blockchain_job(internal_job_id, employer_wallet, budget_tokens, job_title):
    """
    employer_wallet: Employer's blockchain address (e.g., '0x...')
    budget_tokens: Amount in smallest unit (e.g., 1000000000000000000 for 1 token)
    job_title: Used to create metadata URI pointing to your internal job
    """
    metadata_uri = f"https://your-job-board.com/api/jobs/{internal_job_id}"

    response = requests.post(
        f"{GBML_API}/jobs/{MODULE_ID}/create",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "employerAddress": employer_wallet,
            "budget": budget_tokens,
            "metadataUri": metadata_uri
        }
    )
    response.raise_for_status()
    data = response.json()

    # Store the on-chain jobId in your database
    update_job_record(internal_job_id, {
        "blockchain_job_id": data['jobId'],
        "escrow_tx_hash": data['txHash'],
        "escrow_status": "OPEN"
    })

    return data
```

### Data Model (Your DB)

```sql
ALTER TABLE jobs ADD COLUMN blockchain_job_id VARCHAR(255);
ALTER TABLE jobs ADD COLUMN escrow_tx_hash VARCHAR(255);
ALTER TABLE jobs ADD COLUMN escrow_status VARCHAR(50) DEFAULT 'OPEN';
ALTER TABLE jobs ADD COLUMN employer_wallet_address VARCHAR(255);
ALTER TABLE jobs ADD COLUMN freelancer_wallet_address VARCHAR(255);
```

---

## 7. Step 5: Integrate Job Assignment

When a freelancer is awarded/hired for a job, call GBML to assign them on-chain.

### Code Example

```python
def assign_blockchain_job(internal_job_id, freelancer_wallet):
    job = get_job(internal_job_id)

    response = requests.post(
        f"{GBML_API}/jobs/{MODULE_ID}/{job.blockchain_job_id}/assign",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "freelancerAddress": freelancer_wallet
        }
    )
    response.raise_for_status()

    update_job_record(internal_job_id, {
        "freelancer_wallet_address": freelancer_wallet,
        "escrow_status": "ASSIGNED"
    })
```

---

## 8. Step 6: Integrate Job Completion & Payment Release

When the employer confirms the job is done, call GBML to release escrow funds to the freelancer.

### Code Example

```python
def complete_blockchain_job(internal_job_id, employer_wallet):
    job = get_job(internal_job_id)

    response = requests.post(
        f"{GBML_API}/jobs/{MODULE_ID}/{job.blockchain_job_id}/complete",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "employerAddress": employer_wallet
        }
    )
    response.raise_for_status()

    update_job_record(internal_job_id, {
        "escrow_status": "COMPLETED",
        "completion_tx_hash": response.json()['txHash']
    })

    # Trigger your existing post-completion logic:
    # - Notify freelancer
    # - Enable rating
    # - Mark job as closed in your system
```

---

## 9. Step 7: Integrate Dispute Resolution

If an employer or freelancer raises a dispute, the on-chain escrow enters DISPUTED state. Only an admin can resolve it.

### Raise a Dispute (Either Party)

```python
def raise_dispute(internal_job_id, reason):
    job = get_job(internal_job_id)

    response = requests.post(
        f"{GBML_API}/jobs/{MODULE_ID}/{job.blockchain_job_id}/dispute",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"reason": reason}
    )
    response.raise_for_status()

    update_job_record(internal_job_id, {
        "escrow_status": "DISPUTED",
        "dispute_reason": reason
    })
```

### Resolve a Dispute (Admin Only)

```python
def resolve_dispute(internal_job_id, winner_wallet):
    """
    winner_wallet: Address of the party that should receive the escrowed funds
    """
    job = get_job(internal_job_id)

    response = requests.post(
        f"{GBML_API}/jobs/{MODULE_ID}/{job.blockchain_job_id}/resolve",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"winnerAddress": winner_wallet}
    )
    response.raise_for_status()

    update_job_record(internal_job_id, {
        "escrow_status": "RESOLVED",
        "dispute_winner": winner_wallet
    })
```

---

## 10. Step 8: Integrate Reputation & Ratings

After a job is completed, users can rate each other. Ratings are stored immutably on-chain.

### Rate a User

```python
def rate_user(target_wallet, score, review=""):
    """
    target_wallet: The user being rated (freelancer or employer)
    score: 1-5
    review: Optional text review
    """
    response = requests.post(
        f"{GBML_API}/reputation/{MODULE_ID}/rate",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "targetAddress": target_wallet,
            "score": score,
            "review": review
        }
    )
    response.raise_for_status()
    return response.json()
```

### Display Reputation on Your Site

```python
def get_user_reputation(wallet_address):
    response = requests.get(
        f"{GBML_API}/reputation/{MODULE_ID}/{wallet_address}",
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    response.raise_for_status()
    data = response.json()

    return {
        "averageScore": data['averageScore'],
        "totalRatings": data['totalRatings']
    }
```

### Show Rating History

```python
def get_rating_history(wallet_address, page=0, page_size=20):
    response = requests.get(
        f"{GBML_API}/reputation/{MODULE_ID}/{wallet_address}/ratings",
        headers={"Authorization": f"Bearer {API_KEY}"},
        params={"offset": page * page_size, "limit": page_size}
    )
    response.raise_for_status()
    return response.json()
```

---

## 11. Step 9: Webhook / Event Handling

GBML does not yet push webhooks natively. Your backend should **poll** for status changes or listen to on-chain events:

### Polling Pattern

```python
import time, requests

def poll_job_status(internal_job_id, interval_seconds=30):
    job = get_job(internal_job_id)

    while job.escrow_status not in ('COMPLETED', 'RESOLVED', 'CANCELLED'):
        response = requests.get(
            f"{GBML_API}/jobs/{MODULE_ID}/{job.blockchain_job_id}",
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        data = response.json()
        new_status = data['job']['status']

        if new_status != job.escrow_status:
            update_job_record(internal_job_id, {"escrow_status": new_status})
            notify_users(internal_job_id, new_status)
            job.escrow_status = new_status

        time.sleep(interval_seconds)
```

### Event-Driven (Advanced)

You can listen to on-chain events directly via ethers.js if you have access to the RPC endpoint:

```javascript
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://your-juvidoe-rpc.com');

const escrowABI = [ /* ABI from the JobBoardEscrow artifact */ ];
const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, provider);

escrow.on('JobCreated', (jobId, employer, budget, metadataUri) => {
    console.log(`Job ${jobId} created by ${employer}`);
    // Update your database
});

escrow.on('JobCompleted', (jobId, freelancer, amount) => {
    console.log(`Job ${jobId} completed, ${amount} released to ${freelancer}`);
    // Trigger notifications
});
```

---

## 12. Frontend Dashboard

The GBML UI includes a **Dynamic Dashboard** that automatically renders job board widgets when a module has `hasJobEscrow` capability. Your admin users can:

1. Navigate to the GBML UI → Dynamic Modules tab
2. Select your "My Job Board" module
3. See a dashboard with:
   - **Stats cards**: Total jobs, escrow balance, total ratings
   - **Job lookup**: Search by on-chain job ID
   - **Quick actions**: Links to API endpoints

### Embedding in Your Site

You can embed the dashboard or show key metrics:

```html
<!-- Fetch stats from your backend proxy -->
<div id="job-board-stats">
  <div>Total Jobs: <span id="total-jobs"></span></div>
  <div>Escrow Balance: <span id="escrow-balance"></span></div>
  <div>Total Ratings: <span id="total-ratings"></span></div>
</div>

<script>
fetch('/api/gbml-proxy/jobs/my-job-board/stats')
  .then(r => r.json())
  .then(data => {
    document.getElementById('total-jobs').textContent = data.totalJobs;
    document.getElementById('escrow-balance').textContent = data.escrowBalance;
    document.getElementById('total-ratings').textContent = data.totalRatings;
  });
</script>
```

---

## 13. API Reference

### Job Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/gbml/jobs/:moduleId/create` | Create job + deposit escrow | admin, TREASURY |
| `POST` | `/gbml/jobs/:moduleId/:jobId/assign` | Assign freelancer | authenticated |
| `POST` | `/gbml/jobs/:moduleId/:jobId/complete` | Complete job, release funds | admin, TREASURY |
| `POST` | `/gbml/jobs/:moduleId/:jobId/cancel` | Cancel job, refund employer | admin, TREASURY |
| `POST` | `/gbml/jobs/:moduleId/:jobId/dispute` | Raise dispute | authenticated |
| `POST` | `/gbml/jobs/:moduleId/:jobId/resolve` | Resolve dispute (admin) | admin |
| `GET` | `/gbml/jobs/:moduleId/:jobId` | Get job details | authenticated |
| `GET` | `/gbml/jobs/:moduleId/stats` | Module statistics | authenticated |
| `GET` | `/gbml/jobs/:moduleId/escrow-balance` | Total escrowed | authenticated |

### Reputation Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/gbml/reputation/:moduleId/rate` | Rate a user (1-5) | authenticated |
| `POST` | `/gbml/reputation/:moduleId/batch-rate` | Batch rate users | admin |
| `GET` | `/gbml/reputation/:moduleId/:address` | Get user reputation | authenticated |
| `GET` | `/gbml/reputation/:moduleId/:address/ratings` | Paginated rating history | authenticated |

### Common Request Headers

```http
Authorization: Bearer <your-api-key-or-jwt>
Content-Type: application/json
```

### Error Response Format

```json
{
  "error": "Failed to assign job",
  "message": "Job 5 is not open. Current status: 2"
}
```

**HTTP Status Codes:**
- `200` — Success
- `201` — Created (job created)
- `400` — Bad request (missing fields)
- `403` — Forbidden (insufficient permissions)
- `404` — Not found
- `409` — Conflict (invalid state transition)
- `500` — Internal error

---

## 14. Testing Checklist

Use this checklist to verify your integration works end-to-end:

### Setup
- [ ] Module registered (`POST /gbml/custom-modules`)
- [ ] Contracts deployed (`POST /gbml/enable-blockchain`)
- [ ] API key generated and stored

### Job Lifecycle
- [ ] Employer can create a job with tokens in escrow
- [ ] Freelancer can be assigned to an OPEN job
- [ ] Employer cannot assign themselves
- [ ] Job completion releases funds to freelancer
- [ ] Cancelling an OPEN job refunds the employer
- [ ] Cancelling an ASSIGNED job refunds the employer

### Disputes
- [ ] Employer can raise a dispute on ASSIGNED or COMPLETED jobs
- [ ] Freelancer can raise a dispute on ASSIGNED or COMPLETED jobs
- [ ] Admin can resolve a dispute, sending funds to the winner
- [ ] Non-parties cannot raise disputes

### Reputation
- [ ] User can rate another user (1-5)
- [ ] Self-rating is rejected
- [ ] Reputation score updates correctly
- [ ] Rating history is paginated and accessible

### Error Handling
- [ ] Your backend handles 4xx errors gracefully
- [ ] Your backend handles 5xx errors with retry logic
- [ ] Token balance checks prevent overspending

---

## Quickstart Summary

```bash
# 1. Register
curl -X POST /gbml/custom-modules -d @job-board-module.json

# 2. Deploy
curl -X POST /gbml/enable-blockchain -d '{"moduleId":"my-job-board"}'

# 3. Generate API key
curl -X POST /gbml/admin/api-keys -d '{"label":"backend","roles":["admin"]}'

# 4. Create a job (from your backend)
curl -X POST /gbml/jobs/my-job-board/create \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"employerAddress":"0x...","budget":"1000000000000000000","metadataUri":"https://..."}'

# 5. Assign a freelancer
curl -X POST /gbml/jobs/my-job-board/1/assign \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"freelancerAddress":"0x..."}'

# 6. Complete the job
curl -X POST /gbml/jobs/my-job-board/1/complete \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"employerAddress":"0x..."}'

# 7. Rate the freelancer
curl -X POST /gbml/reputation/my-job-board/rate \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"targetAddress":"0x...","score":5,"review":"Great work!"}'
```
