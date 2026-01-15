import express from "express";
import cors from "cors";
import paymentsRoutes from "./routes/payments.routes.js";
import fiatRoutes from "./routes/fiat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import disbursementRoutes from "./routes/disbursement.routes.js";
import apiKeyRoutes from "./routes/api-key.routes.js";
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

