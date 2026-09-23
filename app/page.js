"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";
import { getPublicSheets } from "./lib/public-data";
import { usePublicDataVersion } from "./lib/use-public-refresh";

const HEADER_BG = "bg-[#4E9A73]"; 
const HEADER_TEXT = "text-[#4E9A73]";
const YELLO_BG = "bg-[#E8B931]";
const YELLO_BORDER = "border-[#E8B931]";
const MAIN_BG = "bg-white"; 

// Helper pengubah URL Google Drive
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

const defaultPenduduk = [
  { title: "Jumlah Penduduk", value: "1.234", imageUrl: "/penduduk.svg" },
  { title: "Jumlah Laki-laki", value: "600", imageUrl: "/cowo.svg" },
  { title: "Jumlah Perempuan", value: "634", imageUrl: "/cewe.svg" }
];

const defaultInven = [
  { title: "Jumlah Penduduk", value: "9999", imageUrl: "/gelas.svg" },
  { title: "Jumlah Keluarga", value: "567", imageUrl: "/piring.svg" },
  { title: "Jumlah RT", value: "100", imageUrl: "/soblok.svg" }
];

const defaultBerita = [
  {
    id: 1,
    category: "PENGUMUMAN",
    title: "Minyak Goreng Sekarang Harganya Melebihi Minyak Pijet",
    image: "/Shodiq.jpg",
    preview: "Informasi harga sembako dan minyak goreng di wilayah Gamplong IV..."
  },
  {
    id: 2,
    category: "PENGUMUMAN",
    title: "Pengumuman Kerja Bakti Padukuhan Gamplong IV",
    image: "/Shodiq.jpg",
    preview: "Diimbau kepada seluruh warga untuk mengikuti kerja bakti..."
  },
  {
    id: 3,
    category: "KEGIATAN",
    title: "Pelatihan Kewaspadaan & Posko Pengamanan Warga",
    image: "/Shodiq.jpg",
    preview: "Kegiatan gotong royong dan posko pengamanan warga..."
  }
];

const defaultKomunitas = [
  {
    id: 1,
    title: "KELOMPOK TERNAK KAMBING",
    image: "/Shodiq.jpg",
    desc: "Organisasi dan wadah kegiatan peternak kambing di Padukuhan Gamplong IV."
  },
  {
    id: 2,
    title: "KELOMPOK TANI",
    image: "/Shodiq.jpg",
    desc: "Komunitas petani Padukuhan Gamplong IV dalam mengelola hasil bumi dan pertanian."
  },
  {
    id: 3,
    title: "KELOMPOK PEMUDA",
    image: "/Shodiq.jpg",
    desc: "Wadah kreativitas, gotong royong, dan kegiatan kepemudaan Padukuhan Gamplong IV."
  }
];

