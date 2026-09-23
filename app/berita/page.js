"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, Calendar, Loader2 } from "lucide-react";
import { getPublicSheets } from "../lib/public-data";
import { usePublicDataVersion } from "../lib/use-public-refresh";

const HEADER_BG = "bg-[#4E9A73]";
const YELLO_BG = "bg-[#E8B931]";

const categories = ["PENGUMUMAN", "BERITA"];

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

const getImage = (item, idKey = "fotoid", urlKey = "fotourl", fallback = "/Shodiq.jpg") => {
  if (!item) return fallback;

  const fileId = item[idKey] || item[idKey.toLowerCase()];
  if (fileId) {
    return `/api/image?id=${encodeURIComponent(fileId)}`;
  }

  const rawUrl = item[urlKey] || item[urlKey.toLowerCase()];
  if (rawUrl) {
    if (!rawUrl.includes("http") && !rawUrl.startsWith("/")) {
      return `/api/image?id=${encodeURIComponent(rawUrl)}`;
    }
    return fixDriveUrl(rawUrl);
  }

  return fallback;
};

export default function BeritaPage() {
  const publicDataVersion = usePublicDataVersion();
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    async function fetchBerita() {
      try {
        const data = await getPublicSheets(["berita"]);

        if (Array.isArray(data.berita)) {
          const mappedArticles = data.berita.map((item, idx) => ({
            id: item._row || idx + 1,
            category: (item.kategori).trim().toUpperCase(),
            title: item.judul,
            image: getImage(item),
            preview: item.preview,
            content: item.isi,
            date: item["tanggal upload"],
          }))
          .reverse();
          setNewsArticles(mappedArticles);
        }
      } catch (error) {
        console.error("Gagal mengambil data berita:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBerita();
  }, [publicDataVersion]);

  const activeArticle = newsArticles.find((a) => a.id === activeModal);

  const toggleCategory = (catName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E9A73]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="py-6 md:py-8">
        {categories.map((catName) => {
          const filteredArticles = newsArticles.filter(
            (article) => article.category === catName
          );

          if (filteredArticles.length === 0) return null;

          const isExpanded = !!expandedCategories[catName];
          const displayedArticles = isExpanded
            ? filteredArticles
            : filteredArticles.slice(0, 3);

          const hasMoreThanThree = filteredArticles.length > 3;

          return (
            <section key={catName} className="mb-8 md:mb-12">
              <div className="max-w-5xl mx-auto px-4 mb-3">
                <span className={`inline-block ${HEADER_BG} text-white font-extrabold text-xs md:text-sm px-6 md:px-8 py-2 rounded-full uppercase tracking-wider`}>
                  {catName}
                </span>
              </div>

              <div className={`w-full h-2 ${YELLO_BG}`}></div>

              <div className={`${HEADER_BG} px-4 sm:px-6 md:px-12 py-8 md:py-12`}>
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {displayedArticles.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveModal(item.id)}
                      className="bg-white rounded-xl p-3 shadow-md hover:scale-[1.02] transition-transform cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                             loading="lazy" decoding="async"/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100">
                              Tidak Ada Gambar
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Calendar size={14} className="text-[#4E9A73]" />
                          <time dateTime={String(item.date)}>
                            {formatDate(item.date)}
                          </time>
                        </div>

                        <h3 className="font-extrabold text-sm md:text-base text-black leading-tight mb-2 line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {item.preview}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMoreThanThree && (
                  <div className="flex justify-center items-center mt-8">
                    <button
                      onClick={() => toggleCategory(catName)}
                      className="bg-white text-[#4E9A73] hover:bg-[#E8B931] hover:text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer group"
                    >
                      <span>
                        {isExpanded ? "Tampilkan Lebih Sedikit" : "Selengkapnya"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>

      {activeModal && activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#4E9A73] text-white px-4 md:px-6 py-3 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-white px-3 py-1 bg-white/20 rounded-full">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white hover:text-yellow-300 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto">
              {activeArticle.image && (
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-40 md:h-52 object-cover rounded-xl mb-4"
                 loading="lazy" decoding="async"/>
              )}

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 font-medium mb-2">
                <Calendar size={16} className="text-[#4E9A73]" />
                <time dateTime={String(activeArticle.date)}>
                  {formatDate(activeArticle.date)}
                </time>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-black mb-3 leading-snug">
                {activeArticle.title}
              </h2>

              <p className="text-xs md:text-sm text-black leading-relaxed text-justify whitespace-pre-line">
                {activeArticle.content}
              </p>

              <div className="text-right mt-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`${HEADER_BG} text-white px-6 py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-[#3d7c5c] transition-colors cursor-pointer`}
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