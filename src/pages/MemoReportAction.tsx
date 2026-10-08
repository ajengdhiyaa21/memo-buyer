import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  LogOut,
  RefreshCw,
  Search,
} from "lucide-react"
import { useNavigate } from "react-router"

type Memo = {
  id: string
  nomorMemo: string
  tanggalSubmit: string
  supplierNama: string
  outlets: string[]
  jenisMemo: string
  status?: string
  ringkasan: string
  detail: { label: string value: string }[]
  data?: Record<string, unknown>
  periodeAwal?: string
  periodeAkhir?: string
}
type Vendor = { name: string memos: Memo[] }
const API = "http://localhost:3001"
const labels: Record<string, string> = {
  "memo-program": "Memo Program",
  "pendapatan-lain": "Memo Lain-lain",
  "update-informasi": "Update Informasi",
}
const fallback: Memo[] = [
  {
    id: "SIM-001",
    nomorMemo: "MEM-SIM-001",
    tanggalSubmit: "2026-09-10",
    supplierNama: "PT. Indofood CBP Sukses Makmur",
    outlets: ["MK1", "MK2", "MK3"],
    jenisMemo: "memo-program",
    ringkasan: "Program Display Produk Akhir Tahun",
    detail: [
      { label: "Kategori Media", value: "DISPLAY" },
      { label: "Jenis Media", value: "N-GONDOLA" },
      { label: "Qty", value: "3" },
      { label: "Total", value: "Rp 3.000.000,00" },
    ],
    periodeAwal: "2026-10-01",
    periodeAkhir: "2026-10-31",
  },
  {
    id: "SIM-002",
    nomorMemo: "MEM-SIM-002",
    tanggalSubmit: "2026-09-15",
    supplierNama: "PT. Unilever Indonesia Tbk",
    outlets: ["MK5", "MK6"],
    jenisMemo: "pendapatan-lain",
    ringkasan: "Sewa Wing Gondola Promo Minuman",
    detail: [
      { label: "Kategori Media", value: "DISPLAY" },
      { label: "Jenis Media", value: "WING-GONDOLA" },
      { label: "Qty", value: "2" },
      { label: "Total", value: "Rp 8.500.000,00" },
    ],
    periodeAwal: "2026-10-01",
    periodeAkhir: "2026-10-20",
  },
]
const fmt = (v?: string) => (v ? v.split("-").reverse().join("/") : "-")
const flatten = (value: unknown, prefix = ""): Array<{
  label: string
  value: string
}> => {
  if (value === null || value === undefined || value === "") return []
  if (Array.isArray(value))
    return value.flatMap((item, index) =>
      flatten(item, `${prefix}[${index + 1}]`),
    )
  if (typeof value === "object")
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, item]) => flatten(item, prefix ? `${prefix} / ${key}` : key),
    )
  return [{ label: prefix, value: String(value) }]
}
function exportExcel(memo: Memo) {
  const fields = [...memo.detail, ...flatten(memo.data || {})]
  const html = `<table><tr><th>Field</th><th>Nilai</th></tr>${fields.map((field) => `<tr><td>${field.label}</td><td>${field.value}</td></tr>`).join("")}</table>`
  const blob = new Blob(
    [`<html><meta charset="utf-8"><body>${html}</body></html>`],
    { type: "application/vnd.ms-excel" },
  )
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${memo.nomorMemo}-detail.xls`
  link.click()
  URL.revokeObjectURL(url)
}
function Detail({ memo, back }: { memo: Memo back: () => void }) {
  const fields = [...memo.detail, ...flatten(memo.data || {})]
  return (
    <div className="space-y-5">
      <button
        onClick={back}
        className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke memo vendor
      </button>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-amber-900 px-6 py-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
            DETAIL INPUT SUPPLIER
          </p>
          <h1 className="mt-1 text-2xl font-black">{memo.nomorMemo}</h1>
          <p className="mt-1 text-sm text-slate-300">
            {memo.supplierNama} · {labels[memo.jenisMemo] || memo.jenisMemo}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-5">
          <a
            href={`${API}/api/memo/${memo.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white"
          >
            <FileText className="h-4 w-4" />
            Lihat / Cetak HTML
          </a>
          <button
            onClick={() => exportExcel(memo)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-4">
          <Info label="Supplier" value={memo.supplierNama} />
          <Info
            label="Jenis Memo"
            value={labels[memo.jenisMemo] || memo.jenisMemo}
          />
          <Info label="Outlet" value={memo.outlets.join(", ")} />
          <Info
            label="Periode"
            value={`${fmt(memo.periodeAwal)} s/d ${fmt(memo.periodeAkhir)}`}
          />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">
              Seluruh Data Input Supplier
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Semua data yang tersimpan dari form supplier.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {fields.length} field
          </span>
        </div>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {fields.length ? (
            fields.map((field, index) => (
              <div
                className="grid gap-2 px-4 py-3 sm:grid-cols-[260px_1fr]"
                key={`${field.label}-${index}`}
              >
                <b className="break-words text-xs uppercase tracking-wide text-slate-500">
                  {field.label}
                </b>
                <span className="whitespace-pre-wrap break-words text-sm text-slate-800">
                  {field.value || "-"}
                </span>
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-sm text-slate-500">
              Belum ada detail input.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
function Info({ label, value }: { label: string value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}
export default function MemoReportAction() {
  const nav = useNavigate()
  const role = localStorage.getItem("bm-role")
  const [rows, setRows] = useState<Memo[]>([])
  const [vendor, setVendor] = useState<string | null>(null)
  const [memo, setMemo] = useState<Memo | null>(null)
  const [search, setSearch] = useState("")
  const [jenis, setJenis] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const load = () =>
    fetch(`${API}/api/memo`)
      .then((r) => r.json())
      .then((data) =>
        setRows(Array.isArray(data) && data.length ? data : fallback),
      )
      .catch(() => setRows(fallback))
  useEffect(() => {
    if (!["Akuntansi", "Pembelian"].includes(role || "")) nav("/login")
    else load()
  }, [role])
  const filtered = useMemo(
    () =>
      rows.filter(
        (m) =>
          (!search ||
            JSON.stringify(m).toLowerCase().includes(search.toLowerCase())) &&
          (!jenis || m.jenisMemo === jenis) &&
          (!from || m.tanggalSubmit >= from) &&
          (!to || m.tanggalSubmit <= to),
      ),
    [rows, search, jenis, from, to],
  )
  const vendors = Object.values(
    filtered.reduce<Record<string, Vendor>>((acc, item) => {
      acc[item.supplierNama] ||= { name: item.supplierNama, memos: [] }
      acc[item.supplierNama].memos.push(item)
      return acc
    }, {}),
  )
  const selectedVendor = vendors.find((item) => item.name === vendor)
  if (memo)
    return (
      <main className="h-full overflow-y-auto bg-[#f6f8fb] p-5">
        <Detail memo={memo} back={() => setMemo(null)} />
      </main>
    )
  if (selectedVendor)
    return (
      <main className="h-full overflow-y-auto space-y-5 bg-[#f6f8fb] p-5">
        <button
          onClick={() => setVendor(null)}
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke rekap vendor
        </button>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
            LAPORAN VENDOR
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">
            {selectedVendor.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar seluruh memo supplier
          </p>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-extrabold">Ringkasan Memo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Nomor Memo",
                    "Jenis Memo",
                    "Ringkasan",
                    "Outlet",
                    "Periode",
                    "Aksi",
                  ].map((item) => (
                    <th
                      className="px-5 py-3 text-left text-[11px] uppercase tracking-wide text-slate-500"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedVendor.memos.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-mono text-xs">
                      {item.nomorMemo}
                    </td>
                    <td className="px-5 py-4">
                      {labels[item.jenisMemo] || item.jenisMemo}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {item.ringkasan}
                    </td>
                    <td className="px-5 py-4">{item.outlets.join(", ")}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={
                          item.periodeAkhir &&
                          renewalDays(item.periodeAkhir) <= 30
                            ? "font-bold text-amber-700"
                            : ""
                        }
                      >
                        {fmt(item.periodeAwal)} - {fmt(item.periodeAkhir)}
                      </span>
                      <RenewalFieldBadge date={item.periodeAkhir} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setMemo(item)}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    )
  return (
    <main className="h-full overflow-y-auto space-y-5 bg-[#f6f8fb] p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            Laporan Internal
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">
            Ringkasan Laporan Memo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Laporan keseluruhan memo supplier untuk {role}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("bm-role")
              nav("/login")
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_170px_170px]">
          <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari vendor atau memo..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm"
          >
            <option value="">Semua Jenis Memo</option>
            {Object.entries(labels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm"
          />
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-extrabold">Ringkasan Memo per Vendor</h2>
          <p className="mt-1 text-xs text-slate-500">
            Klik vendor, lalu pilih memo untuk melihat seluruh input supplier.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Vendor",
                  "Jumlah Memo",
                  "Memo Program",
                  "Memo Lain-lain",
                  "Outlet",
                  "Aksi",
                ].map((item) => (
                  <th
                    className="px-5 py-3 text-left text-[11px] uppercase tracking-wide text-slate-500"
                    key={item}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((item) => (
                <tr className="hover:bg-amber-50/40" key={item.name}>
                  <td className="px-5 py-4 font-bold">{item.name}</td>
                  <td className="px-5 py-4">{item.memos.length}</td>
                  <td className="px-5 py-4">
                    {
                      item.memos.filter((m) => m.jenisMemo === "memo-program")
                        .length
                    }
                  </td>
                  <td className="px-5 py-4">
                    {
                      item.memos.filter(
                        (m) => m.jenisMemo === "pendapatan-lain",
                      ).length
                    }
                  </td>
                  <td className="px-5 py-4">
                    {Array.from(
                      new Set(item.memos.flatMap((m) => m.outlets)),
                    ).join(", ")}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setVendor(item.name)}
                      className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Lihat Memo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vendors.length === 0 && (
            <p className="py-14 text-center text-sm text-slate-500">
              Tidak ada memo ditemukan.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
const renewalDays = (date?: string) =>
  date
    ? Math.ceil(
        (new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000,
      )
    : 9999
function RenewalFieldBadge({ date }: { date?: string }) {
  const days = renewalDays(date)
  if (days > 30 || !date) return null
  return (
    <span
      className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${
        days < 0
          ? "bg-red-100 text-red-700"
          : "animate-pulse bg-amber-100 text-amber-800"
      }`}
    >
      {days < 0 ? "Perpanjang segera" : `Perpanjang (${days} hari)`}
    </span>
  )
}
const fieldAliases: Record<string, string> = {
  jenis: "Jenis Program",
  eventJenis: "Jenis Event",
  eventBentuk: "Kategori Media",
  eventMediaJenis: "Jenis Media",
  eventMediaDetails: "Detail Media",
  eventPeriodeAwal: "Periode Mulai",
  eventPeriodeAkhir: "Periode Selesai",
  sewaPeriodeAwal: "Periode Mulai",
  sewaPeriodeAkhir: "Periode Selesai",
  promosiPeriodeAwal: "Periode Mulai",
  promosiPeriodeAkhir: "Periode Selesai",
  namaProgram: "Nama Program",
  sewaNominal: "Nilai Sewa",
  eventNominal: "Nilai Sewa",
  promosiNominal: "Nilai Sewa",
  caraPembayaran: "Cara Pembayaran",
  eventCaraPembayaran: "Cara Pembayaran",
}
const prettyLabel = (raw: string) =>
  raw
    .split(" / ")
    .map((part) => {
      const index = part.match(/\[(\d+)\]/)?.[1]
      const clean = part
        .replace(/\[\d+\]/, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (char) => char.toUpperCase())
      return `${fieldAliases[part.replace(/\[\d+\]/, "")] || clean}${
        index ? ` #${index}` : ""
      }`
    })
    .join(" / ")
const prettyValue = (value: string) =>
  value.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, "$3/$2/$1")
