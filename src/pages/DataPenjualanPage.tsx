import { useState } from 'react';
import {
  Search, Download, Eye, FileSpreadsheet, CheckCircle2, XCircle,
  Clock, X, History, AlertTriangle,
} from 'lucide-react';
import { OUTLET_META, ALL_OUTLETS } from '../context/AppContext';

/* ── Today ──
   In production this comes from the server clock, not the client. */
const TODAY_DATE_KEY = '2026-09-03';
const TODAY_LABEL = '3 September 2026';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/* ── Types ── */
type PenjualanItem = {
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  qty: number;
  harga: number;
};

type ImportStatus = 'Berhasil' | 'Gagal';

type ImportBatch = {
  id: string;
  fileName: string;
  outlet: string;
  importedBy: string;
  dateKey: string;
  tanggal: string;
  waktu: string;
  status: ImportStatus;
  errorMessage?: string;
  items: PenjualanItem[];
};

/* ── Helper: derive totals from items so numbers never drift ── */
function makeBatch(input: {
  id: string; fileName: string; outlet: string; importedBy: string;
  dateKey: string; tanggal: string; waktu: string; status: ImportStatus;
  errorMessage?: string; items: PenjualanItem[];
}): ImportBatch {
  return { ...input };
}

const batchTotals = (b: ImportBatch) => ({
  totalSKU: b.items.length,
  totalQty: b.items.reduce((s, i) => s + i.qty, 0),
  totalNilai: b.items.reduce((s, i) => s + i.qty * i.harga, 0),
});

/* ── Mock: import history ──
   Replace with an API call (e.g. GET /penjualan/import-history). */
const IMPORT_HISTORY: ImportBatch[] = [
  makeBatch({
    id: 'IMP-014', fileName: 'penjualan_mk1_20260903.xlsx', outlet: 'MK1', importedBy: 'Andi Susanto',
    dateKey: '2026-09-03', tanggal: '3 Sep 2026', waktu: '08:42', status: 'Berhasil',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 58, harga: 3200 },
      { kode: 'PRD-002', nama: 'Sunlight Jeruk 400ml', kategori: 'Pembersih', satuan: 'BTL', qty: 21, harga: 8500 },
      { kode: 'PRD-003', nama: 'Dancow Full Cream 1kg', kategori: 'Susu', satuan: 'KG', qty: 9, harga: 125000 },
      { kode: 'PRD-004', nama: 'Rinso Anti Noda 900g', kategori: 'Detergen', satuan: 'PCS', qty: 30, harga: 28000 },
    ],
  }),
  makeBatch({
    id: 'IMP-013', fileName: 'penjualan_mk2_20260903.xlsx', outlet: 'MK2', importedBy: 'Citra Wulandari',
    dateKey: '2026-09-03', tanggal: '3 Sep 2026', waktu: '09:05', status: 'Berhasil',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 44, harga: 3200 },
      { kode: 'PRD-003', nama: 'Dancow Full Cream 1kg', kategori: 'Susu', satuan: 'KG', qty: 6, harga: 125000 },
      { kode: 'PRD-005', nama: 'So Klin Softener 1L', kategori: 'Pelembut', satuan: 'BTL', qty: 12, harga: 22000 },
    ],
  }),
  makeBatch({
    id: 'IMP-012', fileName: 'penjualan_mk4_20260903.xlsx', outlet: 'MK4', importedBy: 'Gita Lestari',
    dateKey: '2026-09-03', tanggal: '3 Sep 2026', waktu: '07:58', status: 'Berhasil',
    items: [
      { kode: 'PRD-002', nama: 'Sunlight Jeruk 400ml', kategori: 'Pembersih', satuan: 'BTL', qty: 15, harga: 8500 },
      { kode: 'PRD-004', nama: 'Rinso Anti Noda 900g', kategori: 'Detergen', satuan: 'PCS', qty: 22, harga: 28000 },
    ],
  }),
  makeBatch({
    id: 'IMP-011', fileName: 'penjualan_mini1_20260903.xlsx', outlet: 'MINI1', importedBy: 'Andi Susanto',
    dateKey: '2026-09-03', tanggal: '3 Sep 2026', waktu: '10:12', status: 'Berhasil',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 19, harga: 3200 },
      { kode: 'PRD-005', nama: 'So Klin Softener 1L', kategori: 'Pelembut', satuan: 'BTL', qty: 4, harga: 22000 },
    ],
  }),
  makeBatch({
    id: 'IMP-010', fileName: 'penjualan_mk8_20260903_v1.csv', outlet: 'MK8', importedBy: 'Hendra Wijaya',
    dateKey: '2026-09-03', tanggal: '3 Sep 2026', waktu: '08:15', status: 'Gagal',
    errorMessage: 'Format kolom tidak sesuai template (kolom "Harga" hilang)',
    items: [],
  }),
  makeBatch({
    id: 'IMP-009', fileName: 'penjualan_mk1_20260902.xlsx', outlet: 'MK1', importedBy: 'Andi Susanto',
    dateKey: '2026-09-02', tanggal: '2 Sep 2026', waktu: '08:30', status: 'Berhasil',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 51, harga: 3200 },
      { kode: 'PRD-002', nama: 'Sunlight Jeruk 400ml', kategori: 'Pembersih', satuan: 'BTL', qty: 18, harga: 8500 },
      { kode: 'PRD-004', nama: 'Rinso Anti Noda 900g', kategori: 'Detergen', satuan: 'PCS', qty: 26, harga: 28000 },
    ],
  }),
  makeBatch({
    id: 'IMP-008', fileName: 'penjualan_mk2_20260902.xlsx', outlet: 'MK2', importedBy: 'Citra Wulandari',
    dateKey: '2026-09-02', tanggal: '2 Sep 2026', waktu: '09:02', status: 'Berhasil',
    items: [
      { kode: 'PRD-003', nama: 'Dancow Full Cream 1kg', kategori: 'Susu', satuan: 'KG', qty: 5, harga: 125000 },
      { kode: 'PRD-005', nama: 'So Klin Softener 1L', kategori: 'Pelembut', satuan: 'BTL', qty: 9, harga: 22000 },
    ],
  }),
  makeBatch({
    id: 'IMP-007', fileName: 'penjualan_mini2_20260902.xlsx', outlet: 'MINI2', importedBy: 'Indra Kusuma',
    dateKey: '2026-09-02', tanggal: '2 Sep 2026', waktu: '11:20', status: 'Berhasil',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 12, harga: 3200 },
    ],
  }),
  makeBatch({
    id: 'IMP-006', fileName: 'penjualan_mk3_20260901.xlsx', outlet: 'MK3', importedBy: 'Fajar Ramadan',
    dateKey: '2026-09-01', tanggal: '1 Sep 2026', waktu: '08:05', status: 'Berhasil',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 33, harga: 3200 },
      { kode: 'PRD-002', nama: 'Sunlight Jeruk 400ml', kategori: 'Pembersih', satuan: 'BTL', qty: 14, harga: 8500 },
      { kode: 'PRD-003', nama: 'Dancow Full Cream 1kg', kategori: 'Susu', satuan: 'KG', qty: 7, harga: 125000 },
    ],
  }),
  makeBatch({
    id: 'IMP-005', fileName: 'penjualan_mk1_20260901.xlsx', outlet: 'MK1', importedBy: 'Andi Susanto',
    dateKey: '2026-09-01', tanggal: '1 Sep 2026', waktu: '08:40', status: 'Berhasil',
    items: [
      { kode: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', qty: 60, harga: 3200 },
      { kode: 'PRD-004', nama: 'Rinso Anti Noda 900g', kategori: 'Detergen', satuan: 'PCS', qty: 33, harga: 28000 },
    ],
  }),
  makeBatch({
    id: 'IMP-004', fileName: 'penjualan_mk7_20260901_retry.xlsx', outlet: 'MK7', importedBy: 'Budi Hartono',
    dateKey: '2026-09-01', tanggal: '1 Sep 2026', waktu: '13:47', status: 'Gagal',
    errorMessage: 'File rusak / gagal dibuka saat diproses',
    items: [],
  }),
];

