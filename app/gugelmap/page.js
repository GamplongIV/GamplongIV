"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Loader2, Navigation } from "lucide-react";
import { getPublicSheets } from "../lib/public-data";
import { usePublicDataVersion } from "../lib/use-public-refresh";

const HEADER_BG = "bg-[#4E9A73]"; 
const YELLO_BORDER = "border-[#E8B931]";
const MAIN_BG = "bg-white"; 

const RoutingMap = dynamic(() => import("@/components/routingmaps"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
      Memuat Peta...
    </div>
  ),
});

const getIconByKategori = (kategori) => {
  const kat = (kategori || "").toLowerCase();
  if (kat.includes("rumah_dukuh")) return "/rumah_dukuh.svg";
  if (kat.includes("rumah_rt")) return "/rumah_rt.svg";
  if (kat.includes("rumah_rw")) return "/rumah_rw.svg";
  if (kat.includes("usaha")) return "/usaha.svg";
  if (kat.includes("gedung")) return "/gedung.svg";
  if (kat.includes("masjid")) return "/masjid.svg";
  if (kat.includes("mushola")) return "/masjid.svg";
  if (kat.includes("pasar")) return "/pasar.svg";
  if (kat.includes("klinik")) return "/klinik.svg";
  if (kat.includes("skuter")) return "/skuter.svg";
  if (kat.includes("rental")) return "/rental.svg";
  return "/usaha.svg";
};

export default function LocationsPage() {
  const publicDataVersion = usePublicDataVersion();
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    async function fetchMapsData() {
      try {
        const data = await getPublicSheets(["maps"]);

        if (Array.isArray(data.maps)) {
          const mappedData = data.maps
            .map((item, idx) => {
              // Menangani variasi penamaan header latitude & longitude di Google Sheets
              const rawLat = item.latitude || item.Latitude || item.lat || item.Lat;
              const rawLng = item.longitude || item.Longitude || item.long || item.Long || item.lng || item.Lng;

              return {
                id: item._row || idx + 1,
                nama: item.nama || item.Nama || item.judul || "Lokasi Tanpa Nama",
                kategori: item.kategori || item.Kategori || "Lainnya",
                lat: parseFloat(rawLat),
                lng: parseFloat(rawLng),
              };
            })
            // Filter hanya koordinat angka yang valid
            .filter((item) => !isNaN(item.lat) && !isNaN(item.lng));

          setHotspots(mappedData);
          if (mappedData.length > 0) {
            setSelectedHotspot(mappedData[0]);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data peta:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMapsData();
  }, [publicDataVersion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E9A73]" />
      </div>
    );
  }

  return (
    <div className={`${HEADER_BG} min-h-screen text-black pb-8 sm:pb-12`}>
      {/* HEADER PAGE */}
      <div className="max-w-5xl font-bold text-center text-white mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl mb-1 tracking-wide">
          MAPS LOKASI
        </h2>
        <h2 className="text-xl sm:text-2xl md:text-3xl tracking-wide">
          KALURAHAN GAMPLONG IV
        </h2>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* SECTION UTAMA (EMBEDDED GOOGLE MAPS KALURAHAN) */}
        <section className={`${MAIN_BG} mb-10 sm:mb-16 rounded-2xl p-4 sm:p-8 md:p-12 shadow-lg`}>
          <div className={`aspect-video w-full rounded-xl overflow-hidden border-[6px] sm:border-[10px] ${YELLO_BORDER}`}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1997.0155609371848!2d110.23699238859953!3d-7.805113498053795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7af900698e4779%3A0xdb881b201d91bbc6!2sdukuh%20gamplong%204!5e1!3m2!1sid!2sid!4v1787988756891!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          <div className="text-center mt-6 sm:mt-10">
            <a
              href="https://maps.google.com/?q=-7.8051135,110.2369924"
              target="_blank"
              rel="noopener noreferrer"
              className={`${HEADER_BG} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold inline-block hover:opacity-90 transition-opacity w-full sm:w-auto shadow-md`}
            >
              LIHAT DI GOOGLE MAPS
            </a>
          </div>
        </section>

        {/* SECTION POPULAR HOTSPOT */}
        <section>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-1">
            UMKM & HOTSPOT
          </h2>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white mb-2">
            KALURAHAN GAMPLONG IV
          </h2>
          <p className="text-xs sm:text-sm text-center text-white max-w-3xl mx-auto mb-6 sm:mb-12 px-2">
            Kumpulan UMKM dan Hotspot area sekitar Kalurahan Gamplong IV.
          </p>

          <div className="bg-white rounded-2xl p-4 sm:p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 shadow-lg">
            
            {/* DISPLAY PETA LOKASI TERPILIH */}
            <div className="flex flex-col gap-3">
              <div className={`h-[280px] sm:h-[320px] md:h-[350px] rounded-xl overflow-hidden border-[6px] sm:border-[10px] ${YELLO_BORDER}`}>
                {selectedHotspot ? (
                  <RoutingMap
                    position={[selectedHotspot.lat, selectedHotspot.lng]}
                    label={selectedHotspot.nama}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Belum ada data lokasi
                  </div>
                )}
              </div>

              {/* TOMBOL BUKA KOORDINAT TERPILIH DI GOOGLE MAPS */}
              {selectedHotspot && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHotspot.lat},${selectedHotspot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${HEADER_BG} hover:bg-[#3d7c5c] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer`}
                >
                  <Navigation size={18} />
                  <span>Petunjuk Arah Ke {selectedHotspot.nama}</span>
                </a>
              )}
            </div>

            {/* DAFTAR TOMBOL HOTSPOT DARI SHEET */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-white self-start max-h-[400px] overflow-y-auto pr-1">
              {hotspots.length > 0 ? (
                hotspots.map((item) => {
                  const isSelected = selectedHotspot?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedHotspot(item)}
                      className={`p-2.5 sm:p-3 rounded-xl flex items-center gap-3 sm:gap-4 transition-all w-full text-left cursor-pointer shadow-sm ${
                        isSelected
                          ? "bg-[#4E9A73]"
                          : "bg-[#4E9A73]"
                      }`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 relative overflow-hidden rounded-full flex-shrink-0 bg-white/10 p-0.5">
                        <img
                          src={getIconByKategori(item.kategori)}
                          alt="icon"
                          className="object-cover w-full h-full"
                         loading="lazy" decoding="async"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold uppercase text-xs sm:text-sm leading-snug truncate text-white">
                          {item.nama}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-gray-500 py-6 text-sm">
                  Tidak ada titik lokasi hotspot yang tersedia.
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}