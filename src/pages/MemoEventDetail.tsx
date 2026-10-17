import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { demoRows, Detail, type Memo } from "./MemoReportGrouped"
import { FilterCard } from "../components/FilterCard"

const memoLabels: Record<string, string> = {
  "memo-program": "Memo Program",
  "pendapatan-lain": "Memo Lain-lain",
  "update-informasi": "Update Informasi",
}

const dateText = (value?: string) =>
  value ? value.split("-").reverse().join("/") : "-"

const eventOf = (memo: Memo) => {
  const income = (memo.data?.pendapatan || {}) as Record<string, any>
  return String(income.eventJenis || memo.ringkasan || "Event lainnya")
}

const mediaOf = (memo: Memo) => {
  const income = (memo.data?.pendapatan || {}) as Record<string, any>
  const direct = Array.isArray(income.eventMediaJenis)
    ? income.eventMediaJenis
    : []
  return Array.from(new Set(direct.map(String))).join(", ") || "-"
}

const endOf = (memo: Memo) =>
  memo.periodeAkhir ||
  String((memo.data?.pendapatan as any)?.eventPeriodeAkhir || "")

const daysLeft = (value?: string) =>
  value
    ? Math.ceil(
        (new Date(`${value}T00:00:00`).getTime() - Date.now()) / 86400000,
      )
    : 9999

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

export default function MemoEventDetail() {
  const navigate = useNavigate()
  const { eventName } = useParams()
  const [selected, setSelected] = useState<Memo | null>(null)
  const [rows, setRows] = useState<Memo[]>([])
  const [search, setSearch] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const role = localStorage.getItem("bm-role")
    if (!["Akuntansi", "Pembelian"].includes(role || "")) {
      navigate("/login")
      return
    }
    setRows([...readSavedMemos(), ...demoRows])
  }, [navigate])

  const decodedEvent = decodeURIComponent(eventName || "")
  const eventRows = useMemo(
    () =>
      rows.filter(
        (memo) =>
          memo.data?.pendapatan &&
          (memo.data.pendapatan as any).jenis === "event-blbms" &&
          eventOf(memo) === decodedEvent,
      ),
    [rows, decodedEvent],
  )
  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim()
    return eventRows.filter((memo) => {
      const haystack =
        `${memo.nomorMemo} ${memo.supplierNama} ${memo.ringkasan} ${mediaOf(memo)}`.toLowerCase()
      const start = memo.periodeAwal || ""
      return (
        (!query || haystack.includes(query)) &&
        (!from || start >= from) &&
        (!to || start <= to)
      )
    })
  }, [eventRows, search, from, to])
  const pageCount =
    pageSize === 0 ? 1 : Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const visibleRows =
    pageSize === 0
      ? filteredRows
      : filteredRows.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, from, to, pageSize])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  if (selected) {
    return (
      <main className="memo-report-page memo-event-detail-page min-h-full bg-[#f6f8fb] p-5">
        <Detail memo={selected} back={() => setSelected(null)} />
      </main>
    )
  }

  return (
    <main className="memo-report-page memo-event-detail-page min-h-full space-y-5 bg-[#f6f8fb] p-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              Detail Memo Event
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">
              {decodedEvent || "Event"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Daftar memo supplier yang terkait dengan event ini.
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50 px-4 py-3 text-right">
            <p className="text-[10px] font-bold uppercase text-indigo-500">
              Total Memo Event
            </p>
            <p className="mt-1 text-2xl font-black text-indigo-700">
              {eventRows.length}
            </p>
          </div>
        </div>
      </section>

      <FilterCard variant="event">
          <div className="filter-card__search flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor memo, supplier, media..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="filter-card__control filter-card__control--date rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            aria-label="Periode mulai"
          />
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="filter-card__control filter-card__control--date rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            aria-label="Periode selesai"
          />
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="filter-card__control filter-card__control--select filter-card__control--page-size rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            aria-label="Jumlah data per halaman"
          >
            <option value={10}>10 data</option>
            <option value={20}>20 data</option>
            <option value={30}>30 data</option>
            <option value={0}>Semua data</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setFrom("")
              setTo("")
              setPage(1)
            }}
            className="filter-card__control filter-card__reset rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Reset
          </button>
      </FilterCard>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-black text-slate-900">Memo Event</h2>
            <p className="mt-1 text-xs text-slate-500">
              Pilih detail untuk melihat seluruh input supplier.
            </p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {visibleRows.map((memo) => {
            const end = endOf(memo)
            const remaining = daysLeft(end)
            return (
              <div
                key={memo.id}
                className="grid gap-4 px-5 py-4 hover:bg-indigo-50/30 lg:grid-cols-[minmax(280px,1.4fr)_minmax(260px,1fr)_auto] lg:items-center"
              >
                <div className="min-w-[260px] flex-1">
                  <p className="font-mono text-xs font-black text-indigo-700">
                    {memo.nomorMemo}
                  </p>
                  <h3 className="mt-1 font-bold text-slate-900">
                    {memo.supplierNama}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {memoLabels[memo.jenisMemo] || "Memo Lain-lain"} · Outlet:{" "}
                    {memo.outlets.join(", ") || "-"}
                  </p>
                </div>
                <div className="min-w-[210px] text-sm text-slate-600">
                  <p>
                    <span className="font-bold text-slate-400">Periode:</span>{" "}
                    {dateText(memo.periodeAwal)} s/d {dateText(end)}
                  </p>
                  <p className="mt-1">
                    <span className="font-bold text-slate-400">Media:</span>{" "}
                    {mediaOf(memo)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                      remaining < 0
                        ? "bg-red-100 text-red-700"
                        : remaining <= 30
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {remaining < 0 ? "Expired" : `${remaining} hari lagi`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(memo)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    <Eye className="h-3.5 w-3.5" /> Detail
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {!filteredRows.length && (
          <p className="py-14 text-center text-sm text-slate-500">
            Tidak ada memo untuk event ini.
          </p>
        )}
        {!!filteredRows.length && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Menampilkan {pageSize === 0 ? 1 : (page - 1) * pageSize + 1}–
              {pageSize === 0
                ? filteredRows.length
                : Math.min(page * pageSize, filteredRows.length)}{" "}
              dari {filteredRows.length} memo
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1 || pageSize === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
              </button>
              <span className="text-xs font-bold text-slate-600">
                {page} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                disabled={page >= pageCount || pageSize === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40"
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