/* ── Status badge ── */
function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const ok = status === 'Berhasil';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
    }`}>
      {ok ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
      {status}
    </span>
  );
}

/* ── Detail modal: what was inside a specific import batch ── */
function BatchDetailModal({ batch, onClose }: { batch: ImportBatch; onClose: () => void }) {
  const { totalSKU, totalQty, totalNilai } = batchTotals(batch);
  const meta = OUTLET_META[batch.outlet];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border flex flex-col max-h-[88vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-foreground font-mono">{batch.fileName}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold mr-1.5">{batch.outlet}</span>
                  {meta?.kota} • {batch.tanggal}, {batch.waktu} • oleh {batch.importedBy}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {batch.status === 'Gagal' ? (
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-red-700">Import gagal diproses</p>
                  <p className="text-[12px] text-red-600 mt-1">{batch.errorMessage ?? 'Terjadi kesalahan saat memproses file.'}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-3 border-b border-border bg-muted/30 shrink-0 flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total SKU</p>
                  <p className="text-[15px] font-bold text-foreground">{totalSKU}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Qty</p>
                  <p className="text-[15px] font-bold text-foreground">{totalQty.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Nilai</p>
                  <p className="text-[15px] font-bold text-foreground">Rp {totalNilai.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-card">
                    <tr className="bg-muted/50 border-b border-border">
                      {['PLU / Kode', 'Nama Barang', 'Kategori', 'Satuan', 'Qty', 'Harga Jual', 'Total'].map((h, i) => (
                        <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batch.items.map((r) => (
                      <tr key={r.kode} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.kode}</td>
                        <td className="px-4 py-2.5 text-[13px] font-semibold text-foreground whitespace-nowrap">{r.nama}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground">{r.kategori}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[12px] text-foreground font-medium whitespace-nowrap">{r.satuan}</td>
                        <td className="px-4 py-2.5 text-right text-[13px] font-bold text-foreground whitespace-nowrap">{r.qty.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-2.5 text-right text-[13px] text-foreground whitespace-nowrap">Rp {r.harga.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-2.5 text-right text-[13px] font-bold text-foreground whitespace-nowrap">Rp {(r.qty * r.harga).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-[13px] font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Download className="w-3.5 h-3.5" />Unduh File Asli
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all active:scale-[0.98]">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main Component ── */
export function DataPenjualanPage() {
  const [search, setSearch] = useState('');
  const [outletFilter, setOutletFilter] = useState('Semua Outlet');
  const [bulan, setBulan] = useState('9');
  const [tahun, setTahun] = useState('2026');
  const [detailBatch, setDetailBatch] = useState<ImportBatch | null>(null);

  const filtered = IMPORT_HISTORY.filter((b) => {
    const [y, m] = b.dateKey.split('-');
    const matchPeriod = m === bulan.padStart(2, '0') && y === tahun;
    const matchOutlet = outletFilter === 'Semua Outlet' || b.outlet === outletFilter;
    const q = search.toLowerCase();
    const matchSearch =
      b.fileName.toLowerCase().includes(q) ||
      b.outlet.toLowerCase().includes(q) ||
      b.importedBy.toLowerCase().includes(q);
    return matchPeriod && matchOutlet && matchSearch;
  });

  const totalImport = filtered.length;
  const totalBerhasil = filtered.filter((b) => b.status === 'Berhasil').length;
  const totalGagal = filtered.filter((b) => b.status === 'Gagal').length;

  const outletsImportedToday = new Set(
    IMPORT_HISTORY.filter((b) => b.dateKey === TODAY_DATE_KEY && b.status === 'Berhasil').map((b) => b.outlet)
  );
  const outletsBelumImport = ALL_OUTLETS.filter((o) => !outletsImportedToday.has(o));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <History className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h1 className="text-[18px] font-bold text-foreground">Data Penjualan</h1>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Riwayat file Excel penjualan yang telah diimport ke sistem — siapa yang import dan kapan.
          </p>
        </div>
        <div className="shrink-0">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-semibold border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* Outlets not yet imported today */}
      {outletsBelumImport.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-semibold text-amber-800">
              {outletsBelumImport.length} outlet belum import data hari ini ({TODAY_LABEL})
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {outletsBelumImport.map((o) => (
                <span key={o} className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-white text-amber-700 border border-amber-200">{o}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Import', value: String(totalImport), sub: `periode ${MONTHS[Number(bulan) - 1]} ${tahun}`, Icon: FileSpreadsheet, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
          { label: 'Berhasil', value: String(totalBerhasil), sub: 'file diproses tanpa error', Icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
          { label: 'Gagal', value: String(totalGagal), sub: 'perlu diimport ulang', Icon: XCircle, iconColor: 'text-red-600', iconBg: 'bg-red-50' },
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
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2 w-full lg:w-72 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all border border-transparent focus-within:border-amber-300 focus-within:bg-white">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari nama file, outlet, atau nama user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-[13px] placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={outletFilter}
              onChange={(e) => setOutletFilter(e.target.value)}
              className="text-[12px] border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
            >
              <option>Semua Outlet</option>
              {ALL_OUTLETS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="text-[12px] border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
            >
              {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
            </select>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="text-[12px] border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
            >
              {['2024', '2025', '2026'].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {[
                  { h: 'Nama File', align: 'left' },
                  { h: 'Outlet', align: 'left' },
                  { h: 'Tanggal Import', align: 'left' },
                  { h: 'Waktu', align: 'left' },
                  { h: 'Diimport Oleh', align: 'left' },
                  { h: 'SKU', align: 'right' },
                  { h: 'Total Qty', align: 'right' },
                  { h: 'Total Nilai', align: 'right' },
                  { h: 'Status', align: 'left' },
                  { h: 'Aksi', align: 'right' },
                ].map(({ h, align }) => (
                  <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-${align}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                    Tidak ada riwayat import yang cocok untuk periode atau pencarian ini.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const { totalSKU, totalQty, totalNilai } = batchTotals(b);
                  const isToday = b.dateKey === TODAY_DATE_KEY;
                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-[12px] font-mono text-foreground">{b.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold font-mono">{b.outlet}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-foreground whitespace-nowrap">
                        {b.tanggal}{isToday && <span className="ml-1.5 text-[10px] font-semibold text-emerald-600">(Hari ini)</span>}
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono text-muted-foreground whitespace-nowrap">{b.waktu}</td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{b.importedBy}</td>
                      <td className="px-4 py-3 text-right text-[12px] text-foreground whitespace-nowrap">{b.status === 'Berhasil' ? totalSKU : '—'}</td>
                      <td className="px-4 py-3 text-right text-[12px] text-foreground whitespace-nowrap">{b.status === 'Berhasil' ? totalQty.toLocaleString('id-ID') : '—'}</td>
                      <td className="px-4 py-3 text-right text-[12px] font-semibold text-foreground whitespace-nowrap">{b.status === 'Berhasil' ? `Rp ${totalNilai.toLocaleString('id-ID')}` : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><ImportStatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => setDetailBatch(b)}
                          className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailBatch && <BatchDetailModal batch={detailBatch} onClose={() => setDetailBatch(null)} />}
    </div>
  );
}