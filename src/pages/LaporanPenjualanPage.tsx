import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Package, Search, Filter, Download, Tag } from 'lucide-react';

/* ── Data Produk ── */
const PRODUK_MAP: Record<string, { nama: string; kategori: string; satuan: string; harga: number; supplier: string }> = {
  'PRD-001': { nama: 'Indomie Goreng 85g', kategori: 'Mie Instan', satuan: 'PCS', harga: 3200, supplier: 'PT. Indofood Sukses Makmur' },
  'PRD-002': { nama: 'Sunlight Jeruk 400ml', kategori: 'Pembersih', satuan: 'BTL', harga: 8500, supplier: 'PT. Unilever Indonesia' },
  'PRD-003': { nama: 'Dancow Full Cream 1kg', kategori: 'Susu', satuan: 'KG', harga: 125000, supplier: 'PT. Nestle Indonesia' },
  'PRD-004': { nama: 'Rinso Anti Noda 900g', kategori: 'Detergen', satuan: 'PCS', harga: 28000, supplier: 'PT. Unilever Indonesia' },
  'PRD-005': { nama: 'So Klin Softener 1L', kategori: 'Pelembut', satuan: 'BTL', harga: 22000, supplier: 'PT. Wings Surya' },
};

const SUPPLIERS = ['Semua Supplier', ...Array.from(new Set(Object.values(PRODUK_MAP).map((p) => p.supplier)))];

/* ── Data Program Memo per Supplier ──
   Sementara masih mock. Nanti ganti sumbernya dari memoData (hasil input Formulir Memo Buyer),
   di mana setiap memo punya: no memo, nama program, supplier, dan daftar SKU produk yang tercakup. */
type MemoProgram = { id: string; namaProgram: string; supplier: string; skuList: string[] };

const MEMO_PROGRAMS: MemoProgram[] = [
  { id: 'BM-2026-1041', namaProgram: 'Rafaksi Akhir Tahun 2026', supplier: 'PT. Indofood Sukses Makmur', skuList: ['PRD-001'] },
  { id: 'BM-2026-1078', namaProgram: 'Diskon Ramadan Sunlight & Rinso', supplier: 'PT. Unilever Indonesia', skuList: ['PRD-002', 'PRD-004'] },
  { id: 'BM-2026-1092', namaProgram: 'Program Susu Sekolah Q3', supplier: 'PT. Nestle Indonesia', skuList: ['PRD-003'] },
  { id: 'BM-2026-1105', namaProgram: 'Promo So Klin Kuartal 3', supplier: 'PT. Wings Surya', skuList: ['PRD-005'] },
];

type DayEntry = { d: number; harga: number; qty: number };

