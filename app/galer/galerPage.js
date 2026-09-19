"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";

const HEADER_BG = "bg-[#4E9A73]"; 
const HEADER_TEXT = "text-[#4E9A73]";
const YELLO_BG = "bg-[#E8B931]";
const YELLO_TEXT = "text-[#E8B931]";
const MAIN_BG = "bg-white"; 

const newsArticles = [
  { id: 1, title: "Kegiatan Kerja Bakti RT 01", date: "2026-03-10T07:00:00", content: "Kegiatan kerja bakti dilaksanakan pada hari Minggu pagi bersama seluruh warga RT 01 Kalurahan Gamplong IV...", image: "/api/image?id=15ZUuvnafe6uf6vTuQc90ZtNUsvhOCF5z" },
  { id: 2, title: "Posyandu Balita & Lansia", date: "2026-03-08T09:00:00", content: "Layanan kesehatan Posyandu berjalan lancar dengan penimbangan balita dan cek tensi gratis...", image: "/Shodiq.jpg" },
  { id: 3, title: "Rapat Anggota UMKM Gamplong", date: "2026-03-05T19:30:00", content: "Pembahasan strategi promosi produk kerajinan dan kuliner lokal Kalurahan Gamplong IV...", image: "/Shodiq.jpg" },
  { id: 4, title: "Pelatihan Kerajinan Tenun", date: "2026-03-01T13:00:00", content: "Pelatihan diselenggarakan selama dua hari dengan melatih teknik tenun tradisional...", image: "/Shodiq.jpg" },
  { id: 5, title: "Penyuluhan Pengolahan Sampah", date: "2026-02-26T10:00:00", content: "Warga diajak memilah sampah organik dan anorganik dari rumah tangga masing-masing...", image: "/Shodiq.jpg" },
  { id: 6, title: "Turnamen Voli Antar RT", date: "2026-02-20T15:30:00", content: "Turnamen voli tahunan sukses digelar dengan antusiasme tinggi dari para peserta dan penonton...", image: "/Shodiq.jpg" },
  { id: 7, title: "Peringatan Hari Kemerdekaan", date: "2026-02-17T19:00:00", content: "Malam puncak pementasan seni tradisional serta pembagian hadiah lomba meriah digelar...", image: "/Shodiq.jpg" },
  { id: 9, title: "Kunjungan Studi Banding", date: "2026-02-08T09:30:00", content: "Kalurahan Gamplong IV menerima rombongan studi banding terkait pengelolaan desa kerajinan...", image: "/Shodiq.jpg" },
  { id: 10, title: "Penyaluran Bantuan Sosial", date: "2026-02-03T11:00:00", content: "Bantuan bahan pokok diserahkan langsung oleh pengurus RT secara tertib dan transparan...", image: "/Shodiq.jpg" },
  { id: 11, title: "Pengajian Rutin Ibu-Ibu", date: "2026-01-28T16:00:00", content: "Pengajian mingguan diisi dengan ceramah agama dan doa bersama untuk kesejahteraan warga...", image: "/Shodiq.jpg" },
  { id: 12, title: "Bimbingan Belajar Gratis", date: "2026-01-22T14:00:00", content: "Mahasiswa KKN menyelenggarakan bimbel gratis mata pelajaran Matematika dan Bahasa Inggris...", image: "/Shodiq.jpg" },
];

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function BeritaPage() {
  const [activeModal, setActiveModal] = useState(null);

  const activeArticle = newsArticles.find((a) => a.id === activeModal);

  return (
    <div className={`min-h-screen ${MAIN_BG} text-black`}>
      {/* GRID KARTU BERITA */}
      <section className={`${HEADER_BG} px-4 sm:px-6 md:px-12 py-8 sm:py-12`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {newsArticles.map((item) => (
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
                      alt={item.title || "Gambar berita"}
                      className="w-full h-full object-cover"
                     loading="lazy" decoding="async"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Tidak Ada Gambar
                    </div>
                  )}
                </div>

{/* Meta Tanggal & Kategori */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Calendar size={14} className="text-[#4E9A73]" />
                  <time dateTime={item.date}>
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
      </section>

      {/* MODAL DETAIL BERITA */}
      {activeModal && activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-[#438e64] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
                {activeArticle.category || "Berita"}
              </span>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-white/10"
                aria-label="Tutup"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Isi Content Modal */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {activeArticle.image && (
                <div className="w-full h-48 sm:h-60 rounded-xl overflow-hidden relative">
                  <img
                    src={activeArticle.image}
                    alt={activeArticle.title}
                    className="w-full h-full object-cover"
                   loading="lazy" decoding="async"/>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 font-medium">
                <Calendar size={16} className="text-[#4E9A73]" />
                <time dateTime={activeArticle.date}>
                  {formatDate(activeArticle.date)}
                </time>
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black leading-snug">
                {activeArticle.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                {activeArticle.content}
              </p>

              <div className="text-right pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`${HEADER_BG} text-white px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#34704e] transition-colors shadow-sm`}
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