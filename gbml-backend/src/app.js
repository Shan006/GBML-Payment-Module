import express from "express";
import cors from "cors";
import paymentsRoutes from "./routes/payments.routes.js";
import fiatRoutes from "./routes/fiat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import disbursementRoutes from "./routes/disbursement.routes.js";
import apiKeyRoutes from "./routes/api-key.routes.js";
import contractsRoutes from "./contracts/contracts.routes.js";
import deploymentRoutes from "./deployment/deployment.routes.js";
import enablementRoutes from "./enablement/enablement.routes.js";
import settlementsRoutes from "./settlements/settlements.routes.js";
import walletsRoutes from "./wallets/wallets.routes.js";
import { authenticateApiKey } from "./middleware/api-key.js";





const app = express();

// Middleware
app.use(cors());
app.use(authenticateApiKey); // Global API Key authentication

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
// Available as /contracts/* (per spec) and /gbml/contracts/* (for consistency)
app.use("/contracts", contractsRoutes);
app.use("/gbml/contracts", contractsRoutes);

// Dynamic Contract Deployment Engine routes
// Available as /deploy (per spec) and /gbml/deploy (for consistency)
app.use("/deploy", deploymentRoutes);
app.use("/gbml/deploy", deploymentRoutes);

// Blockchain Enablement Service routes
// Available as /enable-blockchain (per spec) and /gbml/enable-blockchain (for consistency)
app.use("/enable-blockchain", enablementRoutes);
app.use("/gbml/enable-blockchain", enablementRoutes);

// Blockchain Modules Management routes
// Available as /blockchain-modules and /gbml/blockchain-modules
app.use("/blockchain-modules", enablementRoutes);
app.use("/gbml/blockchain-modules", enablementRoutes);

// JVD Router / Settlement Layer routes
// Available as /settlements (per spec) and /gbml/settlements (for consistency)
app.use("/settlements", settlementsRoutes);
app.use("/gbml/settlements", settlementsRoutes);

// Wallet Module routes
// Available as /wallets (per spec) and /gbml/wallets (for consistency)
app.use("/wallets", walletsRoutes);
app.use("/gbml/wallets", walletsRoutes);




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

