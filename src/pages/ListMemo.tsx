import { Link, useNavigate } from 'react-router';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, Plus, Filter, FileText, Download, Eye, Upload,
  FileDown, X, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, AlertCircle, Table2, Printer,
  Percent, Wallet, Gift, Layers, ArrowRight,
} from 'lucide-react';
import { memos } from '../data/memoData';

const statusCfg: Record<string, { cls: string; dot: string; icon: React.ElementType; label: string }> = {
  'Draft': { 
    cls: 'bg-slate-100 text-slate-600 border border-slate-200', 
    dot: 'bg-slate-400', 
    icon: FileText,
    label: 'Draft - Belum Disubmit'
  },
  'Submitted': { 
    cls: 'bg-slate-100 text-slate-600 border border-slate-200', 
    dot: 'bg-slate-400', 
    icon: FileText,
    label: 'Submitted - Menunggu Review'
  },
  'Menunggu Buyer': { 
    cls: 'bg-amber-50 text-amber-700 border border-amber-200', 
    dot: 'bg-amber-500', 
    icon: Clock,
    label: 'Menunggu Approval Buyer'
  },
  'Approved Buyer': { 
    cls: 'bg-blue-50 text-blue-700 border border-blue-200', 
    dot: 'bg-blue-500', 
    icon: CheckCircle2,
    label: 'Approved Buyer - Menunggu Checker'
  },
  'Menunggu Checker': { 
    cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200', 
    dot: 'bg-yellow-500', 
    icon: AlertCircle,
    label: 'Menunggu Approval Checker Pembayaran'
  },
  'Approved Checker': { 
    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', 
    dot: 'bg-emerald-500', 
    icon: CheckCircle2,
    label: 'Approved Checker - Ready Setting Harga'
  },
  'Setting Harga': { 
    cls: 'bg-cyan-50 text-cyan-700 border border-cyan-200', 
    dot: 'bg-cyan-500', 
    icon: AlertCircle,
    label: 'Setting Harga'
  },
  'Sell Out Generated': { 
    cls: 'bg-purple-50 text-purple-700 border border-purple-200', 
    dot: 'bg-purple-500', 
    icon: CheckCircle2,
    label: 'Sell Out Generated'
  },
  'Rejected': { 
    cls: 'bg-red-50 text-red-700 border border-red-200', 
    dot: 'bg-red-500', 
    icon: AlertCircle,
    label: 'Rejected'
  },
};

/* ── Kategori Jenis Memo ──
   Data memo saat ini belum punya field kategori eksplisit, jadi kategori
   diturunkan dari teks program/info. Kalau nanti field `kategori` sudah
   ditambahkan di memoData, ganti getMemoCategory agar membaca field itu
   langsung. */
type MemoCategoryKey = 'diskon' | 'cashback' | 'bonus' | 'lainnya';

const memoCategoryCfg: Record<MemoCategoryKey, {
  label: string;
  desc: string;
  icon: React.ElementType;
  soft: string;        // background lembut untuk ikon & badge
  hoverBorder: string; // border saat hover kartu (class Tailwind statis)
  textAccent: string;  // warna teks "Lihat memo" (class Tailwind statis)
}> = {
  diskon: {
    label: 'Program Diskon',
    desc: 'Memo potongan harga & promo diskon dari supplier',
    icon: Percent,
    soft: 'bg-amber-50 text-amber-700',
    hoverBorder: 'hover:border-amber-700',
    textAccent: 'text-amber-700',
  },
  cashback: {
    label: 'Program Cashback',
    desc: 'Memo pengembalian dana atas transaksi pembelian',
    icon: Wallet,
    soft: 'bg-emerald-50 text-emerald-700',
    hoverBorder: 'hover:border-emerald-600',
    textAccent: 'text-emerald-600',
  },
  bonus: {
    label: 'Program Bonus',
    desc: 'Memo bonus barang atau tambahan kuantitas',
    icon: Gift,
    soft: 'bg-purple-50 text-purple-700',
    hoverBorder: 'hover:border-purple-600',
    textAccent: 'text-purple-600',
  },
  lainnya: {
    label: 'Program Lainnya',
    desc: 'Jenis program supplier di luar kategori di atas',
    icon: Layers,
    soft: 'bg-slate-100 text-slate-600',
    hoverBorder: 'hover:border-slate-500',
    textAccent: 'text-slate-600',
  },
};

