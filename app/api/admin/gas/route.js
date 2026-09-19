import { NextResponse } from "next/server";

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
  const response = await fetch(url.toString(), {
    redirect: "follow",
    cache: "no-store",
    ...options,
  });
  const text = await response.text();

  let payload;
  try {
    payload = parseGasText(text, response);
  } catch (error) {
    if (!response.ok) {
      const wrapped = new Error(`${error.message} (HTTP ${response.status}).`);
      wrapped.gasStatus = error.gasStatus;
      wrapped.gasContentType = error.gasContentType;
      wrapped.gasPreview = error.gasPreview;
      throw wrapped;
    }
    throw error;
  }

  return { response, payload };
}

export async function GET(request) {
  try {
    const gasUrl = getGasUrl();
    const url = validateGasUrl(gasUrl);

    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const { response, payload } = await fetchGas(url, { method: "GET" });
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
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
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(outgoing),
    });

    return NextResponse.json(result, { status: response.ok ? 200 : response.status });
  } catch (error) {
    const unauthorized = error?.message === "Unauthorized";
    return jsonErrorResponse(
      error,
      unauthorized ? "Sesi admin tidak valid." : "Gagal mengirim data ke GAS.",
      unauthorized ? 401 : 502
    );
  }
}