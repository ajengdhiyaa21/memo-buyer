import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Search,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  demoRows,
  Detail,
  normalizeMemoType,
  openMemoPrintHtml,
  type Memo,
} from "./MemoReportGrouped"
import { FilterCard } from "../components/FilterCard"

type ApprovalStatus = "pending" | "approved" | "rejected"
type ApprovalRecord = {
  status: ApprovalStatus
  note: string
  at: string
  by: string
}

const APPROVAL_KEY = "memo-purchase-approval"

const memoLabel = (value: string) => {
  const normalized = normalizeMemoType(value)
  return normalized === "memo-program"
    ? "Memo Program"
    : normalized === "update-informasi"
      ? "Update Informasi"
      : "Memo Lain-lain"
}

const dateLabel = (value?: string) =>
  value ? value.split("-").reverse().join("/") : "-"

function readMemos() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("supplier-memo-history") || "[]",
    )
    const saved: Memo[] = Array.isArray(stored) ? stored : []
    const ids = new Set(saved.map((memo) => memo.id))
    return [...saved, ...demoRows.filter((memo) => !ids.has(memo.id))]
  } catch {
    return demoRows
  }
}

function readApprovals(): Record<string, ApprovalRecord> {
  try {
    const value = JSON.parse(localStorage.getItem(APPROVAL_KEY) || "{}")
    return value && typeof value === "object" ? value : {}
  } catch {
    return {}
  }
}

