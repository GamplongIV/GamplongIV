"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Edit3,
  FileImage,
  Image as ImageIcon,
  LayoutDashboard,
  MapPinned,
  Menu,
  Newspaper,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { notifyWebsiteDataChanged } from "../lib/data-change";
import { invalidatePublicDataCache } from "../lib/public-data";
import { getAdminSheets, setAdminSheetCache } from "../lib/admin-data";

const GREEN = "#4E9A73";
const YELLOW = "#E8B931";

const SHEETS = {
  profil: {
    label: "Profil",
    icon: LayoutDashboard,
    fixed: true,
    description: "Sambutan, Sejarah, Visi, dan Misi Padukuhan.",
    fields: [{ key: "isi", label: "Isi", type: "textarea", full: true }],
    fixedKeyLabel: "Bagian",
  },
  kepengurusan: {
    label: "Kepengurusan",
    icon: Users,
    fixed: true,
    description: "Data dukuh, RW, dan RT beserta foto pengurus.",
    fields: [
      { key: "nama", label: "Nama", type: "text", required: true },
      { key: "imageBase64", label: "Foto", type: "image", imageId: "fotoid", imageUrl: "fotourl", full: true },
    ],
    fixedKeyLabel: "Jabatan",
  },
  komunitas: {
    label: "Komunitas",
    icon: Users,
    description: "Daftar komunitas serta tiga gambar pendukung.",
    fields: [
      { key: "nama", label: "Nama komunitas", type: "text", required: true },
      { key: "deskripsi1", label: "Deskripsi 1", type: "textarea" },
      { key: "deskripsi2", label: "Deskripsi 2", type: "textarea" },
      { key: "fotobBase64", label: "Foto banner", type: "image", imageId: "fotobid", imageUrl: "fotoburl" },
      { key: "foto1Base64", label: "Foto 1", type: "image", imageId: "foto1id", imageUrl: "foto1url" },
      { key: "foto2Base64", label: "Foto 2", type: "image", imageId: "foto2id", imageUrl: "foto2url" },
    ],
  },
  administrasi: {
    label: "Administrasi",
    icon: BarChart3,
    fixed: true,
    description: "Statistik penduduk dan data administrasi padukuhan.",
    fields: [{ key: "isi", label: "Nilai", type: "text", required: true }],
    fixedKeyLabel: "Bagian",
  },
  potensi: {
    label: "Potensi",
    icon: Database,
    description: "Potensi dan keunggulan Padukuhan Gamplong IV.",
    fields: [
      { key: "nama", label: "Nama potensi", type: "text", required: true },
      { key: "deskripsi", label: "Deskripsi", type: "textarea", full: true },
      { key: "imageBase64", label: "Foto", type: "image", imageId: "fotoid", imageUrl: "fotourl", full: true },
    ],
  },
  berita: {
    label: "Berita",
    icon: Newspaper,
    description: "Berita dan pengumuman yang tampil pada website.",
    fields: [
      { key: "kategori", label: "Kategori", type: "select", options: ["pengumuman", "berita"], required: true },
      { key: "judul", label: "Judul", type: "text", required: true },
      { key: "preview", label: "Preview", type: "textarea" },
      { key: "isi", label: "Isi berita", type: "textarea", full: true },
      { key: "imageBase64", label: "Gambar", type: "image", imageId: "fotoid", imageUrl: "fotourl", full: true },
      { key: "tanggal upload", label: "Tanggal upload", type: "datetime", required: true },
    ],
  },
  maps: {
    label: "Maps",
    icon: MapPinned,
    description: "Lokasi hotspot dan titik penting di sekitar padukuhan.",
    fields: [
      { key: "nama", label: "Nama lokasi", type: "text", required: true },
      { key: "latitude", label: "Latitude", type: "number", required: true },
      { key: "longitude", label: "Longitude", type: "number", required: true },
      { key: "kategori", label: "Kategori", type: "select", options: ["rumah_dukuh", "rumah_rt", "rumah_rw", "skuter", "gedung", "masjid", "usaha", "pasar", "klinik", "rental", "mushola"], required: true },
    ],
  },
  nama_barang: {
    label: "Nama Barang",
    icon: Database,
    description: "Master nama barang untuk pilihan pada inventaris.",
    fields: [{ key: "nama", label: "Nama barang", type: "text", required: true }],
  },
  inventaris: {
    label: "Inventaris",
    icon: Database,
    description: "Jumlah barang inventaris per RT.",
    fields: [
      { key: "rt", label: "RT", type: "select", options: ["rt 1", "rt 2", "rt 3", "rt 4", "rt 5", "rt 6"], required: true },
      { key: "nama_barang", label: "Nama barang", type: "select-dynamic", source: "nama_barang", required: true },
      { key: "jumlah", label: "Jumlah", type: "number", required: true },
    ],
  },
  galeri: {
    label: "Galeri",
    icon: ImageIcon,
    description: "Dokumentasi kegiatan dan foto galeri website.",
    fields: [
      { key: "judul", label: "Judul", type: "text", required: true },
      { key: "isi", label: "Deskripsi", type: "textarea" },
      { key: "imageBase64", label: "Foto", type: "image", imageId: "fotoid", imageUrl: "fotourl", full: true },
      { key: "tanggal upload", label: "Tanggal upload", type: "datetime", required: true },
    ],
  },
  kontak: {
    label: "Kontak",
    icon: LayoutDashboard,
    fixed: true,
    description: "Nomor WhatsApp, email, Instagram, dan TikTok.",
    fields: [{ key: "isi", label: "Isi", type: "text", required: true }],
    fixedKeyLabel: "Bagian",
  },
};

