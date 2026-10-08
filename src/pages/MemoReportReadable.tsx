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
    id: "SIM-004",
    nomorMemo: "MEM-SIM-004",
    tanggalSubmit: "2026-09-25",
    supplierNama: "PT. Indofood CBP Sukses Makmur",
    outlets: ["MK1", "MK3"],
    jenisMemo: "pendapatan-lain",
    ringkasan: "Event BLBMS Produk Indofood",
    detail: [
      { label: "Kategori Media", value: "Media Display Produk" },
      { label: "Jenis Media", value: "End Gondola" },
      { label: "Total", value: "Rp 10.000.000,00" },
    ],
    data: {
      pendapatan: {
        jenis: "event-blbms",
        eventJenis: "Belanja Luar Biasa Murah Spektakuler (BLBMS)",
        eventBentuk: "Media Display Produk",
        eventPeriodeAwal: "2026-10-01",
        eventPeriodeAkhir: "2026-10-25",
        eventMediaJenis: ["End Gondola"],
      },
    },
    periodeAwal: "2026-10-01",
    periodeAkhir: "2026-10-25",
  },
]
const fmt = (v?: string) => (v ? v.split("-").reverse().join("/") : "-")
const aliases: Record<string, string> = {
  jenis: "Jenis Program",
  namaProgram: "Nama Program",
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
  eventNominal: "Nilai Sewa",
  sewaNominal: "Nilai Sewa",
  promosiNominal: "Nilai Sewa",
  eventCaraPembayaran: "Cara Pembayaran",
}
const pretty = (key: string) =>
  aliases[key] ||
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase())
const flatten = (value: unknown, path = ""): Array<{
  label: string
  value: string
}> => {
  if (value === null || value === undefined || value === "") return []
  if (Array.isArray(value))
    return value.flatMap((item, index) =>
      flatten(item, `${path}[${index + 1}]`),
    )
  if (typeof value === "object")
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, item]) => flatten(item, path ? `${path} / ${key}` : key),
    )
  return [{ label: path, value: String(value) }]
}
const fieldLabel = (raw: string) =>
  raw
    .split(" / ")
    .map((part) => {
      const match = part.match(/\[(\d+)\]/)
      const key = part.replace(/\[\d+\]/, "")
      return `${pretty(key)}${match ? ` #${match[1]}` : ""}`
    })
    .join(" / ")
const fieldValue = (value: string) =>
  value.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, "$3/$2/$1")
const daysLeft = (date?: string) =>
  date
    ? Math.ceil(
        (new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000,
      )
    : 9999
function ExportButtons({ memo }: { memo: Memo }) {
  const exportExcel = () => {
    const fields = [...memo.detail, ...flatten(memo.data || {})]
    const html = `<table><tr><th>Field</th><th>Nilai</th></tr>${fields.map((field) => `<tr><td>${fieldLabel(field.label)}</td><td>${fieldValue(field.value)}</td></tr>`).join("")}</table>`
    const url = URL.createObjectURL(
      new Blob([`<meta charset="utf-8">${html}`], {
        type: "application/vnd.ms-excel",
      }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `${memo.nomorMemo}-detail.xls`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="flex flex-wrap gap-2">
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
        onClick={exportExcel}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
    </div>
  )
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
        Kembali
      </button>
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-amber-900 px-6 py-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            DETAIL INPUT SUPPLIER
          </p>
          <h1 className="mt-1 text-2xl font-black">{memo.nomorMemo}</h1>
          <p className="mt-1 text-sm text-slate-300">
            {memo.supplierNama} · {labels[memo.jenisMemo] || memo.jenisMemo}
          </p>
        </div>
        <div className="border-b p-5">
          <ExportButtons memo={memo} />
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
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-slate-800">
          Seluruh Data Input Supplier
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Data ditampilkan dengan label yang mudah dibaca sesuai bagian form.
        </p>
        <div className="mt-4 divide-y rounded-xl border">
          {fields.map((field, index) => (
            <div
              className="grid gap-2 px-4 py-3 sm:grid-cols-[280px_1fr]"
              key={index}
            >
              <b className="text-xs uppercase tracking-wide text-slate-500">
                {fieldLabel(field.label)}
              </b>
              <span className="whitespace-pre-wrap break-words text-sm text-slate-800">
                {fieldValue(field.value) || "-"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
function Info({ label, value }: { label: string value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}
export default function MemoReportReadable() {
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
        (item) =>
          (!search ||
            JSON.stringify(item)
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (!jenis || item.jenisMemo === jenis) &&
          (!from || item.tanggalSubmit >= from) &&
          (!to || item.tanggalSubmit <= to),
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
  const selected = vendors.find((item) => item.name === vendor)
  if (memo)
    return (
      <main className="h-full overflow-y-auto bg-[#f6f8fb] p-5">
        <Detail memo={memo} back={() => setMemo(null)} />
      </main>
    )
  if (selected)
    return (
      <main className="h-full overflow-y-auto space-y-5 bg-[#f6f8fb] p-5">
        <button
          onClick={() => setVendor(null)}
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke vendor
        </button>
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black">{selected.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pilih memo untuk melihat seluruh input supplier.
          </p>
        </section>
        <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
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
                ].map((title) => (
                  <th
                    className="px-5 py-3 text-left text-[11px] uppercase text-slate-500"
                    key={title}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {selected.memos.map((item) => {
                const warn =
                  item.periodeAkhir && daysLeft(item.periodeAkhir) <= 30
                return (
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
                    <td
                      className={`px-5 py-4 whitespace-nowrap ${
                        warn ? "font-bold text-amber-700" : ""
                      }`}
                    >
                      {fmt(item.periodeAwal)} - {fmt(item.periodeAkhir)}
                      {warn && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-[10px]">
                          Perpanjang
                        </span>
                      )}
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
                )
              })}
            </tbody>
          </table>
        </section>
      </main>
    )
  return (
    <main className="h-full overflow-y-auto space-y-5 bg-[#f6f8fb] p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
            Laporan Internal
          </p>
          <h1 className="mt-1 text-2xl font-black">Ringkasan Laporan Memo</h1>
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
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
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
      <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
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
              ].map((title) => (
                <th
                  className="px-5 py-3 text-left text-[11px] uppercase text-slate-500"
                  key={title}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {vendors.map((item) => (
              <tr key={item.name}>
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
                    item.memos.filter((m) => m.jenisMemo === "pendapatan-lain")
                      .length
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
      </section>
    </main>
  )
}
const sectionNames: Record<string, string> = {
  identity: "Identitas Supplier",
  programInfo: "Informasi Program",
  pendapatan: "Pendapatan dan Media",
  updateInfo: "Update Informasi",
  budgetLink: "Budget",
  catatan: "Catatan",
}
const groupedFields = (fields: Array<{ label: string value: string }>) =>
  Object.entries(
    fields.reduce<Record<string, Array<{ label: string value: string }>>>(
      (groups, field) => {
        const parts = field.label.split(" / ")
        const root = parts.length > 1 ? parts[0] : "detail"
        const label = parts[parts.length - 1]
        ;(groups[root] ||= []).push({ label, value: field.value })
        return groups
      },
      {},
    ),
  )
