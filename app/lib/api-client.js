export async function fetchJsonWithRetry(url, options = {}, config = {}) {
  const retries = Number.isInteger(config.retries) ? config.retries : 2;
  const timeoutMs = Number.isFinite(config.timeoutMs) ? config.timeoutMs : 15000;
  const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let timer = null;
    const controller = new AbortController();

    try {
      const sourceSignal = options.signal;
      if (sourceSignal) {
        if (sourceSignal.aborted) controller.abort(sourceSignal.reason);
        else sourceSignal.addEventListener('abort', () => controller.abort(sourceSignal.reason), { once: true });
      }

      timer = window.setTimeout(() => controller.abort(new DOMException('Request timeout', 'TimeoutError')), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        cache: 'no-store',
      });

      const raw = await response.text();
      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        const preview = raw.replace(/\s+/g, ' ').slice(0, 220);
        const error = new Error(`Respons API bukan JSON (HTTP ${response.status}). ${preview}`);
        error.status = response.status;
        error.raw = raw;
        throw error;
      }

      if (response.ok && json.success !== false) return json;

      const error = new Error(json.message || `Request gagal (HTTP ${response.status}).`);
      error.status = response.status;
      error.payload = json;
      throw error;
    } catch (error) {
      lastError = error;
      const status = Number(error?.status || 0);
      const isAbort = error?.name === 'AbortError' || error?.name === 'TimeoutError';
      const retryable = isAbort || !status || retryableStatuses.has(status) || /bukan JSON/i.test(error?.message || '');

      if (attempt >= retries || !retryable) break;
      const delay = Math.min(2500, 400 * 2 ** attempt);
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  }

  if (lastError?.name === 'AbortError' || lastError?.name === 'TimeoutError') {
    throw new Error('Backend sedang lambat/tidak merespons. Silakan coba lagi.');
  }

  throw lastError || new Error('Gagal terhubung ke backend.');
}
