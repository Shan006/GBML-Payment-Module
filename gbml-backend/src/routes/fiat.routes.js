import express from 'express';
import {
    createFiatPaymentIntent,
    handleStripeWebhook,
    getFiatTransactionStatus,
    listAvailableTokens,
    updateExchangeRates,
    getExchangeRates
} from '../controllers/fiat.controller.js';

const router = express.Router();

/**
 * Fiat Payment Routes
 */

// Create fiat payment intent
router.post('/fiat/payment/create', createFiatPaymentIntent);

// Stripe webhook handler
// Note: Raw body is captured in app.js via the express.json verify hook
router.post('/fiat/webhook', handleStripeWebhook);

// Get fiat transaction status
router.get('/fiat/transaction/:paymentIntentId', getFiatTransactionStatus);

// List available tokens
router.get('/tokens', listAvailableTokens);

// Module-specific exchange rates
router.get('/modules/payments/:moduleId/rates', getExchangeRates);
router.put('/modules/payments/:moduleId/rates', updateExchangeRates);

export default router;
