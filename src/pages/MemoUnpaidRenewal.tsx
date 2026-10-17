import { ArrowLeft, Eye, Search, TriangleAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import {
  demoRows,
  Detail,
  isUnpaidMemo,
  normalizeMemoType,
  type Memo,
} from "./MemoReportGrouped"
import { FilterCard } from "../components/FilterCard"

const endDate = (memo: Memo) => {
  const income = (memo.data?.pendapatan || {}) as Record<string, any>
  return (
    memo.periodeAkhir ||
    income.eventPeriodeAkhir ||
    income.sewaPeriodeAkhir ||
    income.promosiPeriodeAkhir ||
    income.listingPeriodeAkhir ||
    ""
  )
}

const isLeaseMemo = (memo: Memo) => {
  const income = (memo.data?.pendapatan || {}) as Record<string, any>
  const type = String(income.jenis || "").toLowerCase()
  return (
    normalizeMemoType(memo.jenisMemo) === "memo-lain-lain" &&
    !["listing", "reward-insentif", "reward", "update-informasi"].includes(type)
  )
}

const daysUntil = (date: string) =>
  Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000)

const dateLabel = (date: string) =>
  date ? date.split("-").reverse().join("/") : "-"

export default function MemoUnpaidRenewal() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = localStorage.getItem("bm-role") || ""
  const [rows, setRows] = useState<Memo[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<Memo | null>(null)

  useEffect(() => {
    if (role !== "Akuntansi") {
      navigate("/dashboard", { replace: true })
      return
    }
    try {
      const stored = JSON.parse(
        localStorage.getItem("supplier-memo-history") || "[]",
      )
      const savedRows: Memo[] = Array.isArray(stored) ? stored : []
      const savedIds = new Set(savedRows.map((memo) => memo.id))
      setRows([
        ...savedRows,
        ...demoRows.filter((memo) => !savedIds.has(memo.id)),
      ])
    } catch {
      setRows(demoRows)
    }
  }, [navigate, role])

  const candidates = useMemo(
    () =>
      rows
        .filter(isLeaseMemo)
        .map((memo) => ({ memo, end: endDate(memo) }))
        .filter(({ memo, end }) => {
          if (!end || !isUnpaidMemo(memo)) return false
          const days = daysUntil(end)
          return days >= 0 && days <= 60
        }),
    [rows],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return candidates.filter(({ memo, end }) => {
      const days = daysUntil(end)
      const currentStatus = days <= 7 ? "critical" : days <= 30 ? "warning" : "upcoming"
      const haystack = `${memo.nomorMemo} ${memo.supplierNama} ${memo.ringkasan} ${memo.outlets.join(" ")}`.toLowerCase()
      return (
        (!query || haystack.includes(query)) &&
        (!status || status === currentStatus)
      )
    })
  }, [candidates, search, status])

  const criticalCount = candidates.filter(({ end }) => daysUntil(end) <= 7).length
  const warningCount = candidates.filter(({ end }) => {
    const days = daysUntil(end)
    return days >= 8 && days <= 30
  }).length
  const pageCount = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [search, status, pageSize])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("memo")
    if (id) {
      const match = rows.find((memo) => memo.id === id)
      if (match) setSelected(match)
    }
  }, [location.search, rows])

  if (selected) {
    return (
      <main className="memo-report-page min-h-full bg-[#f6f8fb] p-5">
        <Detail
          memo={selected}
          back={() => {
            setSelected(null)
            navigate("/memo-report/unpaid-renewal")
          }}
        />
      </main>
    )
  }

  return (
    <main className="memo-report-page min-h-full space-y-5 bg-[#f6f8fb] p-5">
      <button
        type="button"
        onClick={() => navigate("/memo-report")}
        className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
      </button>

      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
              Monitoring Pembayaran Sewa
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">
              Sewa Akan Berakhir &amp; Belum Dibayar
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Daftar memo sewa dengan status pembayaran belum dibayar dan periode berakhir maksimal 60 hari.
            </p>
          </div>
          <span className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {candidates.length} memo perlu ditindaklanjuti
          </span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-red-600">Total belum dibayar</p>
          <p className="mt-1 text-2xl font-black text-red-800">{candidates.length}</p>
          <p className="mt-1 text-xs text-red-700">Perlu monitoring Akuntansi</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-rose-600">Critical</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{criticalCount}</p>
          <p className="mt-1 text-xs text-slate-500">Berakhir dalam 7 hari</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-amber-600">Warning</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{warningCount}</p>
          <p className="mt-1 text-xs text-slate-500">Berakhir 8–30 hari</p>
        </div>
      </div>

      <FilterCard variant="compact">
          <div className="filter-card__search flex h-10 min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor memo, supplier, event..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="filter-card__control filter-card__control--select h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none"
          >
            <option value="">Semua Status</option>
            <option value="critical">Critical (≤ 7 hari)</option>
            <option value="warning">Warning (8–30 hari)</option>
            <option value="upcoming">Upcoming (31–60 hari)</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setStatus("")
            }}
            className="filter-card__control filter-card__reset h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Reset filter
          </button>
      </FilterCard>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-black text-slate-900">Daftar Sewa Belum Dibayar</h2>
            <p className="mt-1 text-xs text-slate-500">{filtered.length} memo ditemukan</p>
          </div>
          <TriangleAlert className="h-5 w-5 text-red-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Supplier",
                  "Nomor Memo",
                  "Program / Event",
                  "Outlet",
                  "Periode",
                  "Sisa Waktu",
                  "Status Pembayaran",
                  "Aksi",
                ].map((title) => <th key={title} className="px-5 py-3">{title}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(({ memo, end }) => {
                const days = daysUntil(end)
                return (
                  <tr key={memo.id} className="hover:bg-red-50/30">
                    <td className="px-5 py-4 font-bold text-slate-800">{memo.supplierNama}</td>
                    <td className="px-5 py-4 font-mono text-xs text-indigo-700">{memo.nomorMemo}</td>
                    <td className="max-w-[240px] px-5 py-4 font-semibold text-slate-800">{memo.ringkasan || "-"}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{memo.outlets.join(", ") || "-"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">{dateLabel(memo.periodeAwal || "")} s/d {dateLabel(end)}</td>
                    <td className="px-5 py-4 text-xs font-bold text-red-700">{days} hari lagi</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">Belum Dibayar</span></td>
                    <td className="px-5 py-4"><button type="button" onClick={() => setSelected(memo)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700"><Eye className="h-3.5 w-3.5" /> Detail</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="border-t border-slate-100 px-5 py-14 text-center">
            <p className="text-sm font-semibold text-slate-600">Belum ada data sewa yang berstatus belum dibayar.</p>
            <p className="mt-1 text-xs text-slate-400">Data akan tampil setelah status pembayaran dicatat pada memo.</p>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            <span>Menampilkan {visible.length} dari {filtered.length} memo</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">Tampilkan
                <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                  <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={0}>Semua</option>
                </select> data
              </label>
              {pageSize > 0 && <><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Sebelumnya</button><span className="min-w-12 text-center font-semibold text-slate-700">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Berikutnya</button></>}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
