import { fetchJsonWithRetry } from './api-client';

const adminSheetCache = new Map();
const adminPendingRequests = new Map();

function normalizeSheets(sheets) {
  return [...new Set((Array.isArray(sheets) ? sheets : [sheets])
    .map((sheet) => String(sheet || '').trim())
    .filter(Boolean))];
}

function requestKey(sheets) {
  return [...sheets].sort().join(',');
}

export async function getAdminSheets(sheets, { force = false } = {}) {
  const names = normalizeSheets(sheets);
  if (!names.length) return {};

  const missing = force ? names : names.filter((sheet) => !adminSheetCache.has(sheet));
  if (missing.length) {
    const key = requestKey(missing);
    let request = adminPendingRequests.get(key);

    if (!request) {
      request = (async () => {
        const params = new URLSearchParams({ action: 'getSheets', sheets: missing.join(',') });
        const json = await fetchJsonWithRetry(`/api/admin/gas?${params.toString()}`, { method: 'GET' });
        const data = json.data || {};
        Object.entries(data).forEach(([sheet, rows]) => adminSheetCache.set(sheet, rows));
        return data;
      })();
      adminPendingRequests.set(key, request);
    }

    try {
      await request;
    } finally {
      adminPendingRequests.delete(key);
    }
  }

  return Object.fromEntries(names.map((sheet) => [sheet, adminSheetCache.get(sheet) || []]));
}

export function setAdminSheetCache(sheet, rows) {
  if (!sheet) return;
  adminSheetCache.set(String(sheet), Array.isArray(rows) ? rows : []);
}

export function invalidateAdminDataCache(sheets = []) {
  normalizeSheets(sheets).forEach((sheet) => adminSheetCache.delete(sheet));
}

export function clearAdminDataCache() {
  adminSheetCache.clear();
}