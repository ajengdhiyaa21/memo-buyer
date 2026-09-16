import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2, XCircle, Clock, Search, Filter, ChevronDown, Eye,
} from 'lucide-react';
import clsx from 'clsx';
import { MEMOS, type ApprovalMemoData, type MemoStatus } from '../data/approvalData';

/* ── Status badge ── */
function StatusBadge({ status }: { status: MemoStatus }) {
  const cfg = {
    menunggu_buyer:   { label: 'Menunggu Buyer',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',   Icon: Clock },
    menunggu_checker: { label: 'Menunggu Checker', cls: 'bg-blue-50 text-blue-700 border-blue-200',       Icon: Clock },
    approved_checker: { label: 'Disetujui',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    ditolak:          { label: 'Ditolak',          cls: 'bg-red-50 text-red-600 border-red-200',          Icon: XCircle },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      <cfg.Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

/* ── Main Page ── */
export function ApprovalMemo() {
  const navigate = useNavigate();
  const { selectedOutlet } = useApp();

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | MemoStatus>('all');
  const [filterJenis, setFilterJenis] = useState('');

  const filtered = MEMOS
    .filter((m) => !selectedOutlet || m.outlets.includes(selectedOutlet))
    .filter((m) => {
      const q = search.toLowerCase();
      const matchSearch = !q || m.id.toLowerCase().includes(q) || m.supplier.toLowerCase().includes(q) || m.buyer.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchJenis = !filterJenis || m.jenisMemo === filterJenis;
      return matchSearch && matchStatus && matchJenis;
    });

  const countByStatus = (s: MemoStatus) => MEMOS.filter((m) => m.status === s).length;
  // Menjumlahkan total menunggu dari sisi buyer dan checker untuk dashboard summary
  const totalPending = countByStatus('menunggu_buyer') + countByStatus('menunggu_checker');
  const approved = countByStatus('approved_checker');
  const rejected = countByStatus('ditolak');

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-[15px] font-bold text-foreground">Antrian Approval</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">Review dan setujui memo supplier sebelum diproses</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Menunggu */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Menunggu</p>
            <p className="text-[28px] font-extrabold text-amber-700 leading-none mt-0.5">{totalPending}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">total perlu diproses</p>
          </div>
          {totalPending > 0 && (
            <div className="ml-auto">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
          )}
        </div>

        {/* Disetujui */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Disetujui</p>
            <p className="text-[28px] font-extrabold text-emerald-700 leading-none mt-0.5">{approved}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">memo telah disetujui</p>
          </div>
        </div>

        {/* Ditolak */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ditolak</p>
            <p className="text-[28px] font-extrabold text-red-600 leading-none mt-0.5">{rejected}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">memo dikembalikan</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center bg-muted/60 rounded-xl px-3 py-2 border border-border focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition-all min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. memo, supplier, buyer..."
              className="bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground w-full"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1 border border-border overflow-x-auto hide-scrollbar">
            {(['all', 'menunggu_buyer', 'menunggu_checker', 'approved_checker', 'ditolak'] as const).map((s) => {
              const label = { 
                all: 'Semua', 
                menunggu_buyer: 'Menunggu Buyer', 
                menunggu_checker: 'Menunggu Checker',
                approved_checker: 'Disetujui', 
                ditolak: 'Ditolak' 
              }[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap',
                    filterStatus === s ? 'bg-white text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Jenis memo filter */}
          <div className="relative">
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="appearance-none bg-muted/60 border border-border rounded-xl px-3 py-2 pr-7 text-[13px] text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Semua Jenis</option>
              {[...new Set(MEMOS.map((m) => m.jenisMemo))].map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-[12px] text-muted-foreground ml-auto">{filtered.length} memo ditemukan</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full text-[13px]">
          <thead>
            <tr className="border-b border-border" style={{ background: 'linear-gradient(135deg, #FAFAFA, #FEF9F0)' }}>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">No. Memo</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Supplier</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Buyer</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Jenis / Program</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Periode</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Item</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Filter className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">Tidak ada memo yang sesuai filter</p>
                </td>
              </tr>
            ) : filtered.map((m) => (
              <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-amber-50/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-[12px] text-foreground">{m.id}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.tanggal}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground truncate max-w-[180px]">{m.supplier}</p>
                  <p className="text-[11px] text-muted-foreground">{m.metode}</p>
                </td>
                <td className="px-4 py-3 text-foreground">{m.buyer}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[11px] font-semibold">{m.jenisMemo}</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.program}</p>
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">{m.periode}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-[12px] font-bold text-foreground">{m.items.length}</span>
                </td>
                <td className="px-4 py-3 text-center"><StatusBadge status={m.status} /></td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => navigate(`/program-supplier/approval/${m.id}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all"
                  >
                    <Eye className="w-3 h-3" />Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}