import { fetchJsonWithRetry } from './api-client';

const sheetCache = new Map();
const pendingRequests = new Map();

function normalizeSheets(sheets) {
  return [...new Set((Array.isArray(sheets) ? sheets : [sheets])
    .map((sheet) => String(sheet || '').trim())
    .filter(Boolean))];
}

function requestKey(sheets) {
  return [...sheets].sort().join(',');
}

async function requestSheets(sheets) {
  const key = requestKey(sheets);
  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const promise = (async () => {
    const params = new URLSearchParams({
      action: 'getSheets',
      sheets: sheets.join(','),
    });
    const json = await fetchJsonWithRetry(`/api/admin/gas?${params.toString()}`, { method: 'GET' });
    const data = json.data || {};
    Object.entries(data).forEach(([sheet, rows]) => sheetCache.set(sheet, rows));
    return data;
  })();

  pendingRequests.set(key, promise);
  try { return await promise; }
  finally { pendingRequests.delete(key); }
}

export async function getPublicSheets(sheets, { force = false } = {}) {
  const names = normalizeSheets(sheets);
  if (!names.length) return {};
  const missing = force ? names : names.filter((sheet) => !sheetCache.has(sheet));
  if (missing.length) await requestSheets(missing);
  return Object.fromEntries(names.map((sheet) => [sheet, sheetCache.get(sheet) || []]));
}

export function invalidatePublicDataCache() {
  sheetCache.clear();
}