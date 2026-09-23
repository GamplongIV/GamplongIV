"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Loader2, ImageIcon } from "lucide-react";
import { getPublicSheets } from "../lib/public-data";
import { usePublicDataVersion } from "../lib/use-public-refresh";

const HEADER_BG = "bg-[#4E9A73]";
const MAIN_BG = "bg-white";

const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  
  let str = String(dateInput).trim();
  if (!str) return "-";

  if (str.includes("T")) {
    str = str.split("T")[0];
  } else if (str.includes(" ")) {
    const firstPart = str.split(" ")[0];
    if (firstPart.includes("-") || firstPart.includes("/")) {
      str = firstPart;
    }
  }

  const dateForParsing = str.replace(/-/g, "/");
  const parsedDate = new Date(dateForParsing);

  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return str.replace(/\s*\d{1,2}:\d{2}(:\d{2})?.*/, "").trim() || "-";
};

const fixDriveUrl = (url) => {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([^\/\?]+)/) || url.match(/id=([^&]+)/);
    if (match && match[1]) {
      return `/api/image?id=${encodeURIComponent(match[1])}`;
    }
  }
  return url;
};

const getGaleriImage = (item) => {
  if (item.fotoid) {
    return `/api/image?id=${encodeURIComponent(item.fotoid)}`;
  }
  
  const rawUrl = item.fotourl;
  
  if (rawUrl && !rawUrl.includes("http")) {
    return `/api/image?id=${encodeURIComponent(rawUrl)}`;
  }

  return fixDriveUrl(rawUrl);
};

export default function GaleriPage() {
  const publicDataVersion = usePublicDataVersion();
  const [galeriList, setGaleriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPublicSheets(["galeri"]);
        
        if (Array.isArray(data.galeri)) {
          const formatted = data.galeri.map((item, index) => ({
            id: item._row || index + 1,
            title: item.judul,
            date: item["tanggal upload"],
            content: item.isi,
            image: getGaleriImage(item),
          }))
          .reverse();

          setGaleriList(formatted);
        }
      } catch (error) {
        console.error("Gagal mengambil data galeri:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [publicDataVersion]);

  const activeArticle = galeriList.find((a) => a.id === activeModal);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E9A73]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${MAIN_BG} text-black`}>
      {/* GRID KARTU GALERI */}
      <section className={`${HEADER_BG} px-4 sm:px-6 md:px-12 py-8 sm:py-12 min-h-screen`}>
        {galeriList.length === 0 ? (
          <div className="text-center py-20 text-white font-medium">
            Belum ada foto galeri yang diunggah.
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {galeriList.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveModal(item.id)}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-44 sm:h-48 md:h-52 rounded-xl overflow-hidden mb-3 bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || "Gambar galeri"}
                        className="w-full h-full object-cover"
                       loading="lazy" decoding="async"/>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                        <ImageIcon size={32} />
                        <span className="text-xs">Tidak Ada Gambar</span>
                      </div>
                    )}
                  </div>

                  {/* Meta Tanggal */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar size={14} className="text-[#4E9A73]" />
                    <time dateTime={String(item.date)}>
                      {formatDate(item.date)}
                    </time>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-black leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL DETAIL GALERI */}
      {activeModal && activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-[#4E9A73] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                aria-label="Tutup"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Isi Content Modal */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {activeArticle.image && (
                <div className="w-full h-48 sm:h-60 rounded-xl overflow-hidden relative bg-gray-100">
                  <img
                    src={activeArticle.image}
                    alt={activeArticle.title}
                    className="w-full h-full object-cover"
                   loading="lazy" decoding="async"/>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 font-medium">
                <Calendar size={16} className="text-[#4E9A73]" />
                <time dateTime={String(activeArticle.date)}>
                  {formatDate(activeArticle.date)}
                </time>
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black leading-snug">
                {activeArticle.title}
              </h2>

              {activeArticle.content && (
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                  {activeArticle.content}
                </p>
              )}

              <div className="text-right pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`${HEADER_BG} text-white px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#3d7c5c] transition-colors shadow-sm cursor-pointer`}
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}