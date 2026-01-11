import express from "express";
import {
  enablePayments,
  sendPaymentController,
  getTokenBalance,
  getModuleStatus,
  listModules,
} from "../controllers/payments.controller.js";

const router = express.Router();

// List all modules for a tenant
router.get("/modules/payments", listModules);

// Enable payments module
router.post("/modules/payments/enable", enablePayments);

// Send payment
router.post("/payments/send", sendPaymentController);

// Get token balance
router.get("/payments/balance/:tokenAddress/:address", getTokenBalance);

// Get module status
router.get("/modules/payments/:moduleId", getModuleStatus);

export default router;

