"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { getPublicSheets } from "../lib/public-data";
import { usePublicDataVersion } from "../lib/use-public-refresh";

const HEADER_BG = "bg-[#4E9A73]";
const YELLO_BG = "bg-[#E8B931]";
const YELLO_TEXT = "text-[#E8B931]";

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  {
    name: "Profil",
    href: "/prifil",
    subItems: [
      { name: "Sejarah Padukuhan", href: "/prifil" },
      { name: "Visi Padukuhan", href: "/prifil#sejarah" },
      { name: "Misi Padukuhan", href: "/prifil#visi" },
      { name: "Kepengurusan", href: "/prifil#misi" },
      { name: "Kelompok Masyarakat", href: "/prifil#kepengurusan" },
      { name: "Administrasi Penduduk", href: "/prifil#ormas" },
      { name: "Potensi Desa", href: "/prifil#administrasi" },
    ],
  },
  { name: "Berita", href: "/berutu" },
  { name: "Maps", href: "/gugelmap" },
  {
    name: "Inventaris",
    href: "/invensi",
    subItems: [
      { name: "Total Barang", href: "/invensi" },
      { name: "RT 01", href: "/invensi#rt" },
      { name: "RT 02", href: "/invensi#rt-01" },
      { name: "RT 03", href: "/invensi#rt-02" },
      { name: "RT 04", href: "/invensi#rt-03" },
      { name: "RT 05", href: "/invensi#rt-04" },
      { name: "RT 06", href: "/invensi#rt-05" },
    ],
  },
  { name: "Galeri", href: "/galer" },
  { name: "Kontak", isAction: true, actionType: "contact" },
];

const DEFAULT_SOCIAL_LINKS = [
  { nama: "WhatsApp", link: "Loading..." },
  { nama: "Instagram", link: "Loading..." },
  { nama: "Email", link: "Loading..." },
  { nama: "TikTok", link: "Loading..." },
];

const getContactIcon = (bagian = "", link = "") => {
  const text = (String(bagian) + " " + String(link)).toLowerCase();
  if (text.includes("tiktok")) return "/tiktok.svg";
  if (text.includes("wa") || text.includes("whatsapp")) return "/wa.svg";
  if (text.includes("ig") || text.includes("instagram")) return "/ig.svg";
  if (text.includes("mail") || text.includes("email")) return "/mail.svg";
  return "/wa.svg";
};

const formatContactLink = (link = "", bagian = "") => {
  const cleanLink = String(link).trim();
  if (cleanLink.startsWith("http://") || cleanLink.startsWith("https://") || cleanLink.startsWith("mailto:")) {
    return cleanLink;
  }
  const text = (String(bagian) + " " + cleanLink).toLowerCase();
  if (text.includes("mail") || text.includes("email")) {
    return `mailto:${cleanLink}`;
  }
  if (text.includes("wa") || text.includes("whatsapp") || /^\+?\d+$/.test(cleanLink)) {
    const num = cleanLink.replace(/\D/g, "");
    return `https://wa.me/${num}`;
  }
  return `https://${cleanLink}`;
};

