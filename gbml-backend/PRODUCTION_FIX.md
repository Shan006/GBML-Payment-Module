# Production JVD Router Fix - Emergency Guide

## Problem
Your Vercel deployment is returning 500 errors because the JVD Router entry was deleted from the production database.

## Quick Diagnosis
The error "Error enabling blockchain: F" indicates that the blockchain enablement process is failing, most likely because:
- JVD Router entry is missing from the `contracts` table
- The system cannot find or deploy the JVD Router

## Immediate Solutions

### Solution 1: Manual Database Registration (FASTEST)

1. **Access your Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Create a new query

2. **Check if JVD Router exists**
   ```sql
   SELECT * FROM public.contracts WHERE service_id = 'JVD_ROUTER';
   ```

3. **If missing, insert the JVD Router entry**
   ```sql
   -- Insert JVD Router with your actual deployed address
   INSERT INTO public.contracts (
       id,
       service_id,
       contract_name,
       contract_type,
       contract_address,
       abi,
       created_at
   ) VALUES (
       gen_random_uuid(),
       'JVD_ROUTER',
       'JvdRouter',
       'JVD_ROUTER',
       'YOUR_DEPLOYED_JVD_ROUTER_ADDRESS', -- Replace this!
       'YOUR_CONTRACT_ABI'::jsonb, -- Replace this!
       NOW()
   );
   ```

4. **Get the correct values:**
   - **Contract Address**: Check your blockchain explorer or deployment records for the JVD Router address
   - **Contract ABI**: Copy the full ABI from `artifacts/contracts/JvdEgcrRouter.sol/JvdEgcrRouter.json`

### Solution 2: Deploy New JVD Router (If you don't have the address)

1. **Deploy a new JVD Router contract**
   ```bash
   cd gbml-backend
   npx hardhat run scripts/deploy-jvd-router.js --network your-network
   ```

2. **The script will automatically:**
   - Deploy the JVD Router contract
   - Register it in the database
   - Provide you with the contract address

3. **Update your environment if needed**

### Solution 3: Use the API to Re-register (If you have the address)

Create a temporary API endpoint to re-register the JVD Router:

```javascript
// Add this temporarily to your enablement routes
router.post('/admin/register-jvd-router', async (req, res) => {
  const { contractAddress, abi } = req.body;
  
  try {
    const contractsService = new ContractsService();
    const contractDto = new CreateContractDto({
      serviceId: 'JVD_ROUTER',
      contractName: 'JvdRouter',
      contractType: 'JVD_ROUTER',
      contractAddress,
      abi
    });
    
    await contractsService.createContract(contractDto);
    res.json({ success: true, message: 'JVD Router registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Verification Steps

After applying any fix:

1. **Check the health endpoint**
   ```bash
   curl https://your-vercel-url.vercel.app/health
   ```

2. **Look for:**
   ```json
   {
     "status": "ok",
     "routerInitialized": true,
     "routerError": null
   }
   ```

3. **Test blockchain enablement**
   - Try enabling a test module
   - Check if the 500 error is resolved

## Preventing Future Issues

### 1. Database Protection
Add database constraints to prevent accidental deletion:
```sql
-- Add a check to prevent deletion of critical contracts
CREATE OR REPLACE FUNCTION prevent_critical_contract_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.service_id = 'JVD_ROUTER' THEN
    RAISE EXCEPTION 'Cannot delete JVD Router contract';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_jvd_router
BEFORE DELETE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION prevent_critical_contract_deletion();
```

### 2. Monitoring
Set up alerts for:
- Missing JVD Router in database
- Failed JVD Router initialization
- 500 errors on blockchain endpoints

### 3. Backup Strategy
Regular backups of the contracts table:
```sql
-- Backup contracts table
CREATE TABLE contracts_backup AS SELECT * FROM contracts;
```

## Getting Your JVD Router Details

If you don't have your JVD Router address:

1. **Check deployment logs** in Vercel or your deployment system
2. **Check blockchain explorer** for transactions from your deployer address
3. **Look at previous database backups** for the contracts table
4. **Deploy a new one** using the provided script

## Current System Behavior

With the updated `api/index.js`:
- The system now provides better error messages
- Health endpoint shows router initialization status
- Blockchain operations fail gracefully with helpful error messages
- 503 errors instead of 500 errors when router is missing

## Emergency Contact

If you need immediate help:
1. Check Vercel logs for specific error details
2. Verify Supabase database connectivity
3. Ensure environment variables are set correctly in Vercel
4. Check blockchain RPC accessibility from Vercel's network