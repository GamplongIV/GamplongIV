import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getDriveImageUrl(fileId, variant = "thumbnail") {
  const id = encodeURIComponent(fileId);
  if (variant === "view") return `https://drive.google.com/uc?export=view&id=${id}`;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
}

async function fetchDriveImage(url) {
  return fetch(url, {
    redirect: "follow",
    cache: "force-cache",
    next: { revalidate: 86400 },
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0",
    },
  });
}

export async function GET(request) {
  const fileId = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (!fileId || !/^[A-Za-z0-9_-]{10,}$/.test(fileId)) {
    return NextResponse.json({ success: false, message: "File ID tidak valid." }, { status: 400 });
  }

  try {
    let response = await fetchDriveImage(getDriveImageUrl(fileId));

    if (!response.ok || !String(response.headers.get("content-type") || "").startsWith("image/")) {
      response = await fetchDriveImage(getDriveImageUrl(fileId, "view"));
    }

    const contentType = String(response.headers.get("content-type") || "");
    if (!response.ok || !contentType.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "Gambar Drive tidak dapat diakses." }, { status: 404 });
    }

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil gambar dari Google Drive." },
      { status: 502 }
    );
  }
}