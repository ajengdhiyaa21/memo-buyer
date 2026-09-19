import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Trash2, Search, ChevronDown, ArrowLeft, Save, Send,
  Building2, User, Phone, Layers, Percent, Info, Table, LayoutList, AlertCircle,
} from 'lucide-react';

/* ── Data ── */
const ALL_OUTLETS = ['MK1', 'MK2', 'MK3', 'MK4', 'MK5', 'MK6', 'MK7', 'MK8', 'MINI1', 'MINI2', 'MINI3'];
const NAYAN_OUTLETS = ['MK1', 'MK2', 'MK3', 'MK8'];
const GODEAN_OUTLETS = ['MK5', 'MK6', 'MK7', 'MINI1', 'MINI2'];
const ALL_MK_OUTLETS = ['MK1', 'MK2', 'MK3', 'MK5', 'MK6', 'MK7', 'MK8', 'MINI1', 'MINI2', 'MINI3'];

const SUPPLIERS = [
  { id: 'PRI-001', name: 'PT. Indofood CBP Sukses Makmur', type: 'principal' as const },
  { id: 'PRI-002', name: 'PT. Unilever Indonesia Tbk', type: 'principal' as const },
  { id: 'SUP-001', name: 'CV. Sumber Rejeki', type: 'vendor' as const },
  { id: 'SUP-002', name: 'PT. Mitra Distribusi Nusantara', type: 'vendor' as const },
  { id: 'SUP-003', name: 'UD. Makmur Jaya', type: 'vendor' as const },
  { id: 'SUP-004', name: 'PT. Wings Surya', type: 'vendor' as const },
  { id: 'SUP-005', name: 'PT. Nestle Indonesia', type: 'vendor' as const },
];

const PRODUCT_CATALOG = [
  { plu: 'PRD-001', nama: 'Indomie Goreng 85g', satuan: 'PCS', supplierId: 'PRI-001', subKategori: 'Mie Instan' },
  { plu: 'PRD-002', nama: 'Indomie Kuah 70g', satuan: 'PCS', supplierId: 'PRI-001', subKategori: 'Mie Instan' },
  { plu: 'PRD-003', nama: 'Pop Mie Cup 75g', satuan: 'PCS', supplierId: 'PRI-001', subKategori: 'Mie Instan Cup' },
  { plu: 'PRD-004', nama: 'Sunlight Jeruk 400ml', satuan: 'BTL', supplierId: 'PRI-002', subKategori: 'Sabun Cuci Piring' },
  { plu: 'PRD-005', nama: 'Sunlight Lime 750ml', satuan: 'BTL', supplierId: 'PRI-002', subKategori: 'Sabun Cuci Piring' },
  { plu: 'PRD-006', nama: 'Dancow Full Cream 1kg', satuan: 'KG', supplierId: 'SUP-005', subKategori: 'Susu Bubuk' },
  { plu: 'PRD-007', nama: 'Dancow Fortigro 400g', satuan: 'PCS', supplierId: 'SUP-005', subKategori: 'Susu Bubuk' },
  { plu: 'PRD-008', nama: 'Rinso Anti Noda 900g', satuan: 'PCS', supplierId: 'PRI-002', subKategori: 'Detergen' },
  { plu: 'PRD-009', nama: 'So Klin Softener 1L', satuan: 'BTL', supplierId: 'SUP-004', subKategori: 'Pelembut' },
  { plu: 'PRD-010', nama: 'So Klin Pewangi 770ml', satuan: 'BTL', supplierId: 'SUP-004', subKategori: 'Pewangi' },
  { plu: 'PRD-011', nama: 'Mie Sedap Goreng 90g', satuan: 'PCS', supplierId: 'SUP-004', subKategori: 'Mie Instan' },
  { plu: 'PRD-012', nama: 'Roma Kelapa 330g', satuan: 'PCS', supplierId: 'SUP-003', subKategori: 'Biskuit' },
];

const PPN_OPTIONS = [
  { label: 'PPN 10% (sebelum 2022)', value: 10 },
  { label: 'PPN 11%', value: 11 },
  { label: 'PPN 12%', value: 12 },
];
const PPH_OPTIONS = [
  { label: 'PPh Pasal 22 — 1.5%', value: 1.5 },
  { label: 'PPh Pasal 22 — 2%', value: 2 },
  { label: 'PPh Pasal 23 — 2.5%', value: 2.5 },
  { label: 'PPh Pasal 4 Ayat 2 — 15%', value: 15 },
];

type Product = typeof PRODUCT_CATALOG[0];

interface GroupProduct { product: Product; qty: number; }

interface DiscountGroup {
  id: number;
  keterangan: string;
  productScope: ProductScope;
  selectedSubCategory: string;
  discountMode: 'rp' | 'pct';
  discountValue: number;
  products: GroupProduct[];
}

