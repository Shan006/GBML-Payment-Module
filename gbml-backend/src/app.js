import express from "express";
import cors from "cors";
import { globalLimiter, deployLimiter } from "./middleware/rate-limiter.js";
import paymentsRoutes from "./routes/payments.routes.js";
import fiatRoutes from "./routes/fiat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import disbursementRoutes from "./routes/disbursement.routes.js";
import apiKeyRoutes from "./routes/api-key.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import contractsRoutes from "./contracts/contracts.routes.js";
import deploymentRoutes from "./deployment/deployment.routes.js";
import enablementRoutes from "./enablement/enablement.routes.js";
import settlementsRoutes from "./settlements/settlements.routes.js";
import walletsRoutes from "./wallets/wallets.routes.js";
import { setupCustomModuleRoutes } from "./enablement/module-registry.routes.js";
import { authenticateApiKey } from "./middleware/api-key.js";

const app = express();

// Global rate limiter
app.use(globalLimiter);

// Middleware
app.use(cors());
app.use(authenticateApiKey);

// Special parser for Stripe webhooks (need raw body)
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.includes('/fiat/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/gbml", paymentsRoutes);
app.use("/gbml", fiatRoutes);
app.use("/gbml", adminRoutes);
app.use("/gbml", disbursementRoutes);
app.use("/gbml", apiKeyRoutes);

// Contract Registry routes
app.use("/contracts", contractsRoutes);
app.use("/gbml/contracts", contractsRoutes);

// Dynamic Contract Deployment Engine routes (rate limited)
app.use("/deploy", deployLimiter, deploymentRoutes);
app.use("/gbml/deploy", deployLimiter, deploymentRoutes);

// Blockchain Enablement Service routes (rate limited)
app.use("/enable-blockchain", deployLimiter, enablementRoutes);
app.use("/gbml/enable-blockchain", deployLimiter, enablementRoutes);

// Blockchain Modules Management routes
app.use("/blockchain-modules", enablementRoutes);
app.use("/gbml/blockchain-modules", enablementRoutes);

// JVD Router / Settlement Layer routes
app.use("/settlements", settlementsRoutes);
app.use("/gbml/settlements", settlementsRoutes);

// Wallet Module routes
app.use("/wallets", walletsRoutes);
app.use("/gbml/wallets", walletsRoutes);

// Custom Module Registry routes
setupCustomModuleRoutes(app, deployLimiter);

// Job Board routes
app.use("/gbml", jobsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
