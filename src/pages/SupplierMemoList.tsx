import { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react"
import { useNavigate } from "react-router"
import {
  demoRows,
  Detail,
  normalizeMemoType,
  type Memo,
} from "./MemoReportGrouped"

const API = "http://localhost:3001"
const DEMO_MODE = true
const memoLabels: Record<string, string> = {
  "memo-lain-lain": "Memo Lain-lain",
  "memo-program": "Memo Program",
  "pendapatan-lain": "Memo Lain-lain",
  "pendapatan-lain-lain": "Memo Lain-lain",
  "Pendapatan Lain-lain": "Memo Lain-lain",
  "Pendapatan Lain Lain": "Memo Lain-lain",
  "pendapatan lain-lain": "Memo Lain-lain",
  "pendapatan lain lain": "Memo Lain-lain",
  "update-informasi": "Update Informasi",
}
const memoTypeOptions = [
  { key: "memo-program", label: "Memo Program" },
  { key: "memo-lain-lain", label: "Memo Lain-lain" },
  { key: "update-informasi", label: "Update Informasi" },
]
const programLabels: Record<string, string> = {
  "event-blbms": "Event",
  "reward-insentif": "Reward/Insentif",
  listing: "Listing",
  "sewa-visibility": "Sewa / Visibility",
  promosi: "Promosi",
  "on-faktur": "On Faktur",
  "off-faktur": "Off Faktur",
}
const programOptions = [
  { key: "on-faktur", label: "On Faktur" },
  { key: "off-faktur", label: "Off Faktur" },
  { key: "event", label: "Event" },
  { key: "reward-insentif", label: "Reward/Insentif" },
  { key: "listing", label: "Listing" },
]

const dateText = (value?: string) =>
  value ? value.split("-").reverse().join("/") : "-"

function readSavedMemos(): Memo[] {
  try {
    const saved = JSON.parse(
      localStorage.getItem("supplier-memo-history") || "[]",
    )
    return Array.isArray(saved) ? saved as Memo[] : []
  } catch {
    return []
  }
}

function programType(memo: Memo) {
  const data = (memo.data || {}) as Record<string, any>
  const income = data.pendapatan || {}
  const program = data.programInfo || {}
  const values = memo.jenisMemo === "memo-program" ? program.tipe : income.jenis
  if (Array.isArray(values)) {
    return (
      values.map((value) => programLabels[value] || value).join(", ") || "-"
    )
  }
  return programLabels[values] || values || "-"
}

export default function SupplierMemoList() {
  const navigate = useNavigate()
  const role = localStorage.getItem("bm-role") || "Akuntansi"
  const [rows, setRows] = useState<Memo[]>([])
  const [search, setSearch] = useState("")
  const [jenis, setJenis] = useState("")
  const [program, setProgram] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [pageSize, setPageSize] = useState(30)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Memo | null>(null)

  const load = () => {
    const saved = readSavedMemos()
    if (DEMO_MODE) {
      setRows([...saved, ...demoRows])
      return
    }
    fetch(`${API}/api/memo`)
      .then((response) => response.json())
      .then((data) => setRows([...saved, ...(Array.isArray(data) ? data : [])]))
      .catch(() => setRows([...saved, ...demoRows]))
  }

  useEffect(() => {
    if (!["Akuntansi", "Pembelian"].includes(role)) {
      navigate("/login")
      return
    }
    load()
  }, [role])

  const filtered = useMemo(
    () =>
      rows.filter((memo) => {
        const haystack =
          `${memo.nomorMemo} ${memo.supplierNama} ${memo.ringkasan}`.toLowerCase()
        const start = memo.periodeAwal || ""
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (!jenis || normalizeMemoType(memo.jenisMemo) === jenis) &&
          (!program || programType(memo) === program) &&
          (!from || start >= from) &&
          (!to || start <= to)
        )
      }),
    [rows, search, jenis, program, from, to],
  )
  const pageCount =
    pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleRows =
    pageSize === 0
      ? filtered
      : filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, jenis, program, from, to, pageSize])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  if (selected) {
    return <Detail memo={selected} back={() => setSelected(null)} />
  }

  return (
    <main className="memo-report-page min-h-full space-y-5 bg-[#f6f8fb] p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
            Data Supplier
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">
            Daftar Memo Supplier
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Seluruh memo yang telah diinput oleh supplier untuk {role}.
          </p>
        </div>
      </header>

      <section className="memo-list-filter rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:px-6">
        <div className="memo-list-filter-controls flex flex-wrap items-center gap-4">
          <div className="flex min-w-[260px] flex-[1_1_320px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor memo, supplier..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={jenis}
            onChange={(event) => setJenis(event.target.value)}
            className="w-full min-w-[180px] flex-[1_1_190px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none xl:w-[190px] xl:flex-none"
          >
            <option value="">Semua Jenis Memo</option>
            {memoTypeOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={program}
            onChange={(event) => setProgram(event.target.value)}
            className="w-full min-w-[200px] flex-[1_1_220px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none xl:w-[220px] xl:flex-none"
          >
            <option value="">Semua Jenis Program</option>
            {programOptions.map((option) => (
              <option key={option.key} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-full min-w-[150px] flex-[1_1_160px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none xl:w-[160px] xl:flex-none"
          />
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-full min-w-[150px] flex-[1_1_160px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none xl:w-[160px] xl:flex-none"
          />
          <button
            onClick={() => {
              setSearch("")
              setJenis("")
              setProgram("")
              setFrom("")
              setTo("")
              setPage(1)
            }}
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Semua Memo Supplier
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filtered.length} memo ditemukan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              Tampilkan
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300"
                aria-label="Jumlah data per halaman"
              >
                <option value={30}>30 data</option>
                <option value={50}>50 data</option>
                <option value={100}>100 data</option>
                <option value={0}>Semua data</option>
              </select>
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-slate-50 text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">No Memo</th>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">Jenis Memo</th>
                <th className="px-5 py-3">Jenis Program</th>
                <th className="px-5 py-3">Periode</th>
                <th className="px-5 py-3">Outlet</th>
                <th className="px-5 py-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((memo) => (
                <tr key={memo.id} className="align-top hover:bg-indigo-50/30">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-700">
                    {memo.nomorMemo}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {memo.supplierNama}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {memoLabels[memo.jenisMemo] || memo.jenisMemo}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {programType(memo)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {dateText(memo.periodeAwal)} s/d{" "}
                    {dateText(memo.periodeAkhir)}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {memo.outlets.join(", ") || "-"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => setSelected(memo)}
                      title="Lihat detail memo"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <p className="py-14 text-center text-sm text-slate-500">
            Tidak ada memo sesuai filter.
          </p>
        )}
        {!!filtered.length && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Menampilkan {pageSize === 0 ? 1 : (page - 1) * pageSize + 1}–
              {pageSize === 0
                ? filtered.length
                : Math.min(page * pageSize, filtered.length)}{" "}
              dari {filtered.length} memo
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1 || pageSize === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
              </button>
              <span className="min-w-20 text-center text-xs font-bold text-slate-600">
                Halaman {page} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                disabled={page >= pageCount || pageSize === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
