import { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Search, ChevronDown, CheckCircle2,
  FileText, Building2, Tag, Info, Send, AlertCircle,
  ScanLine, IdCard, ArrowLeft, ArrowRight, ShieldCheck,
  RotateCcw, PenLine, Package, UserCog, Wallet, Store,
  Gift, Megaphone, Receipt, Layers, Printer,
} from 'lucide-react';

/* ───────────────────────── Data ───────────────────────── */
const ALL_OUTLETS = ['MK1', 'MK2', 'MK3', 'MK5', 'MK6', 'MK7', 'MK8', 'MINI1', 'MINI2', 'MINI3'];
const NAYAN_OUTLETS = ['MK1', 'MK2', 'MK3', 'MK8'];
const GODEAN_OUTLETS = ['MK5', 'MK6', 'MK7', 'MINI1', 'MINI2'];
const ALL_MK_OUTLETS = ['MK1', 'MK2', 'MK3', 'MK5', 'MK6', 'MK7', 'MK8', 'MINI1', 'MINI2', 'MINI3'];

type SupplierType = 'principal' | 'vendor';

interface SupplierItem {
  id: string;
  name: string;
  type: SupplierType;
}

const SUPPLIERS: SupplierItem[] = [
  { id: 'PRI-001', name: 'PT. Indofood CBP Sukses Makmur', type: 'principal' },
  { id: 'PRI-002', name: 'PT. Unilever Indonesia Tbk', type: 'principal' },
  { id: 'SUP-001', name: 'CV. Sumber Rejeki', type: 'vendor' },
  { id: 'SUP-002', name: 'PT. Mitra Distribusi Nusantara', type: 'vendor' },
  { id: 'SUP-003', name: 'UD. Makmur Jaya', type: 'vendor' },
  { id: 'SUP-004', name: 'PT. Wings Surya', type: 'vendor' },
  { id: 'SUP-005', name: 'PT. Nestle Indonesia', type: 'vendor' },
];

interface Product {
  plu: string;
  nama: string;
  satuan: string;
  supplierId: string;
  subKategori: string;
  gramasi?: string;
  hargaBeli?: number;
  konversi?: string;
  jatuhTempo?: string;
}

const PRODUCT_CATALOG: Product[] = [
  { plu: 'PRD-001', nama: 'Indomie Goreng 85g', satuan: 'PCS', supplierId: 'PRI-001', subKategori: 'Mie Instan', gramasi: '85 gram', hargaBeli: 2500, konversi: '1 Dus = 40 pcs', jatuhTempo: '30 hari' },
  { plu: 'PRD-002', nama: 'Indomie Kuah 70g', satuan: 'PCS', supplierId: 'PRI-001', subKategori: 'Mie Instan', gramasi: '70 gram', hargaBeli: 2200, konversi: '1 Dus = 40 pcs', jatuhTempo: '30 hari' },
  { plu: 'PRD-003', nama: 'Pop Mie Cup 75g', satuan: 'PCS', supplierId: 'PRI-001', subKategori: 'Mie Instan Cup', gramasi: '75 gram', hargaBeli: 3500, konversi: '1 Dus = 24 pcs', jatuhTempo: '30 hari' },
  { plu: 'PRD-004', nama: 'Sunlight Jeruk 400ml', satuan: 'BTL', supplierId: 'PRI-002', subKategori: 'Sabun Cuci Piring', gramasi: '400 ml', hargaBeli: 6500, konversi: '1 Dus = 24 btl', jatuhTempo: '45 hari' },
  { plu: 'PRD-005', nama: 'Sunlight Lime 750ml', satuan: 'BTL', supplierId: 'PRI-002', subKategori: 'Sabun Cuci Piring', gramasi: '750 ml', hargaBeli: 11500, konversi: '1 Dus = 12 btl', jatuhTempo: '45 hari' },
  { plu: 'PRD-006', nama: 'Dancow Full Cream 1kg', satuan: 'KG', supplierId: 'SUP-005', subKategori: 'Susu Bubuk' },
  { plu: 'PRD-007', nama: 'Dancow Fortigro 400g', satuan: 'PCS', supplierId: 'SUP-005', subKategori: 'Susu Bubuk' },
  { plu: 'PRD-008', nama: 'Rinso Anti Noda 900g', satuan: 'PCS', supplierId: 'PRI-002', subKategori: 'Detergen' },
  { plu: 'PRD-009', nama: 'So Klin Softener 1L', satuan: 'BTL', supplierId: 'SUP-004', subKategori: 'Pelembut' },
  { plu: 'PRD-010', nama: 'So Klin Pewangi 770ml', satuan: 'BTL', supplierId: 'SUP-004', subKategori: 'Pewangi' },
  { plu: 'PRD-011', nama: 'Mie Sedap Goreng 90g', satuan: 'PCS', supplierId: 'SUP-004', subKategori: 'Mie Instan' },
  { plu: 'PRD-012', nama: 'Roma Kelapa 330g', satuan: 'PCS', supplierId: 'SUP-003', subKategori: 'Biskuit' },
  { plu: 'PRD-013', nama: 'GIV Body Soap 90g', satuan: 'PCS', supplierId: 'SUP-004', subKategori: 'Sabun Mandi' },
  { plu: 'PRD-014', nama: 'Chitato Sapi Panggang 68g', satuan: 'PCS', supplierId: 'SUP-003', subKategori: 'Snack' },
  { plu: 'PRD-015', nama: 'Good Day Cappuccino 200ml', satuan: 'BTL', supplierId: 'SUP-003', subKategori: 'Minuman Kopi' },
];

/* Mock ID cards -> what a barcode scan would resolve to. This app is supplier-only. */
interface IdCardData {
  cardId: string;
  supplier: SupplierItem | null;
  principal: SupplierItem | null;
  picName: string;
  picPhone: string;
  noRekening?: string;
}

const MOCK_ID_CARDS: IdCardData[] = [
  { cardId: 'MK-SPV-00123', supplier: SUPPLIERS.find((s) => s.id === 'SUP-001')!, principal: null, picName: 'Budi Santoso', picPhone: '0812-3456-7890', noRekening: '2200011234 - Bank BCA' },
  { cardId: 'MK-SPV-00456', supplier: SUPPLIERS.find((s) => s.id === 'SUP-004')!, principal: null, picName: 'Siti Aminah', picPhone: '0813-2211-9988', noRekening: '5500098765 - Bank Mandiri' },
  { cardId: 'MK-SPV-00789', supplier: SUPPLIERS.find((s) => s.id === 'SUP-005')!, principal: null, picName: 'Andi Wijaya', picPhone: '0857-6633-2210', noRekening: '1160077889 - Bank BNI' },
  { cardId: 'MK-PRI-00234', supplier: SUPPLIERS.find((s) => s.id === 'PRI-001')!, principal: SUPPLIERS.find((s) => s.id === 'SUP-002')!, picName: 'Rahmat Hidayat', picPhone: '0821-9900-1122', noRekening: '3300112233 - Bank BCA' },
];

const BANK_OPTIONS = ['BCA', 'Bank Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Bank Permata', 'BTN', 'Bank Danamon', 'BSI', 'Bank Jateng'];

const GRAMASI_UNIT_OPTIONS = ['gram', 'kg', 'ml', 'liter'];
const KONVERSI_UNIT_OPTIONS = ['PCS', 'DUS', 'BOX', 'KARTON', 'LUSIN', 'PACK'];

const PRODUK_UPDATE_FIELDS = [
  { key: 'nama', label: 'Nama Produk' },
  { key: 'gramasi', label: 'Gramasi' },
  { key: 'hargaBeli', label: 'Harga Beli' },
  { key: 'konversi', label: 'Konversi' },
  { key: 'jatuhTempo', label: 'Jatuh Tempo' },
];
const VENDOR_UPDATE_FIELDS = [
  { key: 'picName', label: 'Nama PIC' },
  { key: 'picPhone', label: 'Kontak PIC' },
  { key: 'noRekening', label: 'Nomor Rekening Bank' },
];

const JENIS_MEMO_OPTIONS = [
  { key: 'update-informasi', label: 'Update Informasi', desc: 'Perbarui data produk atau profil vendor', icon: FileText },
  { key: 'memo-program', label: 'Memo Program', desc: 'Diskon on faktur, off faktur, dan/atau budget', icon: Tag },
  { key: 'pendapatan-lain', label: 'Memo Pendapatan Lain-lain', desc: 'Sewa/visibility, reward, promosi, listing', icon: Building2 },
] as const;

const PROGRAM_TIPE_OPTIONS = [
  { key: 'on-faktur', label: 'On Faktur', icon: Receipt },
  { key: 'off-faktur', label: 'Off Faktur', icon: FileText },
  { key: 'budget', label: 'Budget', icon: Wallet },
];

const PPN_RATE_OPTIONS = ['PPN 10% (sebelum 2022)', 'PPN 11%', 'PPN 12%'];
const PPH_RATE_OPTIONS = ['PPh Pasal 22 — 1.5%', 'PPh Pasal 23 — 2%', 'PPh Final — 0.5%', 'PPh 22 Impor — 7.5%'];

const PENDAPATAN_OPTIONS = [
  { key: 'sewa-visibility', label: 'Sewa / Visibility', desc: 'Sewa ruang, gondola, atau media visibility', icon: Store },
  { key: 'reward-insentif', label: 'Reward / Rabat / Insentif', desc: 'Insentif yang melekat pada pencapaian target', icon: Gift },
  { key: 'promosi', label: 'Promosi (Media Cetak/Digital)', desc: 'Kerja sama promosi melalui media cetak atau digital', icon: Megaphone },
  { key: 'listing', label: 'Listing', desc: 'Pendaftaran produk baru beserta syarat & ketentuan', icon: Receipt },
] as const;

const SEWA_VISIBILITY_JENIS = ['End Gondola', 'Wing Gondola', 'Shelving', 'COC', 'Dancing Up', 'Floor', 'Dumbin', 'Backwall Kosmetik', 'Showroom Motor'];
const PROMOSI_MEDIA_OPTIONS = ['Neonbox Instore', 'Spanduk/Banner In Store', 'Spanduk/Banner Out Store', 'Banner Mobil', 'TVC/Digital Signage', 'Promo Instagram', 'Audio Promo', 'Brosur'];
const REWARD_JENIS_OPTIONS = ['Reward', 'Rabate', 'Insentif'];
const REWARD_BENTUK_OPTIONS = ['Uang', 'Hadiah'];
const REWARD_PEMBAYARAN_OPTIONS = ['Tunai', 'Non Tunai'];

const SATUAN_OPTIONS = ['PCS', 'BANDED', 'DUS', 'BOX', 'KARTON', 'LUSIN', 'PACK'];

function getProdukOldValue(product: Product | null, field: string): string {
  if (!product) return '';
  switch (field) {
    case 'nama': return product.nama;
    case 'gramasi': return product.gramasi || '-';
    case 'hargaBeli': return product.hargaBeli ? `Rp ${product.hargaBeli.toLocaleString('id-ID')}` : '-';
    case 'konversi': return product.konversi || '-';
    case 'jatuhTempo': return product.jatuhTempo || '-';
    default: return '-';
  }
}
function getVendorOldValue(identity: IdCardData | null, field: string): string {
  if (!identity) return '';
  switch (field) {
    case 'picName': return identity.picName;
    case 'picPhone': return identity.picPhone;
    case 'noRekening': return identity.noRekening || '-';
    default: return '-';
  }
}

type JenisMemo = 'update-informasi' | 'memo-program' | 'pendapatan-lain' | '';
type OutletScope = 'pt-nayan' | 'all-mk-godean' | 'all-mk' | 'custom';
type ProductScope = 'all-supplier' | 'sub-category' | 'per-plu';
type DiskonMode = 'persen' | 'rp';

interface StepDef { key: string; label: string; }

function getSteps(jenisMemo: JenisMemo, tipeProgram: string[]): StepDef[] {
  const steps: StepDef[] = [
    { key: 'scan', label: 'Scan ID' },
    { key: 'outlet', label: 'Outlet' },
    { key: 'jenis-memo', label: 'Jenis Memo' },
  ];
  if (jenisMemo === 'update-informasi') steps.push({ key: 'update-informasi', label: 'Update Info' });
  if (jenisMemo === 'memo-program') {
    steps.push({ key: 'program-info', label: 'Info Program' });
    const hasProductTipe = tipeProgram.includes('on-faktur') || tipeProgram.includes('off-faktur');
    if (hasProductTipe) steps.push({ key: 'cakupan-produk', label: 'Cakupan Produk' });
    steps.push({ key: 'program-detail', label: 'Detail Program' });
  }
  if (jenisMemo === 'pendapatan-lain') steps.push({ key: 'pendapatan', label: 'Pendapatan Lain' });
  steps.push({ key: 'catatan', label: 'Catatan' });
  steps.push({ key: 'tinjau', label: 'Tinjau & TTD' });
  return steps;
}

type FormErrors = Record<string, string>;

/* ───────────────────────── Shared UI ───────────────────────── */
const inp = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 text-slate-700";
const inpErr = "w-full px-3.5 py-2.5 border border-red-300 rounded-xl text-[13px] bg-red-50/40 focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition-all placeholder:text-slate-400 text-slate-700";

function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
      {children}{req && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
      <AlertCircle className="w-3 h-3 shrink-0" />{message}
    </p>
  );
}

function InfoNote({ tone = 'indigo', children }: { tone?: 'indigo' | 'amber' | 'emerald'; children: React.ReactNode }) {
  const tones = {
    indigo: 'bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    emerald: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]',
  } as const;
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-[12px] leading-relaxed border ${tones[tone]}`}>
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{children}</span>
    </div>
  );
}

function Card({ title, icon: Icon, subtitle, children }: { title: string; icon: React.ElementType; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-amber-50/50 rounded-t-2xl">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-600/10 shrink-0">
          <Icon className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h2 className="text-[13px] font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function OutletChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-semibold transition-all ${
        active ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
      }`}>
      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
        active ? 'bg-[#B45309] border-[#B45309]' : 'border-slate-300'
      }`}>
        {active && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
      </div>
      {label}
    </button>
  );
}

/** Single-select radio chips — use for fields where only ONE option can apply. */
function SingleChoiceChips({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button key={o.key} type="button" onClick={() => onChange(o.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-semibold transition-all ${
              active ? 'bg-amber-600 border-amber-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-white' : 'border-slate-300'}`}>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select checkbox chips — only use where more than one option genuinely can apply at once. */
