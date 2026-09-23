"use client";

import { useState, useEffect } from "react";
import { getPublicSheets } from "../lib/public-data";
import { usePublicDataVersion } from "../lib/use-public-refresh";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';

const HEADER_BG = "bg-[#4E9A73]"; 
const HEADER_TEXT = "text-[#4E9A73]";
const YELLO_BG = "bg-[#E8B931]";
const MAIN_BG = "bg-white"; 
const HEADER_BORDER = "border-[#4E9A73]";

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

const defaultKetud = [
  {
    title: "Kepala Padukuhan",
    name: "Shodiqin",
    imageUrl: "/Shodiq.jpg"
  }
];

const defaultPengur = [
  [
    { title: "Sekretaris Padukuhan", name: "Nurul", imageUrl: "/Shodiq.jpg" },
    { title: "Bendahara Padukuhan", name: "Siti", imageUrl: "/Shodiq.jpg" }
  ],
  [
    { title: "Ketua RT 01", name: "Fulan A", imageUrl: "/Shodiq.jpg" },
    { title: "Ketua RT 02", name: "Fulan B", imageUrl: "/Shodiq.jpg" }
  ]
];

const defaultPenduduk = [];

const defaultPotensi = [
  {
    title: "Masjid At Taubah",
    description: "Masjid yang menjadi pusat kegiatan keagamaan di Padukuhan Gamplong IV.",
    imageUrl: "/Shodiq.jpg",
    link: "https://goo.gl/maps/1a2b3c4d5e6f7g8h9"
  }
];

const defaultKelompokMasyarakat = [
  {
    id: "ternak-kambing",
    title: "KELOMPOK TERNAK KAMBING",
    subtitle: "PADUKUHAN GAMPLONG IV",
    bgImage: "/Shodiq.jpg",
    items: [
      {
        image: "/Shodiq.jpg",
        text: "Kegiatan rutin dilakukan setiap bulan untuk memantau kesehatan ternak dan sarana peternakan."
      }
    ]
  }
];

const PaldusCard = ({ title, name, imageUrl }) => (
  <div className={`${HEADER_BG} border-4 border-white p-5 items-center justify-center rounded-4xl mt-10 max-w-md mx-auto`}>
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl mb-10 p-4">
      <div className="relative w-56 h-56 md:w-74 md:h-74 border-2 overflow-hidden rounded-2xl mx-auto">
        <img 
          src={imageUrl || "/Shodiq.jpg"} 
          alt={name}
          className="w-full h-full object-cover"
         loading="lazy" decoding="async"/>
      </div>
      <div className="text-center mt-4">  
        <h3 className="text-xl font-bold text-black uppercase">{title || "-"}</h3>
        <p className="text-black">{name || "-"}</p>
      </div>
    </div>
  </div>
);

const KepdusCardRight = ({ title, name, imageUrl }) => (
  <div className={`${HEADER_BG} border-4 border-white p-5 flex flex-col items-center justify-center rounded-4xl z-20 mt-10 max-w-md mx-auto`}>        
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl mb-10 p-4">
      <div className="relative w-56 h-56 md:w-74 md:h-74 border-2 overflow-hidden rounded-2xl mx-auto">
        <img 
          src={imageUrl || "/Shodiq.jpg"} 
          alt={name}
          className="w-full h-full object-cover"
         loading="lazy" decoding="async"/>
      </div>
      <div className="text-center mt-4">  
        <h3 className="text-xl font-bold text-black uppercase">{title || "-"}</h3>
        <p className="text-black">{name || "-"}</p>
      </div>
    </div>
  </div>
);

const KepdusCardLeft = ({ title, name, imageUrl }) => (
  <div className={`${HEADER_BG} border-4 border-white p-5 flex flex-col items-center justify-center rounded-4xl z-20 mt-10 max-w-md mx-auto`}>        
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl mb-10 p-4">
      <div className="relative w-56 h-56 md:w-74 md:h-74 border-2 overflow-hidden rounded-2xl mx-auto">
        <img 
          src={imageUrl || "/Shodiq.jpg"} 
          alt={name}
          className="w-full h-full object-cover"
         loading="lazy" decoding="async"/>
      </div>
      <div className="text-center mt-4">  
        <h3 className="text-xl font-bold text-black uppercase">{title || "-"}</h3>
        <p className="text-black">{name || "-"}</p>
      </div>
    </div>
  </div>
);

