import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

function getGasUrl() {
  return process.env.GAS_API_URL || process.env.NEXT_PUBLIC_GAS_API_URL;
}

function parseGasText(text, response) {
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  const trimmed = String(text || "").trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const lower = trimmed.toLowerCase();
    let message = "Google Apps Script mengembalikan respons yang bukan JSON.";

    if (contentType.includes("text/html") || lower.includes("<html") || lower.includes("<!doctype html")) {
      if (lower.includes("accounts.google.com") || lower.includes("sign in") || lower.includes("signin")) {
        message =
          "Google Apps Script mengembalikan halaman login Google. Pastikan deployment Web App memakai URL /exec, dijalankan sebagai pemilik script, dan aksesnya mengizinkan pengguna mengakses Web App.";
      } else {
        message =
          "Google Apps Script mengembalikan HTML, bukan JSON. Periksa kembali URL deployment /exec dan deployment versi terbaru Code.gs.";
      }
    } else if (!trimmed) {
      message = "Google Apps Script mengembalikan respons kosong.";
    }

    const preview = trimmed.replace(/\s+/g, " ").slice(0, 300);
    const error = new Error(message);
    error.gasStatus = response.status;
    error.gasContentType = contentType;
    error.gasPreview = preview;
    throw error;
  }
}

function jsonErrorResponse(error, fallback, status = 500) {
  return NextResponse.json(
    {
      success: false,
      message: error?.message || fallback,
      ...(process.env.NODE_ENV !== "production" && error?.gasPreview
        ? {
            gasStatus: error.gasStatus,
            gasContentType: error.gasContentType,
            gasPreview: error.gasPreview,
          }
        : {}),
    },
    { status }
  );
}

async function ensureAuth(request) {
  const token = request.cookies.get("admin_token")?.value;
  if (token !== "authenticated") {
    throw new Error("Unauthorized");
  }
}

function validateGasUrl(gasUrl) {
  if (!gasUrl || gasUrl.includes("ISI_DEPLOYMENT_ID")) {
    throw new Error("GAS_API_URL belum dikonfigurasi.");
  }

  const url = new URL(gasUrl);
  if (!/script\.google\.com\/macros\/s\/[^/]+\/exec/i.test(url.toString())) {
    throw new Error("GAS_API_URL harus berupa URL Web App Google Apps Script yang berakhir /exec.");
  }
  return url;
}

async function fetchGas(url, options = {}) {
  const maxAttempts = Number.isInteger(options.retries) ? options.retries + 1 : 3;
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 20000;
  const requestOptions = { ...options };
  delete requestOptions.retries;
  delete requestOptions.timeoutMs;

  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
        ...requestOptions,
      });
      const text = await response.text();

      let payload;
      try {
        payload = parseGasText(text, response);
      } catch (error) {
        error.retryable = true;
        if (!response.ok) {
          const wrapped = new Error(`${error.message} (HTTP ${response.status}).`);
          wrapped.gasStatus = error.gasStatus;
          wrapped.gasContentType = error.gasContentType;
          wrapped.gasPreview = error.gasPreview;
          wrapped.retryable = true;
          throw wrapped;
        }
        throw error;
      }

      if (!response.ok) {
        const error = new Error(`Google Apps Script mengembalikan HTTP ${response.status}.`);
        error.gasStatus = response.status;
        error.retryable = [408, 425, 429, 500, 502, 503, 504].includes(response.status);
        throw error;
      }

      return { response, payload };
    } catch (error) {
      lastError = error;
      const message = String(error?.message || "");
      const status = Number(error?.gasStatus || 0);
      const retryable = error?.retryable !== false && (
        error?.name === "AbortError" ||
        error?.name === "TimeoutError" ||
        !status ||
        [408, 425, 429, 500, 502, 503, 504].includes(status) ||
        /bukan JSON|HTML|respons kosong|fetch failed|network/i.test(message)
      );

      if (!retryable || attempt === maxAttempts - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** attempt));
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError?.name === "AbortError" || lastError?.name === "TimeoutError") {
    throw new Error("Google Apps Script tidak merespons dalam batas waktu. Coba lagi beberapa saat kemudian.");
  }

  throw lastError || new Error("Gagal terhubung ke Google Apps Script.");
}

export async function GET(request) {
  try {
    const gasUrl = getGasUrl();
    const url = validateGasUrl(gasUrl);

    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const { response, payload } = await fetchGas(url, { method: "GET", retries: 2, timeoutMs: 20000 });
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonErrorResponse(error, "Gagal terhubung ke GAS.", error?.message === "Unauthorized" ? 401 : 502);
  }
}

export async function POST(request) {
  try {
    await ensureAuth(request);

    const gasUrl = getGasUrl();
    const url = validateGasUrl(gasUrl);
    const writeToken = process.env.GAS_WRITE_TOKEN;

    if (!writeToken) {
      return NextResponse.json(
        { success: false, message: "GAS_WRITE_TOKEN belum dikonfigurasi di .env.local." },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const outgoing = { ...payload, token: writeToken };

    const { response, payload: result } = await fetchGas(url, {
      method: "POST",
      retries: 2,
      timeoutMs: 25000,
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(outgoing),
    });

    return NextResponse.json(result, { status: response.ok ? 200 : response.status, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const unauthorized = error?.message === "Unauthorized";
    return jsonErrorResponse(
      error,
      unauthorized ? "Sesi admin tidak valid." : "Gagal mengirim data ke GAS.",
      unauthorized ? 401 : 502
    );
  }
}