import { sendPayment } from './router.service.js';
import { convertFiatToToken } from './currency.service.js';
import { storeFiatTransaction, updateFiatTransaction } from '../db/index.js';
import { logPaymentTransaction, logError } from './audit.service.js';
import { ethers } from 'ethers';

/**
 * Process successful fiat payment and mint/transfer tokens
 * @param {Object} params - Payment parameters
 * @param {string} params.paymentIntentId - Stripe payment intent ID
 * @param {string} params.moduleId - Module ID
 * @param {string} params.tokenAddress - Token contract address
 * @param {string} params.recipientAddress - Recipient blockchain address
 * @param {number} params.fiatAmount - Fiat amount paid
 * @param {string} params.currency - Currency code (USD, EUR)
 * @param {number} params.tokenDecimals - Token decimals
 * @returns {Promise<Object>} Transaction result
 */
export async function processFiatPaymentSuccess({
    paymentIntentId,
    moduleId,
    tokenAddress,
    recipientAddress,
    fiatAmount,
    currency,
    tokenDecimals,
}) {
    try {
        // Convert fiat to token amount
        const tokenAmountRaw = convertFiatToToken(fiatAmount, currency, moduleId);

        // Convert to wei (considering token decimals)
        const tokenAmount = ethers.parseUnits(tokenAmountRaw, tokenDecimals).toString();

        console.log(`[Fiat Gateway] Converting ${fiatAmount} ${currency} to ${tokenAmountRaw} tokens (${tokenAmount} wei)`);

        // Send tokens to recipient
        const receipt = await sendPayment(tokenAddress, recipientAddress, tokenAmount, tokenDecimals);

        // Update fiat transaction with blockchain tx hash
        updateFiatTransaction(paymentIntentId, {
            status: 'completed',
            blockchainTxHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            tokenAmount: tokenAmountRaw,
            tokenAmountWei: tokenAmount,
        });

        // Log the transaction
        await logPaymentTransaction({
            txHash: receipt.hash,
            tokenAddress,
            from: receipt.from,
            to: recipientAddress,
            amount: tokenAmount,
            moduleId,
            blockNumber: receipt.blockNumber,
            fiatPayment: {
                paymentIntentId,
                fiatAmount,
                currency,
            },
        });

        return {
            success: true,
            blockchainTxHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            tokenAmount: tokenAmountRaw,
            fiatAmount,
            currency,
        };
    } catch (error) {
        console.error('[Fiat Gateway] Error processing payment:', error);

        // Update fiat transaction with error
        try {
            updateFiatTransaction(paymentIntentId, {
                status: 'failed',
                error: error.message,
            });
        } catch (updateError) {
            console.error('[Fiat Gateway] Error updating transaction:', updateError);
        }

        // Log error
        await logError({
            error: error.message,
            context: {
                paymentIntentId,
                moduleId,
                tokenAddress,
                recipientAddress,
                fiatAmount,
                currency,
            },
        });

        throw error;
    }
}

/**
 * Initialize fiat payment (create payment intent and store transaction)
 * @param {Object} params - Payment parameters
 * @param {string} params.moduleId - Module ID
 * @param {string} params.tokenSymbol - Token symbol
 * @param {string} params.tokenAddress - Token contract address
 * @param {string} params.recipientAddress - Recipient blockchain address
 * @param {number} params.fiatAmount - Fiat amount
 * @param {string} params.currency - Currency code (USD, EUR)
 * @param {string} params.paymentIntentId - Stripe payment intent ID
 * @param {number} params.tokenDecimals - Token decimals
 */
export function initializeFiatPayment({
    moduleId,
    tokenSymbol,
    tokenAddress,
    recipientAddress,
    fiatAmount,
    currency,
    paymentIntentId,
    tokenDecimals,
}) {
    // Store fiat transaction in pending state
    storeFiatTransaction(paymentIntentId, {
        paymentIntentId,
        moduleId,
        tokenSymbol,
        tokenAddress,
        recipientAddress,
        fiatAmount,
        currency,
        tokenDecimals,
        status: 'pending',
        blockchainTxHash: null,
    });

    console.log(`[Fiat Gateway] Initialized payment: ${paymentIntentId} for ${fiatAmount} ${currency} -> ${tokenSymbol}`);
}
