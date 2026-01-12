/**
 * Fiat currency configuration
 * Defines supported fiat currencies and default exchange rates
 */

export const SUPPORTED_CURRENCIES = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    code: 'USD',
    decimals: 2,
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    code: 'EUR',
    decimals: 2,
  },
};

/**
 * Default exchange rates (fiat currency to token)
 * These are 1:1 ratios by default
 * Can be customized per module
 */
export const DEFAULT_EXCHANGE_RATES = {
  USD: 1, // 1 USD = 1 token
  EUR: 1, // 1 EUR = 1 token
};

/**
 * Validate if a currency is supported
 * @param {string} currency - Currency code (USD, EUR)
 * @returns {boolean} True if supported
 */
export function isSupportedCurrency(currency) {
  return Object.keys(SUPPORTED_CURRENCIES).includes(currency.toUpperCase());
}

/**
 * Get currency configuration
 * @param {string} currency - Currency code
 * @returns {Object|null} Currency config or null
 */
export function getCurrencyConfig(currency) {
  return SUPPORTED_CURRENCIES[currency.toUpperCase()] || null;
}
