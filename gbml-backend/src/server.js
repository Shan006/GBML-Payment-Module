import app from "./app.js";
import { config } from "./config/env.js";
import { RouterService } from "./settlements/router.service.js";

const PORT = config.port;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`GBML Backend server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Juvidoe RPC: ${config.juvidoeRpcUrl}`);

    // Check and auto-deploy JVD Router if not registered
    console.log('[Startup] Verification of JVD Router settlement contract registration...');
    const routerService = new RouterService();
    await routerService.checkAndDeployRouter();
  });
}

// For Vercel serverless deployment
export default app;


