import { createPaymentIntent, verifyWebhookSignature } from '../services/stripe.service.js';
import { getModuleByTokenSymbol, getFiatTransaction, getAllTokens, updateModuleExchangeRates as updateRatesInDb, getModule } from '../db/index.js';
import { initializeFiatPayment, processFiatPaymentSuccess } from '../services/fiat-gateway.service.js';
import { getModuleExchangeRates } from '../services/currency.service.js';
import { isSupportedCurrency } from '../config/fiat-config.js';

/**
 * Create a fiat payment intent
 * POST /gbml/fiat/payment/create
 */
export async function createFiatPaymentIntent(req, res) {
    const { token, currency, amount, recipientAddress } = req.body;

    try {
        // 1. Validation
        if (!token || !currency || !amount || !recipientAddress) {
            return res.status(400).json({ error: 'Missing required fields: token, currency, amount, recipientAddress' });
        }

        if (!isSupportedCurrency(currency)) {
            return res.status(400).json({ error: `Unsupported currency: ${currency}` });
        }

        // 2. Lookup module by token symbol
        const module = getModuleByTokenSymbol(token);
        if (!module) {
            return res.status(404).json({ error: `Token symbol not found: ${token}` });
        }

        // 3. Create Stripe Payment Intent
        const paymentIntent = await createPaymentIntent({
            amount: parseFloat(amount),
            currency,
            metadata: {
                tokenSymbol: token,
                tokenAddress: module.tokenAddress,
                recipientAddress,
                moduleId: module.moduleId,
                tokenDecimals: module.tokenConfig.decimals
            }
        });

        // 4. Initialize transaction in DB (pending state)
        initializeFiatPayment({
            moduleId: module.moduleId,
            tokenSymbol: token,
            tokenAddress: module.tokenAddress,
            recipientAddress,
            fiatAmount: parseFloat(amount),
            currency: currency.toUpperCase(),
            paymentIntentId: paymentIntent.id,
            tokenDecimals: module.tokenConfig.decimals
        });

        // 5. Return client secret
        return res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            tokenSymbol: token,
            tokenAddress: module.tokenAddress,
            exchangeRates: getModuleExchangeRates(module.moduleId),
            status: 'pending'
        });
    } catch (error) {
        console.error('Error creating fiat payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent', message: error.message });
    }
}

/**
 * Handle Stripe Webhook
 * POST /gbml/fiat/webhook
 */
export async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Stripe requires the raw body for signature verification
        event = verifyWebhookSignature(req.rawBody, sig);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

            // Process the payment success (mint/transfer tokens)
            try {
                await processFiatPaymentSuccess({
                    paymentIntentId: paymentIntent.id,
                    moduleId: paymentIntent.metadata.moduleId,
                    tokenAddress: paymentIntent.metadata.tokenAddress,
                    recipientAddress: paymentIntent.metadata.recipientAddress,
                    fiatAmount: paymentIntent.amount / 100, // Convert from cents
                    currency: paymentIntent.currency.toUpperCase(),
                    tokenDecimals: parseInt(paymentIntent.metadata.tokenDecimals, 10)
                });
            } catch (error) {
                console.error('Error processing successful payment in webhook:', error);
                // We don't return error to Stripe here because we already acknowledged the webhook receipt
            }
            break;

        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            console.log(`PaymentIntent for ${failedIntent.amount} failed.`);
            // Update transaction status in DB could be added here
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
}

/**
 * Get fiat transaction status
 * GET /gbml/fiat/transaction/:paymentIntentId
 */
export async function getFiatTransactionStatus(req, res) {
    const { paymentIntentId } = req.params;

    try {
        const transaction = getFiatTransaction(paymentIntentId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        return res.json(transaction);
    } catch (error) {
        console.error('Error getting transaction status:', error);
        res.status(500).json({ error: 'Failed to get transaction status' });
    }
}

/**
 * List all available tokens
 * GET /gbml/tokens
 */
export async function listAvailableTokens(req, res) {
    try {
        const tokens = getAllTokens();
        return res.json({ tokens });
    } catch (error) {
        console.error('Error listing tokens:', error);
        res.status(500).json({ error: 'Failed to list tokens' });
    }
}

/**
 * Update exchange rates for a module
 * PUT /gbml/modules/payments/:moduleId/rates
 */
export async function updateExchangeRates(req, res) {
    const { moduleId } = req.params;
    const { rates } = req.body;

    try {
        if (!rates || typeof rates !== 'object') {
            return res.status(400).json({ error: 'Rates object is required' });
        }

        // Verify module exists
        const module = getModule(moduleId);
        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }

        updateRatesInDb(moduleId, rates);
        return res.json({ status: 'success', moduleId, rates });
    } catch (error) {
        console.error('Error updating exchange rates:', error);
        res.status(500).json({ error: 'Failed to update exchange rates', message: error.message });
    }
}

/**
 * Get exchange rates for a module
 * GET /gbml/modules/payments/:moduleId/rates
 */
export async function getExchangeRates(req, res) {
    const { moduleId } = req.params;

    try {
        const rates = getModuleExchangeRates(moduleId);
        return res.json({ moduleId, rates });
    } catch (error) {
        console.error('Error getting exchange rates:', error);
        res.status(500).json({ error: 'Failed to get exchange rates', message: error.message });
    }
}
