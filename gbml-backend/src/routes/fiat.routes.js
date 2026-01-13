import express from 'express';
import {
    createFiatPaymentIntent,
    handleStripeWebhook,
    getFiatTransactionStatus,
    listAvailableTokens,
    updateExchangeRates,
    getExchangeRates
} from '../controllers/fiat.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Fiat Payment Routes
 */

// Create fiat payment intent
router.post('/fiat/payment/create', authenticate, createFiatPaymentIntent);

// Stripe webhook handler - PUBLIC (handled by Stripe)
router.post('/fiat/webhook', handleStripeWebhook);

// Get fiat transaction status
router.get('/fiat/transaction/:paymentIntentId', authenticate, getFiatTransactionStatus);

// List available tokens
router.get('/tokens', authenticate, listAvailableTokens);

// Module-specific exchange rates
router.get('/modules/payments/:moduleId/rates', authenticate, getExchangeRates);
router.put('/modules/payments/:moduleId/rates', authenticate, authorize(['admin']), updateExchangeRates);

export default router;
