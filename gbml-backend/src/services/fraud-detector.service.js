import { provider } from '../blockchain/provider.js';
import { supabase } from '../config/supabase.js';

const SUSPICIOUS_PATTERNS = {
  rapidDeployment: { window: 10 * 60 * 1000, threshold: 3 },
};

const deploymentCache = new Map();

export async function detectWalletAnomalies(walletAddress, identity = {}) {
  const checks = [];

  const blacklistCheck = await checkBlacklist(walletAddress);
  if (blacklistCheck) checks.push(blacklistCheck);

  const rapidDeployCheck = checkRapidDeployment(walletAddress, identity);
  if (rapidDeployCheck) checks.push(rapidDeployCheck);

  return {
    isClean: checks.length === 0,
    flags: checks,
    risk: checks.length > 1 ? 'HIGH' : checks.length === 1 ? 'MEDIUM' : 'LOW'
  };
}

async function checkBlacklist(walletAddress) {
  const cleanAddress = walletAddress?.toLowerCase();
  if (!cleanAddress) return null;

  try {
    const { data, error } = await supabase
      .from('wallet_blacklist')
      .select('reason')
      .eq('wallet_address', cleanAddress)
      .maybeSingle();

    if (error) {
      console.error('[FraudDetector] Blacklist check error:', error.message);
      return null;
    }

    if (data) {
      return { type: 'BLACKLISTED', severity: 'HIGH', reason: data.reason };
    }
  } catch (err) {
    console.error('[FraudDetector] Blacklist check failed:', err.message);
  }

  return null;
}

function checkRapidDeployment(walletAddress, identity) {
  const key = identity.apiKeyId || walletAddress;
  const now = Date.now();
  const record = deploymentCache.get(key) || { timestamps: [] };

  record.timestamps = record.timestamps.filter(t => now - t < SUSPICIOUS_PATTERNS.rapidDeployment.window);
  record.timestamps.push(now);
  deploymentCache.set(key, record);

  if (record.timestamps.length > SUSPICIOUS_PATTERNS.rapidDeployment.threshold) {
    return { type: 'RAPID_DEPLOYMENT', severity: 'MEDIUM', reason: `More than ${SUSPICIOUS_PATTERNS.rapidDeployment.threshold} deployment attempts in 10 minutes` };
  }

  return null;
}

export async function logSuspiciousActivity(data) {
  try {
    await supabase
      .from('fraud_events')
      .insert([{
        wallet_address: data.walletAddress,
        ip_address: data.ip,
        module_type: data.moduleType,
        action: data.action,
        flags: JSON.stringify(data.flags || []),
        risk_level: data.riskLevel || 'MEDIUM',
        created_at: new Date().toISOString()
      }]);
  } catch (err) {
    console.error('[FraudDetector] Failed to log suspicious activity:', err.message);
  }

  console.warn('[FRAUD] Suspicious activity detected:', JSON.stringify(data, null, 2));
}

export async function addToBlacklist(walletAddress, reason, adminId) {
  const { error } = await supabase
    .from('wallet_blacklist')
    .upsert([{
      wallet_address: walletAddress.toLowerCase(),
      reason,
      blocked_by: adminId,
      created_at: new Date().toISOString()
    }], { onConflict: 'wallet_address' });

  if (error) {
    console.error('[FraudDetector] Failed to blacklist wallet:', error.message);
    throw new Error('Failed to blacklist wallet');
  }
}

export function cleanupFraudCache() {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [key, record] of deploymentCache.entries()) {
    record.timestamps = record.timestamps.filter(t => cutoff - t < 0);
    if (record.timestamps.length === 0) deploymentCache.delete(key);
  }
}

setInterval(cleanupFraudCache, 30 * 60 * 1000);