export default function Navbar() {
  const publicDataVersion = usePublicDataVersion();
  const [activeModal, setActiveModal] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setOpenSubmenu(null);
  }, []);

  const handleActionClick = (type) => {
    setActiveModal(type);
  };

  const toggleMenu = () => {
    setActiveModal((prev) => (prev === "menu" ? null : "menu"));
    setOpenSubmenu(null);
  };

  const toggleSubmenu = (name) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await getPublicSheets(["kontak"]);
        
        if (Array.isArray(data.kontak) && data.kontak.length > 0) {
          const formatted = data.kontak.map((item) => ({
            nama: item.bagian || item.Bagian || item.nama || item.platform || item.jenis || "Kontak",
            link: item.link || item.url || item.value || item.isi || "",
          }));
          setContacts(formatted);
        } else {
          setContacts(DEFAULT_SOCIAL_LINKS);
        }
      } catch (error) {
        console.error("Gagal mengambil kontak navbar:", error);
        setContacts(DEFAULT_SOCIAL_LINKS);
      } finally {
        setLoadingContacts(false);
      }
    }

    fetchContacts();
  }, [publicDataVersion]);

  const displayContacts = contacts.length > 0 ? contacts : DEFAULT_SOCIAL_LINKS;

  return (
    <nav className={`sticky top-0 left-0 right-0 ${HEADER_BG} z-[9999]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 flex items-center gap-1">
            <span className="text-white text-2xl sm:text-3xl font-bold">GAMPLONG</span>
            <span className={`${YELLO_TEXT} text-xl sm:text-2xl font-bold`}>IV</span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2 lg:space-x-4">
              {NAV_ITEMS.map((item) =>
                item.isAction ? (
                  <button
                    key={item.name}
                    onClick={() => handleActionClick(item.actionType)}
                    className="text-white hover:bg-black/10 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer"
                  >
                    {item.name}
                  </button>
                ) : item.subItems ? (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className="text-white hover:bg-black/10 px-3 py-2 rounded-md text-sm font-medium transition inline-flex items-center gap-1"
                    >
                      {item.name}
                      <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />
                    </Link>
                    <div className="absolute left-0 mt-0 w-52 bg-white rounded-xl shadow-xl py-2 hidden group-hover:block border border-gray-100 animate-in fade-in duration-150">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-[#4E9A73] transition font-medium"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-white hover:bg-black/10 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              aria-label="Toggle Menu"
              className="p-2 rounded-md text-white hover:bg-black/10 focus:outline-none transition cursor-pointer"
            >
              {activeModal === "menu" ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`${YELLO_BG} h-2`} />

      {/* Mobile Menu */}
      {activeModal === "menu" && (
        <div className={`md:hidden ${HEADER_BG} border-t border-green-800`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.isAction ? (
                <button
                  key={item.name}
                  onClick={() => handleActionClick(item.actionType)}
                  className="w-full text-left text-white hover:bg-black/10 block px-3 py-2 rounded-md text-base font-medium transition cursor-pointer"
                >
                  {item.name}
                </button>
              ) : item.subItems ? (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-white hover:bg-black/10 rounded-md">
                    <Link
                      href={item.href}
                      onClick={closeModal}
                      className="px-3 py-2 text-base font-medium"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="p-2 text-white"
                      aria-label="Toggle Submenu"
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 ${
                          openSubmenu === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {openSubmenu === item.name && (
                    <div className="pl-4 space-y-1 border-l-2 border-white/20 ml-3">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={closeModal}
                          className="text-white/90 hover:bg-black/10 block px-3 py-1.5 rounded-md text-sm font-medium transition"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeModal}
                  className="text-white hover:bg-black/10 block px-3 py-2 rounded-md text-base font-medium transition"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* Modal Kontak */}
      {activeModal === "contact" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="relative w-full max-w-sm sm:max-w-md bg-white shadow-2xl rounded-2xl text-black border border-gray-100 p-5 sm:p-6 flex flex-col z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">KONTAK PADUKUHAN</h2>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition cursor-pointer"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className={`${HEADER_BG} p-4 sm:p-5 rounded-xl text-white`}>
              {loadingContacts ? (
                <div className="flex items-center justify-center py-6 text-white">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-sm">Memuat kontak...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayContacts.map((link, index) => {
                    const iconSrc = getContactIcon(link.nama, link.link);
                    const href = formatContactLink(link.link, link.nama);

                    return (
                      <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-lg hover:bg-white/10 transition duration-200 gap-3"
                      >
                        <img
                          src={iconSrc}
                          alt={link.nama}
                          className="w-7 h-7 md:w-15 md:h-15 object-contain flex-shrink-0"
                         loading="lazy" decoding="async"/>
                        <span className="text-white text-sm sm:text-base font-semibold truncate">
                          {link.nama}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}