function MultiChoiceChips({ options, value, onChange }: { options: { key: string; label: string; icon?: React.ElementType }[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o.key);
        const Icon = o.icon;
        return (
          <button key={o.key} type="button" onClick={() => toggle(o.key)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[12.5px] font-semibold transition-all ${
              active ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
            }`}>
            <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${active ? 'bg-[#B45309] border-[#B45309]' : 'border-slate-300'}`}>
              {active && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
            </div>
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function YesNoToggle({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
      <button type="button" onClick={() => onChange(true)}
        className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${value === true ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Ya</button>
      <button type="button" onClick={() => onChange(false)}
        className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${value === false ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Tidak</button>
    </div>
  );
}

/** iOS-style pill switch — used for independently activatable settings like PPN / PPh. */
function ToggleSwitch({ checked, onChange, color = '#7C3AED' }: { checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} aria-pressed={checked}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ background: checked ? color : '#CBD5E1' }}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function DiskonModeToggle({ value, onChange }: { value: DiskonMode; onChange: (v: DiskonMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit shrink-0">
      {(['persen', 'rp'] as const).map((m) => (
        <button key={m} type="button" onClick={() => onChange(m)}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${value === m ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
          {m === 'persen' ? 'Persentase (%)' : 'Rupiah (Rp)'}
        </button>
      ))}
    </div>
  );
}

/** Old -> new value pair. Labels describe the change plainly: what it was, what it becomes. */
function ChangeField({ oldValue, newValue, onChange, placeholder }: { oldValue: string; newValue: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:items-end">
      <div>
        <Label>Data Sebelumnya</Label>
        <div className="px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 border border-slate-200 text-slate-500">
          {oldValue || <span className="italic text-slate-400">Belum ada data</span>}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block mb-3" />
      <div>
        <Label req>Data Baru</Label>
        <input type="text" value={newValue} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'Masukkan data baru...'} className={inp} />
      </div>
    </div>
  );
}

/** Old -> new value pair where the new value is a number plus a unit dropdown (gramasi / konversi). */
function ChangeFieldWithUnit({ oldValue, newValue, onValueChange, unit, onUnitChange, unitOptions, prefix, numberPlaceholder }: {
  oldValue: string; newValue: string; onValueChange: (v: string) => void;
  unit: string; onUnitChange: (v: string) => void; unitOptions: string[];
  prefix?: string; numberPlaceholder?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:items-end">
      <div>
        <Label>Data Sebelumnya</Label>
        <div className="px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 border border-slate-200 text-slate-500">
          {oldValue || <span className="italic text-slate-400">Belum ada data</span>}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block mb-3" />
      <div>
        <Label req>Data Baru</Label>
        <div className="flex items-center gap-2">
          {prefix && <span className="text-[12px] text-slate-500 shrink-0">{prefix}</span>}
          <input type="number" min={0} value={newValue} onChange={(e) => onValueChange(e.target.value)} placeholder={numberPlaceholder || '0'} className={`${inp} flex-1`} />
          <div className="relative shrink-0 w-28">
            <select value={unit} onChange={(e) => onUnitChange(e.target.value)} className={`${inp} appearance-none pr-8 cursor-pointer`}>
              <option value="">Satuan...</option>
              {unitOptions.map((u) => <option key={u}>{u}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PeriodeRange({ awal, akhir, onAwal, onAkhir }: { awal: string; akhir: string; onAwal: (v: string) => void; onAkhir: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div><Label req>Periode Dari</Label><input type="date" value={awal} onChange={(e) => onAwal(e.target.value)} className={inp} /></div>
      <div><Label req>Periode Sampai</Label><input type="date" value={akhir} onChange={(e) => onAkhir(e.target.value)} className={inp} /></div>
    </div>
  );
}

/* ───────────────────────── Step indicator ───────────────────────── */
function StepIndicator({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 overflow-x-auto">
        <div className="flex items-center min-w-max">
          {steps.map((s, i) => {
            const state = i < current ? 'done' : i === current ? 'active' : 'todo';
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5 w-[92px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-all ${
                    state === 'active' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : state === 'done' ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {state === 'done' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10.5px] font-semibold text-center leading-tight ${
                    state === 'active' ? 'text-amber-700' : state === 'done' ? 'text-slate-500' : 'text-slate-400'
                  }`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-[2px] w-8 sm:w-12 -mt-5 shrink-0 ${i < current ? 'bg-amber-300' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Step: Scan ID ───────────────────────── */
function ScanIdStep({ identity, onScanned, error }: { identity: IdCardData | null; onScanned: (card: IdCardData) => void; error?: string }) {
  const [scanning, setScanning] = useState(false);
  const doScan = () => {
    setScanning(true);
    window.setTimeout(() => {
      const card = MOCK_ID_CARDS[Math.floor(Math.random() * MOCK_ID_CARDS.length)];
      onScanned(card);
      setScanning(false);
    }, 1400);
  };

  return (
    <Card title="Scan Kartu ID Supplier" icon={IdCard} subtitle="Tempelkan / scan barcode kartu ID supplier Anda untuk mengisi identitas secara otomatis">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className={`relative w-full max-w-sm rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all ${
          scanning ? 'border-amber-400 bg-amber-50' : identity ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50'
        }`}>
          {scanning ? (
            <>
              <ScanLine className="w-10 h-10 text-amber-600 animate-pulse mb-3" />
              <p className="text-[13px] font-bold text-amber-800">Membaca kartu ID...</p>
              <p className="text-[11px] text-amber-600 mt-1">Mohon tunggu sebentar</p>
            </>
          ) : identity ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-3" />
              <p className="text-[13px] font-bold text-emerald-800">Kartu ID terbaca</p>
              <p className="text-[11px] font-mono text-emerald-600 mt-1">{identity.cardId}</p>
            </>
          ) : (
            <>
              <IdCard className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-[13px] font-bold text-slate-600">Belum ada kartu terdeteksi</p>
              <p className="text-[11px] text-slate-400 mt-1">Tekan tombol di bawah untuk mensimulasikan scan barcode</p>
            </>
          )}
        </div>

        <button type="button" onClick={doScan} disabled={scanning}
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl text-[13px] font-bold text-white transition-all active:scale-[0.98] bg-gradient-to-r from-amber-700 to-amber-600 shadow-lg shadow-amber-700/30 disabled:opacity-60 disabled:cursor-not-allowed">
          <ScanLine className="w-4 h-4" />{identity ? 'Scan Ulang Kartu' : 'Scan Kartu ID'}
        </button>
        <FieldError message={error} />

        {identity && (
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Data Terisi Otomatis</p>
            {identity.principal && (
              <div className="flex justify-between items-center text-[13px]"><span className="text-slate-400">Nama Principle</span><span className="font-semibold text-slate-800 text-right">{identity.principal.name}</span></div>
            )}
            <div className="flex justify-between items-center text-[13px]"><span className="text-slate-400">{identity.principal ? 'Vendor/Supplier Relasi' : 'Nama Supplier'}</span><span className="font-semibold text-slate-800 text-right">{identity.supplier?.name}</span></div>
            <div className="flex justify-between items-center text-[13px]"><span className="text-slate-400">Nama PIC</span><span className="font-semibold text-slate-800">{identity.picName}</span></div>
            <div className="flex justify-between items-center text-[13px]"><span className="text-slate-400">No. Telepon PIC</span><span className="font-semibold text-slate-800">{identity.picPhone}</span></div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ───────────────────────── Step: Outlet ───────────────────────── */
function OutletStep({ outlets, outletScope, applyOutletScope, toggleOutlet, error }: {
  outlets: string[]; outletScope: OutletScope; applyOutletScope: (s: OutletScope) => void; toggleOutlet: (o: string) => void; error?: string;
}) {
  return (
    <Card title="Cakupan Outlet / MK" icon={Layers} subtitle="Tentukan outlet mana saja yang berlaku untuk memo ini">
      <div>
        <Label req>Pilih cakupan memo</Label>
        <div className="flex flex-col lg:flex-row gap-3">
          <button type="button" onClick={() => applyOutletScope('pt-nayan')}
            className={`flex-1 text-left rounded-2xl border p-4 transition-all ${outletScope === 'pt-nayan' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-[13px] font-bold text-slate-800">PT Mirota Nayan</p>
            <p className="text-[11px] text-slate-500 mt-1">Berlaku untuk MK1, MK2, MK3, MK8</p>
          </button>
          <button type="button" onClick={() => applyOutletScope('all-mk-godean')}
            className={`flex-1 text-left rounded-2xl border p-4 transition-all ${outletScope === 'all-mk-godean' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-[13px] font-bold text-slate-800">All MK Godean</p>
            <p className="text-[11px] text-slate-500 mt-1">Berlaku untuk MK5, MK6, MK7</p>
          </button>
          <button type="button" onClick={() => applyOutletScope('custom')}
            className={`flex-1 text-left rounded-2xl border p-4 transition-all ${outletScope === 'custom' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <p className="text-[13px] font-bold text-slate-800">Manual</p>
            <p className="text-[11px] text-slate-500 mt-1">Pilih outlet secara bebas di bawah</p>
          </button>
        </div>
      </div>

      <div>
        <Label>Pilih outlet</Label>
        <div className="flex flex-wrap gap-2">
          {ALL_OUTLETS.map((out) => (
            <OutletChip key={out} label={out} active={outlets.includes(out)} onClick={() => toggleOutlet(out)} />
          ))}
        </div>
        <FieldError message={error} />
        {outlets.length > 0 && <p className="mt-2 text-[11px] text-amber-700 font-medium">{outlets.length} outlet dipilih: {outlets.join(', ')}</p>}
      </div>
    </Card>
  );
}

/* ───────────────────────── Step: Jenis Memo ───────────────────────── */
function JenisMemoStep({ value, onChange, error }: { value: JenisMemo; onChange: (v: JenisMemo) => void; error?: string }) {
  return (
    <Card title="Pilih Jenis Memo" icon={Tag} subtitle="Pilih satu jenis memo yang ingin diajukan">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {JENIS_MEMO_OPTIONS.map((o) => {
          const Icon = o.icon;
          const active = value === o.key;
          return (
            <button key={o.key} type="button" onClick={() => onChange(o.key as JenisMemo)}
              className={`text-left rounded-2xl border p-4 transition-all ${active ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${active ? 'bg-amber-600' : 'bg-slate-100'}`}>
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-[13px] font-bold text-slate-800">{o.label}</p>
              <p className="text-[11px] text-slate-500 mt-1">{o.desc}</p>
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </Card>
  );
}

/* ───────────────────────── Step: Update Informasi ───────────────────────── */
interface UpdateInfoState {
  jenisUpdate: 'produk' | 'vendor' | '';
  selectedProducts: Product[];
  produkFields: string[];
  produkValues: Record<string, string>;
  produkUnits: Record<string, string>;
  produkKonversi: Record<string, ListingConversionRow>;
  vendorFields: string[];
  vendorValues: Record<string, string>;
  vendorBank: string;
  vendorRekening: string;
}

interface ListingConversionRow {
  qty1: number;
  satuan1: string;
  qty2: number;
  satuan2: string;
  qty3: number;
  satuan3: string;
}

const emptyListingConversionRow = (): ListingConversionRow => ({
  qty1: 0,
  satuan1: '',
  qty2: 0,
  satuan2: '',
  qty3: 0,
  satuan3: '',
});

function formatListingConversion(row?: ListingConversionRow) {
  if (!row) return '';
  return [
    row.qty1 && row.satuan1 ? `${row.qty1} ${row.satuan1}` : '',
    row.qty2 && row.satuan2 ? `${row.qty2} ${row.satuan2}` : '',
    row.qty3 && row.satuan3 ? `${row.qty3} ${row.satuan3}` : '',
  ].filter(Boolean).join(' -> ');
}

function UpdateInformasiStep({ state, setField, onJenisUpdateChange, identity, errors }: {
  state: UpdateInfoState; setField: <K extends keyof UpdateInfoState>(f: K, v: UpdateInfoState[K]) => void;
  onJenisUpdateChange: (v: 'produk' | 'vendor') => void; identity: IdCardData | null; errors: FormErrors;
}) {
  const setProdukValue = (plu: string, field: string, value: string) => setField('produkValues', { ...state.produkValues, [`${plu}::${field}`]: value });
  const setProdukUnit = (plu: string, field: string, unit: string) => setField('produkUnits', { ...state.produkUnits, [`${plu}::${field}`]: unit });
  const setProdukKonversi = (plu: string, field: keyof ListingConversionRow, value: string | number) => {
    const key = `${plu}::konversi`;
    setField('produkKonversi', {
      ...state.produkKonversi,
      [key]: { ...(state.produkKonversi[key] || emptyListingConversionRow()), [field]: value },
    });
  };
  const setVendorValue = (field: string, value: string) => setField('vendorValues', { ...state.vendorValues, [field]: value });

  return (
    <Card title="Update Informasi" icon={FileText} subtitle="Perbarui data produk atau profil vendor Anda — data yang diupdate boleh lebih dari satu">
      <div>
        <Label req>Jenis Update</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => onJenisUpdateChange('produk')}
            className={`flex items-center gap-3 text-left rounded-2xl border p-4 transition-all ${state.jenisUpdate === 'produk' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${state.jenisUpdate === 'produk' ? 'bg-amber-600' : 'bg-slate-100'}`}><Package className={`w-4 h-4 ${state.jenisUpdate === 'produk' ? 'text-white' : 'text-slate-400'}`} /></div>
            <div><p className="text-[13px] font-bold text-slate-800">Update Informasi Produk</p><p className="text-[11px] text-slate-500 mt-0.5">Bisa pilih dan input lebih dari satu produk</p></div>
          </button>
          <button type="button" onClick={() => onJenisUpdateChange('vendor')}
            className={`flex items-center gap-3 text-left rounded-2xl border p-4 transition-all ${state.jenisUpdate === 'vendor' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${state.jenisUpdate === 'vendor' ? 'bg-amber-600' : 'bg-slate-100'}`}><UserCog className={`w-4 h-4 ${state.jenisUpdate === 'vendor' ? 'text-white' : 'text-slate-400'}`} /></div>
            <div><p className="text-[13px] font-bold text-slate-800">Update Profil Vendor</p><p className="text-[11px] text-slate-500 mt-0.5">Ubah data PIC / rekening</p></div>
          </button>
        </div>
        <FieldError message={errors.jenisUpdate} />
      </div>

      {state.jenisUpdate === 'produk' && (
        <div className="space-y-4 border-t border-slate-100 pt-5">
          <div>
            <Label req>Pilih Produk (bisa lebih dari satu)</Label>
            <PluMultiSelect selected={state.selectedProducts} onChange={(v) => setField('selectedProducts', v)} />
            <FieldError message={errors.selectedProducts} />
          </div>
          <div>
            <Label req>Data yang Diupdate (bisa lebih dari satu)</Label>
            <MultiChoiceChips options={PRODUK_UPDATE_FIELDS} value={state.produkFields} onChange={(v) => setField('produkFields', v)} />
            <FieldError message={errors.produkFields} />
          </div>
          {state.selectedProducts.length > 0 && state.produkFields.length > 0 && (
            <div className="space-y-3">
              {state.selectedProducts.map((product) => (
                <div key={product.plu} className="rounded-xl border border-slate-200 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-[12.5px] font-bold text-slate-800">{product.nama}</p>
                    <span className="text-[10px] font-mono text-slate-400">{product.plu}</span>
                  </div>
                  {state.produkFields.map((field) => {
                    const key = `${product.plu}::${field}`;
                    return (
                      <div key={field}>
                        <Label req>{PRODUK_UPDATE_FIELDS.find((f) => f.key === field)?.label}</Label>
                        {field === 'gramasi' ? (
                          <ChangeFieldWithUnit
                            oldValue={getProdukOldValue(product, field)}
                            newValue={state.produkValues[key] || ''} onValueChange={(v) => setProdukValue(product.plu, field, v)}
                            unit={state.produkUnits[key] || ''} onUnitChange={(u) => setProdukUnit(product.plu, field, u)}
                            unitOptions={GRAMASI_UNIT_OPTIONS} numberPlaceholder="cth: 85"
                          />
                        ) : field === 'konversi' ? (
                          <div className="grid grid-cols-1 lg:grid-cols-[240px_auto_1fr] gap-4 lg:items-start">
                            <div>
                              <Label>Data Sebelumnya</Label>
                              <div className="px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 border border-slate-200 text-slate-500">
                                {getProdukOldValue(product, field) || <span className="italic text-slate-400">Belum ada data</span>}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 hidden lg:block mt-8" />
                            <div>
                              <Label req>Data Baru</Label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                  { qty: 'qty1', satuan: 'satuan1', label: 'Level 1', placeholder: 'cth: 1' },
                                  { qty: 'qty2', satuan: 'satuan2', label: 'Level 2', placeholder: 'cth: 12' },
                                  { qty: 'qty3', satuan: 'satuan3', label: 'UOM Terkecil', placeholder: 'cth: 24' },
                                ].map((item) => {
                                  const row = state.produkKonversi[key] || emptyListingConversionRow();
                                  return (
                                    <div key={item.qty} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                                      <div className="space-y-2">
                                        <input
                                          type="number"
                                          min={0}
                                          value={(row[item.qty as keyof ListingConversionRow] as number) || ''}
                                          onChange={(e) => setProdukKonversi(product.plu, item.qty as keyof ListingConversionRow, parseInt(e.target.value) || 0)}
                                          className={inp}
                                          placeholder={item.placeholder}
                                        />
                                        <div className="relative">
                                          <select
                                            value={(row[item.satuan as keyof ListingConversionRow] as string) || ''}
                                            onChange={(e) => setProdukKonversi(product.plu, item.satuan as keyof ListingConversionRow, e.target.value)}
                                            className={`${inp} appearance-none pr-8 cursor-pointer`}
                                          >
                                            <option value="">Satuan...</option>
                                            {KONVERSI_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                                          </select>
                                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <ChangeField
                            oldValue={getProdukOldValue(product, field)}
                            newValue={state.produkValues[key] || ''}
                            onChange={(v) => setProdukValue(product.plu, field, v)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <FieldError message={errors.produkValues} />
            </div>
          )}
        </div>
      )}

      {state.jenisUpdate === 'vendor' && (
        <div className="space-y-4 border-t border-slate-100 pt-5">
          <div>
            <Label req>Data yang Diupdate (bisa lebih dari satu)</Label>
            <MultiChoiceChips options={VENDOR_UPDATE_FIELDS} value={state.vendorFields} onChange={(v) => setField('vendorFields', v)} />
            <FieldError message={errors.vendorFields} />
          </div>
          {state.vendorFields.map((field) => (
            <div key={field}>
              {field === 'noRekening' ? (
                <div>
                  <Label req>Nomor Rekening Bank</Label>
                  <div className="px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 border border-slate-200 text-slate-500 mb-3">
                    {getVendorOldValue(identity, 'noRekening') || <span className="italic text-slate-400">Belum ada data</span>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label req>Bank</Label>
                      <div className="relative">
                        <select value={state.vendorBank} onChange={(e) => setField('vendorBank', e.target.value)} className={`${inp} appearance-none pr-9 cursor-pointer`}>
                          <option value="">Pilih bank...</option>
                          {BANK_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <Label req>Nomor Rekening Baru</Label>
                      <input type="text" value={state.vendorRekening} onChange={(e) => setField('vendorRekening', e.target.value)} className={inp} placeholder="Masukkan nomor rekening..." />
                    </div>
                  </div>
                  <FieldError message={errors.vendorRekening} />
                </div>
              ) : (
                <div>
                  <Label req>{VENDOR_UPDATE_FIELDS.find((f) => f.key === field)?.label}</Label>
                  <ChangeField oldValue={getVendorOldValue(identity, field)} newValue={state.vendorValues[field] || ''} onChange={(v) => setVendorValue(field, v)} />
                </div>
              )}
            </div>
          ))}
          {state.vendorFields.length > 0 && <FieldError message={errors.vendorValues} />}
        </div>
      )}
    </Card>
  );
}

/* ───────────────────────── Multi-product picker ───────────────────────── */
function PluMultiSelect({ selected, onChange, showSelectedList = true }: { selected: Product[]; onChange: (products: Product[]) => void; showSelectedList?: boolean }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const suggestions = PRODUCT_CATALOG.filter(
    (p) => !selected.find((s) => s.plu === p.plu) && (p.plu.toLowerCase().includes(query.toLowerCase()) || p.nama.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (p: Product) => { onChange([...selected, p]); setQuery(''); };
  const remove = (plu: string) => onChange(selected.filter((p) => p.plu !== plu));

  return (
    <div>
      <div ref={ref} className="relative">
        <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 ml-3 shrink-0" />
          <input type="text" value={query} placeholder={selected.length === 0 ? 'Cari PLU atau nama produk...' : 'Tambah produk lain...'}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
            className="flex-1 px-2 py-2.5 bg-transparent border-none outline-none text-[13px] text-slate-700 placeholder:text-slate-400" />
          {selected.length > 0 && <span className="mr-3 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">{selected.length} dipilih</span>}
        </div>
        {open && (
          <div className="absolute left-0 top-full mt-1.5 w-full z-50 bg-white rounded-xl border border-slate-200 shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-100">
            {suggestions.length === 0 ? (
              <div className="px-4 py-3 text-[12px] text-slate-400 text-center">{query ? 'Produk tidak ditemukan' : 'Semua produk sudah dipilih'}</div>
            ) : suggestions.map((p) => (
              <button key={p.plu} type="button" onClick={() => add(p)} className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-amber-50 transition-colors text-left">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0"><span className="text-[9px] font-bold text-amber-700">{p.satuan}</span></div>
                <div><p className="text-[12px] font-semibold text-slate-800">{p.nama}</p><p className="text-[10px] font-mono text-slate-400">{p.plu}</p></div>
                <Plus className="w-3.5 h-3.5 text-amber-600 ml-auto shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
      {showSelectedList && selected.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {selected.map((p) => (
            <span key={p.plu} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-600">
              {p.nama}
              <button type="button" onClick={() => remove(p.plu)} className="p-0.5 rounded hover:bg-red-50 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Step: Cakupan Produk (shared by on/off faktur) ───────────────────────── */
function ProductScopeStep({ title, productScope, setProductScope, selectedSubCategory, setSelectedSubCategory, products, setProducts, subCategories, supplierId, error }: {
  title?: string;
  productScope: ProductScope;
  setProductScope: (v: ProductScope) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (v: string) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  subCategories: string[];
  supplierId?: string;
  error?: string;
}) {
  const applyScope = (scope: ProductScope) => {
    setProductScope(scope);
    if (scope === 'all-supplier') { setProducts(PRODUCT_CATALOG.filter((p) => supplierId && p.supplierId === supplierId)); setSelectedSubCategory(''); }
    if (scope === 'sub-category') { setProducts([]); setSelectedSubCategory(''); }
    if (scope === 'per-plu') { setProducts([]); setSelectedSubCategory(''); }
  };
  const applySubCategory = (cat: string) => {
    setSelectedSubCategory(cat);
    setProducts(PRODUCT_CATALOG.filter((p) => p.subKategori === cat));
  };

  return (
    <Card title={title || 'Cakupan Produk'} icon={Package} subtitle="Tentukan produk mana saja yang termasuk dalam program ini">
      <div>
        <Label req>Cakupan</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { value: 'all-supplier' as const, label: 'All Produk Supplier' },
            { value: 'sub-category' as const, label: 'All Sub Kategori' },
            { value: 'per-plu' as const, label: 'Per PLU' },
          ].map((opt) => (
            <button key={opt.value} type="button" onClick={() => applyScope(opt.value)}
              className={`rounded-xl border px-4 py-3 text-left text-[13px] font-semibold transition-all ${productScope === opt.value ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {productScope === 'sub-category' && (
        <div className="max-w-sm">
          <Label req>Sub Kategori</Label>
          <div className="relative">
            <select value={selectedSubCategory} onChange={(e) => applySubCategory(e.target.value)} className={`${inp} appearance-none pr-9 cursor-pointer`}>
              <option value="">Pilih sub kategori...</option>
              {subCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {productScope === 'per-plu' && (
        <div>
          <Label req>Pilih Produk</Label>
          <PluMultiSelect selected={products} onChange={setProducts} />
        </div>
      )}

      <FieldError message={error} />
      {products.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[12px] font-semibold text-slate-600">{products.length} produk termasuk dalam cakupan ini</p>
        </div>
      )}
    </Card>
  );
}

/** Wraps ProductScopeStep so On Faktur and Off Faktur each get their own independent product scope — a program
 * can discount a different set of products on-invoice vs. off-invoice, so the two must not be forced to match. */
function CakupanProdukStep({
  tipe,
  onScope, setOnScope, onSubCategory, setOnSubCategory, onProducts, setOnProducts, onError,
  offScope, setOffScope, offSubCategory, setOffSubCategory, offProducts, setOffProducts, offError,
  subCategories, supplierId,
}: {
  tipe: string[];
  onScope: ProductScope; setOnScope: (v: ProductScope) => void; onSubCategory: string; setOnSubCategory: (v: string) => void;
  onProducts: Product[]; setOnProducts: (p: Product[]) => void; onError?: string;
  offScope: ProductScope; setOffScope: (v: ProductScope) => void; offSubCategory: string; setOffSubCategory: (v: string) => void;
  offProducts: Product[]; setOffProducts: (p: Product[]) => void; offError?: string;
  subCategories: string[]; supplierId?: string;
}) {
  const hasOn = tipe.includes('on-faktur');
  const hasOff = tipe.includes('off-faktur');
  const both = hasOn && hasOff;
  return (
    <div className="space-y-5">
      {both && (
        <InfoNote tone="amber">Program ini memakai On Faktur dan Off Faktur sekaligus — cakupan produknya boleh berbeda untuk masing-masing skema, jadi diatur terpisah di bawah ini.</InfoNote>
      )}
      {hasOn && (
        <ProductScopeStep
          title={both ? 'Cakupan Produk — On Faktur' : 'Cakupan Produk'}
          productScope={onScope} setProductScope={setOnScope} selectedSubCategory={onSubCategory} setSelectedSubCategory={setOnSubCategory}
          products={onProducts} setProducts={setOnProducts} subCategories={subCategories} supplierId={supplierId} error={onError}
        />
      )}
      {hasOff && (
        <ProductScopeStep
          title={both ? 'Cakupan Produk — Off Faktur' : 'Cakupan Produk'}
          productScope={offScope} setProductScope={setOffScope} selectedSubCategory={offSubCategory} setSelectedSubCategory={setOffSubCategory}
          products={offProducts} setProducts={setOffProducts} subCategories={subCategories} supplierId={supplierId} error={offError}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Step: Info Program ───────────────────────── */
interface ProgramInfoState {
  namaProgram: string;
  tipe: string[];
  ppnAktif: boolean;
  ppnRate: string;
  pphAktif: boolean;
  pphRate: string;
  redaksi: string;
  periodeAwal: string;
  periodeAkhir: string;
}

/** Independently activatable PPN + PPh chooser. Reused anywhere a transaction may be taxed:
 *  Off Faktur programs, Sewa/Visibility, Reward/Rabat/Insentif, and Listing. */
function KetentuanPajakSection({ ppnAktif, ppnRate, onPpnAktif, onPpnRate, pphAktif, pphRate, onPphAktif, onPphRate, errors }: {
  ppnAktif: boolean; ppnRate: string; onPpnAktif: (v: boolean) => void; onPpnRate: (v: string) => void;
  pphAktif: boolean; pphRate: string; onPphAktif: (v: boolean) => void; onPphRate: (v: string) => void;
  errors?: { ppnRate?: string; pphRate?: string };
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-slate-800">PPN (Pajak Pertambahan Nilai)</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Aktifkan jika dikenakan PPN</p>
          </div>
          <ToggleSwitch checked={ppnAktif} onChange={(v) => { onPpnAktif(v); if (!v) onPpnRate(''); }} color="#7C3AED" />
        </div>
        {ppnAktif && (
          <div className="mt-3">
            <div className="relative">
              <select value={ppnRate} onChange={(e) => onPpnRate(e.target.value)} className={`${errors?.ppnRate ? inpErr : inp} appearance-none pr-9 cursor-pointer`}>
                <option value="">Pilih tarif PPN...</option>
                {PPN_RATE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {ppnRate && (
              <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />{ppnRate} aktif
              </span>
            )}
            <FieldError message={errors?.ppnRate} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-slate-800">PPh (Pajak Penghasilan)</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Aktifkan jika dikenakan PPh</p>
          </div>
          <ToggleSwitch checked={pphAktif} onChange={(v) => { onPphAktif(v); if (!v) onPphRate(''); }} color="#2563EB" />
        </div>
        {pphAktif && (
          <div className="mt-3">
            <div className="relative">
              <select value={pphRate} onChange={(e) => onPphRate(e.target.value)} className={`${errors?.pphRate ? inpErr : inp} appearance-none pr-9 cursor-pointer`}>
                <option value="">Pilih tarif PPh...</option>
                {PPH_RATE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {pphRate && (
              <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{pphRate} aktif
              </span>
            )}
            <FieldError message={errors?.pphRate} />
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramInfoStep({ state, setField, errors }: { state: ProgramInfoState; setField: <K extends keyof ProgramInfoState>(f: K, v: ProgramInfoState[K]) => void; errors: FormErrors }) {
  const showPajak = state.tipe.includes('off-faktur');

  return (
    <Card title="Informasi Program" icon={Tag} subtitle="Program dapat mencakup lebih dari satu tipe sekaligus">
      <div><Label req>Nama Program</Label><input type="text" value={state.namaProgram} onChange={(e) => setField('namaProgram', e.target.value)} className={errors.namaProgram ? inpErr : inp} placeholder="cth: Program Akhir Tahun 2026" /><FieldError message={errors.namaProgram} /></div>

      <div>
        <Label req>Tipe Program</Label>
        <MultiChoiceChips options={PROGRAM_TIPE_OPTIONS} value={state.tipe} onChange={(v) => setField('tipe', v)} />
        <FieldError message={errors.tipe} />
        <p className="mt-2 text-[11px] text-slate-400">Bisa memilih lebih dari satu — misalnya On Faktur sekaligus didukung Budget.</p>
      </div>

      {showPajak && (
        <div className="border-t border-slate-100 pt-5">
          <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
            Ketentuan Pajak
          </p>
          <p className="text-[11px] text-slate-400 mb-3">Karena program ini Off Faktur, tentukan pajak yang berlaku</p>
          <KetentuanPajakSection
            ppnAktif={state.ppnAktif} ppnRate={state.ppnRate} onPpnAktif={(v) => setField('ppnAktif', v)} onPpnRate={(v) => setField('ppnRate', v)}
            pphAktif={state.pphAktif} pphRate={state.pphRate} onPphAktif={(v) => setField('pphAktif', v)} onPphRate={(v) => setField('pphRate', v)}
            errors={{ ppnRate: errors.ppnRate, pphRate: errors.pphRate }}
          />
        </div>
      )}

      <div>
        <Label req>Redaksi</Label>
        <textarea rows={3} value={state.redaksi} onChange={(e) => setField('redaksi', e.target.value)} className={`${errors.redaksi ? inpErr : inp} resize-none`} placeholder="Tuliskan redaksi kesepakatan program ini..." />
        <FieldError message={errors.redaksi} />
      </div>

      <div>
        <Label req>Periode Program</Label>
        <PeriodeRange awal={state.periodeAwal} akhir={state.periodeAkhir} onAwal={(v) => setField('periodeAwal', v)} onAkhir={(v) => setField('periodeAkhir', v)} />
        <FieldError message={errors.periodeAwal || errors.periodeAkhir} />
      </div>
    </Card>
  );
}

/* ───────────────────────── Step: Detail Program (per-produk + budget) ───────────────────────── */
interface OnFakturProductRow {
  diskonMode: DiskonMode;
  diskonValue: number;
  bandedAktif: boolean;
  banded: string;
  strataMinQty: number;
  alokasiQty: number;
  keterangan: string;
}
const emptyOnFakturProductRow = (): OnFakturProductRow => ({
  diskonMode: 'persen', diskonValue: 0, bandedAktif: false, banded: '', strataMinQty: 0, alokasiQty: 0, keterangan: '',
});

interface OffFakturProductRow {
  diskonMode: DiskonMode;
  diskonValue: number;
  kuponVoucherAktif: boolean;
  kuponVoucher: string;
  freeProdukAktif: boolean;
  freeProdukKeterangan: string;
  offAlokasiTipe: 'qty' | 'rp';
  offAlokasiQty: number;
  offAlokasiRp: number;
  keterangan: string;
}
const emptyOffFakturProductRow = (): OffFakturProductRow => ({
  diskonMode: 'persen', diskonValue: 0, kuponVoucherAktif: false, kuponVoucher: '', freeProdukAktif: false, freeProdukKeterangan: '',
  offAlokasiTipe: 'qty', offAlokasiQty: 0, offAlokasiRp: 0, keterangan: '',
});

interface BudgetLinkState { keterangan: string; nominal: number; }

function OnFakturProductCard({ product, row, setField }: {
  product: Product; row: OnFakturProductRow;
  setField: <K extends keyof OnFakturProductRow>(f: K, v: OnFakturProductRow[K]) => void;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <p className="text-[12.5px] font-bold text-slate-800">{product.nama}</p>
        <span className="text-[10px] font-mono text-slate-400">{product.plu}</span>
      </div>

      <div>
        <Label req>Potongan (On Faktur)</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <DiskonModeToggle value={row.diskonMode} onChange={(v) => setField('diskonMode', v)} />
          <input type="number" min={0} value={row.diskonValue || ''} onChange={(e) => setField('diskonValue', parseFloat(e.target.value) || 0)}
            placeholder={row.diskonMode === 'persen' ? 'Persentase diskon...' : 'Nominal potongan (Rp)...'} className={`${inp} sm:max-w-xs`} />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">Potongan tiap produk boleh berbeda — sebagian Rp, sebagian persentase.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Banded</Label>
          <YesNoToggle value={row.bandedAktif} onChange={(v) => { setField('bandedAktif', v); if (!v) setField('banded', ''); }} />
          {row.bandedAktif && (
            <div className="mt-3">
              <input type="text" value={row.banded} onChange={(e) => setField('banded', e.target.value)} className={inp} placeholder="cth: Beli 2 Gratis 1" />
            </div>
          )}
        </div>
        <div><Label>Syarat Strata (Min. Qty Order)</Label><input type="number" min={0} value={row.strataMinQty || ''} onChange={(e) => setField('strataMinQty', parseInt(e.target.value) || 0)} className={inp} placeholder="0" /></div>
        <div><Label>Alokasi Qty</Label><input type="number" min={0} value={row.alokasiQty || ''} onChange={(e) => setField('alokasiQty', parseInt(e.target.value) || 0)} className={inp} placeholder="0" /></div>
      </div>

      <div><Label>Keterangan Produk</Label><input type="text" value={row.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={inp} placeholder="Catatan khusus untuk produk ini (opsional)" /></div>
    </div>
  );
}

function OffFakturProductCard({ product, row, setField }: {
  product: Product; row: OffFakturProductRow;
  setField: <K extends keyof OffFakturProductRow>(f: K, v: OffFakturProductRow[K]) => void;
}) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <p className="text-[12.5px] font-bold text-slate-800">{product.nama}</p>
        <span className="text-[10px] font-mono text-slate-400">{product.plu}</span>
      </div>

      <div>
        <Label req>Potongan (Off Faktur)</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <DiskonModeToggle value={row.diskonMode} onChange={(v) => setField('diskonMode', v)} />
          <input type="number" min={0} value={row.diskonValue || ''} onChange={(e) => setField('diskonValue', parseFloat(e.target.value) || 0)}
            placeholder={row.diskonMode === 'persen' ? 'Persentase diskon...' : 'Nominal potongan (Rp)...'} className={`${inp} sm:max-w-xs`} />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">Potongan tiap produk boleh berbeda — sebagian Rp, sebagian persentase.</p>
      </div>

      <div>
        <Label>Kupon dan Voucher</Label>
        <YesNoToggle value={row.kuponVoucherAktif} onChange={(v) => { setField('kuponVoucherAktif', v); if (!v) setField('kuponVoucher', ''); }} />
        {row.kuponVoucherAktif && (
          <div className="mt-3">
            <input type="text" value={row.kuponVoucher} onChange={(e) => setField('kuponVoucher', e.target.value)} className={inp} placeholder="Keterangan kupon/voucher..." />
          </div>
        )}
      </div>
      <div>
        <Label>Free Produk</Label>
        <YesNoToggle value={row.freeProdukAktif} onChange={(v) => setField('freeProdukAktif', v)} />
        {row.freeProdukAktif && (
          <div className="mt-3">
            <input type="text" value={row.freeProdukKeterangan} onChange={(e) => setField('freeProdukKeterangan', e.target.value)} className={inp} placeholder="Keterangan produk gratis..." />
            <p className="mt-1.5 text-[11px] text-slate-400">Nilai produk otomatis tercatat sebagai Rp 0.</p>
          </div>
        )}
      </div>
      <div>
        <Label>Alokasi</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit shrink-0">
            {(['qty', 'rp'] as const).map((tipe) => (
              <button
                key={tipe}
                type="button"
                onClick={() => setField('offAlokasiTipe', tipe)}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${row.offAlokasiTipe === tipe ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tipe === 'qty' ? 'Qty' : 'Rp'}
              </button>
            ))}
          </div>
          {row.offAlokasiTipe === 'qty' ? (
            <input type="number" min={0} value={row.offAlokasiQty || ''} onChange={(e) => setField('offAlokasiQty', parseInt(e.target.value) || 0)} className={`${inp} sm:max-w-xs`} placeholder="Jumlah qty" />
          ) : (
            <input type="number" min={0} value={row.offAlokasiRp || ''} onChange={(e) => setField('offAlokasiRp', parseFloat(e.target.value) || 0)} className={`${inp} sm:max-w-xs`} placeholder="Nominal Rp" />
          )}
        </div>
      </div>

      <div><Label>Keterangan Produk</Label><input type="text" value={row.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={inp} placeholder="Catatan khusus untuk produk ini (opsional)" /></div>
    </div>
  );
}

function BudgetLinkSection({ state, setField }: { state: BudgetLinkState; setField: <K extends keyof BudgetLinkState>(f: K, v: BudgetLinkState[K]) => void }) {
  return (
    <div className="rounded-2xl border border-purple-200">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-purple-200 rounded-t-2xl bg-purple-50">
        <Wallet className="w-4 h-4 text-purple-700" />
        <p className="text-[13px] font-bold text-purple-700">Budget</p>
      </div>
      <div className="p-5 space-y-4">
        <div><Label req>Keterangan Penggunaan Budget</Label><input type="text" value={state.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={inp} placeholder="cth: Support biaya event akhir tahun" /></div>
        <div className="max-w-xs"><Label req>Nominal (Rp)</Label><input type="number" min={0} value={state.nominal || ''} onChange={(e) => setField('nominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" /></div>
      </div>
    </div>
  );
}

function ProgramDetailStep({
  tipe,
  onProducts, onRows, updateOnRow, onError,
  offProducts, offRows, updateOffRow, offError,
  budgetLink, setBudgetLink,
}: {
  tipe: string[];
  onProducts: Product[]; onRows: Record<string, OnFakturProductRow>; updateOnRow: (plu: string, field: keyof OnFakturProductRow, val: string | number | boolean) => void; onError?: string;
  offProducts: Product[]; offRows: Record<string, OffFakturProductRow>; updateOffRow: (plu: string, field: keyof OffFakturProductRow, val: string | number | boolean) => void; offError?: string;
  budgetLink: BudgetLinkState; setBudgetLink: <K extends keyof BudgetLinkState>(f: K, v: BudgetLinkState[K]) => void;
}) {
  const hasOn = tipe.includes('on-faktur');
  const hasOff = tipe.includes('off-faktur');
  return (
    <Card title="Detail Program" icon={Receipt} subtitle="Ketentuan diisi terpisah per skema penagihan, karena produk On Faktur dan Off Faktur bisa berbeda">
      {hasOn && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Detail On Faktur</p>
          <FieldError message={onError} />
          {onProducts.length === 0 ? (
            <p className="text-[12px] text-slate-400 italic">Belum ada produk pada cakupan On Faktur.</p>
          ) : (
            <div className="space-y-4">
              {onProducts.map((p) => (
                <OnFakturProductCard key={p.plu} product={p} row={onRows[p.plu] || emptyOnFakturProductRow()} setField={(f, v) => updateOnRow(p.plu, f, v)} />
              ))}
            </div>
          )}
        </div>
      )}
      {hasOff && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Detail Off Faktur</p>
          <FieldError message={offError} />
          {offProducts.length === 0 ? (
            <p className="text-[12px] text-slate-400 italic">Belum ada produk pada cakupan Off Faktur.</p>
          ) : (
            <div className="space-y-4">
              {offProducts.map((p) => (
                <OffFakturProductCard key={p.plu} product={p} row={offRows[p.plu] || emptyOffFakturProductRow()} setField={(f, v) => updateOffRow(p.plu, f, v)} />
              ))}
            </div>
          )}
        </div>
      )}
      {tipe.includes('budget') && <BudgetLinkSection state={budgetLink} setField={setBudgetLink} />}
    </Card>
  );
}

/* ───────────────────────── Step: Pendapatan Lain-lain ───────────────────────── */
interface ListingProductRow {
  namaProduk: string;
  barcodePcs: string;
  barcodeKarton: string;
  konversiQty1: number;
  konversiSatuan1: string;
  konversiQty2: number;
  konversiSatuan2: string;
  konversiQty3: number;
  konversiSatuan3: string;
  hargaPerPcs: number;
  hargaPpn: 'include' | 'exclude' | '';
  diskonReguler: number;
}
const emptyListingProductRow = (): ListingProductRow => ({
  namaProduk: '',
  barcodePcs: '',
  barcodeKarton: '',
  konversiQty1: 0,
  konversiSatuan1: '',
  konversiQty2: 0,
  konversiSatuan2: '',
  konversiQty3: 0,
  konversiSatuan3: '',
  hargaPerPcs: 0,
  hargaPpn: '',
  diskonReguler: 0,
});

interface ProductQtyRow {
  qty: number;
  satuan: string;
}

function ProductQtyTable({ products, rows, onChange, onRemove, error }: {
  products: Product[];
  rows: Record<string, ProductQtyRow>;
  onChange: (plu: string, field: keyof ProductQtyRow, value: string | number) => void;
  onRemove?: (plu: string) => void;
  error?: string;
}) {
  if (products.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Produk</th>
              <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-28">Qty</th>
              <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-36">Satuan</th>
              {onRemove && <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-12">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => {
              const row = rows[product.plu] || { qty: 0, satuan: product.satuan || '' };
              return (
                <tr key={product.plu}>
                  <td className="px-3 py-3">
                    <p className="text-[12.5px] font-bold text-slate-800">{product.nama}</p>
                    <p className="mt-0.5 text-[10.5px] font-mono text-slate-400">{product.plu}</p>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={0}
                      value={row.qty || ''}
                      onChange={(e) => onChange(product.plu, 'qty', parseFloat(e.target.value) || 0)}
                      className={inp}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative">
                      <select value={row.satuan} onChange={(e) => onChange(product.plu, 'satuan', e.target.value)} className={`${inp} appearance-none pr-9 cursor-pointer`}>
                        <option value="">Satuan...</option>
                        {SATUAN_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </td>
                  {onRemove && (
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => onRemove(product.plu)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" aria-label={`Hapus ${product.nama}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <FieldError message={error} />
    </div>
  );
}

interface PendapatanState {
  jenis: string; namaProgram: string;
  // Sewa / Visibility
  sewaJenis: string;
  sewaProducts: Product[];
  sewaProductRows: Record<string, ProductQtyRow>;
  sewaNominal: number;
  sewaPeriodeAwal: string; sewaPeriodeAkhir: string;
  sewaKeterangan: string;
  sewaPpnAktif: boolean; sewaPpnRate: string;
  sewaPphAktif: boolean; sewaPphRate: string;
  // Reward / Rabat / Insentif
  rewardProducts: Product[];
  rewardProductRows: Record<string, ProductQtyRow>;
  rewardJenis: string;
  rewardBentuk: string;
  rewardPembayaran: string;
  rewardBank: string;
  rewardNoRekening: string;
  rewardNominal: number;
  target: string;
  rewardMode: DiskonMode;
  rewardValue: number;
  rewardPeriodeAwal: string; rewardPeriodeAkhir: string;
  rewardKeterangan: string;
  rewardPpnAktif: boolean; rewardPpnRate: string;
  rewardPphAktif: boolean; rewardPphRate: string;
  // Promosi
  mediaTipe: string; mediaKeterangan: string;
  // Listing (satu memo bisa mendaftarkan lebih dari satu produk)
  listingProducts: ListingProductRow[];
  listingPkp: boolean | null; listingReturn: boolean | null; listingBiayaLabel: boolean | null;
  listingTempoPembayaran: string; listingCaraPembayaran: string;
  listingPpnAktif: boolean; listingPpnRate: string;
  listingPphAktif: boolean; listingPphRate: string;
}

function PendapatanStep({ state, setField, errors }: { state: PendapatanState; setField: <K extends keyof PendapatanState>(f: K, v: PendapatanState[K]) => void; errors: FormErrors }) {
  const syncProductRows = (products: Product[], rows: Record<string, ProductQtyRow>) => {
    const next: Record<string, ProductQtyRow> = {};
    products.forEach((product) => {
      next[product.plu] = rows[product.plu] || { qty: 0, satuan: product.satuan || '' };
    });
    return next;
  };
  const setSewaProducts = (products: Product[]) => {
    setField('sewaProducts', products);
    setField('sewaProductRows', syncProductRows(products, state.sewaProductRows));
  };
  const setRewardProducts = (products: Product[]) => {
    setField('rewardProducts', products);
    setField('rewardProductRows', syncProductRows(products, state.rewardProductRows));
  };
  const removeSewaProduct = (plu: string) => setSewaProducts(state.sewaProducts.filter((product) => product.plu !== plu));
  const removeRewardProduct = (plu: string) => setRewardProducts(state.rewardProducts.filter((product) => product.plu !== plu));
  const updateSewaProductRow = (plu: string, field: keyof ProductQtyRow, value: string | number) =>
    setField('sewaProductRows', { ...state.sewaProductRows, [plu]: { ...(state.sewaProductRows[plu] || { qty: 0, satuan: '' }), [field]: value } });
  const updateRewardProductRow = (plu: string, field: keyof ProductQtyRow, value: string | number) =>
    setField('rewardProductRows', { ...state.rewardProductRows, [plu]: { ...(state.rewardProductRows[plu] || { qty: 0, satuan: '' }), [field]: value } });
  const updateListingRow = (index: number, field: keyof ListingProductRow, value: string | number) => {
    const rows = [...state.listingProducts];
    rows[index] = { ...rows[index], [field]: value };
    setField('listingProducts', rows);
  };
  const addListingRow = () => setField('listingProducts', [...state.listingProducts, emptyListingProductRow()]);
  const removeListingRow = (index: number) => setField('listingProducts', state.listingProducts.filter((_, i) => i !== index));

  return (
    <Card title="Memo Pendapatan Lain-lain" icon={Building2} subtitle="Pilih satu jenis program pendapatan lain-lain">
      <div><Label req>Nama Program / Kegiatan</Label><input type="text" value={state.namaProgram} onChange={(e) => setField('namaProgram', e.target.value)} className={inp} placeholder="cth: Sewa Gondola Ujung MK3" /></div>

      <div>
        <Label req>Jenis Program</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PENDAPATAN_OPTIONS.map((o) => {
            const Icon = o.icon; const active = state.jenis === o.key;
            return (
              <button key={o.key} type="button" onClick={() => setField('jenis', o.key)}
                className={`flex items-start gap-3 text-left rounded-2xl border p-4 transition-all ${active ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-amber-600' : 'bg-slate-100'}`}><Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} /></div>
                <div><p className="text-[13px] font-bold text-slate-800">{o.label}</p><p className="text-[11px] text-slate-500 mt-0.5">{o.desc}</p></div>
              </button>
            );
          })}
        </div>
        <FieldError message={errors.jenis} />
      </div>

      {state.jenis === 'sewa-visibility' && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <Label req>Jenis Sewa / Visibility</Label>
            <SingleChoiceChips options={SEWA_VISIBILITY_JENIS.map((s) => ({ key: s, label: s }))} value={state.sewaJenis} onChange={(v) => setField('sewaJenis', v)} />
            <FieldError message={errors.sewaJenis} />
          </div>
          <div>
            <Label req>Produk yang Dipajang / Didisplay (bisa lebih dari satu)</Label>
            <PluMultiSelect selected={state.sewaProducts} onChange={setSewaProducts} showSelectedList={false} />
            <FieldError message={errors.sewaProducts} />
          </div>
          <ProductQtyTable products={state.sewaProducts} rows={state.sewaProductRows} onChange={updateSewaProductRow} onRemove={removeSewaProduct} error={errors.sewaProductRows} />
        
          <div><Label req>Periode Sewa</Label><PeriodeRange awal={state.sewaPeriodeAwal} akhir={state.sewaPeriodeAkhir} onAwal={(v) => setField('sewaPeriodeAwal', v)} onAkhir={(v) => setField('sewaPeriodeAkhir', v)} /></div>
          <div><Label req>Keterangan</Label><input type="text" value={state.sewaKeterangan} onChange={(e) => setField('sewaKeterangan', e.target.value)} className={inp} placeholder="Catatan tambahan terkait sewa/visibility..." /></div>
          <div className="border-t border-slate-100 pt-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
              Ketentuan Pajak
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Sewa/visibility adalah objek jasa/sewa — tentukan pajak yang berlaku</p>
            <KetentuanPajakSection
              ppnAktif={state.sewaPpnAktif} ppnRate={state.sewaPpnRate} onPpnAktif={(v) => setField('sewaPpnAktif', v)} onPpnRate={(v) => setField('sewaPpnRate', v)}
              pphAktif={state.sewaPphAktif} pphRate={state.sewaPphRate} onPphAktif={(v) => setField('sewaPphAktif', v)} onPphRate={(v) => setField('sewaPphRate', v)}
              errors={{ ppnRate: errors.sewaPpnRate, pphRate: errors.sewaPphRate }}
            />
          </div>
        </div>
      )}

      {state.jenis === 'reward-insentif' && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <Label req>Jenis Reward / Rabat / Insentif</Label>
            <SingleChoiceChips options={REWARD_JENIS_OPTIONS.map((s) => ({ key: s, label: s }))} value={state.rewardJenis} onChange={(v) => setField('rewardJenis', v)} />
            <FieldError message={errors.rewardJenis} />
          </div>
          <div>
            <Label req>Bentuk Reward / Rabat / Insentif</Label>
            <SingleChoiceChips
              options={REWARD_BENTUK_OPTIONS.map((s) => ({ key: s, label: s }))}
              value={state.rewardBentuk}
              onChange={(v) => {
                setField('rewardBentuk', v);
                if (v !== 'Uang') {
                  setField('rewardPembayaran', '');
                  setField('rewardBank', '');
                  setField('rewardNoRekening', '');
                  setField('rewardNominal', 0);
                }
              }}
            />
            <FieldError message={errors.rewardBentuk} />
          </div>
          {state.rewardBentuk === 'Uang' && (
            <div>
              <Label req>Metode Uang</Label>
              <SingleChoiceChips
                options={REWARD_PEMBAYARAN_OPTIONS.map((s) => ({ key: s, label: s }))}
                value={state.rewardPembayaran}
                onChange={(v) => {
                  setField('rewardPembayaran', v);
                  if (v !== 'Non Tunai') {
                    setField('rewardBank', '');
                    setField('rewardNoRekening', '');
                  }
                }}
              />
              <FieldError message={errors.rewardPembayaran} />
            </div>
          )}
          {state.rewardBentuk === 'Uang' && state.rewardPembayaran === 'Non Tunai' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Bank</Label>
                <div className="relative">
                  <select value={state.rewardBank} onChange={(e) => setField('rewardBank', e.target.value)} className={`${inp} appearance-none pr-9 cursor-pointer`}>
                    <option value="">Pilih bank...</option>
                    {BANK_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <FieldError message={errors.rewardBank} />
              </div>
              <div>
                <Label req>No Rekening</Label>
                <input type="text" value={state.rewardNoRekening} onChange={(e) => setField('rewardNoRekening', e.target.value)} className={inp} placeholder="Masukkan nomor rekening..." />
                <FieldError message={errors.rewardNoRekening} />
              </div>
            </div>
          )}
          {state.rewardBentuk === 'Uang' && (
            <div className="max-w-xs">
              <Label req>Nominal (Rp)</Label>
              <input type="number" min={0} value={state.rewardNominal || ''} onChange={(e) => setField('rewardNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" />
              <FieldError message={errors.rewardNominal} />
            </div>
          )}
          <div><Label req>Periode</Label><PeriodeRange awal={state.rewardPeriodeAwal} akhir={state.rewardPeriodeAkhir} onAwal={(v) => setField('rewardPeriodeAwal', v)} onAkhir={(v) => setField('rewardPeriodeAkhir', v)} /></div>
          <div><Label>Keterangan (opsional)</Label><input type="text" value={state.rewardKeterangan} onChange={(e) => setField('rewardKeterangan', e.target.value)} className={inp} placeholder="Catatan tambahan terkait reward/insentif..." /></div>
          <div className="border-t border-slate-100 pt-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
              Ketentuan Pajak
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Reward/rabat/insentif tergolong hadiah — tentukan pajak yang berlaku</p>
            <KetentuanPajakSection
              ppnAktif={state.rewardPpnAktif} ppnRate={state.rewardPpnRate} onPpnAktif={(v) => setField('rewardPpnAktif', v)} onPpnRate={(v) => setField('rewardPpnRate', v)}
              pphAktif={state.rewardPphAktif} pphRate={state.rewardPphRate} onPphAktif={(v) => setField('rewardPphAktif', v)} onPphRate={(v) => setField('rewardPphRate', v)}
              errors={{ ppnRate: errors.rewardPpnRate, pphRate: errors.rewardPphRate }}
            />
          </div>
        </div>
      )}

      {state.jenis === 'promosi' && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <Label req>Media Cetak / Digital</Label>
            <SingleChoiceChips options={PROMOSI_MEDIA_OPTIONS.map((s) => ({ key: s, label: s }))} value={state.mediaTipe} onChange={(v) => setField('mediaTipe', v)} />
          </div>
          <div><Label req>Keterangan Media</Label><input type="text" value={state.mediaKeterangan} onChange={(e) => setField('mediaKeterangan', e.target.value)} className={inp} placeholder="cth: Brosur mingguan / Instagram Ads" /></div>
        </div>
      )}

      {state.jenis === 'listing' && (
        <div className="border-t border-slate-100 pt-5 space-y-5">
          <div className="space-y-3">
            <Label req>Produk yang Di-listing (bisa lebih dari satu)</Label>
            {state.listingProducts.map((row, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Produk #{i + 1}</p>
                  <button type="button" onClick={() => removeListingRow(i)} disabled={state.listingProducts.length === 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div><Label req>Nama Produk</Label><input type="text" value={row.namaProduk} onChange={(e) => updateListingRow(i, 'namaProduk', e.target.value)} className={inp} placeholder="Nama produk yang di-listing..." /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label req>Barcode PCS</Label><input type="text" value={row.barcodePcs} onChange={(e) => updateListingRow(i, 'barcodePcs', e.target.value)} className={inp} placeholder="Masukkan barcode pcs..." /></div>
                  <div><Label req>Barcode Karton</Label><input type="text" value={row.barcodeKarton} onChange={(e) => updateListingRow(i, 'barcodeKarton', e.target.value)} className={inp} placeholder="Masukkan barcode karton..." /></div>
                </div>
                <div>
                  <Label req>Konversi Bertingkat</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { qty: 'konversiQty1', satuan: 'konversiSatuan1', label: 'Level 1', placeholder: 'cth: 1' },
                      { qty: 'konversiQty2', satuan: 'konversiSatuan2', label: 'Level 2', placeholder: 'cth: 12' },
                      { qty: 'konversiQty3', satuan: 'konversiSatuan3', label: 'UOM Terkecil', placeholder: 'cth: 24' },
                    ].map((item) => (
                      <div key={item.qty} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={0}
                            value={(row[item.qty as keyof ListingProductRow] as number) || ''}
                            onChange={(e) => updateListingRow(i, item.qty as keyof ListingProductRow, parseInt(e.target.value) || 0)}
                            className={inp}
                            placeholder={item.placeholder}
                          />
                          <div className="relative shrink-0 w-32">
                            <select
                              value={(row[item.satuan as keyof ListingProductRow] as string) || ''}
                              onChange={(e) => updateListingRow(i, item.satuan as keyof ListingProductRow, e.target.value)}
                              className={`${inp} appearance-none pr-8 cursor-pointer`}
                            >
                              <option value="">Satuan...</option>
                              {SATUAN_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label req>Diskon Reguler (%)</Label><input type="number" min={0} value={row.diskonReguler || ''} onChange={(e) => updateListingRow(i, 'diskonReguler', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label req>Harga per Pcs</Label><input type="number" min={0} value={row.hargaPerPcs || ''} onChange={(e) => updateListingRow(i, 'hargaPerPcs', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" /></div>
                  <div><Label req>Harga Tersebut</Label><SingleChoiceChips options={[{ key: 'include', label: 'Include PPN' }, { key: 'exclude', label: 'Exclude PPN' }]} value={row.hargaPpn} onChange={(v) => updateListingRow(i, 'hargaPpn', v)} /></div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addListingRow}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-[13px] font-semibold text-slate-500 hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />Tambah Produk
            </button>
            <FieldError message={errors.listingProducts} />
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Syarat & Ketentuan Listing (berlaku untuk seluruh produk di atas)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label req>PKP (Bisa Faktur Pajak)?</Label><YesNoToggle value={state.listingPkp} onChange={(v) => setField('listingPkp', v)} /></div>
              <div><Label req>Bisa Return?</Label><YesNoToggle value={state.listingReturn} onChange={(v) => setField('listingReturn', v)} /></div>
              <div><Label req>Biaya Label Rp 15,-?</Label><YesNoToggle value={state.listingBiayaLabel} onChange={(v) => setField('listingBiayaLabel', v)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label req>Tempo Pembayaran</Label><input type="text" value={state.listingTempoPembayaran} onChange={(e) => setField('listingTempoPembayaran', e.target.value)} className={inp} placeholder="cth: 30 hari setelah faktur" /></div>
              <div><Label req>Cara Pembayaran Listing</Label><input type="text" value={state.listingCaraPembayaran} onChange={(e) => setField('listingCaraPembayaran', e.target.value)} className={inp} placeholder="cth: Transfer / potong faktur" /></div>
            </div>
            <div><Label req>Dikenakan PPN / PPh?</Label>
              <p className="text-[11px] text-slate-400 mb-3">Berlaku untuk seluruh produk pada listing ini — pilih tarif jika PPN dan/atau PPh dikenakan</p>
              <KetentuanPajakSection
                ppnAktif={state.listingPpnAktif} ppnRate={state.listingPpnRate} onPpnAktif={(v) => setField('listingPpnAktif', v)} onPpnRate={(v) => setField('listingPpnRate', v)}
                pphAktif={state.listingPphAktif} pphRate={state.listingPphRate} onPphAktif={(v) => setField('listingPphAktif', v)} onPphRate={(v) => setField('listingPphRate', v)}
                errors={{ ppnRate: errors.listingPpnRate, pphRate: errors.listingPphRate }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ───────────────────────── Step: Catatan ───────────────────────── */
function NotesStep({ catatan, setCatatan }: { catatan: string; setCatatan: (v: string) => void }) {
  return (
    <Card title="Catatan" icon={FileText} subtitle="Instruksi atau catatan tambahan untuk tim Buyer (opsional)">
      <div>
        <Label>Catatan (Memo Internal)</Label>
        <textarea rows={5} value={catatan} onChange={(e) => setCatatan(e.target.value)} className={`${inp} resize-none`} placeholder="Catatan atau instruksi khusus untuk tim Buyer..." />
      </div>
    </Card>
  );
}

/* ───────────────────────── Signature pad ───────────────────────── */
function SignaturePad({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e293b';
    if (value) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0); img.src = value; }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
  };
  const start = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); drawing.current = true; const ctx = canvasRef.current!.getContext('2d')!; const { x, y } = getPos(e); ctx.beginPath(); ctx.moveTo(x, y); };
  const move = (e: React.MouseEvent | React.TouchEvent) => { if (!drawing.current) return; e.preventDefault(); const ctx = canvasRef.current!.getContext('2d')!; const { x, y } = getPos(e); ctx.lineTo(x, y); ctx.stroke(); setEmpty(false); };
  const end = () => { if (!drawing.current) return; drawing.current = false; onChange(canvasRef.current!.toDataURL('image/png')); };
  const clear = () => { const canvas = canvasRef.current!; const ctx = canvas.getContext('2d')!; ctx.clearRect(0, 0, canvas.width, canvas.height); setEmpty(true); onChange(''); };

  return (
    <div>
      <div className={`relative rounded-2xl border-2 border-dashed bg-slate-50 ${error ? 'border-red-300' : 'border-slate-300'}`}>
        <canvas ref={canvasRef} width={600} height={200} className="w-full h-[200px] touch-none rounded-2xl cursor-crosshair bg-white"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
        {empty && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><p className="text-[12px] text-slate-400 flex items-center gap-1.5"><PenLine className="w-3.5 h-3.5" />Tanda tangan di area ini</p></div>}
      </div>
      <div className="flex items-center justify-between mt-2">
        <FieldError message={error} />
        <button type="button" onClick={clear} className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-red-600 transition-colors"><RotateCcw className="w-3.5 h-3.5" />Hapus &amp; Ulangi</button>
      </div>
    </div>
  );
}

/* ───────────────────────── Step: Review + Sign ───────────────────────── */
function Row({ label, value }: { label?: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-[12.5px] py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800 text-right">{value || '—'}</span>
    </div>
  );
}

function ReviewStep({
  identity, outlets, jenisMemo, updateInfo, programInfo, onProducts, onRows, offProducts, offRows, budgetLink, pendapatan, catatan,
  signature, setSignature, agreed, setAgreed, errors,
}: {
  identity: IdCardData | null; outlets: string[]; jenisMemo: JenisMemo;
  updateInfo: UpdateInfoState; programInfo: ProgramInfoState;
  onProducts: Product[]; onRows: Record<string, OnFakturProductRow>;
  offProducts: Product[]; offRows: Record<string, OffFakturProductRow>;
  budgetLink: BudgetLinkState;
  pendapatan: PendapatanState;
  catatan: string; signature: string; setSignature: (v: string) => void; agreed: boolean; setAgreed: (v: boolean) => void; errors: FormErrors;
}) {
  const yn = (v: boolean | null) => v === null ? '—' : v ? 'Ya' : 'Tidak';
  const hasOn = programInfo.tipe.includes('on-faktur');
  const hasOff = programInfo.tipe.includes('off-faktur');

  const produkFieldDisplay = (plu: string, f: string) => {
    const key = `${plu}::${f}`;
    const value = updateInfo.produkValues[key];
    const unit = updateInfo.produkUnits[key];
    if (f === 'gramasi') return value ? `${value}${unit ? ` ${unit}` : ''}` : '';
    if (f === 'konversi') return formatListingConversion(updateInfo.produkKonversi[key]);
    return value;
  };

  return (
    <div className="space-y-6">
      <Card title="Tinjau Ringkasan Memo" icon={ShieldCheck} subtitle="Periksa kembali seluruh data sebelum menandatangani dan submit">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Identitas Supplier</p>
          <div className="rounded-xl border border-slate-200 p-4 divide-y divide-slate-100">
            {identity?.principal && <Row label="Nama Principle" value={identity.principal.name} />}
            <Row label={identity?.principal ? 'Vendor/Supplier Relasi' : 'Nama Supplier'} value={identity?.supplier?.name} />
            <Row label="Nama PIC" value={identity?.picName} />
            <Row label="No. Telepon PIC" value={identity?.picPhone} />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cakupan Outlet</p>
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-[12.5px] text-slate-700">{outlets.length > 0 ? outlets.join(', ') : '—'}</p></div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Jenis Memo</p>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[12.5px] font-semibold text-slate-800">
              {jenisMemo === 'update-informasi' && 'Update Informasi'}
              {jenisMemo === 'memo-program' && 'Memo Program'}
              {jenisMemo === 'pendapatan-lain' && 'Memo Pendapatan Lain-lain'}
            </p>
          </div>
        </div>

        {jenisMemo === 'update-informasi' && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Detail Update</p>
            {updateInfo.jenisUpdate === 'produk' ? (
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                {updateInfo.selectedProducts.map((p) => (
                  <div key={p.plu} className="p-4">
                    <p className="text-[12px] font-bold text-slate-800 mb-1">{p.nama} <span className="font-mono text-slate-400 font-normal">({p.plu})</span></p>
                    {updateInfo.produkFields.map((f) => (
                      <Row key={f} label={PRODUK_UPDATE_FIELDS.find((x) => x.key === f)?.label} value={produkFieldDisplay(p.plu, f)} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 p-4 divide-y divide-slate-100">
                {updateInfo.vendorFields.map((f) => f === 'noRekening' ? (
                  <Row key={f} label="Nomor Rekening Bank" value={updateInfo.vendorBank ? `${updateInfo.vendorBank} - ${updateInfo.vendorRekening}` : ''} />
                ) : (
                  <Row key={f} label={VENDOR_UPDATE_FIELDS.find((x) => x.key === f)?.label} value={updateInfo.vendorValues[f]} />
                ))}
              </div>
            )}
          </div>
        )}

        {jenisMemo === 'memo-program' && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Detail Program</p>
            <div className="rounded-xl border border-slate-200 p-4 divide-y divide-slate-100">
              <Row label="Nama Program" value={programInfo.namaProgram} />
              <Row label="Tipe Program" value={programInfo.tipe.map((t) => PROGRAM_TIPE_OPTIONS.find((o) => o.key === t)?.label).join(', ')} />
              {hasOff && <Row label="PPN" value={programInfo.ppnAktif ? programInfo.ppnRate || 'Aktif' : 'Tidak dikenakan'} />}
              {hasOff && <Row label="PPh" value={programInfo.pphAktif ? programInfo.pphRate || 'Aktif' : 'Tidak dikenakan'} />}
              <Row label="Redaksi" value={programInfo.redaksi} />
              <Row label="Periode" value={programInfo.periodeAwal && programInfo.periodeAkhir ? `${programInfo.periodeAwal} s/d ${programInfo.periodeAkhir}` : ''} />
            </div>

            {hasOn && onProducts.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mt-3 mb-1.5">Produk On Faktur</p>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {onProducts.map((p) => {
                    const r = onRows[p.plu] || emptyOnFakturProductRow();
                    return (
                      <div key={p.plu} className="p-4 space-y-1">
                        <p className="text-[12px] font-bold text-slate-800">{p.nama} <span className="font-mono text-slate-400 font-normal">({p.plu})</span></p>
                        <Row label="Potongan" value={r.diskonMode === 'persen' ? `${r.diskonValue}%` : `Rp ${r.diskonValue.toLocaleString('id-ID')}`} />
                        <Row label="Banded" value={r.bandedAktif ? `Ya - ${r.banded}` : 'Tidak'} />
                        <Row label="Syarat Strata" value={r.strataMinQty ? `Min. ${r.strataMinQty} qty` : ''} />
                        <Row label="Alokasi Qty" value={r.alokasiQty ? String(r.alokasiQty) : ''} />
                        <Row label="Keterangan" value={r.keterangan} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {hasOff && offProducts.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mt-3 mb-1.5">Produk Off Faktur</p>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {offProducts.map((p) => {
                    const r = offRows[p.plu] || emptyOffFakturProductRow();
                    return (
                      <div key={p.plu} className="p-4 space-y-1">
                        <p className="text-[12px] font-bold text-slate-800">{p.nama} <span className="font-mono text-slate-400 font-normal">({p.plu})</span></p>
                        <Row label="Potongan" value={r.diskonMode === 'persen' ? `${r.diskonValue}%` : `Rp ${r.diskonValue.toLocaleString('id-ID')}`} />
                        <Row label="Kupon/Voucher" value={r.kuponVoucherAktif ? `Ya - ${r.kuponVoucher}` : 'Tidak'} />
                        <Row label="Free Produk" value={r.freeProdukAktif ? `Ya — ${r.freeProdukKeterangan}` : 'Tidak'} />
                        <Row label="Alokasi" value={r.offAlokasiTipe === 'qty' ? `${r.offAlokasiQty} qty` : `Rp ${r.offAlokasiRp.toLocaleString('id-ID')}`} />
                        <Row label="Keterangan" value={r.keterangan} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {programInfo.tipe.includes('budget') && (
              <div className="rounded-xl border border-slate-200 p-4 divide-y divide-slate-100 mt-3">
                <Row label="Keterangan Budget" value={budgetLink.keterangan} />
                <Row label="Nominal" value={budgetLink.nominal ? `Rp ${budgetLink.nominal.toLocaleString('id-ID')}` : ''} />
              </div>
            )}
          </div>
        )}

        {jenisMemo === 'pendapatan-lain' && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Detail Pendapatan Lain-lain</p>
            <div className="rounded-xl border border-slate-200 p-4 divide-y divide-slate-100">
              <Row label="Nama Program" value={pendapatan.namaProgram} />
              <Row label="Jenis Program" value={PENDAPATAN_OPTIONS.find((o) => o.key === pendapatan.jenis)?.label} />
              {pendapatan.jenis === 'sewa-visibility' && (
                <>
                  <Row label="Jenis Sewa/Visibility" value={pendapatan.sewaJenis} />
                  <Row label="Produk" value={pendapatan.sewaProducts.map((p) => {
                    const row = pendapatan.sewaProductRows[p.plu];
                    const qty = row?.qty ? `${row.qty} ${row.satuan}` : '';
                    return qty ? `${p.nama} (${qty})` : p.nama;
                  }).join(', ')} />
                  <Row label="Nilai Sewa" value={pendapatan.sewaNominal ? `Rp ${pendapatan.sewaNominal.toLocaleString('id-ID')}` : ''} />
                  <Row label="Periode" value={pendapatan.sewaPeriodeAwal && pendapatan.sewaPeriodeAkhir ? `${pendapatan.sewaPeriodeAwal} s/d ${pendapatan.sewaPeriodeAkhir}` : ''} />
                  <Row label="Keterangan" value={pendapatan.sewaKeterangan} />
                  <Row label="PPN" value={pendapatan.sewaPpnAktif ? pendapatan.sewaPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.sewaPphAktif ? pendapatan.sewaPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
              {pendapatan.jenis === 'reward-insentif' && (
                <>
                  <Row label="Jenis" value={pendapatan.rewardJenis} />
                  <Row label="Bentuk" value={pendapatan.rewardBentuk} />
                  {pendapatan.rewardBentuk === 'Uang' && <Row label="Metode Uang" value={pendapatan.rewardPembayaran} />}
                  {pendapatan.rewardBentuk === 'Uang' && pendapatan.rewardPembayaran === 'Non Tunai' && <Row label="Rekening Bank" value={pendapatan.rewardBank && pendapatan.rewardNoRekening ? `${pendapatan.rewardBank} - ${pendapatan.rewardNoRekening}` : ''} />}
                  {pendapatan.rewardBentuk === 'Uang' && <Row label="Nominal" value={pendapatan.rewardNominal ? `Rp ${pendapatan.rewardNominal.toLocaleString('id-ID')}` : ''} />}
                  <Row label="Periode" value={pendapatan.rewardPeriodeAwal && pendapatan.rewardPeriodeAkhir ? `${pendapatan.rewardPeriodeAwal} s/d ${pendapatan.rewardPeriodeAkhir}` : ''} />
                  <Row label="Keterangan" value={pendapatan.rewardKeterangan} />
                  <Row label="PPN" value={pendapatan.rewardPpnAktif ? pendapatan.rewardPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.rewardPphAktif ? pendapatan.rewardPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
              {pendapatan.jenis === 'promosi' && (<><Row label="Jenis Media" value={pendapatan.mediaTipe} /><Row label="Keterangan Media" value={pendapatan.mediaKeterangan} /></>)}
              {pendapatan.jenis === 'listing' && (
                <>
                  <Row label="PKP" value={yn(pendapatan.listingPkp)} />
                  <Row label="Bisa Return" value={yn(pendapatan.listingReturn)} />
                  <Row label="Biaya Label Rp 15,-" value={yn(pendapatan.listingBiayaLabel)} />
                  <Row label="Tempo Pembayaran" value={pendapatan.listingTempoPembayaran} />
                  <Row label="Cara Pembayaran" value={pendapatan.listingCaraPembayaran} />
                  <Row label="PPN" value={pendapatan.listingPpnAktif ? pendapatan.listingPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.listingPphAktif ? pendapatan.listingPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
            </div>
            {pendapatan.jenis === 'listing' && pendapatan.listingProducts.length > 0 && (
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 mt-3">
                {pendapatan.listingProducts.map((r, i) => (
                  <div key={i} className="p-4 space-y-1">
                    <p className="text-[12px] font-bold text-slate-800">{r.namaProduk || `Produk #${i + 1}`}</p>
                    <Row label="Barcode PCS" value={r.barcodePcs} />
                    <Row label="Barcode Karton" value={r.barcodeKarton} />
                    <Row label="Konversi" value={[
                      r.konversiQty1 && r.konversiSatuan1 ? `${r.konversiQty1} ${r.konversiSatuan1}` : '',
                      r.konversiQty2 && r.konversiSatuan2 ? `${r.konversiQty2} ${r.konversiSatuan2}` : '',
                      r.konversiQty3 && r.konversiSatuan3 ? `${r.konversiQty3} ${r.konversiSatuan3}` : '',
                    ].filter(Boolean).join(' -> ')} />
                    <Row label="Harga per Pcs" value={r.hargaPerPcs ? `Rp ${r.hargaPerPcs.toLocaleString('id-ID')} (${r.hargaPpn === 'include' ? 'Include PPN' : r.hargaPpn === 'exclude' ? 'Exclude PPN' : '—'})` : ''} />
                    <Row label="Diskon Reguler" value={r.diskonReguler ? `${r.diskonReguler}%` : ''} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {catatan && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Catatan</p>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-[12.5px] text-slate-700 whitespace-pre-wrap">{catatan}</p></div>
          </div>
        )}
      </Card>

      <Card title="Tanda Tangan" icon={PenLine} subtitle="Bubuhkan tanda tangan sebagai persetujuan atas isi memo di atas">
        <SignaturePad value={signature} onChange={setSignature} error={errors.signature} />
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
          <span className="text-[12px] text-slate-600 leading-relaxed">Saya menyatakan bahwa seluruh data yang saya isi pada formulir ini sudah benar dan sesuai kesepakatan, dan siap ditindaklanjuti oleh tim Buyer.</span>
        </label>
        <FieldError message={errors.agreed} />
      </Card>
    </div>
  );
}

/* ───────────────────────── Success screen ───────────────────────── */
function makeQrCells(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  return Array.from({ length: 441 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    const finder = (x < 6 && y < 6) || (x > 14 && y < 6) || (x < 6 && y > 14);
    if (finder) return x === 0 || y === 0 || x === 5 || y === 5 || (x > 1 && x < 4 && y > 1 && y < 4);
    return ((hash + x * 17 + y * 31 + x * y * 7) % 5) < 2;
  });
}

function memoTypeLabel(jenisMemo: JenisMemo) {
  return JENIS_MEMO_OPTIONS.find((o) => o.key === jenisMemo)?.label || 'Memo Supplier';
}

function programMethodLabel(jenisMemo: JenisMemo, programInfo: ProgramInfoState, pendapatan: PendapatanState) {
  if (jenisMemo === 'memo-program') return programInfo.tipe.map((t) => PROGRAM_TIPE_OPTIONS.find((o) => o.key === t)?.label || t).join(', ');
  if (jenisMemo === 'pendapatan-lain') return PENDAPATAN_OPTIONS.find((o) => o.key === pendapatan.jenis)?.label || '';
  return 'Update Informasi';
}

function printRows(jenisMemo: JenisMemo, updateInfo: UpdateInfoState, onProducts: Product[], onRows: Record<string, OnFakturProductRow>, offProducts: Product[], offRows: Record<string, OffFakturProductRow>, budgetLink: BudgetLinkState, pendapatan: PendapatanState) {
  if (jenisMemo === 'memo-program') {
    const rows = [
      ...onProducts.map((p) => {
        const r = onRows[p.plu] || emptyOnFakturProductRow();
        return { plu: p.plu, nama: p.nama, qty: r.alokasiQty || '-', potongan: r.diskonValue ? (r.diskonMode === 'persen' ? `${r.diskonValue}%` : `Rp ${r.diskonValue.toLocaleString('id-ID')}`) : '-', total: '-' };
      }),
      ...offProducts.map((p) => {
        const r = offRows[p.plu] || emptyOffFakturProductRow();
        return { plu: p.plu, nama: p.nama, qty: r.offAlokasiTipe === 'qty' ? r.offAlokasiQty || '-' : '-', potongan: r.diskonValue ? (r.diskonMode === 'persen' ? `${r.diskonValue}%` : `Rp ${r.diskonValue.toLocaleString('id-ID')}`) : '-', total: r.offAlokasiTipe === 'rp' && r.offAlokasiRp ? `Rp ${r.offAlokasiRp.toLocaleString('id-ID')}` : '-' };
      }),
    ];
    if (budgetLink.nominal) rows.push({ plu: '-', nama: budgetLink.keterangan || 'Budget', qty: '-', potongan: '-', total: `Rp ${budgetLink.nominal.toLocaleString('id-ID')}` });
    return rows;
  }
  if (jenisMemo === 'pendapatan-lain' && pendapatan.jenis === 'listing') {
    return pendapatan.listingProducts.map((r, i) => ({ plu: r.barcodePcs || '-', nama: r.namaProduk || `Produk #${i + 1}`, qty: formatListingConversion({ qty1: r.konversiQty1, satuan1: r.konversiSatuan1, qty2: r.konversiQty2, satuan2: r.konversiSatuan2, qty3: r.konversiQty3, satuan3: r.konversiSatuan3 }) || '-', potongan: r.diskonReguler ? `${r.diskonReguler}%` : '-', total: r.hargaPerPcs ? `Rp ${r.hargaPerPcs.toLocaleString('id-ID')}` : '-' }));
  }
  if (jenisMemo === 'pendapatan-lain') {
    const total = pendapatan.sewaNominal || pendapatan.rewardNominal || 0;
    return [{ plu: '-', nama: pendapatan.namaProgram || programMethodLabel(jenisMemo, INITIAL_PROGRAM_INFO, pendapatan), qty: '-', potongan: '-', total: total ? `Rp ${total.toLocaleString('id-ID')}` : '-' }];
  }
  return updateInfo.selectedProducts.map((p) => ({ plu: p.plu, nama: p.nama, qty: '-', potongan: updateInfo.produkFields.join(', '), total: '-' }));
}

function PrintInfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-slate-100 py-1.5 text-[10.5px]">
      <span className="font-black uppercase tracking-wider text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800">{value || '-'}</span>
    </div>
  );
}

function SuccessScreen({
  onReset, identity, outlets, jenisMemo, updateInfo, programInfo, onProducts, onRows, offProducts, offRows, budgetLink, pendapatan, signature,
}: {
  onReset: () => void;
  identity: IdCardData | null;
  outlets: string[];
  jenisMemo: JenisMemo;
  updateInfo: UpdateInfoState;
  programInfo: ProgramInfoState;
  onProducts: Product[];
  onRows: Record<string, OnFakturProductRow>;
  offProducts: Product[];
  offRows: Record<string, OffFakturProductRow>;
  budgetLink: BudgetLinkState;
  pendapatan: PendapatanState;
  signature: string;
}) {
  const [submittedAt] = useState(() => new Date());
  const [memoNo] = useState(() => `BM-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
  const [showPreview, setShowPreview] = useState(false);
  const rows = printRows(jenisMemo, updateInfo, onProducts, onRows, offProducts, offRows, budgetLink, pendapatan);
  const periode = jenisMemo === 'memo-program'
    ? [programInfo.periodeAwal, programInfo.periodeAkhir].filter(Boolean).join(' s/d ')
    : [pendapatan.sewaPeriodeAwal || pendapatan.rewardPeriodeAwal, pendapatan.sewaPeriodeAkhir || pendapatan.rewardPeriodeAkhir].filter(Boolean).join(' s/d ') || '-';
  const programName = programInfo.namaProgram || pendapatan.namaProgram || memoTypeLabel(jenisMemo);
  const credential = `KREDENSIAL KEASLIAN DOKUMEN | ${memoNo} | Supplier: ${identity?.supplier?.name || '-'} | Program: ${programName} | Periode: ${periode} | Outlet: ${outlets.join(', ') || '-'}`;
  const qrCells = makeQrCells(credential);
  const totalLabel = rows.find((r) => String(r.total).startsWith('Rp'))?.total || '-';
  const updateFieldValue = (product: Product, field: string) => {
    const key = `${product.plu}::${field}`;
    if (field === 'gramasi') return `${updateInfo.produkValues[key] || ''} ${updateInfo.produkUnits[key] || ''}`.trim();
    if (field === 'konversi') return formatListingConversion(updateInfo.produkKonversi[key]);
    if (field === 'hargaBeli' && updateInfo.produkValues[key]) return `Rp ${Number(updateInfo.produkValues[key]).toLocaleString('id-ID')}`;
    return updateInfo.produkValues[key] || '-';
  };
  const detailTitle = jenisMemo === 'update-informasi' ? 'Detail Update Informasi'
    : jenisMemo === 'memo-program' ? 'Detail Program'
      : 'Detail Pendapatan Lain-lain';

  return (
    <div className="min-h-screen p-6 bg-[#EDF1F8]">
      <div className="print:hidden bg-white rounded-2xl border border-slate-200 shadow-xl max-w-5xl w-full p-6 mx-auto mb-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-center text-[22px] font-extrabold text-slate-900 mb-2">Memo Berhasil Disubmit</h2>
        <p className="text-[14px] text-slate-500 leading-relaxed mb-6">Terima kasih. Memo Anda telah ditandatangani dan diterima, dan akan diproses oleh tim Buyer. PIC akan dihubungi dalam 1×24 jam kerja.</p>
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2 border border-slate-100 max-w-md mx-auto">
          <div className="flex justify-between text-[12px]"><span className="text-slate-400">Nomor Referensi</span><span className="font-mono font-bold text-slate-800">{memoNo}</span></div>
          <div className="flex justify-between text-[12px]"><span className="text-slate-400">Waktu Submit</span><span className="font-semibold text-slate-700">{submittedAt.toLocaleString('id-ID')}</span></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => setShowPreview(true)} className="px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.98] bg-slate-950 shadow-md inline-flex items-center justify-center gap-2"><FileText className="w-4 h-4" />Preview PDF</button>
          <button onClick={onReset} className="px-6 py-3 rounded-xl text-[13px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">Submit Memo Baru</button>
        </div>
      </div>

      <div className={`memo-preview-modal print:block ${showPreview ? 'fixed inset-0 z-50 flex flex-col bg-slate-950/70' : 'hidden'}`}>
        <div className="print:hidden flex items-center justify-between gap-3 bg-white border-b border-slate-200 px-5 py-3 shadow-sm">
          <div>
            <p className="text-[13px] font-bold text-slate-900">Preview PDF Memo</p>
            <p className="text-[11px] text-slate-500">{memoNo}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-slate-950 inline-flex items-center gap-2"><Printer className="w-4 h-4" />Cetak / Simpan PDF</button>
            <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50">Tutup</button>
          </div>
        </div>
        <div className="memo-preview-scroll flex-1 overflow-auto py-6">
      <div className="sellout-print-page memo-print-page mx-auto bg-white text-slate-950 shadow-xl w-[210mm] min-h-[297mm] p-[14mm]">
        <div className="flex justify-between items-start border-b-2 border-slate-950 pb-6">
          <div><h1 className="text-[18px] font-black tracking-tight">BUYER MEMO SYSTEM</h1><p className="text-[11px] font-bold text-slate-400 uppercase">{memoTypeLabel(jenisMemo)}</p></div>
          <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">No Memo</p><p className="text-[18px] font-black">{memoNo}</p><p className="text-[10px] text-slate-400">Tgl: {submittedAt.toLocaleDateString('id-ID')}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 text-[12px]">
          {[
            ['Supplier', identity?.supplier?.name || '-'],
            ['Program', programName],
            ['Periode', periode],
            ['PIC Supplier', identity?.picName || '-'],
            ['Metode', programMethodLabel(jenisMemo, programInfo, pendapatan)],
          ].map(([label, value]) => (
            <div key={label} className="border border-slate-200 rounded px-3 py-2"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-bold">{value}</p></div>
          ))}
          <div className="col-span-2 border border-slate-200 rounded px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Outlet Berlaku</p>
            <div className="flex flex-wrap gap-1 mt-2">{(outlets.length ? outlets : ['-']).map((o) => <span key={o} className="px-2 py-1 rounded border border-amber-300 bg-amber-50 text-[10px] font-bold text-amber-800">{o}</span>)}</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="bg-slate-950 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white">{detailTitle}</div>
          <div className="border border-t-0 border-slate-200 p-3">
            {jenisMemo === 'update-informasi' && (
              <div className="space-y-3">
                {updateInfo.jenisUpdate === 'produk' && updateInfo.selectedProducts.map((product) => (
                  <div key={product.plu} className="memo-detail-card rounded border border-slate-200 p-3">
                    <p className="mb-2 text-[12px] font-black">{product.nama} <span className="font-mono text-slate-400">({product.plu})</span></p>
                    {updateInfo.produkFields.map((field) => (
                      <PrintInfoRow key={field} label={PRODUK_UPDATE_FIELDS.find((f) => f.key === field)?.label || field} value={updateFieldValue(product, field)} />
                    ))}
                  </div>
                ))}
                {updateInfo.jenisUpdate === 'vendor' && (
                  <div className="memo-detail-card rounded border border-slate-200 p-3">
                    {updateInfo.vendorFields.map((field) => (
                      <PrintInfoRow key={field} label={VENDOR_UPDATE_FIELDS.find((f) => f.key === field)?.label || field} value={field === 'noRekening' ? `${updateInfo.vendorBank} - ${updateInfo.vendorRekening}` : updateInfo.vendorValues[field]} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {jenisMemo === 'memo-program' && (
              <div className="space-y-3">
                <PrintInfoRow label="Redaksi" value={programInfo.redaksi} />
                {onProducts.map((product) => {
                  const row = onRows[product.plu] || emptyOnFakturProductRow();
                  return (
                    <div key={product.plu} className="memo-detail-card rounded border border-amber-200 p-3">
                      <p className="mb-2 text-[12px] font-black">On Faktur - {product.nama} <span className="font-mono text-slate-400">({product.plu})</span></p>
                      <PrintInfoRow label="Potongan" value={row.diskonValue ? (row.diskonMode === 'persen' ? `${row.diskonValue}%` : `Rp ${row.diskonValue.toLocaleString('id-ID')}`) : '-'} />
                      <PrintInfoRow label="Banded" value={row.bandedAktif ? `Ya - ${row.banded}` : 'Tidak'} />
                      <PrintInfoRow label="Syarat Strata" value={row.strataMinQty ? `${row.strataMinQty} qty` : '-'} />
                      <PrintInfoRow label="Alokasi Qty" value={row.alokasiQty || '-'} />
                      <PrintInfoRow label="Keterangan" value={row.keterangan || '-'} />
                    </div>
                  );
                })}
                {offProducts.map((product) => {
                  const row = offRows[product.plu] || emptyOffFakturProductRow();
                  return (
                    <div key={product.plu} className="memo-detail-card rounded border border-indigo-200 p-3">
                      <p className="mb-2 text-[12px] font-black">Off Faktur - {product.nama} <span className="font-mono text-slate-400">({product.plu})</span></p>
                      <PrintInfoRow label="Potongan" value={row.diskonValue ? (row.diskonMode === 'persen' ? `${row.diskonValue}%` : `Rp ${row.diskonValue.toLocaleString('id-ID')}`) : '-'} />
                      <PrintInfoRow label="Kupon/Voucher" value={row.kuponVoucherAktif ? `Ya - ${row.kuponVoucher}` : 'Tidak'} />
                      <PrintInfoRow label="Free Produk" value={row.freeProdukAktif ? `Ya - ${row.freeProdukKeterangan}` : 'Tidak'} />
                      <PrintInfoRow label="Alokasi" value={row.offAlokasiTipe === 'qty' ? `${row.offAlokasiQty || 0} qty` : `Rp ${(row.offAlokasiRp || 0).toLocaleString('id-ID')}`} />
                      <PrintInfoRow label="Keterangan" value={row.keterangan || '-'} />
                    </div>
                  );
                })}
                {budgetLink.nominal > 0 && <PrintInfoRow label="Budget" value={`${budgetLink.keterangan} - Rp ${budgetLink.nominal.toLocaleString('id-ID')}`} />}
              </div>
            )}

            {jenisMemo === 'pendapatan-lain' && (
              <div className="space-y-3">
                <PrintInfoRow label="Nama Program" value={pendapatan.namaProgram} />
                <PrintInfoRow label="Jenis" value={programMethodLabel(jenisMemo, programInfo, pendapatan)} />
                {pendapatan.jenis === 'sewa-visibility' && (
                  <div className="memo-detail-card rounded border border-slate-200 p-3">
                    <PrintInfoRow label="Jenis Sewa" value={pendapatan.sewaJenis} />
                    <PrintInfoRow label="Produk" value={pendapatan.sewaProducts.map((p) => {
                      const r = pendapatan.sewaProductRows[p.plu];
                      return `${p.nama}${r ? ` (${r.qty} ${r.satuan})` : ''}`;
                    }).join(', ')} />
                    <PrintInfoRow label="Nominal" value={`Rp ${pendapatan.sewaNominal.toLocaleString('id-ID')}`} />
                    <PrintInfoRow label="Periode" value={`${pendapatan.sewaPeriodeAwal} s/d ${pendapatan.sewaPeriodeAkhir}`} />
                    <PrintInfoRow label="Keterangan" value={pendapatan.sewaKeterangan || '-'} />
                  </div>
                )}
                {pendapatan.jenis === 'reward-insentif' && (
                  <div className="memo-detail-card rounded border border-slate-200 p-3">
                    <PrintInfoRow label="Jenis" value={pendapatan.rewardJenis} />
                    <PrintInfoRow label="Bentuk" value={pendapatan.rewardBentuk} />
                    <PrintInfoRow label="Metode" value={pendapatan.rewardPembayaran || '-'} />
                    <PrintInfoRow label="Rekening" value={pendapatan.rewardBank ? `${pendapatan.rewardBank} - ${pendapatan.rewardNoRekening}` : '-'} />
                    <PrintInfoRow label="Nominal" value={pendapatan.rewardNominal ? `Rp ${pendapatan.rewardNominal.toLocaleString('id-ID')}` : '-'} />
                    <PrintInfoRow label="Periode" value={`${pendapatan.rewardPeriodeAwal} s/d ${pendapatan.rewardPeriodeAkhir}`} />
                    <PrintInfoRow label="Keterangan" value={pendapatan.rewardKeterangan || '-'} />
                  </div>
                )}
                {pendapatan.jenis === 'promosi' && <div className="memo-detail-card rounded border border-slate-200 p-3"><PrintInfoRow label="Media" value={pendapatan.mediaTipe} /><PrintInfoRow label="Keterangan" value={pendapatan.mediaKeterangan} /></div>}
                {pendapatan.jenis === 'listing' && pendapatan.listingProducts.map((row, i) => (
                  <div key={i} className="memo-detail-card rounded border border-slate-200 p-3">
                    <p className="mb-2 text-[12px] font-black">{row.namaProduk || `Produk #${i + 1}`}</p>
                    <PrintInfoRow label="Barcode PCS" value={row.barcodePcs} />
                    <PrintInfoRow label="Barcode Karton" value={row.barcodeKarton} />
                    <PrintInfoRow label="Konversi" value={formatListingConversion({ qty1: row.konversiQty1, satuan1: row.konversiSatuan1, qty2: row.konversiQty2, satuan2: row.konversiSatuan2, qty3: row.konversiQty3, satuan3: row.konversiSatuan3 })} />
                    <PrintInfoRow label="Diskon Reguler" value={`${row.diskonReguler}%`} />
                    <PrintInfoRow label="Harga PCS" value={`Rp ${row.hargaPerPcs.toLocaleString('id-ID')} (${row.hargaPpn === 'include' ? 'Include PPN' : 'Exclude PPN'})`} />
                  </div>
                ))}
                <PrintInfoRow label="PKP" value={pendapatan.listingPkp === null ? '-' : pendapatan.listingPkp ? 'Ya' : 'Tidak'} />
                <PrintInfoRow label="Return" value={pendapatan.listingReturn === null ? '-' : pendapatan.listingReturn ? 'Ya' : 'Tidak'} />
                <PrintInfoRow label="Biaya Label" value={pendapatan.listingBiayaLabel === null ? '-' : pendapatan.listingBiayaLabel ? 'Ya' : 'Tidak'} />
                <PrintInfoRow label="Pembayaran" value={`${pendapatan.listingTempoPembayaran} - ${pendapatan.listingCaraPembayaran}`} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mt-10 text-center text-[12px]">
          <div><p className="font-bold">Buyer</p><div className="h-20 border-b border-slate-400" /><p className="mt-2 text-slate-500">Nama & Tanda Tangan</p></div>
          <div><p className="font-bold">Supplier</p><div className="h-20 border-b border-slate-400 flex items-end justify-center">{signature && <img src={signature} alt="Tanda tangan supplier" className="max-h-16 max-w-48 object-contain" />}</div><p className="mt-2 text-slate-500">{identity?.picName || 'Nama & Tanda Tangan'}</p></div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between gap-6">
          <div className="text-[9px] text-slate-500 leading-relaxed"><p className="font-black text-slate-600">Kredensial Keaslian Dokumen</p><p className="font-mono break-all">{credential}</p></div>
          <div className="grid gap-0.5 border border-slate-300 p-1 bg-white w-[84px] h-[84px] shrink-0" style={{ gridTemplateColumns: 'repeat(21, 1fr)' }}>{qrCells.map((active, i) => <span key={i} className={active ? 'bg-slate-950' : 'bg-white'} />)}</div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Main wizard ───────────────────────── */
const INITIAL_UPDATE_INFO: UpdateInfoState = { jenisUpdate: '', selectedProducts: [], produkFields: [], produkValues: {}, produkUnits: {}, produkKonversi: {}, vendorFields: [], vendorValues: {}, vendorBank: '', vendorRekening: '' };
const INITIAL_PROGRAM_INFO: ProgramInfoState = { namaProgram: '', tipe: [], ppnAktif: false, ppnRate: '', pphAktif: false, pphRate: '', redaksi: '', periodeAwal: '', periodeAkhir: '' };
const INITIAL_BUDGET_LINK: BudgetLinkState = { keterangan: '', nominal: 0 };
const INITIAL_PENDAPATAN: PendapatanState = {
  jenis: '', namaProgram: '',
  sewaJenis: '', sewaProducts: [], sewaProductRows: {}, sewaNominal: 0, sewaPeriodeAwal: '', sewaPeriodeAkhir: '', sewaKeterangan: '',
  sewaPpnAktif: false, sewaPpnRate: '', sewaPphAktif: false, sewaPphRate: '',
  rewardJenis: '', rewardBentuk: '', rewardPembayaran: '', rewardBank: '', rewardNoRekening: '', rewardNominal: 0, rewardProducts: [], rewardProductRows: {}, target: '', rewardMode: 'persen', rewardValue: 0, rewardPeriodeAwal: '', rewardPeriodeAkhir: '', rewardKeterangan: '',
  rewardPpnAktif: false, rewardPpnRate: '', rewardPphAktif: false, rewardPphRate: '',
  mediaTipe: '', mediaKeterangan: '',
  listingProducts: [emptyListingProductRow()],
  listingPkp: null, listingReturn: null, listingBiayaLabel: null, listingTempoPembayaran: '', listingCaraPembayaran: '',
  listingPpnAktif: false, listingPpnRate: '', listingPphAktif: false, listingPphRate: '',
};

export default function SupplierMemoWizard() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const [identity, setIdentity] = useState<IdCardData | null>(null);
  const [outlets, setOutlets] = useState<string[]>([]);
  const [outletScope, setOutletScope] = useState<OutletScope>('custom');
  const [jenisMemo, setJenisMemo] = useState<JenisMemo>('');

  const [updateInfo, setUpdateInfo] = useState<UpdateInfoState>(INITIAL_UPDATE_INFO);
  const [programInfo, setProgramInfo] = useState<ProgramInfoState>(INITIAL_PROGRAM_INFO);

  const [onProductScope, setOnProductScope] = useState<ProductScope>('per-plu');
  const [onSelectedSubCategory, setOnSelectedSubCategory] = useState('');
  const [onProducts, setOnProducts] = useState<Product[]>([]);
  const [onRows, setOnRows] = useState<Record<string, OnFakturProductRow>>({});

  const [offProductScope, setOffProductScope] = useState<ProductScope>('per-plu');
  const [offSelectedSubCategory, setOffSelectedSubCategory] = useState('');
  const [offProducts, setOffProducts] = useState<Product[]>([]);
  const [offRows, setOffRows] = useState<Record<string, OffFakturProductRow>>({});

  const [budgetLink, setBudgetLink] = useState<BudgetLinkState>(INITIAL_BUDGET_LINK);

  const [pendapatan, setPendapatan] = useState<PendapatanState>(INITIAL_PENDAPATAN);

  const [catatan, setCatatan] = useState('');
  const [signature, setSignature] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subCategories = Array.from(new Set(PRODUCT_CATALOG.map((p) => p.subKategori)));

  const setUF = <K extends keyof UpdateInfoState>(f: K, v: UpdateInfoState[K]) => setUpdateInfo((p) => ({ ...p, [f]: v }));
  const setPF = <K extends keyof ProgramInfoState>(f: K, v: ProgramInfoState[K]) => setProgramInfo((p) => ({ ...p, [f]: v }));
  const setBL = <K extends keyof BudgetLinkState>(f: K, v: BudgetLinkState[K]) => setBudgetLink((p) => ({ ...p, [f]: v }));
  const setPendF = <K extends keyof PendapatanState>(f: K, v: PendapatanState[K]) => setPendapatan((p) => ({ ...p, [f]: v }));

  const steps = getSteps(jenisMemo, programInfo.tipe);
  const currentKey = steps[Math.min(step, steps.length - 1)].key;

  /* Keep per-product rows in sync with the selected product scope — On Faktur and Off Faktur tracked independently */
  useEffect(() => {
    setOnRows((prev) => {
      const next: Record<string, OnFakturProductRow> = {};
      onProducts.forEach((p) => { next[p.plu] = prev[p.plu] || emptyOnFakturProductRow(); });
      return next;
    });
  }, [onProducts]);

  useEffect(() => {
    setOffRows((prev) => {
      const next: Record<string, OffFakturProductRow> = {};
      offProducts.forEach((p) => { next[p.plu] = prev[p.plu] || emptyOffFakturProductRow(); });
      return next;
    });
  }, [offProducts]);

  const applyOutletScope = (scope: OutletScope) => {
    setOutletScope(scope);
    if (scope === 'pt-nayan') setOutlets([...NAYAN_OUTLETS]);
    if (scope === 'all-mk-godean') setOutlets([...GODEAN_OUTLETS]);
    if (scope === 'all-mk') setOutlets([...ALL_MK_OUTLETS]);
    if (scope === 'custom') setOutlets([]);
  };
  const toggleOutlet = (o: string) => { setOutletScope('custom'); setOutlets((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]); };

  const onScanned = (card: IdCardData) => { setIdentity(card); setErrors({}); };

  const onJenisUpdateChange = (v: 'produk' | 'vendor') => setUpdateInfo({ ...INITIAL_UPDATE_INFO, jenisUpdate: v });

  const onJenisMemoChange = (v: JenisMemo) => {
    setJenisMemo(v);
    setUpdateInfo(INITIAL_UPDATE_INFO); setProgramInfo(INITIAL_PROGRAM_INFO);
    setOnProductScope('per-plu'); setOnSelectedSubCategory(''); setOnProducts([]); setOnRows({});
    setOffProductScope('per-plu'); setOffSelectedSubCategory(''); setOffProducts([]); setOffRows({});
    setBudgetLink(INITIAL_BUDGET_LINK); setPendapatan(INITIAL_PENDAPATAN);
  };

  const updateOnRow = (plu: string, field: keyof OnFakturProductRow, val: string | number | boolean) =>
    setOnRows((prev) => ({ ...prev, [plu]: { ...(prev[plu] || emptyOnFakturProductRow()), [field]: val } }));
  const updateOffRow = (plu: string, field: keyof OffFakturProductRow, val: string | number | boolean) =>
    setOffRows((prev) => ({ ...prev, [plu]: { ...(prev[plu] || emptyOffFakturProductRow()), [field]: val } }));

  const validateStep = (key: string): FormErrors => {
    const e: FormErrors = {};
    if (key === 'scan') { if (!identity) e.scan = 'Scan kartu ID terlebih dahulu untuk melanjutkan.'; }
    if (key === 'outlet') { if (outlets.length === 0) e.outlet = 'Pilih minimal satu outlet.'; }
    if (key === 'jenis-memo') { if (!jenisMemo) e.jenisMemo = 'Pilih jenis memo yang ingin diajukan.'; }
    if (key === 'update-informasi') {
      if (!updateInfo.jenisUpdate) e.jenisUpdate = 'Pilih jenis update terlebih dahulu.';
      if (updateInfo.jenisUpdate === 'produk') {
        if (updateInfo.selectedProducts.length === 0) e.selectedProducts = 'Pilih minimal satu produk.';
        if (updateInfo.produkFields.length === 0) e.produkFields = 'Pilih minimal satu data yang akan diupdate.';
        const allFilled = updateInfo.selectedProducts.length > 0 && updateInfo.produkFields.length > 0 &&
          updateInfo.selectedProducts.every((p) => updateInfo.produkFields.every((f) => {
            const key2 = `${p.plu}::${f}`;
            if (f === 'konversi') {
              const row = updateInfo.produkKonversi[key2];
              return Boolean(row && row.qty1 > 0 && row.satuan1 && row.qty2 > 0 && row.satuan2 && row.qty3 > 0 && row.satuan3);
            }
            const valOk = (updateInfo.produkValues[key2] || '').trim();
            const unitOk = f === 'gramasi' ? (updateInfo.produkUnits[key2] || '').trim() : true;
            return Boolean(valOk) && Boolean(unitOk);
          }));
        if (updateInfo.selectedProducts.length > 0 && updateInfo.produkFields.length > 0 && !allFilled) e.produkValues = 'Lengkapi data baru (termasuk satuan) untuk setiap produk & data yang dipilih.';
      }
      if (updateInfo.jenisUpdate === 'vendor') {
        if (updateInfo.vendorFields.length === 0) e.vendorFields = 'Pilih minimal satu data yang akan diupdate.';
        const nonBankFields = updateInfo.vendorFields.filter((f) => f !== 'noRekening');
        const nonBankFilled = nonBankFields.every((f) => (updateInfo.vendorValues[f] || '').trim());
        if (updateInfo.vendorFields.length > 0 && !nonBankFilled) e.vendorValues = 'Lengkapi seluruh data baru.';
        if (updateInfo.vendorFields.includes('noRekening') && (!updateInfo.vendorBank || !updateInfo.vendorRekening.trim())) e.vendorRekening = 'Lengkapi bank dan nomor rekening baru.';
      }
    }
    if (key === 'program-info') {
      if (!programInfo.namaProgram.trim()) e.namaProgram = 'Nama program wajib diisi.';
      if (programInfo.tipe.length === 0) e.tipe = 'Pilih minimal satu tipe program.';
      if (programInfo.tipe.includes('off-faktur')) {
        if (!programInfo.ppnAktif && !programInfo.pphAktif) { e.ppnRate = 'Aktifkan PPN dan/atau PPh untuk program Off Faktur.'; }
        if (programInfo.ppnAktif && !programInfo.ppnRate) e.ppnRate = 'Pilih tarif PPN.';
        if (programInfo.pphAktif && !programInfo.pphRate) e.pphRate = 'Pilih tarif PPh.';
      }
      if (!programInfo.redaksi.trim()) e.redaksi = 'Redaksi wajib diisi.';
      if (!programInfo.periodeAwal) e.periodeAwal = 'Periode dari wajib diisi.';
      if (!programInfo.periodeAkhir) e.periodeAkhir = 'Periode sampai wajib diisi.';
      if (programInfo.periodeAwal && programInfo.periodeAkhir && programInfo.periodeAkhir < programInfo.periodeAwal) e.periodeAkhir = 'Periode sampai tidak boleh sebelum periode dari.';
    }
    if (key === 'cakupan-produk') {
      const hasOn = programInfo.tipe.includes('on-faktur');
      const hasOff = programInfo.tipe.includes('off-faktur');
      if (hasOn && onProducts.length === 0) e.onProduk = 'Pilih minimal satu produk untuk cakupan On Faktur.';
      if (hasOff && offProducts.length === 0) e.offProduk = 'Pilih minimal satu produk untuk cakupan Off Faktur.';
    }
    if (key === 'program-detail') {
      const hasOn = programInfo.tipe.includes('on-faktur');
      const hasOff = programInfo.tipe.includes('off-faktur');
      if (hasOn) {
        const invalid = onProducts.some((p) => !(onRows[p.plu]?.diskonValue > 0));
        const bandedInvalid = onProducts.some((p) => onRows[p.plu]?.bandedAktif && !onRows[p.plu]?.banded.trim());
        if (invalid) e.onProduk = 'Isi potongan untuk setiap produk On Faktur yang dipilih.';
        if (bandedInvalid) e.onProduk = e.onProduk || 'Isi keterangan banded untuk produk On Faktur yang memilih Ya.';
      }
      if (hasOff) {
        const invalid = offProducts.some((p) => !(offRows[p.plu]?.diskonValue > 0));
        const kuponInvalid = offProducts.some((p) => offRows[p.plu]?.kuponVoucherAktif && !offRows[p.plu]?.kuponVoucher.trim());
        const freeProdukInvalid = offProducts.some((p) => offRows[p.plu]?.freeProdukAktif && !offRows[p.plu]?.freeProdukKeterangan.trim());
        if (invalid) e.offProduk = 'Isi potongan untuk setiap produk Off Faktur yang dipilih.';
        if (kuponInvalid) e.offProduk = e.offProduk || 'Isi keterangan kupon/voucher untuk produk Off Faktur yang memilih Ya.';
        if (freeProdukInvalid) e.offProduk = e.offProduk || 'Isi keterangan free produk untuk produk Off Faktur yang memilih Ya.';
      }
      if (programInfo.tipe.includes('budget') && (!budgetLink.keterangan.trim() || !budgetLink.nominal)) e.onProduk = e.onProduk || 'Lengkapi keterangan dan nominal budget.';
    }
    if (key === 'pendapatan') {
      if (!pendapatan.namaProgram.trim()) e.namaProgram = 'Nama program wajib diisi.';
      if (!pendapatan.jenis) e.jenis = 'Pilih jenis program pendapatan.';
      if (pendapatan.jenis === 'sewa-visibility') {
        if (!pendapatan.sewaJenis) e.sewaJenis = 'Pilih jenis sewa/visibility.';
        if (pendapatan.sewaProducts.length === 0) e.sewaProducts = 'Pilih minimal satu produk.';
        if (pendapatan.sewaProducts.some((p) => !pendapatan.sewaProductRows[p.plu]?.qty || !pendapatan.sewaProductRows[p.plu]?.satuan)) e.sewaProductRows = 'Lengkapi qty dan satuan untuk setiap produk.';
        if (!pendapatan.sewaNominal) e.sewaJenis = e.sewaJenis || 'Lengkapi nilai sewa.';
        if (!pendapatan.sewaPeriodeAwal || !pendapatan.sewaPeriodeAkhir) e.sewaJenis = e.sewaJenis || 'Lengkapi periode sewa.';
        if (!pendapatan.sewaPpnAktif && !pendapatan.sewaPphAktif) e.sewaPpnRate = 'Aktifkan PPN dan/atau PPh untuk sewa/visibility ini.';
        if (pendapatan.sewaPpnAktif && !pendapatan.sewaPpnRate) e.sewaPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.sewaPphAktif && !pendapatan.sewaPphRate) e.sewaPphRate = 'Pilih tarif PPh.';
      }
      if (pendapatan.jenis === 'reward-insentif') {
        if (!pendapatan.rewardJenis) e.rewardJenis = 'Pilih reward, rabate, atau insentif.';
        if (!pendapatan.rewardBentuk) e.rewardBentuk = 'Pilih uang atau hadiah.';
        if (pendapatan.rewardBentuk === 'Uang' && !pendapatan.rewardPembayaran) e.rewardPembayaran = 'Pilih tunai atau non tunai.';
        if (pendapatan.rewardBentuk === 'Uang' && pendapatan.rewardPembayaran === 'Non Tunai' && !pendapatan.rewardBank) e.rewardBank = 'Pilih bank.';
        if (pendapatan.rewardBentuk === 'Uang' && pendapatan.rewardPembayaran === 'Non Tunai' && !pendapatan.rewardNoRekening.trim()) e.rewardNoRekening = 'Isi nomor rekening.';
        if (pendapatan.rewardBentuk === 'Uang' && !pendapatan.rewardNominal) e.rewardNominal = 'Isi nominal.';
        if (!pendapatan.rewardPeriodeAwal || !pendapatan.rewardPeriodeAkhir) e.target = e.target || 'Lengkapi periode.';
        if (!pendapatan.rewardPpnAktif && !pendapatan.rewardPphAktif) e.rewardPpnRate = 'Aktifkan PPN dan/atau PPh untuk reward/insentif ini.';
        if (pendapatan.rewardPpnAktif && !pendapatan.rewardPpnRate) e.rewardPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.rewardPphAktif && !pendapatan.rewardPphRate) e.rewardPphRate = 'Pilih tarif PPh.';
      }
      if (pendapatan.jenis === 'promosi') {
        if (!pendapatan.mediaTipe) e.jenis = 'Pilih jenis media.';
        if (!pendapatan.mediaKeterangan.trim()) e.jenis = e.jenis || 'Keterangan media wajib diisi.';
      }
      if (pendapatan.jenis === 'listing') {
        const rowsValid = pendapatan.listingProducts.length > 0 && pendapatan.listingProducts.every((r) =>
          r.namaProduk.trim() &&
          r.barcodePcs.trim() &&
          r.barcodeKarton.trim() &&
          r.konversiQty1 > 0 && r.konversiSatuan1 &&
          r.konversiQty2 > 0 && r.konversiSatuan2 &&
          r.konversiQty3 > 0 && r.konversiSatuan3 &&
          r.hargaPerPcs > 0 &&
          r.hargaPpn
        );
        if (!rowsValid) e.listingProducts = 'Lengkapi data setiap produk yang di-listing.';
        if (pendapatan.listingPkp === null || pendapatan.listingReturn === null || pendapatan.listingBiayaLabel === null || !pendapatan.listingTempoPembayaran.trim() || !pendapatan.listingCaraPembayaran.trim()) {
          e.listingProducts = e.listingProducts || 'Lengkapi syarat & ketentuan listing.';
        }
        if (!pendapatan.listingPpnAktif && !pendapatan.listingPphAktif) e.listingPpnRate = 'Aktifkan PPN dan/atau PPh untuk listing ini.';
        if (pendapatan.listingPpnAktif && !pendapatan.listingPpnRate) e.listingPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.listingPphAktif && !pendapatan.listingPphRate) e.listingPphRate = 'Pilih tarif PPh.';
      }
    }
    if (key === 'tinjau') {
      if (!signature) e.signature = 'Tanda tangan wajib diisi.';
      if (!agreed) e.agreed = 'Centang persetujuan sebelum submit.';
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(currentKey);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goBack = () => { setErrors({}); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = () => {
    const e = validateStep('tinjau');
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitted(true);
  };

  const resetAll = () => {
    setSubmitted(false); setStep(0); setIdentity(null); setOutlets([]); setOutletScope('custom'); setJenisMemo('');
    setUpdateInfo(INITIAL_UPDATE_INFO); setProgramInfo(INITIAL_PROGRAM_INFO);
    setOnProductScope('per-plu'); setOnSelectedSubCategory(''); setOnProducts([]); setOnRows({});
    setOffProductScope('per-plu'); setOffSelectedSubCategory(''); setOffProducts([]); setOffRows({});
    setBudgetLink(INITIAL_BUDGET_LINK); setPendapatan(INITIAL_PENDAPATAN);
    setCatatan(''); setSignature(''); setAgreed(false);
  };

  if (submitted) return (
    <SuccessScreen
      onReset={resetAll}
      identity={identity}
      outlets={outlets}
      jenisMemo={jenisMemo}
      updateInfo={updateInfo}
      programInfo={programInfo}
      onProducts={onProducts}
      onRows={onRows}
      offProducts={offProducts}
      offRows={offRows}
      budgetLink={budgetLink}
      pendapatan={pendapatan}
      signature={signature}
    />
  );

  return (
    <div className="min-h-screen bg-[#EDF1F8]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-[11px] bg-gradient-to-br from-amber-700 to-amber-600 shadow-md">BM</div>
            <div className="leading-tight">
              <p className="text-[13px] font-bold text-slate-800">Buyer Memo System</p>
              <p className="text-[10px] text-slate-400">Formulir Pengajuan Memo Supplier</p>
            </div>
          </div>
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${identity ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${identity ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {identity ? 'Akses Supplier' : 'Belum Scan ID'}
          </span>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-amber-700 via-amber-500 to-[#EDF1F8]" />
      </header>

      <StepIndicator steps={steps} current={step} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-28">
        <div className="text-center space-y-1.5">
          <h1 className="text-[20px] font-extrabold text-slate-900">Formulir Memo Buyer</h1>
          <p className="text-[13px] text-slate-500">Langkah {step + 1} dari {steps.length} — {steps[step].label}</p>
        </div>

        {currentKey === 'scan' && <ScanIdStep identity={identity} onScanned={onScanned} error={errors.scan} />}
        {currentKey === 'outlet' && <OutletStep outlets={outlets} outletScope={outletScope} applyOutletScope={applyOutletScope} toggleOutlet={toggleOutlet} error={errors.outlet} />}
        {currentKey === 'jenis-memo' && <JenisMemoStep value={jenisMemo} onChange={onJenisMemoChange} error={errors.jenisMemo} />}
        {currentKey === 'update-informasi' && <UpdateInformasiStep state={updateInfo} setField={setUF} onJenisUpdateChange={onJenisUpdateChange} identity={identity} errors={errors} />}
        {currentKey === 'program-info' && <ProgramInfoStep state={programInfo} setField={setPF} errors={errors} />}
        {currentKey === 'cakupan-produk' && (
          <CakupanProdukStep
            tipe={programInfo.tipe}
            onScope={onProductScope} setOnScope={setOnProductScope} onSubCategory={onSelectedSubCategory} setOnSubCategory={setOnSelectedSubCategory}
            onProducts={onProducts} setOnProducts={setOnProducts} onError={errors.onProduk}
            offScope={offProductScope} setOffScope={setOffProductScope} offSubCategory={offSelectedSubCategory} setOffSubCategory={setOffSelectedSubCategory}
            offProducts={offProducts} setOffProducts={setOffProducts} offError={errors.offProduk}
            subCategories={subCategories} supplierId={identity?.supplier?.id}
          />
        )}
        {currentKey === 'program-detail' && (
          <ProgramDetailStep
            tipe={programInfo.tipe}
            onProducts={onProducts} onRows={onRows} updateOnRow={updateOnRow} onError={errors.onProduk}
            offProducts={offProducts} offRows={offRows} updateOffRow={updateOffRow} offError={errors.offProduk}
            budgetLink={budgetLink} setBudgetLink={setBL}
          />
        )}
        {currentKey === 'pendapatan' && <PendapatanStep state={pendapatan} setField={setPendF} errors={errors} />}
        {currentKey === 'catatan' && <NotesStep catatan={catatan} setCatatan={setCatatan} />}
        {currentKey === 'tinjau' && (
          <ReviewStep
            identity={identity} outlets={outlets} jenisMemo={jenisMemo}
            updateInfo={updateInfo} programInfo={programInfo} onProducts={onProducts} onRows={onRows} offProducts={offProducts} offRows={offRows} budgetLink={budgetLink}
            pendapatan={pendapatan} catatan={catatan}
            signature={signature} setSignature={setSignature} agreed={agreed} setAgreed={setAgreed} errors={errors}
          />
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <button type="button" onClick={goBack} disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <ArrowLeft className="w-4 h-4" />Kembali
          </button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={goNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all active:scale-[0.98] bg-gradient-to-r from-amber-700 to-amber-600 shadow-md shadow-amber-700/30">
              Lanjut<ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all active:scale-[0.98] bg-gradient-to-r from-amber-700 to-amber-600 shadow-md shadow-amber-700/30">
              <Send className="w-4 h-4" />Submit Memo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
