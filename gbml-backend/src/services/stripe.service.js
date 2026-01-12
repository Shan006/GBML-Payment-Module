import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});

/**
 * Create a payment intent for fiat payment
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in smallest currency unit (cents for USD/EUR)
 * @param {string} params.currency - Currency code (usd, eur)
 * @param {Object} params.metadata - Additional metadata to attach to payment intent
 * @returns {Promise<Object>} Stripe payment intent
 */
export async function createPaymentIntent({ amount, currency, metadata = {} }) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                ...metadata,
                source: 'gbml-fiat-gateway',
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
}

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified event object
 */
export function verifyWebhookSignature(payload, signature) {
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }

        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
        );

        return event;
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        throw new Error(`Webhook verification failed: ${error.message}`);
    }
}

/**
 * Retrieve a payment intent by ID
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
export async function getPaymentIntent(paymentIntentId) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
}

/**
 * Cancel a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Cancelled payment intent
 */
export async function cancelPaymentIntent(paymentIntentId) {
    try {
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error cancelling payment intent:', error);
        throw new Error(`Failed to cancel payment intent: ${error.message}`);
    }
}

export default stripe;