const KelompokItemCard = ({ group }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full max-w-full bg-cover bg-center bg-no-repeat py-12 px-4 md:px-8 flex items-center justify-between cursor-pointer transition-all duration-300 group"
        style={{
          backgroundImage: `url('${group.bgImage || "/Shodiq.jpg"}')`,
          backgroundBlendMode: "multiply",
          backgroundColor: "rgba(0, 0, 0, 0.65)"
        }}
      >
        <div className="flex flex-col items-center justify-center w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-1">
            {group.title}
          </h2>
          {group.subtitle && (
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white/90">
              {group.subtitle}
            </h3>
          )}
        </div>
        <ChevronDown 
          className={`w-7 h-7 md:w-9 md:h-9 text-white transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="bg-white p-6 md:p-10 space-y-8 md:space-y-12 animate-fadeIn">
          {group.items && group.items.map((item, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <div 
                key={idx} 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-center"
              >
                {isEven ? (
                  <>
                    <div className="col-span-1 flex justify-center">
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-2 overflow-hidden rounded-3xl">
                        <img 
                          src={item.image || "/Shodiq.jpg"} 
                          alt={group.title} 
                          className="w-full h-full object-cover" 
                         loading="lazy" decoding="async"/>
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
                      <p className="text-xs sm:text-sm md:text-base text-center md:text-justify text-black leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center order-2 md:order-1">
                      <p className="text-xs sm:text-sm md:text-base text-center md:text-justify text-black leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-center order-1 md:order-2">
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-2 overflow-hidden rounded-3xl">
                        <img 
                          src={item.image || "/Shodiq.jpg"} 
                          alt={group.title} 
                          className="w-full h-full object-cover" 
                         loading="lazy" decoding="async"/>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CollapsibleSection = ({ 
  id,
  title, 
  subtitle, 
  description, 
  bgColor = MAIN_BG, 
  textColor = HEADER_TEXT, 
  defaultOpen = false, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} className={`py-8 md:py-12 ${bgColor} transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-col items-center justify-center cursor-pointer group focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-center gap-3 px-4">
          <h2 className={`text-lg md:text-4xl font-bold text-center ${textColor}`}>
            {title}
          </h2>
          <ChevronDown 
            className={`w-6 h-6 md:w-8 md:h-8 ${textColor} transition-transform duration-300 group-hover:scale-110 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
        {subtitle && (
          <h3 className={`text-xl md:text-3xl hidden md:block font-bold text-center mt-1 ${textColor}`}>
            {subtitle}
          </h3>
        )}
        {description && (
          <p className={`text-xs md:text-sm hidden md:block text-center max-w-3xl mx-auto mt-2 opacity-90 ${textColor}`}>
            {description}
          </p>
        )}
      </button>

      {isOpen && (
        <div className="mt-8 transition-all duration-300 animate-fadeIn">
          {children}
        </div>
      )}
    </section>
  );
};

export default function Home() {
  const publicDataVersion = usePublicDataVersion();
  const [currentImage, setCurrentImage] = useState(0);
  const [dbData, setDbData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPublicSheets(["profil", "kepengurusan", "komunitas", "administrasi", "potensi"]);
        setDbData(data);
      } catch (err) {
        console.error("Gagal mengambil data dari backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [publicDataVersion]);

  const getProfil = (bagian, fallbackText) => {
    const list = dbData.profil || [];
    const item = list.find(p => (p.bagian).toLowerCase() === bagian.toLowerCase());
    return item?.isi || fallbackText;
  };

  const sejarahText = getProfil("sejarah", "Loading Sejarah Padukuhan Gamplong IV...");
  const visiText = getProfil("visi", "Loading Visi Padukuhan Gamplong IV...");
  const misiText = getProfil("misi", "Loading Misi Padukuhan Gamplong IV...");

  const rawKepengurusan = dbData.kepengurusan || [];
  let ketud = defaultKetud;
  let pengur = defaultPengur;

  if (rawKepengurusan.length > 0) {
    const headIndex = rawKepengurusan.findIndex(item => {
      const jab = (item.jabatan).toLowerCase();
      return jab.includes("kepala dukuh") || jab.includes("dukuh");
    });

    const head = headIndex !== -1 ? rawKepengurusan[headIndex] : rawKepengurusan[0];
    ketud = [{
      title: head.jabatan,
      name: head.nama,
      imageUrl: getImage(head, "fotoid", "fotourl")
    }];

    const remaining = rawKepengurusan.filter((_, idx) => (headIndex !== -1 ? idx !== headIndex : idx !== 0));

    if (remaining.length > 0) {
      const formatted = remaining.map(item => ({
        title: item.jabatan,
        name: item.nama,
        imageUrl: getImage(item, "fotoid", "fotourl")
      }));

      pengur = [];
      for (let i = 0; i < formatted.length; i += 2) {
        pengur.push(formatted.slice(i, i + 2));
      }
    }
  }

  const rawKomunitas = dbData.komunitas || [];
  let kelompokMasyarakat = defaultKelompokMasyarakat;

  if (rawKomunitas.length > 0) {
    kelompokMasyarakat = rawKomunitas.map((item, idx) => ({
      id: item._row || `komunitas-${idx}`,
      title: item.nama ? item.nama.toUpperCase() : "KELOMPOK MASYARAKAT",
      subtitle: "PADUKUHAN GAMPLONG IV",
      bgImage: getImage(item, "fotobid", "fotoburl"),
      items: [
        ...(item.deskripsi1 ? [{
          image: getImage(item, "foto1id", "foto1url"),
          text: item.deskripsi1
        }] : []),
        ...(item.deskripsi2 ? [{
          image: getImage(item, "foto2id", "foto2url"),
          text: item.deskripsi2
        }] : [])
      ]
    }));
  }

  const rawAdministrasi = dbData.administrasi || [];
  let pendudud = defaultPenduduk;

  if (rawAdministrasi.length > 0) {
    const formattedAdmin = rawAdministrasi.map(item => ({
      title: item.bagian,
      value: item.isi,
      imageUrl: getImage(item, "fotoid", "fotourl")
    }));

    pendudud = [];
    for (let i = 0; i < formattedAdmin.length; i += 3) {
      pendudud.push(formattedAdmin.slice(i, i + 3));
    }
  }

  const rawPotensi = dbData.potensi || [];
  let potensi = defaultPotensi;

  if (rawPotensi.length > 0) {
    potensi = rawPotensi.map(item => ({
      title: item.nama || "-",
      description: item.deskripsi || "-",
      imageUrl: getImage(item, "fotoid", "fotourl"),
    }));
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev === potensi.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? potensi.length - 1 : prev - 1));
  };

  const safeCurrentImage = potensi.length > 0 ? Math.min(currentImage, potensi.length - 1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E9A73]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${MAIN_BG}`}>

{/* SEJARAH PADUKUHAN */}
      <CollapsibleSection 
        title="SEJARAH"
        subtitle="PADUKUHAN GAMPLONG IV"
        description="Profil dan Sejarah Padukuhan Gamplong IV."
        bgColor={HEADER_BG}
        textColor="text-white"
        id="sejarah"
      >
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:bg-white md:grid-cols-2 gap-6 md:pr-12 md:gap-8 items-stretch">
          <div className="col-span-1 flex justify-center items-center">
            <div className="relative w-full h-48 md:h-full min-h-[300px] overflow-hidden mx-auto">
                <img 
                  src="/sejarah.jpg" 
                  alt="Sejarah Padukuhan"
                  className="w-full h-full object-cover object-center"
                  loading="lazy" 
                  decoding="async"/>
              </div>
            </div>
            <div className="col-span-1 flex flex-col justify-center">
              <p className="text-xs md:text-sm md:py-5 text-center md:text-left md:text-black leading-relaxed whitespace-pre-line px-5 md:px-0">
                {sejarahText}
              </p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

{/* VISI PADUKUHAN */}
      <CollapsibleSection 
        title="VISI"
        subtitle="PADUKUHAN GAMPLONG IV"
        description="Visi Padukuhan Gamplong IV."
        bgColor={MAIN_BG}
        textColor={HEADER_TEXT}
        id="visi"
      >
        <div className="mx-auto">
          <div className={`grid grid-cols-1 md:bg-[#4E9A73] md:grid-cols-2 gap-6 md:pl-12 md:gap-8 items-center`}>
            <div className="col-span-1 flex flex-col justify-center order-2 md:order-1">
              <p className={`text-xs md:text-xl text-bold text-center text-black md:text-end md:text-white leading-relaxed whitespace-pre-line px-5 md:px-0`}>
                {visiText}
              </p>
            </div>
            <div className="col-span-1 order-1 md:order-2">
              <div className="relative w-48 h-48 md:w-auto md:h-100 overflow-hidden mx-auto">
                <img 
                  src="/visi.jpg" 
                  alt="Visi Padukuhan"
                  className="w-full h-full object-cover"
                 loading="lazy" decoding="async"/>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

{/* MISI PADUKUHAN */}
      <div className={`${YELLO_BG} h-2`}/>
      <CollapsibleSection 
        title="MISI"
        subtitle="PADUKUHAN GAMPLONG IV"
        description="Misi Padukuhan Gamplong IV."
        bgColor={HEADER_BG}
        textColor="text-white"
        id="misi"
      >
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:bg-white md:grid-cols-2 gap-6 md:pr-12 md:gap-8 items-stretch">
          
          <div className="col-span-1 flex justify-center items-center">
            <div className="relative w-full h-48 md:h-full min-h-[300px] overflow-hidden mx-auto">
              <img 
                src="/misi.jpg" 
                alt="Misi Padukuhan"
                className="w-full h-full object-cover object-center"
                loading="lazy" 
                decoding="async"
              />
            </div>
          </div>

          <div className="col-span-1 flex flex-col justify-center">
            <p className="md:py-8 text-xs md:text-sm text-center md:text-left md:text-black leading-relaxed whitespace-pre-line px-5 md:px-0">
              {misiText}
            </p>
          </div>

        </div>
      </div>
      </CollapsibleSection>

{/* KEPENGURUSAN */}
      <CollapsibleSection 
        title="KEPENGURUSAN"
        subtitle="PADUKUHAN GAMPLONG IV"
        description="Kepengurusan Pemerintahan dan Pimpinan Kelompok Masyarakat Padukuhan Gamplong IV."
        bgColor={MAIN_BG}
        textColor={HEADER_TEXT}
        id="kepengurusan"
      >
        <div className="max-w-5xl mx-auto">
          <div className="relative flex flex-col items-center w-full">
            
            {/* Kepala Padukuhan */}
            {ketud.map((person, index) => (
              <div key={index} className="relative z-20 mb-8 md:mb-12 w-full max-w-md mx-auto">
                <PaldusCard {...person} />
              </div>
            ))}

            {/* Pengurus Padukuhan & RT */}
            {pengur.map((row, rowIndex) => (
              <div key={rowIndex} className="relative z-10 w-full mb-6 md:mb-0">
                <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-5xl mx-auto relative gap-6 md:gap-0">
                  
                  {/* Card Sisi Kiri */}
                  <div className="z-10 justify-start w-full md:w-auto">
                    {row[0] && <KepdusCardRight {...row[0]} />}
                  </div>

                  {/* Ornamen Garis & Lingkaran Desktop */}
                  <div className={`${HEADER_BORDER} absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white border-10 rounded-full z-20 hidden md:block transition-colors duration-300`}/>
                  <div className="hidden md:flex justify-center items-center w-2xl h-5" />
                  <div className={`hidden md:block absolute top-1/2 left-0 right-1/2 h-5 ${HEADER_BG} -translate-y-1/2 z-0`} />
                  
                  {row[1] && (
                    <div className={`hidden md:block absolute top-1/2 left-1/2 right-0 h-5 ${HEADER_BG} -translate-y-1/2 z-0`} />
                  )}
                  
                  <div className={`hidden md:block absolute h-126.5 bottom-1/2 w-2.5 ${HEADER_BG} left-1/2 -translate-x-1/2 z-0`} /> 

                  {/* Card Sisi Kanan */}
                  <div className="z-10 justify-end w-full md:w-auto">
                    {row[1] ? (
                      <KepdusCardLeft {...row[1]} />
                    ) : (
                      <div className="hidden md:block w-44 sm:w-56 md:w-64" />
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* KELOMPOK MASYARAKAT */}
      <div className={`${YELLO_BG} h-2`}/>
      <CollapsibleSection 
        title="KELOMPOK MASYARAKAT"
        subtitle="PADUKUHAN GAMPLONG IV"
        description="Sejarah, tujuan dan ragam kegiatan Kelompok Masyarakat di Padukuhan Gamplong IV."
        bgColor={HEADER_BG}
        textColor="text-white"
        id="ormas"
      >
        <div className="w-full mx-auto">
          {kelompokMasyarakat.map((group) => (
            <KelompokItemCard key={group.id} group={group} />
          ))}
        </div>
      </CollapsibleSection>

      {/* ADMINISTRASI */}
      <CollapsibleSection 
        title="ADMINISTRASI PENDUDUK"
        subtitle="PADUKUHAN GAMPLONG IV"
        description="Kumpulan data dan Statistik seputar Padukuhan Gamplong IV."
        bgColor={MAIN_BG}
        textColor={HEADER_TEXT}
        id="administrasi"
      >
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-4xl">
          <div className="w-full h-full mx-auto">
            <iframe
                src="https://datastudio.google.com/embed/reporting/8689520f-48e0-471f-b777-823899114197/page/PISVE"
                className="w-full h-full border-0 rounded-lg"
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
              </iframe>
          </div>
        </div>
      </CollapsibleSection>

      {/* POTENSI */}
      <div className={`${YELLO_BG} h-2`}/>
      <CollapsibleSection 
        title="POTENSI DESA"
        subtitle="PADUKUHAN GAMPLONG IV"
        description="Profil dan Lokasi Lingkungan dan Potensi Wisata yang ada di Padukuhan Gamplong IV."
        bgColor={HEADER_BG}
        textColor="text-white"
        id="potensi"
      >
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 py-12 mt-12 rounded-3xl ${HEADER_BG} p-6 md:p-10 items-center`}>
          
          {/* Carousel Gambar & Navigasi */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 border-4 border-white overflow-hidden rounded-2xl">
              <img
                src={potensi[safeCurrentImage]?.imageUrl || "/Shodiq.jpg"}
                alt={potensi[safeCurrentImage]?.title}
                className="w-full h-full object-cover transition-opacity duration-300"
               loading="lazy" decoding="async"/>
            </div>
            
            <div className="bg-white w-64 md:w-80 text-center py-2 -mt-4 z-10 rounded-b-lg shadow-md">
              <p className={`uppercase text-xl font-bold ${HEADER_TEXT} text-gray-900`}>
                {potensi[safeCurrentImage]?.title}
              </p>
            </div>

            <div className="w-64 md:w-80 flex items-center pt-6 justify-between px-2">
              <button
                onClick={prevImage}
                className="border-2 border-white text-white p-1 transition-all rounded hover:bg-white hover:text-gray-900"
                aria-label="Previous Image"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>

              <div className="text-center">
                <p className="text-lg text-white font-semibold">
                  {safeCurrentImage + 1} <span className="text-white">/</span> {potensi.length}
                </p>
              </div>

              <button
                onClick={nextImage}
                className="border-2 border-white text-white p-1 transition-all rounded hover:bg-white hover:text-gray-900"
                aria-label="Next Image"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Card Deskripsi Potensi */}
          {potensi.map((item, index) => {
            if (index !== safeCurrentImage) return null;

            return (
              <div key={index} className={`w-full relative rounded-4xl p-2 ${MAIN_BG} transition-all duration-300`}>
                <div className={`grid grid-cols-3 md:grid-cols-6 gap-2 border-2 m-3 p-4 text-white rounded-2xl ${HEADER_BG}`}>
                  <h3 className="col-span-2 text-sm flex items-center justify-start font-black uppercase">Nama Potensi</h3>
                  <h3 className="col-span-1 text-sm text-center flex items-center justify-center font-black md:text-start uppercase"> : </h3>
                  <p className="col-span-3 text-lg font-black">{item.title}</p>

                  <h3 className="col-span-2 text-sm font-black flex items-center justify-start uppercase">Deskripsi</h3>
                  <h3 className="col-span-1 text-sm text-center flex items-center justify-center font-black md:text-start uppercase">:</h3>
                  <p className="col-span-3 font-bold text-xs md:text-sm text-justify">{item.description}</p>
                </div>
              </div>
            );
          })}

        </div>
      </CollapsibleSection>
    </div>
  );
}