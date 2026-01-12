import { DEFAULT_EXCHANGE_RATES, isSupportedCurrency } from '../config/fiat-config.js';
import { getModule } from '../db/index.js';

/**
 * Get exchange rate for a module and currency
 * @param {string} moduleId - Module ID
 * @param {string} currency - Currency code (USD, EUR)
 * @returns {number} Exchange rate (fiat to token)
 */
export function getExchangeRate(moduleId, currency) {
    const currencyUpper = currency.toUpperCase();

    if (!isSupportedCurrency(currencyUpper)) {
        throw new Error(`Unsupported currency: ${currency}`);
    }

    // Get module to check for custom rates
    const module = getModule(moduleId);
    if (!module) {
        throw new Error(`Module not found: ${moduleId}`);
    }

    // Check if module has custom exchange rates
    if (module.exchangeRates && module.exchangeRates[currencyUpper]) {
        return module.exchangeRates[currencyUpper];
    }

    // Return default rate
    return DEFAULT_EXCHANGE_RATES[currencyUpper];
}

/**
 * Convert fiat amount to token amount
 * @param {number} fiatAmount - Fiat amount
 * @param {string} currency - Currency code (USD, EUR)
 * @param {string} moduleId - Module ID
 * @returns {string} Token amount as string
 */
export function convertFiatToToken(fiatAmount, currency, moduleId) {
    const rate = getExchangeRate(moduleId, currency);
    const tokenAmount = fiatAmount * rate;
    return tokenAmount.toString();
}

/**
 * Get all exchange rates for a module
 * @param {string} moduleId - Module ID
 * @returns {Object} Exchange rates object
 */
export function getModuleExchangeRates(moduleId) {
    const module = getModule(moduleId);
    if (!module) {
        throw new Error(`Module not found: ${moduleId}`);
    }

    // Return custom rates if available, otherwise default rates
    return module.exchangeRates || { ...DEFAULT_EXCHANGE_RATES };
}

/**
 * Update exchange rates for a module
 * @param {string} moduleId - Module ID
 * @param {Object} rates - Exchange rates object {USD: 1.5, EUR: 1.3}
 * @returns {Object} Updated rates
 */
export function updateModuleExchangeRates(moduleId, rates) {
    // Validate rates
    for (const [currency, rate] of Object.entries(rates)) {
        if (!isSupportedCurrency(currency)) {
            throw new Error(`Unsupported currency: ${currency}`);
        }
        if (typeof rate !== 'number' || rate <= 0) {
            throw new Error(`Invalid rate for ${currency}: ${rate}`);
        }
    }

    return rates;
}
