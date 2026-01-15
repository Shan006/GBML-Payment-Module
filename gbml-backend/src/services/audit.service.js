import { supabase } from '../config/supabase.js';

/**
 * Audit service for logging transactions and module events
 */

/**
 * Log an action to the persistent audit_logs table
 * @param {Object} data 
 * @param {Object} identity - req.apiKeyIdentity or req.user
 */
export async function logAudit(data, identity = {}) {
  const logEntry = {
    api_key_id: identity.apiKeyId || identity.id && identity.roles ? identity.id : null,
    admin_id: identity.id && !identity.roles ? identity.id : null,
    tenant_id: identity.tenantId || data.tenantId,
    action: data.action,
    resource: data.resource || 'GENERAL',
    payload: data.payload || {},
    status: data.status || 'SUCCESS',
    error_message: data.error,
    ip_address: data.ip,
    user_agent: data.userAgent
  };

  const { error } = await supabase
    .from('audit_logs')
    .insert([logEntry]);

  if (error) {
    console.error('[AUDIT] Failed to save log to Supabase:', error);
  }

  // Also log to console for debugging
  console.log(`[AUDIT] ${logEntry.action}:`, JSON.stringify(logEntry, null, 2));

  return logEntry;
}

/**
 * Log a payment transaction
 */
export async function logPaymentTransaction(data, identity = {}) {
  await logAudit({
    action: 'PAYMENT_TRANSACTION',
    resource: 'TREASURY',
    payload: data,
    tenantId: data.tenantId
  }, identity);
}

/**
 * Log module enable event
 */
export async function logModuleEnable(data, identity = {}) {
  await logAudit({
    action: 'MODULE_ENABLE',
    resource: 'MODULE',
    payload: data,
    tenantId: data.tenantId
  }, identity);
}

/**
 * Log error event
 */
export async function logError(data, identity = {}) {
  await logAudit({
    action: 'ERROR',
    resource: data.resource || 'GENERAL',
    payload: data.context || {},
    status: 'FAILED',
    error: data.error,
    tenantId: data.tenantId
  }, identity);
}

/**
 * Log pause/unpause action
 */
export async function logPauseAction(data, identity = {}) {
  await logAudit({
    action: data.isPaused ? 'PAUSE' : 'UNPAUSE',
    resource: 'EMERGENCY_PAUSE',
    payload: data,
    tenantId: data.tenantId
  }, identity);
}


