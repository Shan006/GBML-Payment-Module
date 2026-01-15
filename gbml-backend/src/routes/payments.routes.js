import express from "express";
import {
  enablePayments,
  sendPaymentController,
  getTokenBalance,
  getModuleStatus,
  listModules,
} from "../controllers/payments.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * Payments Routes
 * Protected by authentication
 */

// List all modules for a tenant
router.get("/modules/payments", authenticate, listModules);

// Enable payments module - ADMIN ONLY
router.post("/modules/payments/enable", authenticate, authorize(['admin']), enablePayments);

// Send payment
// Send payment
router.post("/payments/send", authenticate, authorize(['admin', 'TREASURY']), sendPaymentController);

// Get token balance
router.get("/payments/balance/:tokenAddress/:address", authenticate, getTokenBalance);

// Get module status
router.get("/modules/payments/:moduleId", authenticate, getModuleStatus);

export default router;
