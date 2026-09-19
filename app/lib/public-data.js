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
    const response = await fetch(`/api/admin/gas?${params.toString()}`, { cache: 'no-store' });
    const raw = await response.text();
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      const preview = raw.replace(/\s+/g, ' ').slice(0, 220);
      throw new Error(`Respons API bukan JSON (HTTP ${response.status}). ${preview}`);
    }
    if (!response.ok || json.success === false) throw new Error(json.message || 'Gagal mengambil data website.');
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