export default function MemoPurchaseApproval() {
  const navigate = useNavigate()
  const role = localStorage.getItem("bm-role") || ""
  const [rows, setRows] = useState<Memo[]>([])
  const [approvals, setApprovals] = useState<Record<string, ApprovalRecord>>({})
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"" | ApprovalStatus>("")
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([])
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<Memo | null>(null)
  const [note, setNote] = useState("")

  useEffect(() => {
    if (role !== "Pembelian") {
      navigate("/dashboard")
      return
    }
    setRows(readMemos())
    setApprovals(readApprovals())
  }, [navigate, role])

  const statusOf = (memo: Memo): ApprovalStatus =>
    approvals[memo.id]?.status || "pending"

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((memo) => {
      const haystack = `${memo.nomorMemo} ${memo.supplierNama} ${memo.ringkasan} ${memo.outlets.join(" ")}`.toLowerCase()
      return (
        (!query || haystack.includes(query)) &&
        (!status || statusOf(memo) === status) &&
        (!selectedOutlets.length || selectedOutlets.some((item) => memo.outlets.includes(item))) &&
        (!from || (memo.periodeAkhir || "") >= from) &&
        (!to || (memo.periodeAwal || "") <= to)
      )
    })
  }, [rows, search, status, selectedOutlets, from, to, approvals])

  const outlets = useMemo(
    () => Array.from(new Set(rows.flatMap((memo) => memo.outlets))).sort(),
    [rows],
  )

  const pending = rows.filter((memo) => statusOf(memo) === "pending").length
  const approved = rows.filter((memo) => statusOf(memo) === "approved").length
  const rejected = rows.filter((memo) => statusOf(memo) === "rejected").length
  const pageCount = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [search, status, pageSize, selectedOutlets, from, to])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const saveDecision = (memo: Memo, decision: Exclude<ApprovalStatus, "pending">) => {
    const next = {
      ...approvals,
      [memo.id]: {
        status: decision,
        note: note.trim(),
        at: new Date().toISOString(),
        by: "Pembelian",
      },
    }
    localStorage.setItem(APPROVAL_KEY, JSON.stringify(next))
    setApprovals(next)
    setNote("")
    setSelected(decision === "approved" ? memo : null)
  }

  if (selected) {
    const approval = approvals[selected.id]
    return (
      <main className="memo-report-page min-h-full space-y-5 bg-[#f6f8fb] p-5">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke report approval
        </button>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Approval Pembelian</p>
              <h1 className="mt-1 text-xl font-black text-slate-900">{selected.nomorMemo}</h1>
              <p className="mt-1 text-sm text-slate-500">{selected.supplierNama} · {selected.ringkasan}</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              !approval || approval.status === "pending"
                ? "bg-amber-50 text-amber-700"
                : approval.status === "approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
            }`}>
              {!approval || approval.status === "pending" ? "Menunggu Approval" : approval.status === "approved" ? "Disetujui" : "Ditolak"}
            </span>
          </div>
          {(!approval || approval.status === "pending") && (
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
              <label className="flex-1 text-xs font-semibold text-slate-600">
                Catatan approval (opsional)
                <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-amber-500" placeholder="Tambahkan catatan..." />
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => saveDecision(selected, "rejected")} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"><XCircle className="h-4 w-4" /> Tolak</button>
                <button type="button" onClick={() => saveDecision(selected, "approved")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4" /> Approve</button>
              </div>
            </div>
          )}
          {approval && approval.status !== "pending" && <p className="mt-3 text-xs text-slate-500">Diproses oleh {approval.by} pada {new Date(approval.at).toLocaleString("id-ID")} {approval.note && `· ${approval.note}`}</p>}
        </section>
        <Detail memo={selected} back={() => setSelected(null)} embedded />
      </main>
    )
  }

  return (
    <main className="memo-report-page min-h-full space-y-5 bg-[#f6f8fb] p-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pembelian</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Report Approval Memo Supplier</h1>
          <p className="mt-1 text-sm text-slate-500">Review memo yang masuk, setujui atau tolak, lalu lihat riwayat keputusannya.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-amber-50 px-3 py-2"><b className="block text-lg text-amber-700">{pending}</b><span className="text-[10px] text-amber-700">Menunggu</span></div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2"><b className="block text-lg text-emerald-700">{approved}</b><span className="text-[10px] text-emerald-700">Approved</span></div>
          <div className="rounded-xl bg-red-50 px-3 py-2"><b className="block text-lg text-red-700">{rejected}</b><span className="text-[10px] text-red-700">Ditolak</span></div>
        </div>
      </header>

      <FilterCard variant="compact">
          <div className="filter-card__search flex h-10 min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-indigo-300 focus-within:bg-white"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nomor memo, supplier, program..." className="w-full bg-transparent text-sm outline-none" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value as "" | ApprovalStatus)} className="filter-card__control filter-card__control--select h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none"><option value="">Semua Status</option><option value="pending">Menunggu Approval</option><option value="approved">Approved</option><option value="rejected">Ditolak</option></select>
          <details className="filter-card__control filter-card__control--select group relative h-10 min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none">
            <summary className="flex h-full cursor-pointer list-none items-center justify-between gap-3 px-3 [&::-webkit-details-marker]:hidden"><span className="truncate">{selectedOutlets.length ? `${selectedOutlets.length} outlet dipilih` : "Semua Outlet"}</span><span className="h-2 w-2 shrink-0 -translate-y-0.5 rotate-45 border-b-2 border-r-2 border-slate-700 transition-transform group-open:rotate-[225deg]" /></summary>
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5"><span className="text-xs font-bold text-slate-700">Pilih outlet</span>{selectedOutlets.length > 0 && <button type="button" onClick={() => setSelectedOutlets([])} className="text-[10px] font-bold text-amber-700 hover:text-amber-900">Hapus pilihan</button>}</div>
              <div className="max-h-56 overflow-y-auto p-2">
              {outlets.map((item) => <label key={item} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={selectedOutlets.includes(item)} onChange={(event) => setSelectedOutlets((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item))} className="h-3.5 w-3.5 accent-amber-600" />{item}</label>)}
              </div>
            </div>
          </details>
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="Periode mulai" className="filter-card__control filter-card__control--date h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none" />
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="Periode selesai" className="filter-card__control filter-card__control--date h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none" />
          <button type="button" onClick={() => { setSearch(""); setStatus(""); setSelectedOutlets([]); setFrom(""); setTo("") }} className="filter-card__control filter-card__reset h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">Reset filter</button>
      </FilterCard>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black text-slate-900">Seluruh Memo Masuk</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} memo ditemukan</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead className="bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500"><tr>{["No Memo", "Supplier", "Jenis Memo", "Program / Ringkasan", "Periode", "Status Approval", "Aksi"].map((title) => <th key={title} className="px-5 py-3">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map((memo) => { const current = statusOf(memo); return <tr key={memo.id} className="hover:bg-amber-50/30"><td className="px-5 py-4 font-mono text-xs font-bold text-indigo-700">{memo.nomorMemo}</td><td className="px-5 py-4 font-semibold text-slate-800">{memo.supplierNama}</td><td className="px-5 py-4 text-xs text-slate-600">{memoLabel(memo.jenisMemo)}</td><td className="max-w-[260px] truncate px-5 py-4 text-slate-700">{memo.ringkasan}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{dateLabel(memo.periodeAwal)} s/d {dateLabel(memo.periodeAkhir)}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${current === "pending" ? "bg-amber-50 text-amber-700" : current === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{current === "pending" ? <Clock3 className="h-3 w-3" /> : current === "approved" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{current === "pending" ? "Menunggu Approval" : current === "approved" ? "Approved" : "Ditolak"}</span></td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSelected(memo)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700"><Eye className="h-3.5 w-3.5" /> Detail</button>{current === "approved" && <button type="button" onClick={() => openMemoPrintHtml(memo)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"><FileText className="h-3.5 w-3.5" /> Cetak Dokumen</button>}</div></td></tr> })}</tbody></table></div>
        {!filtered.length && <p className="border-t border-slate-100 py-14 text-center text-sm text-slate-500">Tidak ada memo sesuai filter.</p>}
        {!!filtered.length && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>Menampilkan {visible.length} dari {filtered.length} memo</span><div className="flex items-center gap-2"><label className="flex items-center gap-2">Tampilkan<select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"><option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={0}>Semua</option></select>data</label>{pageSize > 0 && <><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya</button><span className="min-w-12 text-center font-semibold text-slate-700">{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Berikutnya <ChevronRight className="h-3.5 w-3.5" /></button></>}</div></div>}
      </section>
    </main>
  )
}
