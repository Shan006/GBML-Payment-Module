# Vercel 500 Error - Troubleshooting Guide

## Diagnosis Results

✅ **Database**: JVD Router is present and correct in your production database
✅ **Local Tests**: All tests pass locally
❌ **Vercel**: 500 errors on production

This confirms the issue is **Vercel-specific**, not a database issue.

## Most Likely Causes

### 1. Environment Variables Missing in Vercel (Most Common)

**Check your Vercel environment variables:**

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Verify ALL these variables are set for **Production**:

```
JUVIDOE_RPC_URL=https://mainnet-rpc.jvdegcr.com
TREASURY_PRIVATE_KEY=your_private_key_here
DEPLOYER_PRIVATE_KEY=your_private_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

**Critical:** Make sure variables are set for the **Production** environment, not just Preview/Development.

### 2. Blockchain RPC Not Accessible from Vercel

Vercel's network may not be able to reach your blockchain RPC.

**Test this:**
1. Check if your RPC provider allows requests from Vercel's IP ranges
2. Some RPC providers have IP whitelisting
3. Try using a public RPC endpoint for testing

**Solution:** Use a different RPC endpoint that's accessible from anywhere:
- Infura: `https://mainnet.infura.io/v3/YOUR_KEY`
- Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`
- Cloudflare: `https://cloudflare-eth.com`

### 3. Vercel Timeout Limits

Vercel functions have strict timeout limits:
- **Hobby Plan**: 10 seconds
- **Pro Plan**: 60 seconds

Blockchain operations (especially contract deployments) can exceed these limits.

**Solution:** Use the enhanced error handling in the updated `api/index.js` and consider:
- Moving heavy blockchain operations to a dedicated server
- Using queue-based processing
- Implementing timeout-aware operations

### 4. Database Connection Pooling

Vercel serverless functions can overwhelm database connections.

**Solution:** Ensure your Supabase connection is properly configured for serverless.

## Immediate Troubleshooting Steps

### Step 1: Check Vercel Logs

1. Go to your Vercel project dashboard
2. Navigate to **Deployments**
3. Click on your latest production deployment
4. View **Function Logs** for specific error messages

### Step 2: Test Health Endpoint

Test the health endpoint to see what's failing:
```bash
curl https://your-vercel-url.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "routerInitialized": true,
  "routerError": null
}
```

If you get errors, this will tell you exactly what's failing.

### Step 3: Verify Environment Variables

Create a test endpoint to check environment variables:

```javascript
// Add temporarily to api/index.js
app.get('/debug/env', (req, res) => {
  res.json({
    hasRpcUrl: !!process.env.JUVIDOE_RPC_URL,
    hasTreasuryKey: !!process.env.TREASURY_PRIVATE_KEY,
    hasDeployerKey: !!process.env.DEPLOYER_PRIVATE_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
});
```

Then test: `curl https://your-vercel-url.vercel.app/debug/env`

### Step 4: Test Database Connection

Check if Vercel can reach your Supabase:

```javascript
// Add temporarily to api/index.js
app.get('/debug/db', async (req, res) => {
  try {
    const { supabase } = await import('../src/config/supabase.js');
    const { data, error } = await supabase.from('contracts').select('count').single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      count: data.count,
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Step 5: Test Blockchain RPC Connection

```javascript
// Add temporarily to api/index.js
app.get('/debug/rpc', async (req, res) => {
  try {
    const { ethers } = await import('ethers');
    const { config } = await import('../src/config/env.js');
    
    const provider = new ethers.JsonRpcProvider(config.juvidoeRpcUrl);
    const network = await provider.getNetwork();
    
    res.json({
      success: true,
      chainId: network.chainId.toString(),
      message: 'RPC connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Alternative Deployment Solutions

If Vercel continues to have issues with blockchain operations:

### Option 1: Use a Dedicated Server

Deploy the backend to a traditional VPS:
- DigitalOcean
- AWS EC2
- Heroku
- Railway

This avoids Vercel's timeout limitations.

### Option 2: Hybrid Approach

- Keep the frontend on Vercel
- Move blockchain operations to a dedicated API server
- Use Vercel only for lightweight operations

### Option 3: Use Vercel Edge Functions

For simpler operations, Vercel Edge Functions have different limits and may work better.

## Quick Fix Checklist

Use this checklist to systematically identify the issue:

- [ ] Check Vercel logs for specific error messages
- [ ] Verify ALL environment variables in Vercel (Production)
- [ ] Test health endpoint: `/health`
- [ ] Test database connection: `/debug/db`
- [ ] Test RPC connection: `/debug/rpc`
- [ ] Check if RPC provider allows Vercel IPs
- [ ] Consider timeout limits for blockchain operations
- [ ] Test with a different RPC endpoint

## Next Steps

1. **Check Vercel logs** - This will give you the exact error
2. **Verify environment variables** - Most common issue
3. **Test the debug endpoints** - Isolate the problem
4. **Consider alternative deployment** - If Vercel limitations are the issue

The local tests confirm your code is correct. The issue is definitely in the Vercel configuration or environment.