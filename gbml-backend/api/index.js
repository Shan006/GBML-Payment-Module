import app from "../src/app.js";
import { RouterService } from "../src/settlements/router.service.js";
import { ContractsService } from "../src/contracts/contracts.service.js";
import { config } from "../src/config/env.js";
import { supabase } from "../src/config/supabase.js";
import { ethers } from "ethers";

// Initialize JVD Router for serverless environment
let routerInitialized = false;
let initializationError = null;

async function initializeRouter() {
  if (!routerInitialized && !initializationError) {
    try {
      console.log('[Vercel] Initializing JVD Router...');
      
      // First check if router exists in database
      const contractsService = new ContractsService();
      const existingRouter = await contractsService.getContractByServiceId('JVD_ROUTER');
      
      if (existingRouter && existingRouter.contractAddress) {
        console.log('[Vercel] JVD Router found in database:', existingRouter.contractAddress);
        routerInitialized = true;
        console.log('[Vercel] JVD Router initialized successfully');
        return;
      }
      
      // If not found, try to deploy
      console.log('[Vercel] JVD Router not found, attempting deployment...');
      const routerService = new RouterService();
      const routerAddress = await routerService.checkAndDeployRouter();
      
      if (routerAddress) {
        routerInitialized = true;
        console.log('[Vercel] JVD Router deployed and initialized:', routerAddress);
      } else {
        throw new Error('JVD Router deployment returned null address');
      }
    } catch (error) {
      console.error('[Vercel] Failed to initialize JVD Router:', error.message);
      initializationError = error.message;
      // Don't throw - allow the app to continue, but individual requests will fail
    }
  }
}

// Middleware to ensure router is initialized before handling requests
app.use(async (req, res, next) => {
  await initializeRouter();
  
  // If router failed to initialize, return helpful error for blockchain operations
  if (initializationError && req.path.includes('blockchain')) {
    return res.status(503).json({
      error: 'JVD Router initialization failed',
      message: 'The JVD Router contract is not available. Please contact administrator to register the JVD Router in the database.',
      details: initializationError
    });
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    routerInitialized,
    routerError: initializationError
  });
});

// Debug endpoints for troubleshooting Vercel issues
app.get('/debug/env', (req, res) => {
  res.json({
    hasRpcUrl: !!process.env.JUVIDOE_RPC_URL,
    hasTreasuryKey: !!process.env.TREASURY_PRIVATE_KEY,
    hasDeployerKey: !!process.env.DEPLOYER_PRIVATE_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV
  });
});

app.get('/debug/db', async (req, res) => {
  try {
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

app.get('/debug/rpc', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(config.juvidoeRpcUrl);
    const network = await provider.getNetwork();
    
    res.json({
      success: true,
      chainId: network.chainId.toString(),
      networkName: network.name,
      message: 'RPC connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/debug/router', async (req, res) => {
  try {
    const contractsService = new ContractsService();
    const router = await contractsService.getContractByServiceId('JVD_ROUTER');
    
    if (router) {
      res.json({
        success: true,
        routerAddress: router.contractAddress,
        message: 'JVD Router found in database'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'JVD Router not found in database'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Vercel serverless function handler
export default app;