const CollapsibleSection = ({ 
    id,
    title, 
    subtitle, 
    description, 
    bgColor = MAIN_BG, 
    textColor = HEADER_TEXT, 
    defaultOpen = true, 
    children 
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section id={id} className={`py-8 md:py-12 ${bgColor} md:rounded-2xl px-2 md:px-12 transition-all duration-300`}>
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

const HeroSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [backgrounds, setBackgrounds] = useState([]); 
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchBackgrounds = async () => {
            try {
                const images = ["/1.jpg", "/2.jpg", "/3.jpg"];
                setBackgrounds(images);
            } catch (error) {
                console.error("Error fetching background images:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBackgrounds();
    }, []);

    function goToSlide(index) {
        setActiveIndex(index);
        if (sliderRef.current) {
            sliderRef.current.scrollTo({
                left: index * sliderRef.current.clientWidth,
                behavior: "smooth",
            });
        }
    }

    useEffect(() => {
        if (loading || backgrounds.length <= 1) return;

        const autoSlideInterval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % backgrounds.length;
            goToSlide(nextIndex);
        }, 4000);

        return () => clearInterval(autoSlideInterval);
    }, [activeIndex, loading, backgrounds.length]);

    const handleScroll = () => {
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const newIndex = Math.round(scrollLeft / clientWidth);
            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            }
        }
    };

    if (loading) return <div className="w-full h-[60vh] md:h-[90vh] bg-gray-200 animate-pulse" />;

    return (
        <div className="relative w-full h-[90vh] md:h-[90vh] overflow-hidden">
            <div 
                ref={sliderRef}
                className="flex h-full w-full overflow-x-scroll snap-x snap-mandatory scroll-smooth"
                onScroll={handleScroll}
                style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
                {backgrounds.map((src, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-full h-full snap-center"
                        style={{ width: '100%' }}
                    >
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ 
                                backgroundImage: `url(${src})`,
                                backgroundBlendMode: 'multiply',
                                backgroundColor: 'rgba(0, 0, 0, 0.65)', 
                            }}
                        />
                    </div>
                ))}
            </div>

            <div
              className="w-full h-full bg-cover bg-center z-10 absolute bottom-0 transform"
              style={{ backgroundImage: "url('/kereta.png')" }}
            />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pb-10 pointer-events-none">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-md mb-1 uppercase tracking-wide">
                    WEBSITE RESMI
                </h2>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#E8B931] drop-shadow-md mb-3 uppercase tracking-wide">
                    PADUKUHAN GAMPLONG IV
                </h2>
                <p className="text-xs md:text-sm text-white max-w-2xl drop-shadow px-2">
                    Sumber informasi dan berita terbaru seputar Padukuhan Gamplong IV. 
                </p>
            </div>

            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center space-x-2">
                {backgrounds.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${
                            index === activeIndex ? "bg-white scale-110" : "bg-gray-400 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default function Home() {
  const publicDataVersion = usePublicDataVersion();
    const [isDesktop, setIsDesktop] = useState(true);
    const [dbData, setDbData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getPublicSheets([
                    "profil",
                    "berita",
                    "komunitas",
                    "inventaris",
                    "administrasi",
                    "kepengurusan",
                ]);
                setDbData(data);
            } catch (err) {
                console.error("Gagal mengambil data backend:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [publicDataVersion]);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const rawProfil = dbData.profil || [];
    const profilSambutan = rawProfil.find(item => 
        (item.bagian).toLowerCase().includes("sambutan")
    ) || rawProfil[0] || {};

    const sambutanTeks = 
        profilSambutan.isi || 
        "Selamat datang di website resmi Padukuhan Gamplong IV. Website ini hadir sebagai media komunikasi, transparansi informasi publik, serta sarana promosi potensi wilayah Padukuhan Gamplong IV kepada masyarakat luas.";

    const rawBerita = dbData.berita || [];
    let processedBerita = defaultBerita;

    if (rawBerita.length > 0) {
        const sortedBerita = [...rawBerita].reverse();

        const newestPengumumanIndex = sortedBerita.findIndex(b => 
            (b.kategori || b.category || "").toLowerCase() === "pengumuman"
        );

        let middleBerita = newestPengumumanIndex !== -1 ? sortedBerita[newestPengumumanIndex] : sortedBerita[0];
        const remainingBerita = sortedBerita.filter((_, idx) => (newestPengumumanIndex !== -1 ? idx !== newestPengumumanIndex : idx !== 0));

        let leftBerita = remainingBerita[0] || middleBerita;
        let rightBerita = remainingBerita[1] || remainingBerita[0] || middleBerita;

        const newsList = [leftBerita, middleBerita, rightBerita];

        processedBerita = newsList.map((item, idx) => ({
            id: item.id || item._row || idx,
            category: (item.kategori || item.category || "BERITA").toUpperCase(),
            title: item.judul || item.title || "-",
            image: getImage(item, "fotoid", "fotourl", "/Shodiq.jpg"),
            preview: item.isi || item.deskripsi || item.preview || ""
        }));
    }

    const rawKomunitas = dbData.komunitas || [];
    let processedKomunitas = defaultKomunitas;

    if (rawKomunitas.length > 0) {
        const recentKomunitas = [...rawKomunitas].reverse().slice(0, 3);
        processedKomunitas = recentKomunitas.map((item, idx) => ({
            id: item._row || idx,
            title: (item.nama || "KELOMPOK MASYARAKAT").toUpperCase(),
            image: getImage(item, "fotobid", "fotoburl", "/Shodiq.jpg"),
            desc: item.deskripsi1 || item.deskripsi2 || "Wadah kegiatan kemasyarakatan Padukuhan Gamplong IV."
        }));
    }

    const rawInventaris = dbData.inventaris || [];
    let processedInven = defaultInven;

    if (rawInventaris.length > 0) {
        const combinedMap = rawInventaris.reduce((acc, item) => {
            const name = item.nama_barang;
            const qty = Number(item.jumlah) || 0;

            if (!acc[name]) {
                acc[name] = 0;
            }
            acc[name] += qty;

            return acc;
        }, {});

        processedInven = Object.keys(combinedMap).slice(0,3).map(namaBarang => ({
            title: namaBarang,
            value: combinedMap[namaBarang],
            imageUrl: namaBarang.toLowerCase() + ".svg" || "barang.svg"
        }));
    }


    const rawAdministrasi = dbData.administrasi || [];
    let processedPenduduk = defaultPenduduk;

    if (rawAdministrasi.length > 0) {
        processedPenduduk = rawAdministrasi.slice(0, 3).map(item => ({
            title: "jumlah " + item.bagian,
            value: item.isi,
            imageUrl: item.bagian + ".svg"
        }));
    }

    const rawKepengurusan = dbData.kepengurusan || [];
    const kadusData = rawKepengurusan.find(item => {
        const jab = (item.jabatan || item.Jabatan || "").toLowerCase();
        return jab.includes("kepala dusun") || jab.includes("dukuh");
    });
    const kadusNama = kadusData?.nama || "Pak Dukuh";
    const kadusFoto = getImage(kadusData, "fotoid", "fotourl", "/Shodiq.jpg");

    const displayedBerita = isDesktop ? processedBerita : processedBerita.slice(1, 2);
    const displayedPenduduk = isDesktop ? processedPenduduk : processedPenduduk.slice(0, 3);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4E9A73]" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${MAIN_BG}`}>
            
            <HeroSlider />

{/* SAMBUTAN KEPALA Padukuhan */}
            <section className={`px-4 ${MAIN_BG} mt-6 md:mt-10`}>
                <div className={`${HEADER_TEXT} max-w-5xl mx-auto`}>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mt-3 mb-1">
                        SAMBUTAN KATA
                    </h2>
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-5">
                        KEPALA PADUKUHAN GAMPLONG IV
                    </h2>

                    <div className={`${HEADER_BG} border-4 p-2 md:p-3 flex flex-col items-center justify-center rounded-3xl md:rounded-4xl mt-6 md:mt-10 max-w-md mx-auto`}>
                        <div className="flex flex-col items-center justify-center bg-white rounded-2xl my-4 md:my-10 p-4 w-full">
                            <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 overflow-hidden rounded-2xl mx-auto">
                                <img 
                                    src={kadusFoto} 
                                    alt="Kepala Padukuhan"
                                    className="w-full h-full object-cover"
                                 loading="lazy" decoding="async"/>
                            </div>
                            <div className="text-center mt-3 md:mt-4">  
                                <h3 className="text-lg md:text-xl font-bold text-black">{kadusNama}</h3>
                                <p className="text-xs md:text-sm text-gray-600">Kepala Padukuhan</p>
                            </div>
                        </div>
                    </div>

                    {rawProfil.length > 0 && (
                        <p className="text-sm text-gray-700 text-center py-8 whitespace-pre-line">
                            {sambutanTeks}
                        </p>
                    )}
                </div>
            </section>
           
{/* BERITA TERKINI */}
            <div className={`${YELLO_BG} h-2`}/>
            <section className={`py-8 md:py-12 px-4 ${HEADER_BG}`}>
                <div className="max-w-5xl mx-auto text-white text-center">
                    <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                        BERITA TERKINI
                    </h2>
                    <h2 className="text-xl md:text-3xl font-bold mb-2">
                        PADUKUHAN GAMPLONG IV
                    </h2>
                    <p className="text-xs md:text-sm max-w-3xl mx-auto mb-6 md:mb-12">
                        Kumpulan berita terbaru seputar Padukuhan Gamplong IV, mulai dari kegiatan, pengumuman, hingga informasi penting lainnya.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {displayedBerita.map((item, index) => {
                            const isMiddle = isDesktop && index === 1; 

                            return (
                                <div 
                                    key={`berita-${item.id}-${index}`} 
                                    className={`bg-white text-left rounded-xl flex flex-col justify-between transition-all duration-300 p-4 ${
                                        isMiddle 
                                            ? "md:p-6 md:scale-110 md:-translate-y-1 z-10" 
                                            : "md:scale-95 opacity-100 md:opacity-90" 
                                    }`}
                                >
                                    <div>
                                        <div className={`relative w-full rounded-xl overflow-hidden mb-3 h-48 md:${isMiddle ? 'h-52' : 'h-44'}`}>
                                            <img 
                                                src={item.image} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover"
                                             loading="lazy" decoding="async"/>
                                        </div>
                                        <span className="text-[10px] font-extrabold bg-[#4E9A73] text-white px-2.5 py-1 rounded-full uppercase">
                                            {item.category}
                                        </span>
                                        <h3 className={`font-extrabold text-black leading-tight mt-2 mb-2 line-clamp-2 text-base ${isMiddle ? 'md:text-base' : 'md:text-sm'}`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {item.preview}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center mt-8 md:mt-12"> 
                        <Link href="berita" className="bg-white text-[#4E9A73] hover:bg-[#E8B931] hover:text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer group">
                            SELENGKAPNYA
                        </Link>
                    </div>
                </div>
            </section>

{/* ADMINISTRASI PENDUDUK */}
            <section className={`py-8 md:py-12 md:px-4 ${MAIN_BG}`}>
                <div className={`md:max-w-5xl mx-auto ${HEADER_TEXT} text-center`}>
                    <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 px-4">
                        ADMINISTRASI PENDUDUK
                    </h2>
                    <h2 className="text-xl md:text-3xl font-bold mb-2 px-4">
                        PADUKUHAN GAMPLONG IV
                    </h2>
                    <p className="text-xs md:text-sm max-w-3xl mx-auto mb-6 md:mb-8 px-4">
                        Informasi administrasi penduduk terkini seputar Padukuhan Gamplong IV.
                    </p>

                    <CollapsibleSection
                    id="infografis"
                    title="INFOGRAFIS"
                    subtitle="PADUKUHAN GAMPLONG IV"
                    description="Infografis seputar Padukuhan Gamplong IV."
                    bgColor={HEADER_BG}
                    textColor="text-white"
                    defaultOpen={false}
                    >
                        <img
                            src="/infografis.png"
                            alt="Infografis"
                            className="w-auto h-full justify-center items-center mx-auto rounded-3xl"
                         loading="lazy" decoding="async"/>
                    </CollapsibleSection>

                    <div className="max-w-5xl mx-auto bg-white pt-12 rounded-2xl md:rounded-4xl shadow-sm md:shadow-none px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {displayedPenduduk.map((item, index) => (
                                <div key={index} className="bg-[#4E9A73] p-4 md:p-6 rounded-2xl text-center flex flex-col items-center justify-center">
                                    <img
                                        src={item.imageUrl} 
                                        alt={item.title}
                                        className="w-16 h-16 md:w-24 md:h-24 rounded-xl mb-2 object-contain"
                                     loading="lazy" decoding="async"/>
                                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1 uppercase">{item.title}</h3>
                                    <p className="text-base md:text-lg text-white font-medium">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center mt-6 md:mt-8 px-4"> 
                        <Link href="/profil" className={`${HEADER_BG} text-white hover:bg-[#E8B931] hover:text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer group`}>
                            SELENGKAPNYA
                        </Link>
                    </div>
                </div>
            </section>
            
{/* MAPS DAN HOTSPOT AREA */}
            <div className={`${YELLO_BG} h-2`}/>
            <section className={`py-8 md:py-12 px-4 ${HEADER_BG}`}>
                <div className="max-w-5xl mx-auto text-white text-center">
                    <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                        MAPS DAN HOTSPOT AREA
                    </h2>
                    <h2 className="text-xl md:text-3xl font-bold mb-2">
                        PADUKUHAN GAMPLONG IV
                    </h2>
                    <p className="text-xs md:text-sm max-w-3xl mx-auto mb-6 md:mb-12">
                        Kumpulan peta dan hotspot area seputar Padukuhan Gamplong IV.
                    </p>
                    
                    <div className="bg-white rounded-2xl p-3 md:p-6 shadow-md mx-auto">
                        <div className={`aspect-square md:aspect-video w-full rounded-xl overflow-hidden border-2 md:border-4 ${YELLO_BORDER}`}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1997.0155609371848!2d110.23699238859953!3d-7.805113498053795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7af900698e4779%3A0xdb881b201d91bbc6!2sdukuh%20gamplong%204!5e1!3m2!1sid!2sid!4v1787988756891!5m2!1sid!2sid"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8 md:mt-12"> 
                        <Link href="/gugelmap" className="bg-white text-[#4E9A73] hover:bg-[#E8B931] hover:text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer group">
                            SELENGKAPNYA
                        </Link>
                    </div>
                </div>
            </section>

{/* INVENTARIS DAN SARANA PRASARANA */}
            <section className={`py-8 md:py-12 px-4 ${MAIN_BG}`}>
                <div className={`max-w-5xl mx-auto ${HEADER_TEXT} text-center`}>
                    <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                        INVENTARIS DAN SARANA PRASARANA
                    </h2>
                    <h2 className="text-xl md:text-3xl font-bold mb-2">
                        PADUKUHAN GAMPLONG IV
                    </h2>
                    <p className="text-xs md:text-sm max-w-3xl mx-auto mb-6 md:mb-8">
                        Informasi inventaris dan sarana prasarana Padukuhan Gamplong IV.
                    </p>

                    <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-4xl shadow-sm md:shadow-none">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {/* UBAH rawInventaris MENJADI processedInven */}
                            {processedInven.map((item, index) => (
                                <div key={index} className="bg-[#4E9A73] p-4 md:p-6 rounded-2xl text-center flex flex-col items-center justify-center">
                                    <img
                                        src={item.imageUrl} 
                                        alt={item.title}
                                        className="w-12 h-12 md:w-16 md:h-16 mb-2 rounded-xl object-contain"
                                        loading="lazy" 
                                        decoding="async"
                                        /* Opsional: Fallback jika file gambar .svg tidak ada di folder public */
                                        onError={(e) => {
                                            e.currentTarget.src = "/default-icon.svg"; 
                                        }}
                                    />
                                    <h3 className="text-lg md:text-2xl uppercase font-bold text-white mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-base md:text-lg text-white font-medium">
                                        {item.value} Units {/* atau sesuaikan kata porsi/unit/buah */}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center mt-6 md:mt-8"> 
                        <Link href="/invensi" className={`${HEADER_BG} text-white hover:bg-[#E8B931] hover:text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer group`}>
                            SELENGKAPNYA
                        </Link>
                    </div>
                </div>
            </section>

{/* KELOMPOK DAN KOMUNITAS */}
            <div className={`${YELLO_BG} h-2`}/>
            <section className={`py-8 md:py-12 px-4 ${HEADER_BG}`}>
                <div className="max-w-5xl mx-auto text-white text-center">
                    <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                        KELOMPOK DAN KOMUNITAS
                    </h2>
                    <h2 className="text-xl md:text-3xl font-bold mb-2">
                        PADUKUHAN GAMPLONG IV
                    </h2>
                    <p className="text-xs md:text-sm max-w-3xl mx-auto mb-6 md:mb-12">
                        Kumpulan kelompok dan komunitas warga di Padukuhan Gamplong IV.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {processedKomunitas.map((item, index) => (
                            <div key={`komunitas-${item.id}-${index}`} className="bg-white rounded-2xl py-4 md:py-5 shadow-md flex flex-col items-center text-center">
                                <div className="w-full h-36 md:h-44 overflow-hidden mb-3 md:mb-5">
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover"
                                     loading="lazy" decoding="async"/>
                                </div>
                                <h3 className="font-extrabold text-sm md:text-base text-[#4E9A73] mb-2 px-4 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed px-4 line-clamp-3">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-8 md:mt-12"> 
                        <Link href="/profil" className="bg-white text-[#4E9A73] hover:bg-[#E8B931] hover:text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer group">
                            SELENGKAPNYA
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}