interface TableRow {
  id: number;
  plu: string;
  productName: string;
  qty: number;
  discountMode: 'rp' | 'pct';
  discountValue: number;
  keterangan: string;
}

type OutletScope = 'pt-nayan' | 'all-mk-godean' | 'all-mk' | 'custom';
type SupplierType = 'principal' | 'vendor';
type ProductScope = 'all-supplier' | 'sub-category' | 'per-plu';

interface SupplierItem {
  id: string;
  name: string;
  type: SupplierType;
}

/* ── Shared styles (app design tokens: bg-card, border-border, text-foreground, amber-600/700) ── */
const inp = "w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-card focus:outline-none focus:ring-2 focus:ring-amber-600/15 focus:border-amber-600 transition-all placeholder:text-muted-foreground text-foreground";

/* ── Label ── */
function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
      {children}{req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

/* ── Section wrapper — matches the app's card convention (accent bar header) ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-xl border border-border shadow-sm">
      <div className="px-6 py-3.5 border-b border-border flex items-center gap-2.5 rounded-t-xl"
        style={{ background: 'linear-gradient(135deg, #FAFAFA, #FEF9F0)' }}>
        <div className="w-1 h-4 rounded-full bg-amber-600" />
        <h2 className="text-[13px] font-bold text-foreground">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

/* ── Toggle switch (Off Faktur / On Faktur) ── */
function Toggle({ value, onChange, labels }: { value: boolean; onChange: (v: boolean) => void; labels: [string, string] }) {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
      {([false, true] as const).map((v) => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
            value === v ? 'bg-amber-700 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}>
          {v === false ? labels[0] : labels[1]}
        </button>
      ))}
    </div>
  );
}

function OutletChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[13px] font-medium ${
        active ? 'bg-amber-50 border-amber-500 text-amber-700 font-semibold' : 'bg-muted/60 border-border text-muted-foreground'
      }`}>
      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
        active ? 'bg-amber-600 border-amber-600' : 'border-border'
      }`}>
        {active && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
      </div>
      {label}
    </button>
  );
}

