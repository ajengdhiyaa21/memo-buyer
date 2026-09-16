import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Plus, Upload, Download, Eye, Pencil, Trash2,
  TrendingUp, Package, DollarSign, BarChart2, X, Store,
  ArrowLeft, CheckCircle2, Clock,
} from 'lucide-react';
import { useApp, OUTLET_META, ALL_OUTLETS } from '../context/AppContext';

/* ── Today ──
   In production this comes from the server clock, not the client. */
const TODAY_LABEL = '3 September 2026';

/* ── Types ── */
type PenjualanItem = {
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  qty: number;
  harga: number;
};

type OutletSalesToday = {
  importedToday: boolean;
  fileName?: string;
  importedAt?: string;
  importedBy?: string;
  items: PenjualanItem[];
};

/* ── Mock: today's imported sales per outlet ──
   Replace with an API call keyed by outlet + today's date. */
const OUTLET_SALES_TODAY: Record<string, OutletSalesToday> = {
  MK1: {
    importedToday: true,
    fileName: 'penjualan_mk1_20260903.xlsx',
    importedAt: '08:42',
    importedBy: 'Andi Susanto',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 58, harga: 3200 },
      { kode: 'PRD-002', nama: 'Sunlight Jeruk 400ml', kategori: 'Pembersih', satuan: 'BTL', qty: 21, harga: 8500 },
      { kode: 'PRD-003', nama: 'Dancow Full Cream 1kg', kategori: 'Susu', satuan: 'KG', qty: 9, harga: 125000 },
      { kode: 'PRD-004', nama: 'Rinso Anti Noda 900g', kategori: 'Detergen', satuan: 'PCS', qty: 30, harga: 28000 },
    ],
  },
  MK2: {
    importedToday: true,
    fileName: 'penjualan_mk2_20260903.xlsx',
    importedAt: '09:05',
    importedBy: 'Citra Wulandari',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 44, harga: 3200 },
      { kode: 'PRD-003', nama: 'Dancow Full Cream 1kg', kategori: 'Susu', satuan: 'KG', qty: 6, harga: 125000 },
      { kode: 'PRD-005', nama: 'So Klin Softener 1L', kategori: 'Pelembut', satuan: 'BTL', qty: 12, harga: 22000 },
    ],
  },
  MK3: { importedToday: false, items: [] },
  MK4: {
    importedToday: true,
    fileName: 'penjualan_mk4_20260903.xlsx',
    importedAt: '07:58',
    importedBy: 'Gita Lestari',
    items: [
      { kode: 'PRD-002', nama: 'Sunlight Jeruk 400ml', kategori: 'Pembersih', satuan: 'BTL', qty: 15, harga: 8500 },
      { kode: 'PRD-004', nama: 'Rinso Anti Noda 900g', kategori: 'Detergen', satuan: 'PCS', qty: 22, harga: 28000 },
    ],
  },
  MK5: { importedToday: false, items: [] },
  MK6: { importedToday: false, items: [] },
  MK7: { importedToday: false, items: [] },
  MK8: { importedToday: false, items: [] },
  MINI1: {
    importedToday: true,
    fileName: 'penjualan_mini1_20260903.xlsx',
    importedAt: '10:12',
    importedBy: 'Andi Susanto',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 19, harga: 3200 },
      { kode: 'PRD-005', nama: 'So Klin Softener 1L', kategori: 'Pelembut', satuan: 'BTL', qty: 4, harga: 22000 },
    ],
  },
  MINI2: { importedToday: false, items: [] },
  MINI3: { importedToday: false, items: [] },
};

