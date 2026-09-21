"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const HEADER_BG = "bg-[#4E9A73]"; 
const HEADER_TEXT = "text-[#4E9A73]";
const YELLO_BG = "bg-[#E8B931]";
const YELLO_BORDER = "border-[#E8B931]";
const MAIN_BG = "bg-white"; 

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin?sheet=profil");
      } else {
        setError(data.message || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${HEADER_BG} ${HEADER_TEXT} min-h-screen flex items-center justify-center px-4`}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">PANEL ADMIN</h1>
          <p className="text-sm">Padukuhan Gamplong IV</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-xs font-semibold mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1">USERNAME</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-black rounded-lg text-sm focus:outline-none"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-black rounded-lg text-sm focus:outline-none"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${YELLO_BG} hover:bg-yellow-500 text-black font-bold py-2.5 rounded-lg text-sm transition duration-200 mt-2`}
          >
            {loading ? "Memproses..." : "MASUK PANEL"}
          </button>
        </form>
      </div>
    </div>
  );
}