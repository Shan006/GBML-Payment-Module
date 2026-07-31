# Vercel Deployment Guide

This guide covers deploying the GBML Backend to Vercel.

## Prerequisites

1. A Vercel account
2. Supabase project configured
3. Juvidoe blockchain RPC endpoint
4. Blockchain wallet private keys

## Required Environment Variables

Set these in your Vercel project settings under **Settings > Environment Variables**:

### Blockchain Configuration
- `JUVIDOE_RPC_URL` - Your Juvidoe RPC endpoint (e.g., `https://mainnet-rpc.jvdegcr.com`)
- `TREASURY_PRIVATE_KEY` - Private key for treasury wallet
- `DEPLOYER_PRIVATE_KEY` - Private key for contract deployment (optional, defaults to TREASURY_PRIVATE_KEY)

### Database Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Payment Processing
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

### Server Configuration
- `PORT` - Server port (default: 3000, Vercel overrides this)
- `NODE_ENV` - Set to `production` for Vercel

## Deployment Steps

### 1. Push to Git

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your repository
4. Select the `gbml-backend` folder as root directory

### 3. Configure Build Settings

Vercel will automatically detect the Node.js project. Configure:

- **Framework Preset**: Node.js
- **Build Command**: `npm install` (or leave empty)
- **Output Directory**: `.` (root)
- **Install Command**: `npm install`

### 4. Set Environment Variables

Add all the required environment variables from the list above in the Vercel project settings.

### 5. Deploy

Click "Deploy". Vercel will build and deploy your backend.

## Important Notes

### Serverless Compatibility

The backend has been configured for Vercel's serverless environment:

- **API Handler**: Located at `api/index.js` for Vercel compatibility
- **Local Development**: Use `npm start` for local development
- **Production**: Vercel uses the serverless handler automatically

### JVD Router Initialization

The JVD Router is initialized lazily in the serverless environment to avoid startup timeouts. The first request will trigger router initialization.

### Database Migrations

Run database migrations manually before deploying:

```bash
# Run migrations against your Supabase project
psql -h your-project.supabase.co -U postgres -d postgres -f migration_blockchain_modules.sql
psql -h your-project.supabase.co -U postgres -d postgres -f migration_contracts.sql
psql -h your-project.supabase.co -U postgres -d postgres -f migration_wallets.sql
psql -h your-project.supabase.co -U postgres -d postgres -f migration_settlements.sql
```

### Limitations

- **No Persistent Server**: Vercel uses serverless functions, so there's no persistent server process
- **Cold Starts**: First requests may be slower due to cold starts
- **Execution Time**: Vercel functions have a maximum execution time (10s for Hobby, 60s for Pro)
- **Blockchain Operations**: Long-running blockchain operations may timeout

### Alternative for Blockchain Operations

For blockchain-heavy operations, consider:
1. Using a dedicated server (AWS, DigitalOcean, etc.)
2. Using Vercel's Edge Functions for lighter operations
3. Implementing queue-based processing for heavy operations

## Troubleshooting

### Build Failures

- Check that all dependencies are in `package.json`
- Ensure Node.js version compatibility (Vercel uses Node.js 18.x by default)
- Verify environment variables are set correctly

### Runtime Errors

- Check Vercel function logs for specific error messages
- Verify database connectivity from Vercel's network
- Ensure blockchain RPC is accessible from Vercel's infrastructure

### Environment Variable Issues

- Ensure variables are set in the correct environment (Production, Preview, Development)
- Check for typos in variable names
- Verify sensitive values are properly escaped

## Monitoring

Monitor your deployment using:
- **Vercel Analytics**: Request metrics and performance
- **Vercel Logs**: Real-time logs and error tracking
- **Supabase Dashboard**: Database performance and queries

## Security

- Never commit `.env` files to version control
- Use Vercel's environment variable management for secrets
- Rotate private keys regularly
- Enable Vercel's protection features (DDoS, etc.)
- Use API keys for authentication

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **GBML Backend**: Check project README and documentation