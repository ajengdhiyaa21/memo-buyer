import { ArrowLeft, Eye, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import {
  demoRows,
  Detail,
  normalizeMemoType,
  type Memo,
} from "./MemoReportGrouped"
import "../styles/memo-report.css"

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

const isRenewableMemo = (memo: Memo) => {
  const income = (memo.data?.pendapatan || {}) as Record<string, any>
  const memoType = normalizeMemoType(String(memo.jenisMemo || ""))
  const programType = String(income.jenis || "").toLowerCase()
  const isOtherMemo = memoType === "memo-lain-lain"
  return (
    isOtherMemo &&
    !["listing", "reward-insentif", "reward", "update-informasi"].includes(
      programType,
    )
  )
}

const daysUntil = (date: string) =>
  date
    ? Math.ceil(
        (new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000,
      )
    : 9999

const dateLabel = (date: string) =>
  date ? date.split("-").reverse().join("/") : "-"

export default function MemoRenewalWatchlist() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = localStorage.getItem("bm-role") || ""
  const [rows, setRows] = useState<Memo[]>([])
  const [selected, setSelected] = useState<Memo | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    if (!["Akuntansi", "Pembelian"].includes(role)) {
      navigate("/login")
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

  const renewalRows = useMemo(
    () =>
      rows
        .filter(isRenewableMemo)
        .map((memo) => ({
          memo,
          end: endDate(memo),
          days: daysUntil(endDate(memo)),
        }))
        .filter((item) => item.end && item.days <= 60)
        .sort((a, b) => a.days - b.days),
    [rows],
  )

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return renewalRows.filter(({ memo, end, days }) => {
      const matchesSearch =
        !query ||
        JSON.stringify({
          nomor: memo.nomorMemo,
          supplier: memo.supplierNama,
          ringkasan: memo.ringkasan,
          outlet: memo.outlets,
        })
          .toLowerCase()
          .includes(query)
      const currentStatus =
        days < 0 ? "expired" : days <= 30 ? "warning" : "upcoming"
      return (
        matchesSearch && (!status || status === currentStatus) && Boolean(end)
      )
    })
  }, [renewalRows, search, status])

  const pageCount =
    pageSize === 0 ? 1 : Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const visibleRows =
    pageSize === 0
      ? filteredRows
      : filteredRows.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [search, status, pageSize])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("memo")
    if (id && rows.length) {
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
            navigate("/memo-report/renewal")
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
      <div className="renewal-watchlist-stack">
        <header className="renewal-watchlist-card rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                Monitoring Masa Berlaku
              </p>
              <h1 className="text-2xl font-black text-slate-900">
                Renewal Watchlist
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Daftar memo sewa yang sudah berakhir atau mendekati jatuh tempo.
              </p>
            </div>
            <span className="rounded-xl bg-amber-50 px-4 py-3 text-right text-xs font-bold text-amber-700">
              {filteredRows.length} memo perlu diperhatikan
            </span>
          </div>
        </header>
        <section className="memo-global-filter memo-renewal-filter renewal-watchlist-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="renewal-filter-controls flex flex-wrap items-center gap-3">
            <div className="flex h-[44px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 md:w-[448px]">
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
              className="h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 md:w-[165px]"
            >
              <option value="">Semua Status</option>
              <option value="expired">Expired</option>
              <option value="warning">≤ 30 hari</option>
              <option value="upcoming">31–60 hari</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setStatus("")
              }}
              className="h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 md:w-[96px]"
            >
              Reset filter
            </button>
          </div>
        </section>
        <section className="renewal-watchlist-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Supplier",
                    "Nomor Memo",
                    "Program / Event",
                    "Outlet",
                    "Periode",
                    "Sisa Waktu",
                    "Status",
                    "Aksi",
                  ].map((title) => (
                    <th
                      key={title}
                      className="px-5 py-3 text-left text-[10px] uppercase tracking-wide text-slate-500"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(({ memo, end, days }) => (
                  <tr
                    key={memo.id}
                    className="border-t border-slate-100 hover:bg-amber-50/40"
                  >
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {memo.supplierNama}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-indigo-700">
                      {memo.nomorMemo}
                    </td>
                    <td className="max-w-[240px] px-5 py-4">
                      <p className="truncate font-semibold text-slate-800">
                        {memo.ringkasan || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {normalizeMemoType(memo.jenisMemo) === "memo-lain-lain"
                          ? "Memo Lain-lain"
                          : memo.jenisMemo}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {memo.outlets.join(", ") || "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                      {dateLabel(memo.periodeAwal || "")} s/d {dateLabel(end)}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold">
                      {days < 0
                        ? `${Math.abs(days)} hari lewat`
                        : `${days} hari lagi`}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          days < 0
                            ? "bg-red-50 text-red-700"
                            : days <= 30
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {days < 0
                          ? "Expired"
                          : days <= 30
                            ? "Warning"
                            : "Upcoming"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelected(memo)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 && (
            <p className="py-14 text-center text-sm text-slate-500">
              Tidak ada memo yang perlu diperpanjang.
            </p>
          )}
          {filteredRows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>
                Menampilkan {visibleRows.length} dari {filteredRows.length} memo
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2">
                  Tampilkan
                  <select
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={0}>Semua</option>
                  </select>{" "}
                  data
                </label>
                {pageSize > 0 && (
                  <>
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <span className="min-w-14 text-center font-semibold text-slate-700">
                      {page} / {pageCount}
                    </span>
                    <button
                      type="button"
                      disabled={page === pageCount}
                      onClick={() =>
                        setPage((value) => Math.min(pageCount, value + 1))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