const GROUPS = [
  { label: "Informasi Padukuhan", items: ["profil", "kepengurusan", "administrasi", "kontak"] },
  { label: "Konten Website", items: ["berita", "komunitas", "potensi", "galeri", "maps"] },
  { label: "Inventaris", items: ["nama_barang", "inventaris"] },
];

function emptyForm(sheetName, row) {
  const config = SHEETS[sheetName];
  const initial = { removeImageFields: [] };
  config.fields.forEach((field) => {
    initial[field.key] = "";
    if (field.type === "select" && field.options?.length) initial[field.key] = field.options[0];
    if (field.type === "image") initial[`__remove_${field.imageId}`] = false;
  });
  if (config.fixed && row?.[config.fixedKeyLabel.toLowerCase()]) {
    initial[config.fixedKeyLabel.toLowerCase()] = row[config.fixedKeyLabel.toLowerCase()];
  }
  if (sheetName === "berita") initial.kategori = "pengumuman";
  if (sheetName === "maps") initial.kategori = "gedung";
  return initial;
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(text)) return text.slice(0, 16);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text.slice(0, 16);
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(value) {
  if (!value) return "-";
  const text = String(value).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (iso) {
    const [, year, month, day, hour, minute] = iso;
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }
  const dmy = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?)?/);
  if (dmy) {
    const [, day, month, year, hour = "00", minute = "00"] = dmy;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} ${String(hour).padStart(2, "0")}:${minute}`;
  }
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }
  return text;
}

function normalizeFieldName(key) {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function getRowField(row, key) {
  if (!row) return undefined;
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  const wanted = normalizeFieldName(key);
  const foundKey = Object.keys(row).find((candidate) => normalizeFieldName(candidate) === wanted);
  return foundKey ? row[foundKey] : undefined;
}

function displayValue(row, key) {
  const value = getRowField(row, key);
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function RowActions({ onEdit, onDelete, allowDelete = true }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
        title="Edit"
      >
        <Edit3 size={15} />
      </button>
      {allowDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
          title="Hapus permanen"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeSheet, setActiveSheet] = useState("profil");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState({});
  const pageSize = 8;

  const config = SHEETS[activeSheet];
  const rows = useMemo(
    () => (Array.isArray(data[activeSheet]) ? data[activeSheet] : []),
    [data, activeSheet]
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const currentRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function apiPost(payload) {
    const res = await fetch("/api/admin/gas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) throw new Error(json.message || "Gagal menyimpan data.");
    return json;
  }

  function requiredSheetsForActiveSheet() {
    if (activeSheet === "inventaris" || activeSheet === "nama_barang") {
      return ["inventaris", "nama_barang"];
    }
    return [activeSheet];
  }

  async function loadActiveSheet(showToast = false, force = false) {
    setLoading(true);
    try {
      const sheets = requiredSheetsForActiveSheet();
      const result = await getAdminSheets(sheets, { force });
      setData((prev) => ({ ...prev, ...(result || {}) }));
      if (showToast) toast("Data berhasil disegarkan.", "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActiveSheet();
  }, [activeSheet]);

  function toast(message, type = "success") {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3500);
  }

  function openAdd() {
    setModal("form");
    setForm(emptyForm(activeSheet));
  }

  function openEdit(row) {
    const formCopy = { ...row };
    config.fields.forEach((field) => {
      if (field.type === "datetime") {
        formCopy[field.key] = toDateTimeLocal(getRowField(row, field.key));
      }
      if (field.type === "image" && field.imageUrl && row[field.imageUrl]) {
        formCopy[field.imageUrl] = row[field.imageUrl];
      }
    });
    setModal({ type: "form", row });
    setForm(formCopy);
  }

  function closeModal() {
    if (busy) return;
    setModal(null);
    setForm({});
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(field, file) {
    if (!file) return;
    try {
      const result = await compressImageFile(file);
      const metaPrefix = field.key.replace(/Base64$/, "");
      setForm((prev) => ({
        ...prev,
        [field.key]: result.dataUrl,
        [`${metaPrefix}Name`]: result.fileName,
        [`${metaPrefix}MimeType`]: result.mimeType,
        [`__remove_${field.imageId}`]: false,
      }));
    } catch (error) {
      toast(error.message || "Gagal membaca gambar.", "error");
    }
  }

  async function saveForm(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const payload = {};
      const removeImageFields = [];
      config.fields.forEach((field) => {
        if (field.type === "image") {
          const value = form[field.key];
          const metaPrefix = field.key.replace(/Base64$/, "");
          if (value && String(value).startsWith("data:")) {
            payload[field.key] = value;
            payload[`${metaPrefix}Name`] = form[`${metaPrefix}Name`] || `${activeSheet}-${Date.now()}.jpg`;
            payload[`${metaPrefix}MimeType`] = form[`${metaPrefix}MimeType`] || "image/jpeg";
          }
          if (form[`__remove_${field.imageId}`]) {
            removeImageFields.push(field.imageId);
          }
        } else {
          payload[field.key] = form[field.key] ?? "";
        }
      });
      if (removeImageFields.length) payload.removeImageFields = removeImageFields;

      let result;

      if (config.fixed) {
        const key = config.fixedKeyLabel.toLowerCase();
        const rowKey = modal?.row?.[key] || form[key];
        if (!rowKey) throw new Error("Kunci data tetap tidak ditemukan.");
        result = await apiPost({
          action: "replaceFixed",
          sheet: activeSheet,
          key: rowKey,
          data: payload,
        });
      } else if (modal?.row?._row) {
        result = await apiPost({
          action: "update",
          sheet: activeSheet,
          row: modal.row._row,
          data: payload,
        });
      } else {
        result = await apiPost({
          action: "add",
          sheet: activeSheet,
          data: payload,
        });
      }

      const saved = result.data;
      invalidatePublicDataCache();
      notifyWebsiteDataChanged(result.version);
      setData((prev) => {
        const list = Array.isArray(prev[activeSheet]) ? [...prev[activeSheet]] : [];
        const index = saved?._row ? list.findIndex((item) => item._row === saved._row) : -1;
        if (index >= 0) list[index] = saved;
        else list.push(saved);
        setAdminSheetCache(activeSheet, list);
        return { ...prev, [activeSheet]: list };
      });

      toast(modal?.row ? "Data berhasil diperbarui." : "Data berhasil ditambahkan.", "success");
      closeModal();

    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function removeRow(row) {
    if (activeSheet === "nama_barang") {
      const used = (data.inventaris || []).some(
        (item) => String(item.nama_barang).trim().toLowerCase() === String(row.nama).trim().toLowerCase()
      );
      if (used) {
        toast("Nama barang tidak bisa dihapus karena masih digunakan di inventaris.", "error");
        return;
      }
    }

    setBusy(true);
    try {
      const result = await apiPost({
        action: "delete",
        sheet: activeSheet,
        row: row._row,
      });
      invalidatePublicDataCache();
      notifyWebsiteDataChanged(result.version);
      setData((prev) => {
        const list = (prev[activeSheet] || []).filter((item) => item._row !== row._row);
        setAdminSheetCache(activeSheet, list);
        return { ...prev, [activeSheet]: list };
      });
      toast("Data berhasil dihapus.", "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function logoutAndViewWebsite() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/");
    }
  }

  const mainColumns = config.fixedKeyLabel
    ? [config.fixedKeyLabel.toLowerCase(), ...config.fields.map((field) => field.key)]
    : config.fields.map((field) => field.key);

  const visibleColumns = mainColumns
    .filter((key, index, arr) => arr.indexOf(key) === index)
    .filter((key) => !key.includes("Base64") && !key.toLowerCase().includes("mime") && !key.toLowerCase().endsWith("id") && !key.toLowerCase().endsWith("url"))
    .filter((key) => !config.fields.find((field) => field.key === key && field.type === "image"))
    .filter((key) => key !== "fotobid" && key !== "foto1id" && key !== "foto2id")
    .slice(0, 5);

  const imageFields = config.fields.filter((field) => field.type === "image");
  const tableHeaders = visibleColumns.map((key) => {
    const field = config.fields.find((item) => item.key === key);
    return field?.label || key;
  });

  function renderCell(row, key) {
    const value = getRowField(row, key);
    if (value === undefined || value === null || value === "") return <span className="text-gray-400">-</span>;
    if (key.toLowerCase().endsWith("url")) {
      return (
        <a href={value} target="_blank" rel="noreferrer" className="text-xs text-[#4E9A73] underline">
          Lihat
        </a>
      );
    }
    if (key === "tanggal upload") {
      return <span className="whitespace-nowrap">{formatDate(value)}</span>;
    }
    if (key === "preview" || key === "isi" || key === "deskripsi" || key === "deskripsi1" || key === "deskripsi2") {
      return <span className="line-clamp-2 text-gray-600">{String(value)}</span>;
    }
    return <span>{String(value)}</span>;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-gray-900">
      {notice && (
        <div
          className={`fixed right-4 top-4 z-[100] max-w-sm rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
            notice.type === "error" ? "bg-red-600 text-white" : "bg-[#1F6A4A] text-white"
          }`}
        >
          <div className="flex items-start gap-2">
            {notice.type === "error" ? <AlertCircle size={18} /> : <Save size={18} />}
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)} className="ml-2 opacity-80 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="text-[11px] font-bold tracking-[0.22em] text-[#4E9A73]">PANEL ADMIN</div>
              <div className="text-base font-extrabold">Padukuhan Gamplong IV</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logoutAndViewWebsite}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E8B931] px-3 py-2 text-xs font-extrabold text-black hover:brightness-95 sm:px-4 sm:py-2.5"
            >
              Lihat Website
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          />
        )}

        <aside
          className={`fixed inset-y-16 left-0 z-50 w-72 overflow-y-auto border-r border-black/5 bg-white px-3 py-4 transition-transform lg:static lg:z-auto lg:block lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-5">
            {GROUPS.map((group) => (
              <div key={group.label}>
                <div className="px-3 pb-2 text-[10px] font-extrabold tracking-[0.18em] text-gray-400">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((key) => {
                    const ItemIcon = SHEETS[key].icon;
                    const active = key === activeSheet;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveSheet(key);
                          setPage(1);
                          setSearch("");
                          setSidebarOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                          active
                            ? "bg-[#EAF3EE] text-[#2E6F51]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <ItemIcon size={17} />
                        <span className="flex-1">{SHEETS[key].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="mb-6">
              <div className="flex flex-col gap-4 rounded-3xl bg-[#4E9A73] p-5 text-white shadow-sm sm:p-7 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-[0.16em]">
                    MANAJEMEN DATA
                  </div>
                  <h1 className="text-2xl font-extrabold sm:text-3xl">{config.label}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/85">{config.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openAdd}
                    disabled={config.fixed}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold shadow-sm ${
                      config.fixed
                        ? "cursor-not-allowed bg-white/25 text-white/60"
                        : "bg-[#E8B931] text-black hover:brightness-95"
                    }`}
                    title={config.fixed ? "Sheet fixed-record diedit berdasarkan bagian." : "Tambah data"}
                  >
                    <Plus size={17} />
                    Tambah
                  </button>
                </div>
              </div>
            </section>


            <section className="rounded-3xl border border-black/5 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold">{config.label}</h2>
                  <p className="text-xs text-gray-500">{filteredRows.length} data ditemukan</p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder={`Cari ${config.label.toLowerCase()}...`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#4E9A73] focus:bg-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-[0.06em] text-gray-500">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      {tableHeaders.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
                      {imageFields.map((field) => (
                        <th key={field.key} className="px-4 py-3 whitespace-nowrap">{field.label}</th>
                      ))}
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={tableHeaders.length + imageFields.length + 2} className="px-4 py-16 text-center text-gray-400">Memuat data...</td></tr>
                    ) : currentRows.length === 0 ? (
                      <tr><td colSpan={tableHeaders.length + imageFields.length + 2} className="px-4 py-16 text-center text-gray-400">Belum ada data.</td></tr>
                    ) : currentRows.map((row, index) => (
                      <tr key={row._row} className="border-t border-gray-100 align-top hover:bg-gray-50/70">
                        <td className="px-4 py-3 text-xs font-bold text-gray-400">{(currentPage - 1) * pageSize + index + 1}</td>
                        {visibleColumns.map((key) => (
                          <td key={key} className="max-w-[280px] px-4 py-3">
                            {renderCell(row, key)}
                          </td>
                        ))}
                        {imageFields.map((field) => (
                          <td key={field.key} className="px-4 py-3">
                            <ImageThumb
                              url={getImageUrl(row, field)}
                              fileId={field.imageId ? row[field.imageId] : ""}
                              label={field.label}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <RowActions
                            onEdit={() => openEdit(row)}
                            onDelete={() => removeRow(row)}
                            allowDelete={!config.fixed}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <div className="text-xs text-gray-500">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, currentPage - 1))}
                    className="rounded-lg border border-gray-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, currentPage + 1))}
                    className="rounded-lg border border-gray-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {modal && (
        <FormModal
          sheetName={activeSheet}
          config={config}
          form={form}
          data={data}
          busy={busy}
          editing={Boolean(modal?.row)}
          onChange={updateField}
          onFile={handleFile}
          onClose={closeModal}
          onSubmit={saveForm}
        />
      )}
    </div>
  );
}

async function compressImageFile(file) {
  const MAX_SIZE = 1600;
  const QUALITY = 0.82;

  if (!file.type.startsWith("image/")) {
    throw new Error("File yang dipilih bukan gambar.");
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gambar tidak dapat diproses."));
    img.src = dataUrl;
  });

  const scale = Math.min(1, MAX_SIZE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar.");
  ctx.drawImage(image, 0, 0, width, height);

  const output = canvas.toDataURL("image/jpeg", QUALITY);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

  return {
    dataUrl: output,
    fileName: `${baseName}.jpg`,
    mimeType: "image/jpeg",
  };
}

function driveImageUrl(fileId, originalUrl = "") {
  const id = String(fileId || "").trim();
  if (id) return `/api/image?id=${encodeURIComponent(id)}`;
  const url = String(originalUrl || "").trim();
  if (!url) return "";
  const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]{10,})/);
  if (match?.[1]) return `/api/image?id=${encodeURIComponent(match[1])}`;
  return url;
}

function getImageUrl(row, field) {
  return driveImageUrl(field.imageId ? row?.[field.imageId] : "", field.imageUrl ? row?.[field.imageUrl] : "");
}

function ImageThumb({ url, fileId, label }) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const fallback = fileId ? `/api/image?id=${encodeURIComponent(fileId)}` : "";
  const activeUrl = !failed ? url : fallback;

  if (!activeUrl || fallbackFailed) {
    return (
      <div title={label || "Belum ada gambar"}>
        <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          <FileImage size={18} />
        </div>
        {label && <div className="mt-1 max-w-24 truncate text-[10px] font-semibold text-gray-400">{label}</div>}
      </div>
    );
  }

  return (
    <a href={fallback || activeUrl} target="_blank" rel="noreferrer" className="block" title={label || "Lihat gambar"}>
      <img
        src={activeUrl}
        alt={label || "gambar"}
        onError={() => {
          if (!failed && fallback) setFailed(true);
          else setFallbackFailed(true);
        }}
        className="h-16 w-24 rounded-lg object-cover ring-1 ring-black/5 bg-gray-100"
      />
      {label && <div className="mt-1 max-w-24 truncate text-[10px] font-semibold text-gray-500">{label}</div>}
    </a>
  );
}

function FormModal({ sheetName, config, form, data, busy, editing, onChange, onFile, onClose, onSubmit }) {
  const barangOptions = (data.nama_barang || []).map((item) => item.nama).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-[#4E9A73]">
              {editing ? "EDIT DATA" : config.fixed ? "PERBARUI DATA" : "TAMBAH DATA"}
            </div>
            <h3 className="text-lg font-extrabold">{config.label}</h3>
          </div>
          <button onClick={onClose} disabled={busy} className="rounded-xl p-2 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="max-h-[calc(92vh-130px)] overflow-y-auto px-5 py-5 sm:px-6">
          {config.fixed && (
            <div className="mb-5 rounded-2xl bg-[#F4F8F5] p-4">
              <div className="text-[10px] font-bold tracking-[0.12em] text-gray-400">{config.fixedKeyLabel}</div>
              <div className="mt-1 text-lg font-extrabold text-[#2E6F51]">
                {form[config.fixedKeyLabel.toLowerCase()] || "-"}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={form[field.key]}
                data={data}
                barangOptions={barangOptions}
                onChange={onChange}
                onFile={onFile}
                form={form}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold">
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4E9A73] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
            >
              <Save size={16} />
              {busy ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ field, value, data, form, barangOptions, onChange, onFile }) {
  const wrapper = field.full ? "md:col-span-2" : "";
  const label = (
    <label className="mb-1.5 block text-xs font-extrabold text-gray-700">
      {field.label}
      {field.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  if (field.type === "image") {
    const currentUrl = driveImageUrl(field.imageId ? form?.[field.imageId] : "", field.imageUrl ? form?.[field.imageUrl] : "");
    return (
      <div className={wrapper}>
        {label}
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(field, e.target.files?.[0])}
            className="block w-full text-sm"
          />
          {value && String(value).startsWith("data:") ? (
            <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-black/5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Preview gambar baru</div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <img src={value} alt="preview" className="h-36 w-full rounded-xl object-cover sm:h-28 sm:w-44"  loading="lazy" decoding="async"/>
                <div className="text-xs text-gray-500">Gambar baru siap diupload saat disimpan.</div>
              </div>
            </div>
          ) : currentUrl ? (
            <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-black/5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Gambar saat ini</div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href={currentUrl} target="_blank" rel="noreferrer" className="block shrink-0">
                  <img src={currentUrl} alt="gambar saat ini" className="h-36 w-full rounded-xl object-cover sm:h-28 sm:w-44"  loading="lazy" decoding="async"/>
                </a>
                <div className="text-xs text-gray-500">Pilih gambar baru untuk mengganti gambar lama.</div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-gray-400">Belum ada gambar.</div>
          )}

          {currentUrl && !String(value || "").startsWith("data:") && !form?.[`__remove_${field.imageId}`] && (
            <button
              type="button"
              onClick={() => onChange(`__remove_${field.imageId}`, true)}
              className="mt-3 inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
            >
              Hapus foto saat disimpan
            </button>
          )}
          {form?.[`__remove_${field.imageId}`] && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              Foto ini ditandai untuk dihapus permanen saat Anda menekan Simpan.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={wrapper}>
        {label}
        <select
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          required={field.required}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4E9A73]"
        >
          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === "select-dynamic") {
    return (
      <div className={wrapper}>
        {label}
        <select
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          required={field.required}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4E9A73]"
        >
          <option value="">Pilih nama barang</option>
          {barangOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === "datetime") {
    return (
      <div className={wrapper}>
        {label}
        <input
          type="datetime-local"
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          required={field.required}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4E9A73]"
        />
        <p className="mt-1.5 text-[11px] text-gray-400">Tanggal dan waktu diisi manual oleh admin.</p>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={wrapper}>
        {label}
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          required={field.required}
          rows={6}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#4E9A73]"
        />
      </div>
    );
  }

  return (
    <div className={wrapper}>
      {label}
      <input
        type={field.type === "number" ? "number" : "text"}
        step={field.type === "number" ? "any" : undefined}
        value={value ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        required={field.required}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#4E9A73]"
      />
    </div>
  );
}
