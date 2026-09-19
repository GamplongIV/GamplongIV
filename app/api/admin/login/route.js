import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;

    if (username === envUser && password === envPass) {
      const response = NextResponse.json({ success: true, message: "Login Berhasil" });
      
      response.cookies.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 hari
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Username atau Password salah!" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}