function getMemoCategory(memo: { program: string; info: string }): MemoCategoryKey {
  const text = `${memo.program} ${memo.info ?? ''}`.toLowerCase();
  if (text.includes('cashback')) return 'cashback';
  if (text.includes('bonus')) return 'bonus';
  if (text.includes('diskon') || text.includes('discount')) return 'diskon';
  return 'lainnya';
}

/* ── Shared Modal Shell ── */
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[3px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div className="pointer-events-auto w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </>
  );
}

/* ── Import Excel Modal ── */
function ImportModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" style={{ boxShadow: '0 32px 80px -16px rgba(0,0,0,0.3)' }}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Upload className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">Import File Excel</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Upload data memo dari file .xlsx / .xls</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-slate-800">Import Berhasil!</p>
                <p className="text-[12px] text-slate-500 mt-1">{file?.name} telah diproses.</p>
              </div>
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer"
                style={{ borderColor: dragging ? '#059669' : '#D1FAE5', background: dragging ? '#F0FDF4' : '#F9FAFB' }}
                onClick={() => document.getElementById('memo-import-input')?.click()}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-slate-700">
                    {file ? file.name : 'Drag & drop atau klik untuk upload'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Format: .xlsx, .xls · Maks 10 MB</p>
                </div>
                <input id="memo-import-input" type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Ketentuan Format</p>
                {['Kolom: No Memo, Supplier, Program, Buyer, Periode, Metode', 'Baris pertama adalah header, data dimulai dari baris ke-2', 'Gunakan template excel yang telah disediakan'].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-slate-500">{t}</p>
                  </div>
                ))}
              </div>

              <button className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />Download template Excel
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-[13px] text-slate-600 hover:bg-slate-100 transition-colors font-medium">Batal</button>
          {done ? (
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>Selesai</button>
          ) : (
            <button disabled={!file} onClick={() => setDone(true)}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #059669, #0D9488)', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}>
              Upload & Proses
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ── Export Excel Modal ── */
function ExportModal({ onClose }: { onClose: () => void }) {
  const [range, setRange] = useState<'all' | 'period'>('all');
  const [done, setDone] = useState(false);

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" style={{ boxShadow: '0 32px 80px -16px rgba(0,0,0,0.3)' }}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileDown className="w-4.5 h-4.5 text-emerald-700" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">Export Excel</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Export daftar memo ke file Excel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-slate-800">File Siap Diunduh</p>
                <p className="text-[12px] text-slate-500 mt-1">memo-export.xlsx telah disiapkan.</p>
              </div>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
                <Download className="w-4 h-4" />Download Sekarang
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-[12px] font-bold text-slate-700">Rentang Data</p>
                {([
                  { val: 'all', label: 'Semua memo', desc: `${memos.length} memo tersedia` },
                  { val: 'period', label: 'Filter periode tertentu', desc: 'Pilih rentang tanggal' },
                ] as const).map(({ val, label, desc }) => (
                  <label key={val} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    style={{ borderColor: range === val ? '#059669' : '#E2E8F0', background: range === val ? '#F0FDF4' : '#F9FAFB' }}>
                    <input type="radio" checked={range === val} onChange={() => setRange(val)} className="accent-emerald-600" />
                    <div>
                      <p className="text-[12px] font-semibold text-slate-700">{label}</p>
                      <p className="text-[11px] text-slate-400">{desc}</p>
                    </div>
                  </label>
                ))}
                {range === 'period' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Dari</label>
                      <input type="date" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sampai</label>
                      <input type="date" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-bold text-slate-700">Kolom yang disertakan</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {['No Memo', 'Buyer', 'Admin', 'Supplier', 'Program', 'Info', 'Periode', 'Tgl Dibuat', 'Status', 'Metode', 'PPN', 'PPh'].map((col) => (
                    <label key={col} className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-emerald-600 rounded" />
                      {col}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {!done && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-[13px] text-slate-600 hover:bg-slate-100 transition-colors font-medium">Batal</button>
            <button onClick={() => setDone(true)} className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #059669, #0D9488)', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}>
              <FileDown className="w-3.5 h-3.5 inline mr-1.5" />Generate Excel
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ── Kartu Pilih Jenis Memo (landing) ── */
function CategoryCard({
  categoryKey, count, onClick,
}: { categoryKey: MemoCategoryKey; count: number; onClick: () => void }) {
  const cfg = memoCategoryCfg[categoryKey];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`group text-left bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${cfg.hoverBorder}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cfg.soft}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-1">
          {count} memo
        </span>
      </div>
      <div>
        <p className="text-[14px] font-bold text-foreground">{cfg.label}</p>
        <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{cfg.desc}</p>
      </div>
      <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${cfg.textAccent} opacity-0 group-hover:opacity-100 transition-opacity`}>
        Lihat memo<ArrowRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}

/* ── Main Page ── */
export function ListMemo() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [category, setCategory] = useState<MemoCategoryKey | null>(null);
  const { selectedOutlet } = useApp();

  const outletMemos = useMemo(
    () => memos.filter((m) => !selectedOutlet || m.outlets.includes(selectedOutlet)),
    [selectedOutlet]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<MemoCategoryKey, number> = { diskon: 0, cashback: 0, bonus: 0, lainnya: 0 };
    outletMemos.forEach((m) => { counts[getMemoCategory(m)] += 1; });
    return counts;
  }, [outletMemos]);

  const filtered = outletMemos
    .filter((m) => !category || getMemoCategory(m) === category)
    .filter(
      (m) =>
        m.no.toLowerCase().includes(search.toLowerCase()) ||
        m.supplier.toLowerCase().includes(search.toLowerCase()) ||
        m.program.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">List Memo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {category ? 'Pilih jenis program lain atau lihat detail memo di bawah.' : 'Pilih jenis program supplier untuk melihat memo-nya.'}
          </p>
        </div>
        <Link
          to="/program-supplier/memo/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-sm shadow-amber-700/20 transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />Buat Memo Baru
        </Link>
      </div>

      {category === null ? (
        /* ── Landing: kartu jenis memo ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(memoCategoryCfg) as MemoCategoryKey[]).map((key) => (
            <CategoryCard key={key} categoryKey={key} count={categoryCounts[key]} onClick={() => setCategory(key)} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setCategory(null)}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />Jenis Memo
              </button>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${memoCategoryCfg[category].soft}`}>
                {memoCategoryCfg[category].label}
              </span>
            </div>
            <div className="flex items-center bg-muted rounded-lg px-3 py-1.5 w-64 border border-border focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-600/15 transition-all">
              <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari no memo, supplier..." className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-colors">
                <Filter className="w-3.5 h-3.5" />Filter
              </button>
              <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-colors">
                <Upload className="w-3.5 h-3.5" />Import Excel
              </button>
              <button onClick={() => setShowExport(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" />Export Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted/70 border-b border-border">
                  {['No Memo', 'Buyer / Admin', 'Supplier', 'Program / Info', 'Periode', 'Tgl Dibuat', 'Status', 'Aksi'].map((h, i) => (
                    <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${i === 7 ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((memo) => {
                  const cfg = statusCfg[memo.status] ?? statusCfg['Draft'];
                  return (
                    <tr
                      key={memo.no}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/program-supplier/memo/${memo.no}`)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[13px] font-bold text-amber-700">{memo.no}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[12px] font-medium text-foreground">{memo.buyer}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{memo.admin}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[12px] font-medium text-foreground">{memo.supplier}</td>
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-semibold text-foreground">{memo.program}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[140px] truncate">{memo.info}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px] text-muted-foreground">{memo.periode}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[12px] text-muted-foreground">{memo.tanggal}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                          {memo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center items-center gap-1">
                          <button title="Lihat Detail" onClick={() => navigate(`/program-supplier/memo/${memo.no}`)} className="p-1.5 text-muted-foreground hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button title="Preview Excel" onClick={() => navigate(`/program-supplier/memo/${memo.no}`)} className="p-1.5 text-muted-foreground hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"><Table2 className="w-3.5 h-3.5" /></button>
                          <button title="Preview PDF" onClick={() => navigate(`/program-supplier/memo/${memo.no}`)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Printer className="w-3.5 h-3.5" /></button>
                          <button title="Lihat Memo" onClick={() => navigate(`/program-supplier/memo/${memo.no}`)} className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">Tidak ada memo ditemukan</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
            <p className="text-[11px] text-muted-foreground">Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari <span className="font-semibold text-foreground">{outletMemos.length}</span> memo</p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40" disabled><ChevronLeft className="w-3.5 h-3.5" /></button>
              <span className="px-3 py-1 rounded-md bg-amber-700 text-white text-[11px] font-bold">1</span>
              <button className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}