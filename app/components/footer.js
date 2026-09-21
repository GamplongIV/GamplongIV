"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicSheets } from "../lib/public-data";
import { usePublicDataVersion } from "../lib/use-public-refresh";

const HEADER_BG = "bg-[#4E9A73]"; 
const YELLO_BORDER = "border-[#E8B931]";

const DEFAULT_CONTACTS = [
  { nama: "WhatsApp", link: "Loading...", label: "Loading..." },
  { nama: "Email", link: "Loading...", label: "Loading..." },
  { nama: "Instagram", link: "Loading...", label: "Loading..." },
  { nama: "TikTok", link: "Loading...", label: "Loading..." },
];

const formatContactLink = (link = "", nama = "") => {
  const cleanLink = String(link).trim();
  if (cleanLink.startsWith("http://") || cleanLink.startsWith("https://") || cleanLink.startsWith("mailto:")) {
    return cleanLink;
  }
  const text = (String(nama) + " " + cleanLink).toLowerCase();
  if (text.includes("mail") || text.includes("email")) {
    return `mailto:${cleanLink}`;
  }
  if (text.includes("wa") || text.includes("whatsapp") || /^\+?\d+$/.test(cleanLink)) {
    const num = cleanLink.replace(/\D/g, "");
    return `https://wa.me/${num}`;
  }
  return `https://${cleanLink}`;
};

export default function Footer() {
  const publicDataVersion = usePublicDataVersion();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await getPublicSheets(["kontak"]);
        
        if (Array.isArray(data.kontak) && data.kontak.length > 0) {
          const formatted = data.kontak.map((item) => ({
            nama: item.bagian || "Loading...",
            link: item.isi || "",
          }));
          setContacts(formatted);
        } else {
          setContacts(DEFAULT_CONTACTS);
        }
      } catch (error) {
        console.error("Gagal mengambil kontak footer:", error);
        setContacts(DEFAULT_CONTACTS);
      }
    }

    fetchContacts();
  }, [publicDataVersion]);

  const displayContacts = contacts.length > 0 ? contacts : DEFAULT_CONTACTS;

  return (
    <footer className={`${HEADER_BG} py-8 sm:py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-5xl mx-auto text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 text-center md:text-left items-start">
          
          {/* DESKRIPSI */}
          <div className="order-2 md:order-1 flex flex-col items-center md:items-start">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wide">
              Website Resmi Padukuhan Gamplong IV
            </h3>
            <p className="text-xs sm:text-sm text-gray-100 leading-relaxed max-w-sm md:max-w-none">
              Sumber informasi resmi terkait Padukuhan Gamplong IV, termasuk berita, acara, dan informasi penting lainnya.
            </p>
          </div>

          {/* LOGO & JUDUL */}
          <div className="order-1 md:order-2 flex flex-col items-center justify-center">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center leading-tight">
              PADUKUHAN<br />GAMPLONG IV
            </h3>
            <img 
              src="/sleman.svg" 
              alt="Gamplong IV Logo" 
              className="w-28 sm:w-36 md:w-40 h-auto object-contain transition-transform hover:scale-105" 
             loading="lazy" decoding="async"/>
          </div>

          {/* KONTAK PADUKUHAN */}
          <div className="order-3 md:order-3 text-center md:text-right flex flex-col items-center md:items-end">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wide">
              Kontak Padukuhan
            </h3>
            <p className="text-xs sm:text-sm mb-2 text-gray-100 max-w-xs md:max-w-none">
              Jl. Gamplong IV, Desa Sumberagung, Kec. Tempel, Kab. Sleman, Yogyakarta 55552
            </p>

            {displayContacts.map((item, idx) => {
              const href = formatContactLink(item.link, item.nama);
              const label = item.nama;
              const isi = item.link

              return (
                <a 
                  key={idx}
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs sm:text-sm mb-2 hover:underline text-gray-100 block transition-all"
                >
                  {label} : {isi}
                </a>
              );
            })}
          </div>

        </div>

        {/* GARIS PEMBATAS */}
        <hr className={`my-8 sm:my-10 ${YELLO_BORDER} border-t-2 opacity-80`} />

        {/* COPYRIGHT & CREDITS */}
        <div className="space-y-2 text-center text-xs sm:text-sm text-gray-200">
          <p>
            &copy; {new Date().getFullYear()} Padukuhan Gamplong IV. All rights reserved.
          </p>
          <p className="text-[11px] sm:text-xs opacity-90">
            Dibuat dengan{" "}
            <Link 
              href="/admin/login" 
              title="Login Admin"
              className="hover:text-[#E8B931] hover:scale-125 transition-all inline-block font-bold px-0.5 cursor-pointer"
            >
              &lt;3
            </Link>{" "}
            oleh Divisi TI KKN UNY Padukuhan Gamplong IV
          </p>
        </div>
      </div>
    </footer>
  );
}