function generateData(kode: string, daysInMonth: number): DayEntry[] {
  const base = PRODUK_MAP[kode];
  const baseHarga = base?.harga ?? 5000;
  const result: DayEntry[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const seed = (kode.charCodeAt(kode.length - 1) ?? 49) + d * 7;
    const qty = d % 3 !== 0 ? (seed % 8) + 1 : 0;
    const harga = d > Math.floor(daysInMonth / 2) ? baseHarga + Math.round(baseHarga * 0.05) : baseHarga;
    result.push({ d, harga, qty });
  }
  return result;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/* ── Cell meta type: dipakai untuk menentukan warna & tooltip tiap sel ── */
type CellMeta = { className: string; title?: string };

/* Row definitions per product: Harga, Qty, Total Nilai — matches the Excel reference */
const ROW_CONFIG: {
  key: string;
  label: string;
  stickyClass: string;
  totalTextClass: string;
  getValue: (e: DayEntry) => string;
  getTotal: (entries: DayEntry[]) => string;
  getCellMeta: (e: DayEntry, hargaNormal: number) => CellMeta;
}[] = [
  {
    key: 'harga',
    label: 'Harga',
    stickyClass: 'bg-amber-50 text-amber-800',
    totalTextClass: 'text-amber-800',
    getValue: (e) => 'Rp ' + e.harga.toLocaleString('id-ID'),
    getTotal: (entries) => 'Rp ' + (entries[entries.length - 1]?.harga ?? 0).toLocaleString('id-ID'),
    getCellMeta: (e, hargaNormal) => {
      if (e.harga === hargaNormal) {
        return { className: 'bg-amber-50/60 text-amber-800' };
      }
      const naik = e.harga > hargaNormal;
      const selisih = Math.abs(e.harga - hargaNormal);
      return {
        className: naik
          ? 'bg-rose-100 text-rose-800 font-bold ring-1 ring-inset ring-rose-300'
          : 'bg-emerald-100 text-emerald-800 font-bold ring-1 ring-inset ring-emerald-300',
        title: `Harga normal: Rp ${hargaNormal.toLocaleString('id-ID')} (${naik ? 'naik' : 'turun'} Rp ${selisih.toLocaleString('id-ID')})`,
      };
    },
  },
  {
    key: 'qty',
    label: 'QTY Penjualan',
    stickyClass: 'bg-emerald-50 text-emerald-700',
    totalTextClass: 'text-emerald-700',
    getValue: (e) => (e.qty > 0 ? String(e.qty) : '—'),
    getTotal: (entries) => String(entries.reduce((s, e) => s + e.qty, 0)),
    getCellMeta: () => ({ className: 'bg-emerald-50/60 text-emerald-700' }),
  },
  {
    key: 'total',
    label: 'Total Nilai',
    stickyClass: 'bg-violet-50 text-violet-700',
    totalTextClass: 'text-violet-700',
    getValue: (e) => (e.qty > 0 ? 'Rp ' + (e.qty * e.harga).toLocaleString('id-ID') : '—'),
    getTotal: (entries) => 'Rp ' + entries.reduce((s, e) => s + e.qty * e.harga, 0).toLocaleString('id-ID'),
    getCellMeta: () => ({ className: 'bg-violet-50/60 text-violet-700' }),
  },
];

export function LaporanPenjualanPage() {
  const { kode } = useParams<{ kode?: string }>();
  const navigate = useNavigate();

  const [bulan, setBulan] = useState(8);
  const [tahun, setTahun] = useState(2026);
  const [search, setSearch] = useState(() => (kode && PRODUK_MAP[kode] ? PRODUK_MAP[kode].nama : ''));
  const [supplierFilter, setSupplierFilter] = useState('Semua Supplier');
  const [programFilter, setProgramFilter] = useState('Semua Program');

  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* ── Daftar program tersedia mengikuti supplier yang dipilih (cascading) ── */
  const availablePrograms = useMemo(() => {
    const relevant = supplierFilter === 'Semua Supplier'
      ? MEMO_PROGRAMS
      : MEMO_PROGRAMS.filter((p) => p.supplier === supplierFilter);
    return ['Semua Program', ...relevant.map((p) => p.namaProgram)];
  }, [supplierFilter]);

  /* Kalau supplier diganti dan program yang lagi dipilih tidak lagi tersedia, reset ke default */
  const handleSupplierChange = (val: string) => {
    setSupplierFilter(val);
    const stillValid =
      programFilter === 'Semua Program' ||
      MEMO_PROGRAMS.some((p) => p.namaProgram === programFilter && (val === 'Semua Supplier' || p.supplier === val));
    if (!stillValid) setProgramFilter('Semua Program');
  };

  /* Info memo aktif untuk program yang dipilih (dipakai untuk badge referensi) */
  const activeProgramInfo = useMemo(() => {
    if (programFilter === 'Semua Program') return null;
    return MEMO_PROGRAMS.find(
      (p) => p.namaProgram === programFilter && (supplierFilter === 'Semua Supplier' || p.supplier === supplierFilter)
    ) ?? null;
  }, [programFilter, supplierFilter]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    /* SKU yang tercakup dalam program terpilih (null = tidak difilter program) */
    const activeProgramSkus = programFilter === 'Semua Program'
      ? null
      : new Set(
          MEMO_PROGRAMS.filter(
            (p) => p.namaProgram === programFilter && (supplierFilter === 'Semua Supplier' || p.supplier === supplierFilter)
          ).flatMap((p) => p.skuList)
        );

    return Object.entries(PRODUK_MAP).filter(([sku, p]) => {
      const matchQuery = !q || p.nama.toLowerCase().includes(q) || sku.toLowerCase().includes(q);
      const matchSupplier = supplierFilter === 'Semua Supplier' || p.supplier === supplierFilter;
      const matchProgram = !activeProgramSkus || activeProgramSkus.has(sku);
      return matchQuery && matchSupplier && matchProgram;
    });
  }, [search, supplierFilter, programFilter]);

  const productsWithData = useMemo(
    () => filteredProducts.map(([sku, p]) => ({ sku, produk: p, entries: generateData(sku, daysInMonth) })),
    [filteredProducts, daysInMonth]
  );

  const totalSku = productsWithData.length;
  const totalQty = productsWithData.reduce((s, p) => s + p.entries.reduce((a, e) => a + e.qty, 0), 0);
  const totalNilai = productsWithData.reduce(
    (s, p) => s + p.entries.reduce((a, e) => a + e.qty * e.harga, 0),
    0
  );

  /* Ringkasan berapa hari harga berubah dari normal */
  const totalHariHargaBerubah = productsWithData.reduce(
    (s, p) => s + p.entries.filter((e) => e.harga !== p.produk.harga).length,
    0
  );

  const handleExport = () => {
    const header = ['Nama Produk', 'SKU', 'Indikator', ...days.map(String), 'Total'];
    const rows: string[][] = [header];
    productsWithData.forEach(({ sku, produk, entries }) => {
      ROW_CONFIG.forEach((row, i) => {
        rows.push([
          i === 0 ? produk.nama : '',
          i === 0 ? sku : '',
          row.label,
          ...entries.map((e) => row.getValue(e).replace('Rp ', '').replace(/—/g, '')),
          row.getTotal(entries).replace('Rp ', ''),
        ]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-penjualan-${MONTHS[bulan - 1]}-${tahun}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-foreground">Laporan Penjualan Harian</h1>
          <p className="text-[13px] text-muted-foreground">Riwayat penjualan harian per SKU dalam satu periode bulan</p>
        </div>
      </div>

      {/* Controls: search, filter supplier, filter program, filter bulan/tahun, export */}
      <div className="bg-card rounded-xl border border-border p-4 flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={supplierFilter}
            onChange={(e) => handleSupplierChange(e.target.value)}
            className="text-[12px] border border-border rounded-lg px-2.5 py-2 bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
          >
            {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* 🔶 Filter Nama Program — otomatis mengikuti supplier yang dipilih */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="text-[12px] border border-border rounded-lg px-2.5 py-2 bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all min-w-[160px]"
          >
            {availablePrograms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="text-[12px] border border-border rounded-lg px-2.5 py-2 bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="text-[12px] border border-border rounded-lg px-2.5 py-2 bg-card text-foreground focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={totalSku === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-gradient-to-r from-amber-700 to-amber-600 shadow-sm shadow-amber-700/30 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Download className="w-3.5 h-3.5" />Export Data
        </button>
      </div>

      {/* Badge info program aktif (No Memo referensi) */}
      {activeProgramInfo && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <Tag className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <p className="text-[12px] text-amber-800">
            Menampilkan produk dalam program <span className="font-bold">{activeProgramInfo.namaProgram}</span>
            {' '}— Ref. Memo <span className="font-mono font-semibold">{activeProgramInfo.id}</span>
            {' '}({activeProgramInfo.supplier})
          </p>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: 'Jumlah SKU Ditampilkan', value: String(totalSku), Icon: Package, colorText: 'text-slate-700', colorBg: 'bg-slate-50', colorBorder: 'border-slate-200' },
          { label: 'Total Qty Terjual', value: totalQty.toLocaleString('id-ID'), Icon: TrendingUp, colorText: 'text-emerald-600', colorBg: 'bg-emerald-50', colorBorder: 'border-emerald-200' },
          { label: 'Total Nilai Penjualan', value: 'Rp ' + (totalNilai / 1_000_000).toFixed(2) + ' Jt', Icon: DollarSign, colorText: 'text-violet-700', colorBg: 'bg-violet-50', colorBorder: 'border-violet-200' },
          { label: 'Hari Harga Berubah', value: String(totalHariHargaBerubah), Icon: Filter, colorText: 'text-rose-600', colorBg: 'bg-rose-50', colorBorder: 'border-rose-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.colorBorder} ${s.colorBg} p-3.5`}>
            <div className="flex items-center gap-2 mb-1">
              <s.Icon className={`w-3.5 h-3.5 ${s.colorText}`} />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
            <p className={`text-[18px] font-bold ${s.colorText} leading-tight`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Excel-like Table: all products, 3 rows each (Harga / QTY Penjualan / Total Nilai) */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-[13px] font-semibold text-foreground">
              Rincian Harian — {MONTHS[bulan - 1]} {tahun}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold">
            {[
              { label: 'Harga', dot: 'bg-amber-400' },
              { label: 'Qty', dot: 'bg-emerald-400' },
              { label: 'Total', dot: 'bg-violet-400' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1.5 text-rose-600">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              Harga Naik
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Harga Turun
            </div>
          </div>
        </div>

        {totalSku === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
            Tidak ada produk yang cocok dengan pencarian atau filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th
                    className="sticky z-20 bg-muted px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground min-w-[170px] border-r border-border"
                    style={{ left: 0 }}
                  >
                    Nama Produk &amp; SKU
                  </th>
                  <th
                    className="sticky z-20 bg-muted px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground min-w-[110px] border-r border-border"
                    style={{ left: 170 }}
                  >
                    Indikator
                  </th>
                  {days.map((d) => (
                    <th
                      key={d}
                      className="px-1 py-2.5 text-center font-semibold text-muted-foreground min-w-[38px] border-l border-border/40 whitespace-nowrap"
                    >
                      {d}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-center font-bold text-foreground min-w-[100px] border-l-2 border-border bg-slate-100/80 sticky right-0 z-20">
                    Total
                  </th>
                </tr>
              </thead>
              {productsWithData.map(({ sku, produk, entries }, pi) => (
                <tbody key={sku} className={pi % 2 === 1 ? 'bg-muted/10' : ''}>
                  {ROW_CONFIG.map((row, ri) => (
                    <tr key={row.key} className="border-t border-border">
                      {ri === 0 && (
                        <td
                          rowSpan={ROW_CONFIG.length}
                          className="sticky z-10 bg-card px-4 py-2 align-top border-r border-border"
                          style={{ left: 0 }}
                        >
                          <p className="text-[12px] font-bold text-foreground leading-tight">{produk.nama}</p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{sku}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{produk.supplier}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Normal: Rp {produk.harga.toLocaleString('id-ID')}</p>
                        </td>
                      )}
                      <td
                        className={`sticky z-10 px-3 py-2 font-bold border-r border-border ${row.stickyClass}`}
                        style={{ left: 170 }}
                      >
                        <span className="text-[11px]">{row.label}</span>
                      </td>
                      {entries.map((entry) => {
                        const meta = row.getCellMeta(entry, produk.harga);
                        return (
                          <td
                            key={entry.d}
                            title={meta.title}
                            className={`px-1 py-2 text-center border-l border-border/30 whitespace-nowrap transition-colors ${meta.className}`}
                          >
                            {row.getValue(entry)}
                          </td>
                        );
                      })}
                      <td className={`px-3 py-2 text-center border-l-2 border-border sticky right-0 z-10 bg-slate-100/80 whitespace-nowrap font-bold ${row.totalTextClass}`}>
                        {row.getTotal(entries)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}