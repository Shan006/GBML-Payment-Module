/**
 * Audit service for logging transactions and module events
 * In production, this would integrate with a database or logging service
 */

/**
 * Log a payment transaction
 * @param {Object} data - Transaction data
 * @param {string} data.txHash - Transaction hash
 * @param {string} data.tokenAddress - Token contract address
 * @param {string} data.from - Sender address
 * @param {string} data.to - Recipient address
 * @param {string} data.amount - Amount transferred
 * @param {string} data.moduleId - Module ID
 */
export async function logPaymentTransaction(data) {
  const logEntry = {
    type: "payment",
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  // In production, save to database
  console.log("[AUDIT] Payment Transaction:", JSON.stringify(logEntry, null, 2));
  
  return logEntry;
}

/**
 * Log module enable event
 * @param {Object} data - Module data
 * @param {string} data.moduleId - Module ID
 * @param {string} data.tenantId - Tenant ID
 * @param {string} data.tokenAddress - Token contract address
 * @param {string} data.mode - Deployment mode (DEPLOY or ATTACH)
 */
export async function logModuleEnable(data) {
  const logEntry = {
    type: "module_enable",
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  // In production, save to database
  console.log("[AUDIT] Module Enabled:", JSON.stringify(logEntry, null, 2));
  
  return logEntry;
}

/**
 * Log error event
 * @param {Object} data - Error data
 * @param {string} data.error - Error message
 * @param {string} data.moduleId - Module ID (optional)
 * @param {Object} data.context - Additional context (optional)
 */
export async function logError(data) {
  const logEntry = {
    type: "error",
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  console.error("[AUDIT] Error:", JSON.stringify(logEntry, null, 2));
  
  return logEntry;
}

