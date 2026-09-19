"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getPublicSheets } from "../lib/public-data";

const HEADER_BG = "bg-[#4E9A73]"; 
const YELLO_BORDER = "border-[#E8B931]";
const MAIN_BG = "bg-white"; 

const MAIN_COORDS = [-7.8051135, 110.2369924];

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
  if (kat.includes("rumah_dukuh")) return "/dukuh.svg";
  if (kat.includes("rumah_rt")) return "/rt.svg";
  if (kat.includes("rumah_rw")) return "/rw.svg";
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
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    async function fetchMapsData() {
      try {
        const data = await getPublicSheets(["maps"]);

        if (Array.isArray(data.maps)) {
          const mappedData = data.maps
            .map((item, idx) => ({
              id: item._row || idx + 1,
              nama: item.nama || item.Nama || "Lokasi Tanpa Nama",
              kategori: item.kategori || item.Kategori || "Lainnya",
              lat: parseFloat(item.latitude || item.Latitude),
              lng: parseFloat(item.longitude || item.Longitude),
            }))
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
  }, []);

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
        {/* SECTION UTAMA (EMBEDDED GOOGLE MAPS) */}
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
            {/* CONTAINER MAPS ROUTING */}
            <div className={`h-[280px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden border-[6px] sm:border-[10px] ${YELLO_BORDER}`}>
              {selectedHotspot ? (
                <RoutingMap
                  start={MAIN_COORDS}
                  end={[selectedHotspot.lat, selectedHotspot.lng]}
                  label={selectedHotspot.nama}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data lokasi
                </div>
              )}
            </div>

            {/* CONTAINER TOMBOL HOTSPOT */}
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
                          ? "bg-[#E8B931]"
                          : "bg-[#4E9A73] hover:bg-[#3d7c5c]"
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
                        <p className="text-[10px] text-white/80 capitalize">
                          {item.kategori}
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