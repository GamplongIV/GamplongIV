"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Package } from "lucide-react";
import { getPublicSheets } from "../lib/public-data";
import { usePublicDataVersion } from "../lib/use-public-refresh";

const HEADER_BG = "bg-[#4E9A73]";
const HEADER_TEXT = "text-[#4E9A73]";
const YELLO_BG = "bg-[#E8B931]";
const MAIN_BG = "bg-white";

const erte = [1, 2, 3, 4, 5, 6];

function getImageUrl(namaBarang) {
  const name = String(namaBarang || "").toLowerCase().trim();
  const knownImages = ["gelas", "piring", "soblok", "sendok", "meja", "kursi", "karpet"];
  
  if (knownImages.includes(name)) {
    return `/${name}.svg`;
  }
  return null;
}

export default function Home() {
  const publicDataVersion = usePublicDataVersion();
  const [inventaris, setInventaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRT, setOpenRT] = useState(() =>
    Object.fromEntries(erte.map((rt) => [rt, false]))
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPublicSheets(["inventaris"]);
        if (Array.isArray(data.inventaris)) {
          setInventaris(data.inventaris);
        }
      } catch (error) {
        console.error("Gagal mengambil data inventaris:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [publicDataVersion]);

  const toggleRT = (rtNumber) => {
    setOpenRT((prev) => ({
      ...prev,
      [rtNumber]: !prev[rtNumber],
    }));
  };

  const totalBarangKalurahan = useMemo(() => {
    const map = {};
    inventaris.forEach((item) => {
      const key = item.nama_barang?.trim();
      if (!key) return;
      const qty = Number(item.jumlah) || 0;
      map[key] = (map[key] || 0) + qty;
    });

    return Object.entries(map).map(([title, val]) => ({
      title,
      value: val.toLocaleString("id-ID"),
      imageUrl: getImageUrl(title),
    }));
  }, [inventaris]);

  const getItemsByRT = (rtNum) => {
    const targetKeys = [`rt ${rtNum}`, `rt${rtNum}`, String(rtNum)];
    const map = {};

    inventaris.forEach((item) => {
      const itemRt = String(item.rt || "").toLowerCase().trim();
      if (targetKeys.includes(itemRt)) {
        const key = item.nama_barang?.trim();
        if (!key) return;
        const qty = Number(item.jumlah) || 0;
        map[key] = (map[key] || 0) + qty;
      }
    });

    return Object.entries(map).map(([title, val]) => ({
      title,
      value: val.toLocaleString("id-ID"),
      imageUrl: getImageUrl(title),
    }));
  };

  return (
    <div className={`min-h-screen ${MAIN_BG}`}>
      {/* HEADER UTAMA */}
      <div className={`${MAIN_BG} ${HEADER_TEXT} text-center py-8 sm:py-12 px-4`}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
          INVENTARIS BARANG
        </h2>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
          KALURAHAN GAMPLONG IV
        </h2>
        <p className="text-xs sm:text-sm max-w-3xl mx-auto px-2">
          Kumpulan data inventaris barang-barang di Kalurahan Gamplong IV.
        </p>
      </div>

      <div className={`${YELLO_BG} h-2`} />

      {/* SECTION TOTAL BARANG KALURAHAN */}
      <section id="total" className={`py-8 sm:py-12 px-4 sm:px-6 ${HEADER_BG}`}>
        <div className="flex flex-col justify-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white">
            TOTAL BARANG INVENTARIS KALURAHAN
          </h2>
        </div>

        <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-md">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#4E9A73]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-semibold">Memuat data inventaris...</p>
            </div>
          ) : totalBarangKalurahan.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada data inventaris yang tersimpan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {totalBarangKalurahan.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#4E9A73] p-4 sm:p-6 rounded-2xl text-center flex flex-col items-center justify-center transition-all hover:shadow-lg"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-xl object-cover"
                     loading="lazy" decoding="async"/>
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-base sm:text-lg text-white font-medium">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HEADER SECTION PER RT */}
      <div id="rt" className={`${MAIN_BG} ${HEADER_TEXT} text-center py-8 sm:py-12 px-4`}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
          INVENTARIS BARANG
        </h2>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
          PER RT
        </h2>
      </div>

      {/* LIST RT ACCORDION */}
      {erte.map((rt) => {
        const isOpen = !!openRT[rt];
        const rtFormatted = String(rt).padStart(2, "0");
        const rtItems = getItemsByRT(rt);

        return (
          <React.Fragment key={rt}>
            <div className={`${YELLO_BG} h-2`} />
            <section id={`rt-${rtFormatted}`} className={`py-6 sm:py-10 px-4 sm:px-6 ${HEADER_BG}`}>
              {/* BUTTON TRIGGER ACCORDION */}
              <button
                onClick={() => toggleRT(rt)}
                className="w-full max-w-5xl mx-auto flex items-center justify-center gap-2 text-white hover:opacity-90 transition-all cursor-pointer focus:outline-none px-2"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  RT {rtFormatted}
                </h2>
                <div className="flex items-center text-white">
                  {isOpen ? (
                    <ChevronUp className="w-6 h-6 sm:w-8 sm:h-8" />
                  ) : (
                    <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
                  )}
                </div>
              </button>

              {/* ACCORDION CONTENT */}
              {isOpen && (
                <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 md:p-8 mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-md transition-all duration-300">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-[#4E9A73]">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <p className="text-xs font-semibold">Memuat data RT {rtFormatted}...</p>
                    </div>
                  ) : rtItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      Belum ada data inventaris untuk RT {rtFormatted}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {rtItems.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="bg-[#4E9A73] p-4 sm:p-6 rounded-2xl text-center flex flex-col items-center justify-center transition-all hover:shadow-lg"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-xl object-cover"
                             loading="lazy" decoding="async"/>
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-xl bg-white/20 flex items-center justify-center text-white">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                            {item.title}
                          </h3>
                          <p className="text-base sm:text-lg text-white font-medium">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </React.Fragment>
        );
      })}
    </div>
  );
}