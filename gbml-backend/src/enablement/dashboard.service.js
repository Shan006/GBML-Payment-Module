import fs from 'fs/promises';
import path from 'path';

const DASHBOARD_PATH = path.join(process.cwd(), 'config', 'dashboard.json');

/**
 * Sync module ↔ contract mapping to dashboard.json (per GBML spec).
 * Database remains source of truth; this file powers admin UI / SDK discovery.
 */
export async function syncModuleToDashboard(entry) {
  let data = { modules: [] };

  try {
    const raw = await fs.readFile(DASHBOARD_PATH, 'utf8');
    data = JSON.parse(raw);
  } catch {
    // Create new dashboard file on first enablement
  }

  if (!Array.isArray(data.modules)) {
    data.modules = [];
  }

  const record = {
    moduleId: entry.moduleId,
    contractType: entry.contractType,
    contractAddress: entry.contractAddress,
    enabled: entry.enabled !== false,
    walletAddress: entry.walletAddress || null,
    jvdRouterAddress: entry.jvdRouterAddress || null,
    updatedAt: new Date().toISOString()
  };

  const index = data.modules.findIndex((m) => m.moduleId === entry.moduleId);
  if (index >= 0) {
    data.modules[index] = { ...data.modules[index], ...record };
  } else {
    data.modules.push(record);
  }

  await fs.mkdir(path.dirname(DASHBOARD_PATH), { recursive: true });
  await fs.writeFile(DASHBOARD_PATH, JSON.stringify(data, null, 2));
  return record;
}