/* ── Import Excel Modal ── */
function ImportModal({ outlet, onClose }: { outlet: string; onClose: () => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const meta = OUTLET_META[outlet];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Import Data Penjualan</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Upload file Excel penjualan harian untuk outlet ini</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-foreground">{outlet}</p>
                <p className="text-[11px] text-muted-foreground">{meta?.kota} • Tanggal import: {TODAY_LABEL}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">File Excel</label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl px-4 py-6 cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground text-center">
                  {fileName ? (
                    <span className="font-semibold text-foreground">{fileName}</span>
                  ) : (
                    <>
                      Klik untuk pilih file, atau seret file ke sini
                      <br />
                      <span className="text-[11px]">.xlsx atau .csv, maks 10MB</span>
                    </>
                  )}
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>

            <button type="button" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 hover:text-amber-900 transition-colors">
              <Download className="w-3 h-3" />Unduh Template Excel
            </button>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Catatan (Opsional)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg text-[13px] bg-card focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all placeholder:text-muted-foreground resize-none"
                placeholder="Catatan tambahan untuk import ini..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors">
              Batal
            </button>
            <button
              onClick={onClose}
              disabled={!fileName}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" />Import Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Manual Add Modal (edge cases outside the daily import) ── */
function TambahManualModal({ outlet, onClose }: { outlet: string; onClose: () => void }) {
  const inputCls = "w-full px-3 py-2 border border-border rounded-lg text-[13px] bg-card focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all placeholder:text-muted-foreground";
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Tambah Data Penjualan</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Input manual untuk outlet {outlet}, di luar import harian</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Kode / PLU', placeholder: 'Kode atau PLU produk', type: 'text' },
              { label: 'Nama Barang', placeholder: 'Nama produk', type: 'text' },
              { label: 'Kategori', placeholder: 'Kategori produk', type: 'text' },
              { label: 'Satuan', placeholder: '', type: 'select', options: ['PCS', 'BTL', 'KG', 'CTN', 'DUS'] },
              { label: 'Qty', placeholder: '0', type: 'number' },
              { label: 'Harga Jual (Rp)', placeholder: '0', type: 'number' },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">{f.label}</label>
                {f.type === 'select' ? (
                  <select className={inputCls}>
                    <option value="">Pilih {f.label}...</option>
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} className={inputCls} placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors">Batal</button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all active:scale-[0.98]">Simpan</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Outlet selection grid ── */
function PenjualanOutletGrid({ outlets, onSelect }: { outlets: string[]; onSelect: (o: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-bold text-foreground">Master Data Penjualan</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">Pilih outlet untuk mengelola data penjualan hari ini — {TODAY_LABEL}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {outlets.map((code) => {
          const meta = OUTLET_META[code];
          const today = OUTLET_SALES_TODAY[code];
          const imported = today?.importedToday ?? false;
          const skuCount = today?.items.length ?? 0;

          return (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className="group text-left rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-amber-300 hover:shadow-lg active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Store className="w-5 h-5 text-amber-700" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    imported
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {imported ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                  {imported ? 'Sudah Import' : 'Belum Import'}
                </span>
              </div>

              <p className="text-[18px] font-extrabold text-foreground tracking-tight leading-none">{code}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{meta?.kota}</p>

              <div className="mt-4 pt-3 border-t border-border">
                {imported ? (
                  <>
                    <p className="text-[12px] text-foreground font-semibold">{skuCount} SKU diimport</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Pukul {today?.importedAt} oleh {today?.importedBy}</p>
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Belum ada data diimport hari ini</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Per-outlet sales table (today only) ── */
function OutletPenjualanTable({ outlet, onBack }: { outlet: string; onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const navigate = useNavigate();

  const record = OUTLET_SALES_TODAY[outlet] ?? { importedToday: false, items: [] };
  const meta = OUTLET_META[outlet];

  const filtered = record.items.filter(
    (r) => r.nama.toLowerCase().includes(search.toLowerCase()) || r.kode.toLowerCase().includes(search.toLowerCase())
  );

  const totalSKU = record.items.length;
  const totalQty = record.items.reduce((s, r) => s + r.qty, 0);
  const totalNilai = record.items.reduce((s, r) => s + r.qty * r.harga, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-amber-700 hover:text-amber-900 font-semibold transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />Ganti Outlet
          </button>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <h1 className="text-[18px] font-bold text-foreground">Master Data Penjualan</h1>
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">{outlet}</span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            {meta?.kota} — data penjualan yang diimport hari ini, {TODAY_LABEL}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-semibold border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
          <button
            onClick={() => setShowManual(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-semibold border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Manual
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-3.5 h-3.5" /> Import Excel
          </button>
        </div>
      </div>

      {/* Status banner */}
      {record.importedToday ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[12px] text-emerald-700 font-medium">
            Data hari ini sudah diimport pukul {record.importedAt} oleh {record.importedBy} — file{' '}
            <span className="font-mono">{record.fileName}</span>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-[12px] text-amber-700 font-medium">
            Outlet {outlet} belum memiliki data penjualan yang diimport hari ini.
          </p>
        </div>
      )}

      {record.importedToday ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total SKU', value: String(totalSKU), sub: 'produk terjual hari ini', Icon: Package, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
              { label: 'Total Qty', value: totalQty.toLocaleString('id-ID'), sub: 'unit terjual', Icon: BarChart2, iconColor: 'text-violet-600', iconBg: 'bg-violet-50' },
              { label: 'Total Nilai', value: 'Rp ' + (totalNilai / 1_000_000).toFixed(1) + ' Jt', sub: 'estimasi nilai penjualan', Icon: DollarSign, iconColor: 'text-amber-700', iconBg: 'bg-amber-50' },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                  <s.Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className="text-[20px] font-bold text-foreground leading-tight">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2 w-full sm:w-72 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all border border-transparent focus-within:border-amber-300 focus-within:bg-white">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Cari SKU atau nama barang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-[13px] placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-[12px] text-muted-foreground shrink-0">{filtered.length} dari {record.items.length} item</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {[
                      { h: 'PLU / Kode', align: 'left' },
                      { h: 'Nama Barang', align: 'left' },
                      { h: 'Kategori', align: 'left' },
                      { h: 'Satuan', align: 'left' },
                      { h: 'Qty', align: 'right' },
                      { h: 'Harga Jual', align: 'right' },
                      { h: 'Total Nilai', align: 'right' },
                      { h: 'Aksi', align: 'right' },
                    ].map(({ h, align }) => (
                      <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-${align}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                        Tidak ada data yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.kode} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.kode}</td>
                        <td className="px-4 py-3">
                          <span className="text-[13px] font-semibold text-foreground">{r.nama}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground">{r.kategori}</span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-foreground font-medium whitespace-nowrap">{r.satuan}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className="text-[13px] font-bold text-foreground">{r.qty.toLocaleString('id-ID')}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-foreground whitespace-nowrap">
                          Rp {r.harga.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-bold text-foreground whitespace-nowrap">
                          Rp {(r.qty * r.harga).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex justify-end items-center gap-1">
                            <button
                              onClick={() => navigate(`/purchasing/penjualan/laporan/${r.kode}`)}
                              className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat History Penjualan"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 text-muted-foreground hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr className="bg-amber-50/80 border-t-2 border-amber-200">
                      <td colSpan={4} className="px-4 py-3 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                        Grand Total
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] font-bold text-amber-800">
                        {filtered.reduce((s, r) => s + r.qty, 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right text-[13px] font-bold text-amber-800 whitespace-nowrap">
                        Rp {filtered.reduce((s, r) => s + r.qty * r.harga, 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-foreground">Belum ada data penjualan hari ini</p>
            <p className="text-[12px] text-muted-foreground mt-1 max-w-xs">
              Import file Excel penjualan harian untuk outlet {outlet} agar datanya tampil di sini.
            </p>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all shadow-sm active:scale-[0.98] mt-1"
          >
            <Upload className="w-3.5 h-3.5" /> Import Data Sekarang
          </button>
        </div>
      )}

      {showImport && <ImportModal outlet={outlet} onClose={() => setShowImport(false)} />}
      {showManual && <TambahManualModal outlet={outlet} onClose={() => setShowManual(false)} />}
    </div>
  );
}

/* ── Main Component ── */
export function PenjualanMasterPage() {
  const { currentUser } = useApp();
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);

  const outlets = currentUser?.assignedOutlets?.length ? currentUser.assignedOutlets : ALL_OUTLETS;

  if (!selectedOutlet) {
    return <PenjualanOutletGrid outlets={outlets} onSelect={setSelectedOutlet} />;
  }

  return <OutletPenjualanTable outlet={selectedOutlet} onBack={() => setSelectedOutlet(null)} />;
}