/* ── Multi-select PLU search (Group mode) ── */
function PluMultiSelect({ selected, onChange }: {
  selected: Product[];
  onChange: (products: Product[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = PRODUCT_CATALOG.filter(
    (p) => !selected.find((s) => s.plu === p.plu) &&
      (p.plu.toLowerCase().includes(query.toLowerCase()) || p.nama.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (p: Product) => { onChange([...selected, p]); setQuery(''); };

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center border border-border rounded-lg bg-muted/40 focus-within:border-amber-600 focus-within:bg-card focus-within:ring-2 focus-within:ring-amber-600/15 transition-all">
        <Search className="w-3.5 h-3.5 text-muted-foreground ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          placeholder={selected.length === 0 ? 'Cari PLU atau nama produk...' : 'Tambah produk lain...'}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="flex-1 px-2 py-2.5 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
        />
        {selected.length > 0 && (
          <span className="mr-3 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">{selected.length} dipilih</span>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-full z-50 bg-card rounded-lg border border-border shadow-lg max-h-52 overflow-y-auto divide-y divide-border">
          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-muted-foreground text-center">
              {query ? 'Produk tidak ditemukan' : 'Semua produk sudah dipilih'}
            </div>
          ) : (
            suggestions.map((p) => (
              <button key={p.plu} type="button" onClick={() => add(p)}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-amber-50 transition-colors text-left">
                <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-amber-700">{p.satuan}</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-foreground">{p.nama}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{p.plu}</p>
                </div>
                <Plus className="w-3.5 h-3.5 text-amber-600 ml-auto shrink-0" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Discount Group Panel ── */
function DiscountGroupPanel({
  group, index, supplierId, subCategories, onUpdate, onRemove,
}: {
  group: DiscountGroup;
  index: number;
  supplierId?: string;
  subCategories: string[];
  onUpdate: (g: DiscountGroup) => void;
  onRemove: () => void;
}) {
  const colors = [
    { bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', pill: '#6366F1' },
    { bg: '#FDF4FF', border: '#E9D5FF', text: '#6B21A8', pill: '#A855F7' },
    { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', pill: '#10B981' },
    { bg: '#FFF7ED', border: '#FED7AA', text: '#92400E', pill: '#F59E0B' },
    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', pill: '#3B82F6' },
  ];
  const c = colors[index % colors.length];

  const set = (field: keyof DiscountGroup, val: unknown) => onUpdate({ ...group, [field]: val });

  const productsForScope = (scope: ProductScope, subCategory = group.selectedSubCategory) => {
    if (scope === 'all-supplier') return PRODUCT_CATALOG.filter((p) => supplierId && p.supplierId === supplierId);
    if (scope === 'sub-category') return PRODUCT_CATALOG.filter((p) => p.subKategori === subCategory);
    return group.products.map((gp) => gp.product);
  };

  const applyProductScope = (scope: ProductScope) => {
    const products = productsForScope(scope, scope === 'sub-category' ? group.selectedSubCategory : '');
    onUpdate({ ...group, productScope: scope, selectedSubCategory: scope === 'sub-category' ? group.selectedSubCategory : '', products: products.map((product) => ({ product, qty: 0 })) });
  };

  const applySubCategory = (subCategory: string) => {
    const products = productsForScope('sub-category', subCategory);
    onUpdate({ ...group, productScope: 'sub-category', selectedSubCategory: subCategory, products: products.map((product) => ({ product, qty: 0 })) });
  };

  const updateProductQty = (plu: string, qty: number) => {
    onUpdate({ ...group, products: group.products.map((gp) => gp.product.plu === plu ? { ...gp, qty } : gp) });
  };

  const removeProduct = (plu: string) => {
    onUpdate({ ...group, products: group.products.filter((gp) => gp.product.plu !== plu) });
  };

  const handleProductChange = (products: Product[]) => {
    const existing = new Map(group.products.map((gp) => [gp.product.plu, gp]));
    onUpdate({ ...group, products: products.map((p) => existing.get(p.plu) ?? { product: p, qty: 0 }) });
  };

  return (
    <div className="rounded-xl border transition-all" style={{ borderColor: c.border, background: `${c.bg}60` }}>
      <div className="flex items-center justify-between px-5 py-3 border-b rounded-t-xl" style={{ borderColor: c.border, background: c.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: c.pill }}>
            {index + 1}
          </div>
          <div>
            <p className="text-[12px] font-bold" style={{ color: c.text }}>Kelompok Diskon #{index + 1}</p>
            <p className="text-[10px] opacity-70" style={{ color: c.text }}>
              {group.products.length === 0 ? 'Belum ada produk' : `${group.products.length} produk`}
              {group.discountValue > 0 && ` · Potongan: ${group.discountValue}${group.discountMode === 'pct' ? '%' : ' Rp'}`}
            </p>
          </div>
        </div>
        <button type="button" onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="rounded-lg border border-border bg-card/80 p-4 space-y-4">
          <div>
            <Label req>Cakupan Produk Kelompok</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: 'all-supplier' as const, label: 'All Produk Supplier' },
                { value: 'sub-category' as const, label: 'All Sub Kategori' },
                { value: 'per-plu' as const, label: 'Per PLU' },
              ].map((opt) => (
                <button key={opt.value} type="button" onClick={() => applyProductScope(opt.value)}
                  className={`rounded-md border px-3 py-2 text-left text-[12px] font-semibold transition-all ${
                    group.productScope === opt.value ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-card border-border text-muted-foreground hover:border-amber-200'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {group.productScope === 'sub-category' && (
            <div className="max-w-sm">
              <Label req>Sub Kategori</Label>
              <div className="relative">
                <select value={group.selectedSubCategory} onChange={(e) => applySubCategory(e.target.value)}
                  className={`${inp} appearance-none pr-9 cursor-pointer`}>
                  <option value="">Pilih sub kategori...</option>
                  {subCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">{group.products.length} produk otomatis masuk ke kelompok ini. Tinggal isi nilai potongan.</p>
        </div>

        <div>
          <Label>Keterangan Kelompok</Label>
          <input type="text" value={group.keterangan}
            onChange={(e) => set('keterangan', e.target.value)}
            className={inp} placeholder="Keterangan tambahan untuk kelompok ini..." />
        </div>

        <div>
          <Label req>Nilai Potongan</Label>
          <div className="flex items-stretch gap-2">
            <div className="flex items-center bg-card rounded-lg p-1 border border-border shrink-0">
              {(['rp', 'pct'] as const).map((m) => (
                <button key={m} type="button" onClick={() => set('discountMode', m)}
                  className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all"
                  style={group.discountMode === m
                    ? { background: c.pill, color: '#fff' }
                    : { color: '#6B7280' }}>
                  {m === 'rp' ? 'Rp' : '%'}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={group.discountValue || ''}
                onChange={(e) => set('discountValue', parseFloat(e.target.value) || 0)}
                placeholder={group.discountMode === 'rp' ? 'Nominal potongan per satuan...' : 'Persentase potongan...'}
                min={0}
                className={`${inp} bg-card ${group.discountMode === 'pct' ? 'pr-8' : ''}`}
              />
              {group.discountMode === 'pct' && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px] pointer-events-none">%</span>
              )}
            </div>
          </div>
        </div>

        {group.productScope === 'per-plu' && (
        <div>
          <Label req>Tambah Produk Ke Kelompok Ini</Label>
          <PluMultiSelect selected={group.products.map((gp) => gp.product)} onChange={handleProductChange} />
        </div>
        )}

        {group.products.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Daftar Produk &amp; Target Quantity</p>
            <div className="rounded-lg border overflow-hidden bg-card overflow-x-auto" style={{ borderColor: c.border }}>
              <div className="grid text-[10px] font-semibold uppercase tracking-wide px-4 py-2.5 border-b min-w-[420px]" style={{ gridTemplateColumns: '110px 1fr 100px 40px', background: c.bg, borderColor: c.border, color: c.text }}>
                <span>PLU</span>
                <span>Produk</span>
                <span className="text-right">Qty Target</span>
                <span></span>
              </div>
              {group.products.map((gp) => (
                <div key={gp.product.plu} className="grid items-center px-4 py-2.5 border-b last:border-0 gap-3 bg-card hover:bg-muted/40 transition-colors min-w-[420px]"
                  style={{ gridTemplateColumns: '110px 1fr 100px 40px', borderColor: c.border }}>
                  <p className="text-[11px] font-mono font-semibold" style={{ color: c.pill }}>{gp.product.plu}</p>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{gp.product.nama}</p>
                    <p className="text-[10px] text-muted-foreground">{gp.product.satuan}</p>
                  </div>
                  <input
                    type="number"
                    value={gp.qty || ''}
                    min={0}
                    onChange={(e) => updateProductQty(gp.product.plu, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="px-2.5 py-1.5 border border-border rounded-md text-[12px] text-right bg-card focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all"
                  />
                  <button type="button" onClick={() => removeProduct(gp.product.plu)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md transition-colors text-center">
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Table View (manual entry) ── */
function TableView({ rows, onUpdate, onAdd, onRemove }: {
  rows: TableRow[];
  onUpdate: (id: number, field: keyof TableRow, val: unknown) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="min-w-full text-[12px]">
          <thead>
            <tr className="bg-muted/70 border-b border-border">
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-32">PLU</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground min-w-[220px]">Produk</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-20">Qty</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-16">Mode</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-28">Potongan</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Keterangan</th>
              <th className="px-3 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5 w-32">
                  <input type="text" value={row.plu} placeholder="cth: PRD-001"
                    onChange={(e) => onUpdate(row.id, 'plu', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-md text-[12px] font-mono font-medium focus:outline-none focus:border-amber-600 bg-muted/40 focus:bg-card transition-all text-foreground uppercase placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground" />
                </td>
                <td className="px-3 py-2.5 min-w-[220px]">
                  <input type="text" value={row.productName} placeholder="Masukkan nama produk..."
                    onChange={(e) => onUpdate(row.id, 'productName', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-md text-[12px] focus:outline-none focus:border-amber-600 bg-muted/40 focus:bg-card transition-all text-foreground placeholder:text-muted-foreground" />
                </td>
                <td className="px-3 py-2.5 w-20">
                  <input type="number" value={row.qty || ''} min={0} placeholder="0"
                    onChange={(e) => onUpdate(row.id, 'qty', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-border rounded-md text-[12px] text-right focus:outline-none focus:border-amber-600 bg-muted/40 focus:bg-card transition-all text-foreground" />
                </td>
                <td className="px-3 py-2.5 w-16 text-center">
                  <button type="button"
                    onClick={() => onUpdate(row.id, 'discountMode', row.discountMode === 'rp' ? 'pct' : 'rp')}
                    className={`w-full py-1.5 rounded-md border text-[11px] font-bold hover:border-amber-600 hover:bg-amber-50 transition-all ${row.discountMode === 'rp' ? 'text-amber-700 bg-amber-50/50 border-amber-200' : 'text-purple-600 bg-purple-50/50 border-purple-200'}`}>
                    {row.discountMode === 'rp' ? 'Rp' : '%'}
                  </button>
                </td>
                <td className="px-3 py-2.5 w-28">
                  <div className="relative">
                    <input type="number" value={row.discountValue || ''} min={0} placeholder="0"
                      onChange={(e) => onUpdate(row.id, 'discountValue', parseFloat(e.target.value) || 0)}
                      className={`w-full px-2.5 py-1.5 border border-border rounded-md text-[12px] text-right focus:outline-none focus:border-amber-600 bg-muted/40 focus:bg-card transition-all text-foreground ${row.discountMode === 'pct' ? 'pr-6' : ''}`} />
                    {row.discountMode === 'pct' && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] pointer-events-none">%</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 min-w-[140px]">
                  <input type="text" value={row.keterangan} placeholder="Keterangan..."
                    onChange={(e) => onUpdate(row.id, 'keterangan', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-md text-[12px] focus:outline-none focus:border-amber-600 bg-muted/40 focus:bg-card transition-all placeholder:text-muted-foreground text-foreground" />
                </td>
                <td className="px-3 py-2.5 w-10 text-center">
                  <button type="button" onClick={() => onRemove(row.id)} disabled={rows.length === 1}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-[13px] text-muted-foreground hover:border-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all">
        <Plus className="w-4 h-4" />Tambah Baris
      </button>
    </div>
  );
}

/* ── Main Component ── */
export function CreateMemo() {
  const navigate = useNavigate();

  /* Supplier info */
  const [supplierType, setSupplierType] = useState<SupplierType>('principal');
  const [supplier, setSupplier] = useState<SupplierItem | null>(null);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [supplierQuery, setSupplierQuery] = useState('');
  const supplierRef = useRef<HTMLDivElement>(null);
  const [vendorSupplier, setVendorSupplier] = useState<SupplierItem | null>(null);
  const [vendorSupplierOpen, setVendorSupplierOpen] = useState(false);
  const [vendorSupplierQuery, setVendorSupplierQuery] = useState('');
  const vendorSupplierRef = useRef<HTMLDivElement>(null);
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');

  /* Program info */
  const [outlets, setOutlets] = useState<string[]>([]);
  const [outletScope, setOutletScope] = useState<OutletScope>('pt-nayan');
  const [jenisMemo, setJenisMemo] = useState('');
  const [jenisProgram, setJenisProgram] = useState('');
  const [isOnFaktur, setIsOnFaktur] = useState(false);
  const [ppnAktif, setPpnAktif] = useState(false);
  const [pphAktif, setPphAktif] = useState(false);
  const [ppnValue, setPpnValue] = useState(11);
  const [pphValue, setPphValue] = useState(1.5);

  const [programName, setProgramName] = useState('');
  const [periodeAwal, setPeriodeAwal] = useState('');
  const [periodeAkhir, setPeriodeAkhir] = useState('');

  /* Discount groups */
  const [viewMode, setViewMode] = useState<'group' | 'table'>('group');
  const [groups, setGroups] = useState<DiscountGroup[]>([
    { id: 1, keterangan: '', productScope: 'per-plu', selectedSubCategory: '', discountMode: 'rp', discountValue: 0, products: [] },
  ]);
  const [tableRows, setTableRows] = useState<TableRow[]>([
    { id: 1, plu: '', productName: '', qty: 0, discountMode: 'rp', discountValue: 0, keterangan: '' },
  ]);

  const [catatan, setCatatan] = useState('');
  const [redaksi, setRedaksi] = useState('');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node)) setSupplierOpen(false);
      if (vendorSupplierRef.current && !vendorSupplierRef.current.contains(e.target as Node)) setVendorSupplierOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredSuppliers = SUPPLIERS.filter((s) =>
    s.type === supplierType &&
    (s.id.toLowerCase().includes(supplierQuery.toLowerCase()) || s.name.toLowerCase().includes(supplierQuery.toLowerCase()))
  );
  const filteredVendorSuppliers = SUPPLIERS.filter((s) =>
    s.type === 'vendor' &&
    (s.id.toLowerCase().includes(vendorSupplierQuery.toLowerCase()) || s.name.toLowerCase().includes(vendorSupplierQuery.toLowerCase()))
  );

  const applyOutletScope = (scope: OutletScope) => {
    setOutletScope(scope);
    if (scope === 'pt-nayan') setOutlets([...NAYAN_OUTLETS]);
    if (scope === 'all-mk-godean') setOutlets([...GODEAN_OUTLETS]);
    if (scope === 'all-mk') setOutlets([...ALL_MK_OUTLETS]);
    if (scope === 'custom') setOutlets([]);
  };

  const toggleOutlet = (o: string) => {
    setOutletScope('custom');
    setOutlets((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]);
  };

  const addGroup = () => setGroups((prev) => [...prev, { id: Date.now(), keterangan: '', productScope: 'per-plu', selectedSubCategory: '', discountMode: 'rp', discountValue: 0, products: [] }]);
  const updateGroup = (g: DiscountGroup) => setGroups((prev) => prev.map((x) => x.id === g.id ? g : x));
  const removeGroup = (id: number) => { if (groups.length > 1) setGroups((prev) => prev.filter((g) => g.id !== id)); };

  const addTableRow = () => setTableRows((prev) => [...prev, { id: Date.now(), plu: '', productName: '', qty: 0, discountMode: 'rp', discountValue: 0, keterangan: '' }]);
  const updateTableRow = (id: number, field: keyof TableRow, val: unknown) =>
    setTableRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const removeTableRow = (id: number) => { if (tableRows.length > 1) setTableRows((prev) => prev.filter((r) => r.id !== id)); };
  const subCategories = Array.from(new Set(PRODUCT_CATALOG.map((p) => p.subKategori)));

  return (
    <div className="w-full space-y-5 pb-16">
      {/* Page Header — matches ListMemo's heading style */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Buat Memo Baru</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Formulir pembuatan memo supplier</p>
        </div>
      </div>

      {/* ── 1. Cakupan Outlet ── */}
      <Section title="Cakupan Outlet">
        <div className="space-y-5">
          <div>
            <Label req>Pilih cakupan memo</Label>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <button type="button" onClick={() => applyOutletScope('pt-nayan')}
                className={`text-left rounded-lg border p-4 transition-all ${outletScope === 'pt-nayan' ? 'border-amber-300 bg-amber-50' : 'border-border bg-card hover:border-amber-200'}`}>
                <p className="text-[13px] font-bold text-foreground">PT Nayan</p>
                <p className="text-[11px] text-muted-foreground mt-1">MK1, MK2, MK3, MK8</p>
              </button>
              <button type="button" onClick={() => applyOutletScope('all-mk-godean')}
                className={`text-left rounded-lg border p-4 transition-all ${outletScope === 'all-mk-godean' ? 'border-amber-300 bg-amber-50' : 'border-border bg-card hover:border-amber-200'}`}>
                <p className="text-[13px] font-bold text-foreground">PT Mirota Godean</p>
                <p className="text-[11px] text-muted-foreground mt-1">MK5, MK6, MK7, MINI1, MINI2</p>
              </button>
              <button type="button" onClick={() => applyOutletScope('all-mk')}
                className={`text-left rounded-lg border p-4 transition-all ${outletScope === 'all-mk' ? 'border-amber-300 bg-amber-50' : 'border-border bg-card hover:border-amber-200'}`}>
                <p className="text-[13px] font-bold text-foreground">All MK</p>
                <p className="text-[11px] text-muted-foreground mt-1">Semua MK aktif</p>
              </button>
            </div>
          </div>

          <div>
            <Label>Pilih outlet manual</Label>
            <div className="flex flex-wrap gap-2">
              <OutletChip label="Manual / Bebas Pilih" active={outletScope === 'custom'} onClick={() => applyOutletScope('custom')} />
              {ALL_OUTLETS.map((out) => (
                <OutletChip key={out} label={out} active={outlets.includes(out)} onClick={() => toggleOutlet(out)} />
              ))}
            </div>
            {outlets.length > 0 && (
              <p className="mt-2 text-[11px] text-amber-700 font-medium">{outlets.length} outlet dipilih: {outlets.join(', ')}</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── 2. Informasi Supplier ── */}
      <Section title="Informasi Supplier">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label req>Jenis Supplier</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setSupplierType('principal'); setSupplier(null); setSupplierQuery(''); }}
                  className={`px-4 py-3 rounded-lg border text-left transition-all ${supplierType === 'principal' ? 'border-amber-300 bg-amber-50' : 'border-border bg-card hover:border-amber-200'}`}>
                  <p className="text-[13px] font-bold text-foreground">Principle</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Wajib pilih relasi vendor/supplier</p>
                </button>
                <button type="button" onClick={() => { setSupplierType('vendor'); setSupplier(null); setSupplierQuery(''); setVendorSupplier(null); setVendorSupplierQuery(''); }}
                  className={`px-4 py-3 rounded-lg border text-left transition-all ${supplierType === 'vendor' ? 'border-amber-300 bg-amber-50' : 'border-border bg-card hover:border-amber-200'}`}>
                  <p className="text-[13px] font-bold text-foreground">Vendor/Supplier</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Tanpa relasi principle wajib</p>
                </button>
              </div>
            </div>

          <div className="relative" ref={supplierRef}>
            <Label req>{supplierType === 'principal' ? 'Nama Principle' : 'Nama Vendor/Supplier'}</Label>
            <div className="relative">
              <div
                className="flex items-center border border-border rounded-lg bg-card focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-600/15 transition-all cursor-text"
                onClick={() => setSupplierOpen(true)}>
                <Search className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
                <input
                  type="text"
                  value={supplier ? `${supplier.id} - ${supplier.name}` : supplierQuery}
                  placeholder={supplierType === 'principal' ? 'Cari by no ID principle atau nama...' : 'Cari by no ID supplier atau nama...'}
                  onChange={(e) => { setSupplierQuery(e.target.value); setSupplier(null); setSupplierOpen(true); }}
                  onFocus={() => setSupplierOpen(true)}
                  className="flex-1 px-2.5 py-2.5 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground" />
                <ChevronDown className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
              </div>
              {supplierOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full z-50 bg-card rounded-lg border border-border shadow-lg max-h-60 overflow-y-auto">
                  {filteredSuppliers.length === 0
                    ? (
                      <div className="p-3.5 bg-amber-50/80 border-b border-amber-100 text-[12px] text-amber-900 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-950 mb-0.5">Nama Supplier Tidak Ditemukan</p>
                          <p className="text-[11px] leading-relaxed text-amber-800">
                            Tambahkan supplier baru terlebih dahulu melalui menu <strong>Master Data</strong>.
                          </p>
                        </div>
                      </div>
                    )
                    : filteredSuppliers.map((s) => (
                      <button key={s.id} type="button"
                        onClick={() => { setSupplier(s); setSupplierQuery(''); setSupplierOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-foreground hover:bg-amber-50 hover:text-amber-800 transition-colors text-left border-b border-border last:border-0">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span><span className="font-mono text-[11px] text-muted-foreground">{s.id}</span> - {s.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          </div>

          {supplierType === 'principal' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
              <div className="relative" ref={vendorSupplierRef}>
                <Label req>Vendor/Supplier Relasi</Label>
                <div className="flex items-center border border-amber-200 rounded-lg bg-card focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-600/15 transition-all cursor-text"
                  onClick={() => setVendorSupplierOpen(true)}>
                  <Search className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
                  <input type="text"
                    value={vendorSupplier ? `${vendorSupplier.id} - ${vendorSupplier.name}` : vendorSupplierQuery}
                    placeholder="Cari relasi vendor/supplier..."
                    onChange={(e) => { setVendorSupplierQuery(e.target.value); setVendorSupplier(null); setVendorSupplierOpen(true); }}
                    onFocus={() => setVendorSupplierOpen(true)}
                    className="flex-1 px-2.5 py-2.5 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground" />
                  <ChevronDown className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                </div>
                {vendorSupplierOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-full z-50 bg-card rounded-lg border border-border shadow-lg max-h-60 overflow-y-auto">
                    {filteredVendorSuppliers.map((s) => (
                      <button key={s.id} type="button" onClick={() => { setVendorSupplier(s); setVendorSupplierQuery(''); setVendorSupplierOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-foreground hover:bg-amber-50 hover:text-amber-800 transition-colors text-left border-b border-border last:border-0">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span><span className="font-mono text-[11px] text-muted-foreground">{s.id}</span> - {s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label req>Nama PIC</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" value={picName} onChange={(e) => setPicName(e.target.value)}
                className={`${inp} pl-10`} placeholder="Nama contact person" />
            </div>
          </div>

          <div>
            <Label req>No. Telepon PIC</Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="tel" value={picPhone} onChange={(e) => setPicPhone(e.target.value)}
                className={`${inp} pl-10`} placeholder="0812-3456-7890" />
            </div>
          </div>
          </div>
        </div>
      </Section>

      {/* ── 3. Informasi Program ── */}
      <Section title="Informasi Program">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label req>Nama Program</Label>
              <input type="text" value={programName} onChange={(e) => setProgramName(e.target.value)}
                className={inp} placeholder="cth: Rafaksi Akhir Tahun 2026" />
            </div>
            <div>
              <Label req>Periode Dari</Label>
              <input type="date" value={periodeAwal} onChange={(e) => setPeriodeAwal(e.target.value)} className={inp} />
            </div>
            <div>
              <Label req>Periode Sampai</Label>
              <input type="date" value={periodeAkhir} onChange={(e) => setPeriodeAkhir(e.target.value)} className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label req>Jenis Memo</Label>
              <div className="relative">
                <select value={jenisMemo} onChange={(e) => setJenisMemo(e.target.value)}
                  className={`${inp} appearance-none pr-9 cursor-pointer`}>
                  <option value="">Pilih jenis memo...</option>
                  <option>Program</option>
                  <option>Perubahan Informasi</option>
                  <option>Sewa</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <Label req>Jenis Program</Label>
              <div className="relative">
                <select value={jenisProgram} onChange={(e) => setJenisProgram(e.target.value)}
                  className={`${inp} appearance-none pr-9 cursor-pointer`}>
                  <option value="">Pilih program...</option>
                  <option>Rafaksi</option>
                  <option>Visibility</option>
                  <option>Diskon</option>
                  <option>Banded</option>
                  <option>Free Product</option>
                  <option>Sewa Gondola</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Skema Penagihan */}
          <div className="border-t border-border pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />Skema Penagihan
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Pilih metode penagihan yang berlaku untuk program ini</p>
              </div>
              <Toggle value={isOnFaktur} onChange={setIsOnFaktur} labels={['Off Faktur', 'On Faktur']} />
            </div>

            <div className={`mt-3 flex items-start gap-2.5 px-4 py-3 rounded-lg text-[12px] leading-relaxed border ${
              isOnFaktur ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {isOnFaktur
                  ? 'On Faktur: Potongan tercantum langsung di dalam faktur penjualan.'
                  : 'Off Faktur: Potongan ditagihkan terpisah melalui nota kredit atau pembayaran langsung.'}
              </span>
            </div>

            {!isOnFaktur && (
              <div className="mt-5 space-y-4">
                <p className="text-[12px] font-semibold text-foreground flex items-center gap-2">
                  <Percent className="w-3.5 h-3.5 text-muted-foreground" />Ketentuan Pajak
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">PPN (Pajak Pertambahan Nilai)</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Aktifkan jika program dikenakan PPN</p>
                      </div>
                      <button type="button" onClick={() => setPpnAktif(!ppnAktif)}
                        className={`relative rounded-full transition-all duration-200 shrink-0 w-10 h-[22px] ${ppnAktif ? 'bg-violet-600' : 'bg-border'}`}>
                        <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${ppnAktif ? 'left-[21px]' : 'left-[3px]'}`} />
                      </button>
                    </div>
                    {ppnAktif && (
                      <div className="relative">
                        <select value={ppnValue} onChange={(e) => setPpnValue(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-violet-200 rounded-lg text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all appearance-none cursor-pointer text-foreground pr-8">
                          {PPN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 border border-violet-200 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                          <span className="text-[11px] text-violet-700 font-medium">PPN {ppnValue}% aktif</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">PPh (Pajak Penghasilan)</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Aktifkan jika program dikenakan PPh</p>
                      </div>
                      <button type="button" onClick={() => setPphAktif(!pphAktif)}
                        className={`relative rounded-full transition-all duration-200 shrink-0 w-10 h-[22px] ${pphAktif ? 'bg-blue-600' : 'bg-border'}`}>
                        <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${pphAktif ? 'left-[21px]' : 'left-[3px]'}`} />
                      </button>
                    </div>
                    {pphAktif && (
                      <div className="relative">
                        <select value={pphValue} onChange={(e) => setPphValue(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-blue-200 rounded-lg text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all appearance-none cursor-pointer text-foreground pr-8">
                          {PPH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-[11px] text-blue-700 font-medium">PPh {pphValue}% aktif</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── 3. Kelompok Potongan & Produk ── */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-border rounded-t-xl"
          style={{ background: 'linear-gradient(135deg, #FAFAFA, #FEF9F0)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-4 rounded-full bg-amber-600" />
            <div>
              <h2 className="text-[13px] font-bold text-foreground">Kelompok Potongan &amp; Produk</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Kelompokkan produk berdasarkan nilai potongan yang sama</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border shrink-0">
            <button type="button" onClick={() => setViewMode('group')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                viewMode === 'group' ? 'bg-card text-amber-700 shadow-sm border border-amber-200/80' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <LayoutList className="w-3.5 h-3.5" />Group
            </button>
            <button type="button" onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                viewMode === 'table' ? 'bg-card text-amber-700 shadow-sm border border-amber-200/80' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Table className="w-3.5 h-3.5" />Tabel
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {viewMode === 'group' ? (
            <>
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Buat satu kelompok untuk setiap nilai potongan yang berbeda. Misalnya: Kelompok A untuk potongan Rp 300/pcs, Kelompok B untuk potongan 10%. Harga normal tidak ditampilkan — cukup isi nilai potongan dan quantity.
                </p>
              </div>

              <div className="space-y-5">
                {groups.map((g, i) => (
                  <DiscountGroupPanel
                    key={g.id}
                    group={g}
                    index={i}
                    supplierId={supplier?.id}
                    subCategories={subCategories}
                    onUpdate={updateGroup}
                    onRemove={() => removeGroup(g.id)}
                  />
                ))}
              </div>

              <button type="button" onClick={addGroup}
                className="w-full py-3.5 border-2 border-dashed border-border rounded-xl text-[13px] font-semibold text-muted-foreground hover:border-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />Tambah Kelompok Diskon
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Mode tabel: Isi satu produk per baris. Masukkan PLU, nama produk, quantity, dan nilai potongan secara langsung (manual).
                </p>
              </div>
              <TableView rows={tableRows} onUpdate={updateTableRow} onAdd={addTableRow} onRemove={removeTableRow} />
            </>
          )}
        </div>
      </div>

      {/* ── 4. Catatan & Redaksi ── */}
      <Section title="Catatan & Redaksi">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Catatan (Memo Internal)</Label>
            <textarea rows={4} value={catatan} onChange={(e) => setCatatan(e.target.value)}
              className={`${inp} resize-none`} placeholder="Catatan atau instruksi khusus untuk tim Buyer..." />
          </div>
          <div>
            <Label>Redaksi (Tampil di Memo Cetak)</Label>
            <textarea rows={4} value={redaksi} onChange={(e) => setRedaksi(e.target.value)}
              className={`${inp} resize-none`} placeholder="Teks yang akan tampil di memo cetak resmi..." />
          </div>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border rounded-lg text-[13px] font-medium text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-colors">
          <Save className="w-4 h-4" />Simpan Draft
        </button>
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-sm shadow-amber-700/20 transition-all active:scale-[0.98]">
          <Send className="w-4 h-4" />Submit for Approval
        </button>
      </div>
    </div>
  );
}
