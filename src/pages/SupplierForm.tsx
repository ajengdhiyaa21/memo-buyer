import { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Search, ChevronDown, CheckCircle2,
  FileText, Building2, Tag, Info, Send, AlertCircle,
  ScanLine, IdCard, ArrowLeft, ArrowRight, ShieldCheck,
  RotateCcw, PenLine, Package, UserCog, Wallet, Store,
  Gift, Megaphone, Receipt, Layers, Printer, Calendar,
} from 'lucide-react';
import mannaKampusLogo from '../../logo.png';

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

const GRAMASI_UNIT_OPTIONS = ['gram', 'kg', 'ml', 'liter', 'PCS', 'PC', 'CR', 'KARTON', 'DUS', 'BOX', 'PACK', 'LUSIN', 'BTL', 'SACHET', 'RENCENG'];
const KONVERSI_UNIT_OPTIONS = ['PC', 'PCS', 'CR', 'DUS', 'BOX', 'KARTON', 'LUSIN', 'PACK', 'BTL', 'SACHET', 'RENCENG'];

const PRODUK_UPDATE_FIELDS = [
  { key: 'barcodeKarton', label: 'Barcode Karton' },
  { key: 'barcodePlu', label: 'Barcode PLU' },
  { key: 'plu', label: 'PLU' },
  { key: 'nama', label: 'Nama Produk' },
  { key: 'gramasi', label: 'Gramasi' },
  { key: 'hargaBeli', label: 'Harga Pokok' },
  { key: 'diskonReguler', label: 'Diskon Reguler (%)' },
  { key: 'konversi', label: 'Konversi' },
  { key: 'jatuhTempo', label: 'Jatuh Tempo' },
];    
const VENDOR_UPDATE_FIELDS = [
  { key: 'picList', label: 'PIC Vendor' },
  { key: 'alamat', label: 'Alamat Vendor' },
  { key: 'npwp', label: 'NPWP' },
  { key: 'email', label: 'Email Vendor' },
];

const JENIS_MEMO_OPTIONS = [
  { key: 'update-informasi', label: 'Update Informasi', desc: 'Perbarui data produk atau profil vendor', icon: FileText },
  { key: 'memo-program', label: 'Memo Program', desc: 'On Faktur dan Off Faktur', icon: Tag },
  { key: 'pendapatan-lain', label: 'Memo Lain-lain', desc: 'Sewa/visibility, reward, promosi, listing, event', icon: Building2 },
] as const;

const PROGRAM_TIPE_OPTIONS = [
  { key: 'on-faktur', label: 'On Faktur', icon: Receipt },
  { key: 'off-faktur', label: 'Off Faktur', icon: FileText },
];

const PPN_RATE_OPTIONS = ['PPN 11%'];
const CARA_PEMBAYARAN_OPTIONS = ['Tunai', 'Transfer', 'Potong Tagihan'];
const DISKON_BASIS_OPTIONS = [
  { key: 'cbp', label: 'Harga Jual (CBP)' },
  { key: 'rbp', label: 'Harga Pokok (RBP)' },
];
const STRATA_UNIT_OPTIONS = ['PCS', 'KARTON'];
const PPH_RATE_OPTIONS = ['PPh Pasal 23 - 15%', 'PPh Pasal 23 - 2%'];
const SEWA_PPH_RATE_OPTIONS = ['PPh Pasal 23 - 2%', 'PPh Final 4 Ayat 2 - 10%'];
const SEWA_CARA_PEMBAYARAN_OPTIONS = ['Transfer', 'Tunai', 'Potong Tagihan'];

const PENDAPATAN_OPTIONS = [
  { key: 'event-blbms', label: 'Event', desc: 'Sewa area/kegiatan untuk event outlet', icon: Calendar },
  { key: 'sewa-visibility', label: 'Sewa / Visibility', desc: 'Sewa ruang, gondola, atau media visibility', icon: Store },
  { key: 'reward-insentif', label: 'Reward / Insentif', desc: 'Reward atau insentif yang melekat pada pencapaian target', icon: Gift },
  { key: 'promosi', label: 'Promosi (Media Cetak/Digital)', desc: 'Kerja sama promosi melalui media cetak atau digital', icon: Megaphone },
  { key: 'listing', label: 'Listing', desc: 'Pendaftaran produk baru beserta syarat & ketentuan', icon: Receipt },
] as const;
const VISIBLE_PENDAPATAN_OPTIONS = PENDAPATAN_OPTIONS.filter((option) => !['sewa-visibility', 'promosi'].includes(option.key));

const SEWA_VISIBILITY_JENIS = ['End Gondola', 'Wing Gondola', 'Shelving', 'COC', 'Dancing Up', 'Floor', 'Dumbin', 'Backwall Kosmetik', 'Clip Strip', 'Dumbin/Mini Wings'];
const PROMOSI_MEDIA_OPTIONS = ['Neonbox Instore', 'Spanduk/Banner In Store', 'Spanduk/Banner Out Store', 'Banner Mobil', 'TVC/Digital Signage', 'Brosur', 'Sosial Media', 'Audio Instore Promo', 'Rollup Banner'];
const REWARD_JENIS_OPTIONS = ['Reward', 'Insentif'];
const REWARD_BENTUK_OPTIONS = ['Uang', 'Barang', 'Hadiah', 'Trip'];

/** Sentinel value for "pilihan lainnya" on Jenis Event — selecting it reveals a free-text input. */
const EVENT_JENIS_OPTIONS = ['Belanja Luar Biasa Murah Spektakuler (BLBMS)', 'Pra Ramadhan & Lebaran', 'Anniversary', 'Tahun Ajaran Baru', 'Natal dan Tahun Baru', 'Grand Opening (New Store)', 'Additional Event', 'Regular Event'];

/** Bentuk/fasilitas yang dipilih setelah Jenis Event — gabungan Reward/Insentif, Promosi, dan Sewa/Visibility. */
const EVENT_MEDIA_CATEGORIES = ['Media Display Produk', 'Media Branding & Publish', 'Area dan Fasilitas'];
const EVENT_MEDIA_BY_CATEGORY: Record<string, string[]> = {
  'Media Display Produk': SEWA_VISIBILITY_JENIS,
  'Media Branding & Publish': PROMOSI_MEDIA_OPTIONS,
  'Area dan Fasilitas': ['Openbooth/Tenant', 'Showroom', 'Buildings', 'Free Drink', 'Free Test','Open Table', 'Fasilitas Air', 'Fasilitas Listrik', 'Fasilitas Internet'],
};

const SATUAN_OPTIONS = ['PCS', 'BANDED', 'DUS', 'BOX', 'KARTON', 'LUSIN', 'PACK'];

function getProdukOldValue(product: Product | null, field: string): string {
  if (!product) return '';
  switch (field) {
    case 'nama': return product.nama;
    case 'barcodeKarton': return '-';
    case 'barcodePlu': return '-';
    case 'plu': return product.plu;
    case 'gramasi': return product.gramasi || '-';
    case 'hargaBeli': return product.hargaBeli ? `Rp ${product.hargaBeli.toLocaleString('id-ID')} include PPN` : '-';
    case 'diskonReguler': return '-';
    case 'konversi': return product.konversi || '-';
    case 'jatuhTempo': return product.jatuhTempo || '-';
    default: return '-';
  }
}
function getVendorOldValue(identity: IdCardData | null, field: string): string {
  if (!identity) return '';
  switch (field) {
    case 'picList': return ['Andi Wijaya (0857-6633-2210)', 'Maya Putri (0856-1122-3344)', 'Rian Hakim (0878-9900-1122)'].join('\n');
    case 'alamat': return '-';
    case 'npwp': return '-';
    case 'email': return '-';
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
    steps.push({ key: 'program-detail', label: 'Detail Program' });
  }
  if (jenisMemo === 'pendapatan-lain') {
    steps.push({ key: 'pendapatan-jenis', label: 'Jenis Program' });
    steps.push({ key: 'pendapatan', label: 'Detail Program' });
  }
  steps.push({ key: 'catatan', label: 'Catatan' });
  steps.push({ key: 'tinjau', label: 'Tinjau & TTD' });
  return steps;
}

type FormErrors = Record<string, string>;

interface VendorPicRow {
  nama: string;
  kontak: string;
}

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

function RewardTypeNote({ type }: { type: string }) {
  if (!['Reward', 'Insentif'].includes(type)) return null;
  const isReward = type === 'Reward';
  return (
    <div className={`mt-2.5 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[12px] font-medium leading-relaxed ${
      isReward
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-indigo-200 bg-indigo-50 text-indigo-800'
    }`}>
      <Info className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isReward ? 'text-amber-600' : 'text-indigo-600'}`} />
      <span>{isReward ? 'Reward adalah pemberian cuma-cuma.' : 'Insentif adalah pemberian dengan pencapaian target tertentu.'}</span>
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
type ChipTone = 'amber' | 'emerald' | 'rose' | 'sky' | 'slate';
const chipToneClass: Record<ChipTone, string> = {
  amber: 'bg-amber-600 border-amber-600 text-white shadow-sm',
  emerald: 'bg-emerald-600 border-emerald-600 text-white shadow-sm',
  rose: 'bg-rose-600 border-rose-600 text-white shadow-sm',
  sky: 'bg-sky-600 border-sky-600 text-white shadow-sm',
  slate: 'bg-slate-700 border-slate-700 text-white shadow-sm',
};

function SingleChoiceChips({ options, value, onChange }: { options: { key: string; label: string; tone?: ChipTone }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button key={o.key} type="button" onClick={() => onChange(o.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-semibold transition-all ${
              active ? chipToneClass[o.tone || 'amber'] : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
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
          {m === 'persen' ? '%' : 'Rp'}
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

function ChangeFieldWithSuffix({ oldValue, newValue, onChange, placeholder, suffix }: { oldValue: string; newValue: string; onChange: (v: string) => void; placeholder?: string; suffix: string }) {
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
        <div className="relative">
          <input type="number" min={0} value={newValue} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || '0'} className={`${inp} pr-14`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">{suffix}</span>
        </div>
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
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [manualId, setManualId] = useState('');
  const [manualError, setManualError] = useState('');
  const doScan = () => {
    setScanning(true);
    window.setTimeout(() => {
      const card = MOCK_ID_CARDS[Math.floor(Math.random() * MOCK_ID_CARDS.length)];
      onScanned(card);
      setScanning(false);
    }, 1400);
  };
  const submitManualId = () => {
    const value = manualId.trim().toUpperCase();
    const card = MOCK_ID_CARDS.find((item) => item.cardId.toUpperCase() === value);
    if (!card) {
      setManualError('ID supplier tidak ditemukan. Gunakan salah satu contoh ID di bawah.');
      return;
    }
    setManualError('');
    onScanned(card);
  };
  const exampleIds = MOCK_ID_CARDS.map((card) => card.cardId);

  return (
    <Card title="Identitas Supplier" icon={IdCard} subtitle="Scan kartu ID supplier atau masukkan ID supplier secara manual">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 w-full max-w-md">
          <button type="button" onClick={() => setMode('scan')} className={`rounded-xl px-4 py-2.5 text-[12px] font-bold transition-all ${mode === 'scan' ? 'bg-white text-amber-700 shadow-sm border border-amber-200' : 'text-slate-500 hover:text-slate-800'}`}>
            Scan ID
          </button>
          <button type="button" onClick={() => setMode('manual')} className={`rounded-xl px-4 py-2.5 text-[12px] font-bold transition-all ${mode === 'manual' ? 'bg-white text-amber-700 shadow-sm border border-amber-200' : 'text-slate-500 hover:text-slate-800'}`}>
            Input ID
          </button>
        </div>

        {mode === 'scan' && (
          <>
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
          </>
        )}

        {mode === 'manual' && (
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4">
          <Label>Input ID Supplier Manual</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={manualId}
              onChange={(e) => {
                setManualId(e.target.value);
                setManualError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitManualId();
              }}
              className={`${manualError ? inpErr : inp} font-mono uppercase`}
              placeholder="cth: MK-SPV-00123"
            />
            <button type="button" onClick={submitManualId} className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-white bg-slate-950 hover:bg-slate-800 transition-colors">
              Gunakan ID
            </button>
          </div>
          <FieldError message={manualError} />
          <div className="mt-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contoh ID demo</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {exampleIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setManualId(id);
                    setManualError('');
                  }}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700 hover:bg-amber-100"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
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
            <p className="text-[13px] font-bold text-slate-800">PT Mirota Godean</p>
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
  if (row.qty1 && row.satuan1 && row.qty2 && row.satuan2 && row.qty3 && row.satuan3) {
    return `1 ${row.satuan1} = ${row.qty2} ${row.satuan2}; 1 ${row.satuan2} = ${row.qty3} ${row.satuan3}; total 1 ${row.satuan1} = ${(row.qty2 || 0) * (row.qty3 || 0)} ${row.satuan3}`;
  }
  if (row.qty1 && row.satuan1 && row.qty3 && row.satuan3) {
    return `1 ${row.satuan1} = ${row.qty3} ${row.satuan3}`;
  }
  return [
    row.qty1 && row.satuan1 ? `${row.qty1} ${row.satuan1}` : '',
    row.qty2 && row.satuan2 ? `${row.qty2} ${row.satuan2}` : '',
    row.qty3 && row.satuan3 ? `${row.qty3} ${row.satuan3}` : '',
  ].filter(Boolean).join(' -> ');
}

function sewaPeriodLabel(start: string, months: number) {
  if (!start && !months) return '';
  if (!start) return months ? `${months} bulan` : '';
  if (!months) return `Mulai ${start}`;
  const startDate = new Date(`${start}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) return `${start} selama ${months} bulan`;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  endDate.setDate(endDate.getDate() - 1);
  const end = endDate.toISOString().slice(0, 10);
  return `${start} s/d ${end} (${months} bulan)`;
}

function addMonthsDateLabel(dateValue: string, months: number) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function periodEndDateValue(start: string, months: number) {
  if (!start || !months) return '';
  const startDate = new Date(`${start}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) return '';
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  endDate.setDate(endDate.getDate() - 1);
  return endDate.toISOString().slice(0, 10);
}

function PaymentDueWarning({ dueDate }: { dueDate?: string }) {
  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
      <div className="flex items-start gap-2">
        <Info className="warning-info-animate mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-[12px] font-semibold leading-relaxed">
          {dueDate
            ? `Batas pembayar maksimal sampai tanggal ${dueDate}.`
            : 'Batas pembayar maksimal akan tampil setelah Periode Sampai diisi.'}
        </p>
      </div>
    </div>
  );
}

function DateRangeLikePicker({
  start, end, onStart, onEnd,
}: {
  start: string; end: string; onStart: (v: string) => void; onEnd: (v: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label req>Tanggal Pemakaian Jasa / Sewa</Label>
          <div className="grid grid-cols-[38px_1fr] rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
            <div className="flex items-center justify-center bg-slate-100 border-r border-slate-300 text-slate-500"><Calendar className="h-4 w-4" /></div>
            <input type="date" value={start} onChange={(e) => onStart(e.target.value)} className="px-3 py-2.5 text-[13px] outline-none text-slate-700" />
          </div>
        </div>
        <div>
          <Label req>Tanggal Jatuh Tempo</Label>
          <div className="grid grid-cols-[38px_1fr] rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
            <div className="flex items-center justify-center bg-slate-100 border-r border-slate-300 text-slate-500"><Calendar className="h-4 w-4" /></div>
            <input type="date" value={end} onChange={(e) => onEnd(e.target.value)} className="px-3 py-2.5 text-[13px] outline-none text-slate-700" />
          </div>
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
        {start && end ? `${start} sampai ${end}` : 'Pilih tanggal pemakaian dan tanggal jatuh tempo.'}
      </div>
    </div>
  );
}

function formatDateShort(dateValue: string) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function dateRangeDurationLabel(startValue: string, endValue: string) {
  if (!startValue || !endValue) return '';
  const start = new Date(`${startValue}T00:00:00`);
  const end = new Date(`${endValue}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return '';
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  let anchor = new Date(start);
  anchor.setMonth(anchor.getMonth() + months);
  if (anchor > end) {
    months -= 1;
    anchor = new Date(start);
    anchor.setMonth(anchor.getMonth() + months);
  }
  const days = Math.floor((end.getTime() - anchor.getTime()) / 86400000) + 1;
  return `${formatDateShort(startValue)} sampai ${formatDateShort(endValue)} (${months ? `${months} bulan` : ''}${months && days ? ' ' : ''}${days ? `${days} hari` : ''})`;
}

function DualCalendarRangePicker({
  start, end, onStart, onEnd, minDate,
}: {
  start: string; end: string; onStart: (v: string) => void; onEnd: (v: string) => void;
  /** Opsional (format YYYY-MM-DD). Tanggal sebelum ini dicoret & tidak bisa dipilih. */
  minDate?: string;
}) {
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const toDate = (v: string) => {
    if (!v) return null;
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const toValue = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const fmt = (v: string) => {
    const d = toDate(v);
    if (!d) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };
  const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const sameDay = (a: Date | null, b: Date) => Boolean(a && a.toDateString() === b.toDateString());
  const minD = toDate(minDate || '');

  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  const [hover, setHover] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(toDate(start) || new Date()));
  const wrapRef = useRef<HTMLDivElement>(null);

  const closePicker = () => { setOpen(false); setHover(null); };
  const openPicker = () => {
    const today = new Date();
    setDraftStart(start);
    setDraftEnd(end);
    setHover(null);
    setVisibleMonth(monthStart(toDate(start) || (minD && minD > today ? minD : today)));
    setOpen(true);
  };
  const applyPicker = () => {
    if (!draftStart || !draftEnd) return;
    onStart(draftStart);
    onEnd(draftEnd);
    closePicker();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closePicker();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePicker(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const ds = toDate(draftStart);
  const de = toDate(draftEnd);
  const previewEnd = de ?? (ds && hover && hover > ds ? hover : null);
  const isEdge = (d: Date) => sameDay(ds, d) || sameDay(de, d);
  const inRange = (d: Date) => Boolean(ds && previewEnd && d > ds && (de ? d < de : d <= previewEnd));

  const pickDate = (date: Date) => {
    const value = toValue(date);
    if (!draftStart || draftEnd || (ds && date < ds)) {
      setDraftStart(value);
      setDraftEnd('');
      return;
    }
    setDraftEnd(value);
    setHover(null);
  };

  const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  const baseYear = new Date().getFullYear();
  const yearFrom = Math.min(baseYear - 5, visibleMonth.getFullYear());
  const yearTo = Math.max(baseYear + 10, nextMonth.getFullYear());
  const years = Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearFrom + i);
  const canPrev = !minD || visibleMonth > monthStart(minD);
  const selectCls = 'rounded border border-slate-300 bg-white px-1 py-0.5 text-[12px] text-slate-700 focus:outline-none focus:border-[#2b7bbf]';

  const renderMonth = (month: Date, side: 'left' | 'right') => {
    const leading = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const offset = side === 'right' ? -1 : 0; // bulan kanan = visibleMonth + 1
    const setMonthYear = (y: number, m: number) => setVisibleMonth(new Date(y, m + offset, 1));

    const cells = Array.from({ length: 42 }, (_, i) => {
      const day = i - leading + 1;
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const inMonth = day >= 1 && day <= daysInMonth;
      const disabled = Boolean(minD && date < minD);
      if (!inMonth) {
        return (
          <div key={i} className={`flex h-9 items-center justify-center text-[13px] text-slate-300 ${disabled ? 'line-through' : ''}`}>
            {date.getDate()}
          </div>
        );
      }
      const edge = isEdge(date);
      const ranged = inRange(date);
      return (
        <button
          key={i}
          type="button"
          disabled={disabled && !edge}
          onClick={() => pickDate(date)}
          onMouseEnter={() => setHover(date)}
          className={`h-9 text-[13px] transition-colors ${
            edge ? 'rounded-[3px] bg-[#2b7bbf] font-semibold text-white'
              : disabled ? 'cursor-not-allowed text-slate-400 line-through'
              : ranged ? 'bg-[#e6f0f8] font-medium text-slate-700'
              : 'font-medium text-slate-700 hover:bg-slate-100'
          }`}
        >
          {date.getDate()}
        </button>
      );
    });

    return (
      <div>
        <div className="relative mb-3 flex h-8 items-center justify-center gap-1.5">
          {side === 'left' && canPrev && (
            <button type="button" aria-label="Bulan sebelumnya" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className="absolute left-0 flex h-7 w-7 items-center justify-center rounded text-[16px] font-bold text-slate-700 hover:bg-slate-100">‹</button>
          )}
          <select value={month.getMonth()} onChange={(e) => setMonthYear(month.getFullYear(), Number(e.target.value))} className={selectCls} aria-label="Bulan">
            {monthNames.map((name, idx) => <option key={name} value={idx}>{name}</option>)}
          </select>
          <select value={month.getFullYear()} onChange={(e) => setMonthYear(Number(e.target.value), month.getMonth())} className={selectCls} aria-label="Tahun">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {side === 'right' && (
            <button type="button" aria-label="Bulan berikutnya" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className="absolute right-0 flex h-7 w-7 items-center justify-center rounded text-[16px] font-bold text-slate-700 hover:bg-slate-100">›</button>
          )}
        </div>
        <div className="grid grid-cols-7 text-center">
          {dayNames.map((d) => <div key={d} className="py-2 text-[12px] font-bold text-slate-800">{d}</div>)}
          {cells}
        </div>
      </div>
    );
  };

  const trigger = (label: string, value: string, placeholder: string) => (
    <div>
      <Label req>{label}</Label>
      <button
        type="button"
        onClick={() => (open ? closePicker() : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`grid w-full grid-cols-[38px_1fr] overflow-hidden rounded-lg border bg-white text-left transition-all ${open ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-300 hover:border-slate-400'}`}
      >
        <span className="flex items-center justify-center border-r border-slate-300 bg-slate-100 text-slate-500"><Calendar className="h-4 w-4" /></span>
        <span className={`px-3 py-2.5 text-[13px] ${value ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>{value ? fmt(value) : placeholder}</span>
      </button>
    </div>
  );

  return (
    <div>
      <div ref={wrapRef} className="relative">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {trigger('Tanggal Mulai Sewa', start, 'Pilih tanggal mulai sewa')}
          {trigger('Tanggal Selesai Sewa', end, 'Klik untuk pilih tanggal selesai')}
        </div>
        {open && (
          <div role="dialog" aria-label="Pilih rentang tanggal sewa" className="absolute left-0 top-full z-50 mt-1 w-full max-w-full rounded-lg border border-slate-200 bg-white shadow-xl sm:w-[560px]" onMouseLeave={() => setHover(null)}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-4 pb-3 pt-4 sm:grid-cols-2">
              {renderMonth(visibleMonth, 'left')}
              {renderMonth(nextMonth, 'right')}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 border-t border-slate-200 px-4 py-3">
              <span className="text-[12px] text-slate-600">
                {draftStart ? `${fmt(draftStart)}${draftEnd ? ` to ${fmt(draftEnd)}` : ''}` : 'Pilih tanggal mulai lalu tanggal selesai'}
              </span>
              <button type="button" onClick={closePicker} className="text-[13px] font-semibold text-slate-600 hover:text-slate-800">Batal</button>
              <button
                type="button"
                onClick={applyPicker}
                disabled={!draftStart || !draftEnd}
                className="rounded-md bg-[#d1b063] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#c29f4f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#d1b063]"
              >
                Pilih
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
        {dateRangeDurationLabel(start, end) || 'Pilih tanggal mulai dan tanggal selesai.'}
      </div>
    </div>
  );
}

function parseVendorPicRows(value?: string): VendorPicRow[] {
  if (!value) return [{ nama: '', kontak: '' }];
  try {
    const parsed = JSON.parse(value) as VendorPicRow[];
    return parsed.length > 0 ? parsed.map((row) => ({ nama: row.nama || '', kontak: row.kontak || '' })) : [{ nama: '', kontak: '' }];
  } catch {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const bracketMatch = line.match(/^(.*?)\s*\((.*?)\)\s*$/);
        if (bracketMatch) return { nama: bracketMatch[1].trim(), kontak: bracketMatch[2].trim() };
        const [nama = '', kontak = ''] = line.split(/\s+-\s+/, 2);
        return { nama, kontak };
      });
  }
}

function formatVendorPicRows(value?: string) {
  const rows = parseVendorPicRows(value).filter((row) => row.nama.trim() || row.kontak.trim());
  return rows.map((row, index) => `PIC ${index + 1}: ${row.nama || '-'}${row.kontak ? ` (${row.kontak})` : ''}`).join('\n');
}

function MannaKampusLogo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      src={mannaKampusLogo}
      alt="Manna Kampus"
      className={compact ? 'h-8 w-auto object-contain' : 'h-9 w-auto max-w-[180px] object-contain'}
    />
  );
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
  const setProdukKonversiRow = (plu: string, patch: Partial<ListingConversionRow>) => {
    const key = `${plu}::konversi`;
    setField('produkKonversi', {
      ...state.produkKonversi,
      [key]: { ...(state.produkKonversi[key] || emptyListingConversionRow()), ...patch },
    });
  };
  const setVendorValue = (field: string, value: string) => setField('vendorValues', { ...state.vendorValues, [field]: value });
  const vendorPicRows = parseVendorPicRows(state.vendorValues.picList || getVendorOldValue(identity, 'picList'));
  const setVendorPicRows = (rows: VendorPicRow[]) => setVendorValue('picList', JSON.stringify(rows));
  const updateVendorPicRow = (index: number, field: keyof VendorPicRow, value: string) => {
    const rows = [...vendorPicRows];
    rows[index] = { ...rows[index], [field]: value };
    setVendorPicRows(rows);
  };
  const addVendorPicRow = () => setVendorPicRows([...vendorPicRows, { nama: '', kontak: '' }]);
  const removeVendorPicRow = (index: number) => {
    const rows = vendorPicRows.filter((_, rowIndex) => rowIndex !== index);
    setVendorPicRows(rows.length > 0 ? rows : [{ nama: '', kontak: '' }]);
  };

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
            <div><p className="text-[13px] font-bold text-slate-800">Update Profil Vendor</p><p className="text-[11px] text-slate-500 mt-0.5">Ubah alamat, NPWP, email, dan daftar PIC</p></div>
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
                        ) : field === 'hargaBeli' ? (
                          <div>
                            <ChangeField
                              oldValue={getProdukOldValue(product, field)}
                              newValue={state.produkValues[key] || ''}
                              onChange={(v) => setProdukValue(product.plu, field, v)}
                              placeholder="Harga pokok per pcs sebelum diskon/reguler"
                            />
                            <p className="mt-1.5 text-[11px] text-slate-400">Harga pokok per PCS, sudah termasuk PPN, dan merupakan harga sebelum diskon/reguler.</p>
                          </div>
                        ) : field === 'diskonReguler' ? (
                          <ChangeFieldWithSuffix
                            oldValue={getProdukOldValue(product, field)}
                            newValue={state.produkValues[key] || ''}
                            onChange={(v) => setProdukValue(product.plu, field, v)}
                            placeholder="cth: 10"
                            suffix="%"
                          />
                        ) : field === 'jatuhTempo' ? (
                          <ChangeFieldWithSuffix
                            oldValue={getProdukOldValue(product, field)}
                            newValue={state.produkValues[key] || ''}
                            onChange={(v) => setProdukValue(product.plu, field, v)}
                            placeholder="cth: 30"
                            suffix="hari"
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
                              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-4">
                                {(() => {
                                  const row = state.produkKonversi[key] || emptyListingConversionRow();
                                  const satuanBesar = row.satuan1 || 'kemasan besar';
                                  const satuanAntara = row.satuan2 || 'kemasan antara';
                                  const satuanKecil = row.satuan3 || 'satuan kecil';
                                  const hasMiddle = Boolean(row.qty2 && row.satuan2);
                                  const totalKecil = hasMiddle ? (row.qty2 || 0) * (row.qty3 || 0) : row.qty3 || 0;
                                  const preview = formatListingConversion(row) || 'Lengkapi konversi dari kemasan terbesar sampai satuan terkecil';

                                  return (
                                    <div className="space-y-4">
                                      <div className="rounded-lg border border-amber-300 bg-white px-3 py-2">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Preview Konversi</p>
                                        <p className="mt-1 text-[14px] font-black text-slate-800">{preview}</p>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <p className="mb-1.5 text-[11px] font-bold text-slate-600">1. Satuan terbesar</p>
                                          <select
                                            value={row.satuan1 || ''}
                                            onChange={(e) => setProdukKonversiRow(product.plu, { qty1: 1, satuan1: e.target.value })}
                                            className={`${inp} cursor-pointer`}
                                          >
                                            <option value="">Pilih, misal KARTON</option>
                                            {KONVERSI_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                                          </select>
                                        </div>
                                        <div>
                                          <p className="mb-1.5 text-[11px] font-bold text-slate-600">2. Isi antara (opsional)</p>
                                          <div className="grid grid-cols-[72px_1fr] gap-2">
                                            <input
                                              type="number"
                                              min={0}
                                              value={row.qty2 || ''}
                                              onChange={(e) => setProdukKonversiRow(product.plu, { qty1: 1, qty2: parseInt(e.target.value) || 0 })}
                                              className={inp}
                                              placeholder="12"
                                            />
                                            <select
                                              value={row.satuan2 || ''}
                                              onChange={(e) => setProdukKonversiRow(product.plu, { qty1: 1, satuan2: e.target.value })}
                                              className={`${inp} cursor-pointer`}
                                            >
                                              <option value="">Misal POUCH</option>
                                              {KONVERSI_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                                            </select>
                                          </div>
                                          <p className="mt-1 text-[10px] text-slate-400">Kosongkan kalau langsung ke satuan terkecil.</p>
                                        </div>
                                        <div>
                                          <p className="mb-1.5 text-[11px] font-bold text-slate-600">3. Isi satuan terkecil</p>
                                          <div className="grid grid-cols-[72px_1fr] gap-2">
                                            <input
                                              type="number"
                                              min={1}
                                              value={row.qty3 || ''}
                                              onChange={(e) => setProdukKonversiRow(product.plu, { qty1: 1, qty3: parseInt(e.target.value) || 0 })}
                                              className={inp}
                                              placeholder={hasMiddle ? '10' : '48'}
                                            />
                                            <select
                                              value={row.satuan3 || ''}
                                              onChange={(e) => setProdukKonversiRow(product.plu, { qty1: 1, satuan3: e.target.value })}
                                              className={`${inp} cursor-pointer`}
                                            >
                                              <option value="">Misal PCS</option>
                                              {KONVERSI_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                                            </select>
                                          </div>
                                          <p className="mt-1 text-[10px] text-slate-400">{hasMiddle ? `Isi 1 ${satuanAntara} berapa ${satuanKecil}.` : `Isi 1 ${satuanBesar} berapa ${satuanKecil}.`}</p>
                                        </div>
                                      </div>

                                      <div className="rounded-lg bg-slate-900 px-3 py-2 text-[12px] text-white">
                                        {hasMiddle ? (
                                          <>Artinya: <span className="font-bold">1 {satuanBesar}</span> berisi <span className="font-bold">{row.qty2 || '...'} {satuanAntara}</span>, dan <span className="font-bold">1 {satuanAntara}</span> berisi <span className="font-bold">{row.qty3 || '...'} {satuanKecil}</span>. Total <span className="font-bold">1 {satuanBesar}</span> = <span className="font-bold">{totalKecil || '...'} {satuanKecil}</span>.</>
                                        ) : (
                                          <>Artinya: <span className="font-bold">1 {satuanBesar}</span> langsung berisi <span className="font-bold">{row.qty3 || '...'} {satuanKecil}</span>.</>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
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
              <Label req>{VENDOR_UPDATE_FIELDS.find((f) => f.key === field)?.label}</Label>
              {field === 'picList' ? (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:items-start">
                  <div>
                    <Label>Data Sebelumnya</Label>
                    <div className="px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 text-slate-600">
                      {getVendorOldValue(identity, field) || <span className="italic text-slate-400">Belum ada data</span>}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block mt-9" />
                  <div>
                    <Label req>Data Baru (bisa lebih dari satu PIC)</Label>
                    <div className="space-y-3">
                      {vendorPicRows.map((pic, index) => (
                        <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">PIC {index + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeVendorPicRow(index)}
                              disabled={vendorPicRows.length === 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={`Hapus PIC ${index + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={pic.nama}
                              onChange={(e) => updateVendorPicRow(index, 'nama', e.target.value)}
                              className={inp}
                              placeholder="Nama PIC"
                            />
                            <input
                              type="text"
                              value={pic.kontak}
                              onChange={(e) => updateVendorPicRow(index, 'kontak', e.target.value)}
                              className={inp}
                              placeholder="No. telepon / WhatsApp"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVendorPicRow}
                        className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white py-3 text-[13px] font-semibold text-slate-500 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 inline-flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />Tambah PIC
                      </button>
                      <p className="text-[11px] leading-relaxed text-slate-400">Daftar ini akan menggantikan daftar PIC sebelumnya. Hapus PIC yang sudah tidak aktif dan tambahkan PIC baru bila perlu.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <ChangeField oldValue={getVendorOldValue(identity, field)} newValue={state.vendorValues[field] || ''} onChange={(v) => setVendorValue(field, v)} />
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
          <div className="absolute left-0 top-full mt-1.5 w-full z-[9999] bg-white rounded-xl border border-slate-200 shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-100">
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
              <span className="font-mono text-[10px] text-slate-400">({p.plu})</span>
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
  useEffect(() => {
    if (productScope !== 'per-plu') {
      setProductScope('per-plu');
      setProducts([]);
      setSelectedSubCategory('');
    }
  }, [productScope, setProductScope, setProducts, setSelectedSubCategory]);

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
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-[13px] font-bold text-amber-800">Per PLU</p>
          <p className="mt-1 text-[11px] text-amber-700">Program wajib memilih produk satu per satu berdasarkan PLU.</p>
        </div>
      </div>

      <div>
        <Label req>Pilih Produk</Label>
        <PluMultiSelect selected={products} onChange={setProducts} />
      </div>

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
  caraPembayaran: string;
  periodeAwal: string;
  periodeAkhir: string;
}

/** Independently activatable PPN + PPh chooser. Reused anywhere a transaction may be taxed:
 *  Off Faktur programs, Sewa/Visibility, Reward/Rabat/Insentif, and Listing. */
function KetentuanPajakSection({ ppnAktif, ppnRate, onPpnAktif, onPpnRate, pphAktif, pphRate, onPphAktif, onPphRate, errors, ppnOptions = PPN_RATE_OPTIONS, pphOptions = PPH_RATE_OPTIONS }: {
  ppnAktif: boolean; ppnRate: string; onPpnAktif: (v: boolean) => void; onPpnRate: (v: string) => void;
  pphAktif: boolean; pphRate: string; onPphAktif: (v: boolean) => void; onPphRate: (v: string) => void;
  errors?: { ppnRate?: string; pphRate?: string };
  ppnOptions?: string[]; pphOptions?: string[];
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
                {ppnOptions.map((o) => <option key={o}>{o}</option>)}
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
                {pphOptions.map((o) => <option key={o}>{o}</option>)}
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
  const paymentDueDate = addMonthsDateLabel(state.periodeAkhir, 2);
  return (
    <Card title="Informasi Program" icon={Tag} subtitle="Program dapat mencakup lebih dari satu tipe sekaligus">
      <div><Label req>Nama Program</Label><input type="text" value={state.namaProgram} onChange={(e) => setField('namaProgram', e.target.value)} className={errors.namaProgram ? inpErr : inp} placeholder="cth: Program Akhir Tahun 2026" /><FieldError message={errors.namaProgram} /></div>

      <div>
        <Label req>Tipe Program</Label>
        <MultiChoiceChips options={PROGRAM_TIPE_OPTIONS} value={state.tipe} onChange={(v) => setField('tipe', v)} />
        <FieldError message={errors.tipe} />
        <p className="mt-2 text-[11px] text-slate-400">Bisa memilih lebih dari satu, misalnya On Faktur dan Off Faktur dalam satu program.</p>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
          <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
          Ketentuan Pajak
        </p>
        <p className="text-[11px] text-slate-400 mb-3">PPN dan PPh bisa aktif/nonaktif masing-masing. PPN program hanya memakai tarif 11%.</p>
        <KetentuanPajakSection
          ppnAktif={state.ppnAktif} ppnRate={state.ppnRate} onPpnAktif={(v) => { setField('ppnAktif', v); if (v) setField('ppnRate', 'PPN 11%'); }} onPpnRate={(v) => setField('ppnRate', v)}
          pphAktif={state.pphAktif} pphRate={state.pphRate} onPphAktif={(v) => setField('pphAktif', v)} onPphRate={(v) => setField('pphRate', v)}
          errors={{ ppnRate: errors.ppnRate, pphRate: errors.pphRate }}
        />
      </div>

      <div>
        <Label req>Redaksi</Label>
        <textarea
          rows={4}
          value={state.redaksi}
          onChange={(e) => setField('redaksi', e.target.value)}
          className={`${errors.redaksi ? inpErr : inp} min-h-28 resize-y`}
          placeholder={'Atas Nama PT ...\nTuliskan kalimat redaksi program di sini...'}
        />
        <p className="mt-1.5 text-[11px] text-slate-400">Guidance: tulis Atas Nama PT terlebih dahulu, lalu lanjutkan dengan kalimat redaksi program.</p>
        <FieldError message={errors.redaksi} />
      </div>

      <div>
        <Label req>Periode Program</Label>
        <PeriodeRange awal={state.periodeAwal} akhir={state.periodeAkhir} onAwal={(v) => setField('periodeAwal', v)} onAkhir={(v) => setField('periodeAkhir', v)} />
        <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
          Durasi: {dateRangeDurationLabel(state.periodeAwal, state.periodeAkhir) || 'Pilih Periode Dari dan Periode Sampai.'}
        </div>
        <FieldError message={errors.periodeAwal || errors.periodeAkhir} />
        <PaymentDueWarning dueDate={paymentDueDate} />
      </div>
    </Card>
  );
}

/* ───────────────────────── Step: Detail Program (per-produk + budget) ───────────────────────── */
interface OnFakturProductRow {
  diskonMode: DiskonMode;
  diskonBasis: string;
  diskonValue: number;
  bandedAktif: boolean;
  banded: string;
  strataMinQty: number;
  strataSatuan: string;
  alokasiQty: number;
  budgetAktif: boolean;
  budgetNominal: number;
  keterangan: string;
}
const emptyOnFakturProductRow = (): OnFakturProductRow => ({
  diskonMode: 'persen', diskonBasis: '', diskonValue: 0, bandedAktif: false, banded: '', strataMinQty: 0, strataSatuan: 'PCS', alokasiQty: 0, budgetAktif: false, budgetNominal: 0, keterangan: '',
});

interface OffFakturProductRow {
  diskonMode: DiskonMode;
  diskonBasis: string;
  diskonValue: number;
  kuponVoucherAktif: boolean;
  kuponVoucher: string;
  freeProdukAktif: boolean;
  freeProdukKeterangan: string;
  offAlokasiQty: number;
  budgetAktif: boolean;
  budgetNominal: number;
  keterangan: string;
}
const emptyOffFakturProductRow = (): OffFakturProductRow => ({
  diskonMode: 'persen', diskonBasis: '', diskonValue: 0, kuponVoucherAktif: false, kuponVoucher: '', freeProdukAktif: false, freeProdukKeterangan: '',
  offAlokasiQty: 0, budgetAktif: false, budgetNominal: 0, keterangan: '',
});

interface BudgetLinkState { keterangan: string; nominal: number; }

interface OnFakturGroup {
  id: string;
  keterangan: string;
  diskonMode: DiskonMode;
  diskonBasis: string;
  diskonValue: number;
  products: Product[];
  rows: Record<string, OnFakturProductRow>;
}

interface OffFakturGroup {
  id: string;
  keterangan: string;
  diskonMode: DiskonMode;
  diskonBasis: string;
  diskonValue: number;
  products: Product[];
  rows: Record<string, OffFakturProductRow>;
}

const emptyOnFakturGroup = (): OnFakturGroup => ({
  id: `on-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  keterangan: '',
  diskonMode: 'rp',
  diskonBasis: '',
  diskonValue: 0,
  products: [],
  rows: {},
});

const emptyOffFakturGroup = (): OffFakturGroup => ({
  id: `off-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  keterangan: '',
  diskonMode: 'rp',
  diskonBasis: '',
  diskonValue: 0,
  products: [],
  rows: {},
});

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
          <DiskonModeToggle value={row.diskonMode} onChange={(v) => { setField('diskonMode', v); if (v !== 'persen') setField('diskonBasis', ''); }} />
          <input type="number" min={0} value={row.diskonValue || ''} onChange={(e) => setField('diskonValue', parseFloat(e.target.value) || 0)}
            placeholder={row.diskonMode === 'persen' ? 'Persentase diskon...' : 'Nominal potongan (Rp)...'} className={`${inp} sm:max-w-xs`} />
        </div>
        {row.diskonMode === 'persen' && (
          <div className="mt-3">
            <Label req>Basis Persentase</Label>
            <SingleChoiceChips options={DISKON_BASIS_OPTIONS} value={row.diskonBasis} onChange={(v) => setField('diskonBasis', v)} />
          </div>
        )}
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
        <div>
          <Label>Syarat Strata (Min. Order)</Label>
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <input type="number" min={0} value={row.strataMinQty || ''} onChange={(e) => setField('strataMinQty', parseInt(e.target.value) || 0)} className={inp} placeholder="0" />
            <select value={row.strataSatuan} onChange={(e) => setField('strataSatuan', e.target.value)} className={`${inp} cursor-pointer`}>
              {STRATA_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><Label>Alokasi (PCS)</Label><input type="number" min={0} value={row.alokasiQty || ''} onChange={(e) => setField('alokasiQty', parseInt(e.target.value) || 0)} className={inp} placeholder="0" /></div>
      </div>

      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div><Label>Penggunaan Budget</Label><p className="text-[11px] text-slate-500">Nominal budget per produk dalam Rupiah.</p></div>
          <YesNoToggle value={row.budgetAktif} onChange={(v) => { setField('budgetAktif', v); if (!v) setField('budgetNominal', 0); }} />
        </div>
        {row.budgetAktif && <div className="mt-3 max-w-xs"><input type="number" min={0} value={row.budgetNominal || ''} onChange={(e) => setField('budgetNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="Nominal budget Rp" /></div>}
      </div>

      <div><Label>Keterangan Produk</Label><textarea rows={3} value={row.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Catatan khusus untuk produk ini (opsional)" /></div>
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
          <DiskonModeToggle value={row.diskonMode} onChange={(v) => { setField('diskonMode', v); if (v !== 'persen') setField('diskonBasis', ''); }} />
          <input type="number" min={0} value={row.diskonValue || ''} onChange={(e) => setField('diskonValue', parseFloat(e.target.value) || 0)}
            placeholder={row.diskonMode === 'persen' ? 'Persentase diskon...' : 'Nominal potongan (Rp)...'} className={`${inp} sm:max-w-xs`} />
        </div>
        {row.diskonMode === 'persen' && (
          <div className="mt-3">
            <Label req>Basis Persentase</Label>
            <SingleChoiceChips options={DISKON_BASIS_OPTIONS} value={row.diskonBasis} onChange={(v) => setField('diskonBasis', v)} />
          </div>
        )}
        <p className="mt-1.5 text-[11px] text-slate-400">Potongan tiap produk boleh berbeda — sebagian Rp, sebagian persentase.</p>
      </div>

      <div>
        <Label>Kupon dan Voucher</Label>
        <YesNoToggle value={row.kuponVoucherAktif} onChange={(v) => { setField('kuponVoucherAktif', v); if (!v) setField('kuponVoucher', ''); }} />
        {row.kuponVoucherAktif && (
          <div className="mt-3">
            <textarea rows={3} value={row.kuponVoucher} onChange={(e) => setField('kuponVoucher', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Keterangan kupon/voucher..." />
          </div>
        )}
      </div>
      <div>
        <Label>Free Produk</Label>
        <YesNoToggle value={row.freeProdukAktif} onChange={(v) => setField('freeProdukAktif', v)} />
        {row.freeProdukAktif && (
          <div className="mt-3">
            <textarea rows={3} value={row.freeProdukKeterangan} onChange={(e) => setField('freeProdukKeterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Keterangan produk gratis..." />
            <p className="mt-1.5 text-[11px] text-slate-400">Nilai produk otomatis tercatat sebagai Rp 0.</p>
          </div>
        )}
      </div>
      <div><Label>Alokasi (PCS)</Label><input type="number" min={0} value={row.offAlokasiQty || ''} onChange={(e) => setField('offAlokasiQty', parseInt(e.target.value) || 0)} className={`${inp} sm:max-w-xs`} placeholder="Jumlah PCS" /></div>

      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div><Label>Penggunaan Budget</Label><p className="text-[11px] text-slate-500">Nominal budget per produk dalam Rupiah.</p></div>
          <YesNoToggle value={row.budgetAktif} onChange={(v) => { setField('budgetAktif', v); if (!v) setField('budgetNominal', 0); }} />
        </div>
        {row.budgetAktif && <div className="mt-3 max-w-xs"><input type="number" min={0} value={row.budgetNominal || ''} onChange={(e) => setField('budgetNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="Nominal budget Rp" /></div>}
      </div>

      <div><Label>Keterangan Produk</Label><textarea rows={3} value={row.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Catatan khusus untuk produk ini (opsional)" /></div>
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
        <div><Label req>Keterangan Penggunaan Budget</Label><textarea rows={3} value={state.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="cth: Support biaya event akhir tahun" /></div>
        <div className="max-w-xs"><Label req>Nominal (Rp)</Label><input type="number" min={0} value={state.nominal || ''} onChange={(e) => setField('nominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" /></div>
      </div>
    </div>
  );
}

function OnFakturProductDetailCard({ product, row, setField }: {
  product: Product; row: OnFakturProductRow;
  setField: <K extends keyof OnFakturProductRow>(f: K, v: OnFakturProductRow[K]) => void;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <p className="text-[12.5px] font-bold text-slate-800">{product.nama}</p>
        <span className="text-[10px] font-mono text-slate-400">{product.plu}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Banded</Label>
          <YesNoToggle value={row.bandedAktif} onChange={(v) => { setField('bandedAktif', v); if (!v) setField('banded', ''); }} />
          {row.bandedAktif && <div className="mt-3"><input type="text" value={row.banded} onChange={(e) => setField('banded', e.target.value)} className={inp} placeholder="cth: Beli 2 Gratis 1" /></div>}
        </div>
        <div>
          <Label>Syarat Strata (Min. Order)</Label>
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <input type="number" min={0} value={row.strataMinQty || ''} onChange={(e) => setField('strataMinQty', parseInt(e.target.value) || 0)} className={inp} placeholder="0" />
            <select value={row.strataSatuan} onChange={(e) => setField('strataSatuan', e.target.value)} className={`${inp} cursor-pointer`}>
              {STRATA_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><Label>Alokasi Produk (PCS)</Label><input type="number" min={0} value={row.alokasiQty || ''} onChange={(e) => setField('alokasiQty', parseInt(e.target.value) || 0)} className={inp} placeholder="0" /></div>
      </div>
      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div><Label>Penggunaan Budget</Label><p className="text-[11px] text-slate-500">Nominal budget per PLU dalam Rupiah.</p></div>
          <YesNoToggle value={row.budgetAktif} onChange={(v) => { setField('budgetAktif', v); if (!v) setField('budgetNominal', 0); }} />
        </div>
        {row.budgetAktif && <div className="mt-3 max-w-xs"><input type="number" min={0} value={row.budgetNominal || ''} onChange={(e) => setField('budgetNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="Nominal budget Rp" /></div>}
      </div>
      <div><Label>Keterangan Produk</Label><textarea rows={3} value={row.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Catatan khusus untuk produk ini (opsional)" /></div>
    </div>
  );
}

function OffFakturProductDetailCard({ product, row, setField }: {
  product: Product; row: OffFakturProductRow;
  setField: <K extends keyof OffFakturProductRow>(f: K, v: OffFakturProductRow[K]) => void;
}) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-white p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <p className="text-[12.5px] font-bold text-slate-800">{product.nama}</p>
        <span className="text-[10px] font-mono text-slate-400">{product.plu}</span>
      </div>
      <div>
        <Label>Kupon dan Voucher</Label>
        <YesNoToggle value={row.kuponVoucherAktif} onChange={(v) => { setField('kuponVoucherAktif', v); if (!v) setField('kuponVoucher', ''); }} />
        {row.kuponVoucherAktif && <div className="mt-3"><textarea rows={3} value={row.kuponVoucher} onChange={(e) => setField('kuponVoucher', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Keterangan kupon/voucher..." /></div>}
      </div>
      <div>
        <Label>Free Produk</Label>
        <YesNoToggle value={row.freeProdukAktif} onChange={(v) => setField('freeProdukAktif', v)} />
        {row.freeProdukAktif && <div className="mt-3"><textarea rows={3} value={row.freeProdukKeterangan} onChange={(e) => setField('freeProdukKeterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Keterangan produk gratis..." /></div>}
      </div>
      <div><Label>Alokasi Produk (PCS)</Label><input type="number" min={0} value={row.offAlokasiQty || ''} onChange={(e) => setField('offAlokasiQty', parseInt(e.target.value) || 0)} className={`${inp} sm:max-w-xs`} placeholder="Jumlah PCS" /></div>
      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div><Label>Penggunaan Budget</Label><p className="text-[11px] text-slate-500">Nominal budget per PLU dalam Rupiah.</p></div>
          <YesNoToggle value={row.budgetAktif} onChange={(v) => { setField('budgetAktif', v); if (!v) setField('budgetNominal', 0); }} />
        </div>
        {row.budgetAktif && <div className="mt-3 max-w-xs"><input type="number" min={0} value={row.budgetNominal || ''} onChange={(e) => setField('budgetNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="Nominal budget Rp" /></div>}
      </div>
      <div><Label>Keterangan Produk</Label><textarea rows={3} value={row.keterangan} onChange={(e) => setField('keterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Catatan khusus untuk produk ini (opsional)" /></div>
    </div>
  );
}

function ProgramDetailStep({
  tipe,
  onGroups, updateOnGroup, updateOnGroupProducts, updateOnGroupRow, addOnGroup, removeOnGroup, onError,
  offGroups, updateOffGroup, updateOffGroupProducts, updateOffGroupRow, addOffGroup, removeOffGroup, offError,
}: {
  tipe: string[];
  onGroups: OnFakturGroup[];
  updateOnGroup: <K extends keyof OnFakturGroup>(index: number, field: K, val: OnFakturGroup[K]) => void;
  updateOnGroupProducts: (index: number, products: Product[]) => void;
  updateOnGroupRow: (index: number, plu: string, field: keyof OnFakturProductRow, val: string | number | boolean) => void;
  addOnGroup: () => void;
  removeOnGroup: (index: number) => void;
  onError?: string;
  offGroups: OffFakturGroup[];
  updateOffGroup: <K extends keyof OffFakturGroup>(index: number, field: K, val: OffFakturGroup[K]) => void;
  updateOffGroupProducts: (index: number, products: Product[]) => void;
  updateOffGroupRow: (index: number, plu: string, field: keyof OffFakturProductRow, val: string | number | boolean) => void;
  addOffGroup: () => void;
  removeOffGroup: (index: number) => void;
  offError?: string;
}) {
  const hasOn = tipe.includes('on-faktur');
  const hasOff = tipe.includes('off-faktur');
  const renderDiscountFields = (
    mode: DiskonMode,
    basis: string,
    value: number,
    onMode: (v: DiskonMode) => void,
    onBasis: (v: string) => void,
    onValue: (v: number) => void,
    showBasis: boolean,
  ) => (
    <div>
      <Label req>Nilai Potongan Kelompok</Label>
      <div className="flex flex-col sm:flex-row gap-3">
        <DiskonModeToggle value={mode} onChange={(v) => { onMode(v); if (v !== 'persen') onBasis(''); }} />
        <input
          type="number"
          min={0}
          value={value || ''}
          onChange={(e) => onValue(parseFloat(e.target.value) || 0)}
          placeholder={mode === 'persen' ? 'Persentase potongan...' : 'Nominal potongan per satuan...'}
          className={inp}
        />
      </div>
      {showBasis && mode === 'persen' && (
        <div className="mt-3">
          <Label req>Basis Persentase</Label>
          <SingleChoiceChips options={DISKON_BASIS_OPTIONS} value={basis} onChange={onBasis} />
        </div>
      )}
    </div>
  );

  return (
    <Card title="Kelompok Potongan & Produk" icon={Receipt} subtitle="Kelompokkan PLU yang memiliki nilai potongan sama">
      {hasOn && (
        <div className="space-y-4">
          <InfoNote tone="amber">Buat satu kelompok untuk PLU dengan nilai potongan yang sama. Banded, syarat strata, alokasi, budget, dan keterangan tetap diisi per PLU.</InfoNote>
          <FieldError message={onError} />
          {onGroups.map((group, index) => (
            <div key={group.id} className="rounded-xl border border-amber-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-[12px] font-bold">{index + 1}</div>
                  <div><p className="text-[13px] font-bold text-amber-900">Kelompok Potongan On Faktur #{index + 1}</p><p className="text-[11px] text-amber-700">{group.products.length} produk</p></div>
                </div>
                <button type="button" onClick={() => removeOnGroup(index)} disabled={onGroups.length === 1} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div><Label>Keterangan Kelompok</Label><input type="text" value={group.keterangan} onChange={(e) => updateOnGroup(index, 'keterangan', e.target.value)} className={inp} placeholder="Keterangan tambahan untuk kelompok ini..." /></div>
                {renderDiscountFields(
                  group.diskonMode,
                  group.diskonBasis,
                  group.diskonValue,
                  (v) => updateOnGroup(index, 'diskonMode', v),
                  (v) => updateOnGroup(index, 'diskonBasis', v),
                  (v) => updateOnGroup(index, 'diskonValue', v),
                  false,
                )}
                <div><Label req>Tambah Produk ke Kelompok Ini</Label><PluMultiSelect selected={group.products} onChange={(products) => updateOnGroupProducts(index, products)} /></div>
                {group.products.length > 0 && (
                  <div className="space-y-3">
                    {group.products.map((product) => (
                      <OnFakturProductDetailCard key={product.plu} product={product} row={group.rows[product.plu] || emptyOnFakturProductRow()} setField={(field, val) => updateOnGroupRow(index, product.plu, field, val)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addOnGroup} className="w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 py-3 text-[13px] font-bold text-amber-700 transition-all hover:bg-amber-50 inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Tambah Kelompok Potongan On Faktur</button>
        </div>
      )}
      {hasOff && (
        <div className="space-y-4">
          <InfoNote tone="indigo">Buat satu kelompok untuk PLU dengan nilai potongan yang sama. Kupon/voucher, free produk, alokasi, budget, dan keterangan tetap diisi per PLU.</InfoNote>
          <FieldError message={offError} />
          {offGroups.map((group, index) => (
            <div key={group.id} className="rounded-xl border border-indigo-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-indigo-200 bg-indigo-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[12px] font-bold">{index + 1}</div>
                  <div><p className="text-[13px] font-bold text-indigo-900">Kelompok Potongan Off Faktur #{index + 1}</p><p className="text-[11px] text-indigo-700">{group.products.length} produk</p></div>
                </div>
                <button type="button" onClick={() => removeOffGroup(index)} disabled={offGroups.length === 1} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div><Label>Keterangan Kelompok</Label><input type="text" value={group.keterangan} onChange={(e) => updateOffGroup(index, 'keterangan', e.target.value)} className={inp} placeholder="Keterangan tambahan untuk kelompok ini..." /></div>
                {renderDiscountFields(
                  group.diskonMode,
                  group.diskonBasis,
                  group.diskonValue,
                  (v) => updateOffGroup(index, 'diskonMode', v),
                  (v) => updateOffGroup(index, 'diskonBasis', v),
                  (v) => updateOffGroup(index, 'diskonValue', v),
                  true,
                )}
                <div><Label req>Tambah Produk ke Kelompok Ini</Label><PluMultiSelect selected={group.products} onChange={(products) => updateOffGroupProducts(index, products)} /></div>
                {group.products.length > 0 && (
                  <div className="space-y-3">
                    {group.products.map((product) => (
                      <OffFakturProductDetailCard key={product.plu} product={product} row={group.rows[product.plu] || emptyOffFakturProductRow()} setField={(field, val) => updateOffGroupRow(index, product.plu, field, val)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addOffGroup} className="w-full rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 py-3 text-[13px] font-bold text-indigo-700 transition-all hover:bg-indigo-50 inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Tambah Kelompok Potongan Off Faktur</button>
        </div>
      )}
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

function ListingConversionEditor({ row, onChange }: { row: ListingProductRow; onChange: (field: keyof ListingProductRow, value: string | number) => void }) {
  const conversion = {
    qty1: row.konversiQty1,
    satuan1: row.konversiSatuan1,
    qty2: row.konversiQty2,
    satuan2: row.konversiSatuan2,
    qty3: row.konversiQty3,
    satuan3: row.konversiSatuan3,
  };
  const satuanBesar = row.konversiSatuan1 || 'kemasan besar';
  const satuanAntara = row.konversiSatuan2 || 'kemasan antara';
  const satuanKecil = row.konversiSatuan3 || 'satuan kecil';
  const hasMiddle = Boolean(row.konversiQty2 && row.konversiSatuan2);
  const totalKecil = hasMiddle ? (row.konversiQty2 || 0) * (row.konversiQty3 || 0) : row.konversiQty3 || 0;
  const preview = formatListingConversion(conversion) || 'Lengkapi konversi dari kemasan terbesar sampai satuan terkecil';

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-4">
      <div className="rounded-lg border border-amber-300 bg-white px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Preview Konversi</p>
        <p className="mt-1 text-[14px] font-black text-slate-800">{preview}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-slate-600">1. Satuan terbesar</p>
          <select value={row.konversiSatuan1 || ''} onChange={(e) => { onChange('konversiQty1', 1); onChange('konversiSatuan1', e.target.value); }} className={`${inp} cursor-pointer`}>
            <option value="">Pilih, misal KARTON</option>
            {KONVERSI_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-slate-600">2. Isi antara (opsional)</p>
          <div className="grid grid-cols-[72px_1fr] gap-2">
            <input type="number" min={0} value={row.konversiQty2 || ''} onChange={(e) => onChange('konversiQty2', parseInt(e.target.value) || 0)} className={inp} placeholder="12" />
            <select value={row.konversiSatuan2 || ''} onChange={(e) => onChange('konversiSatuan2', e.target.value)} className={`${inp} cursor-pointer`}>
              <option value="">Misal POUCH</option>
              {KONVERSI_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Kosongkan kalau langsung ke satuan terkecil.</p>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-slate-600">3. Isi satuan terkecil</p>
          <div className="grid grid-cols-[72px_1fr] gap-2">
            <input type="number" min={1} value={row.konversiQty3 || ''} onChange={(e) => onChange('konversiQty3', parseInt(e.target.value) || 0)} className={inp} placeholder={hasMiddle ? '10' : '48'} />
            <select value={row.konversiSatuan3 || ''} onChange={(e) => onChange('konversiSatuan3', e.target.value)} className={`${inp} cursor-pointer`}>
              <option value="">Misal PCS</option>
              {KONVERSI_UNIT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">{hasMiddle ? `Isi 1 ${satuanAntara} berapa ${satuanKecil}.` : `Isi 1 ${satuanBesar} berapa ${satuanKecil}.`}</p>
        </div>
      </div>
      <div className="rounded-lg bg-slate-900 px-3 py-2 text-[12px] text-white">
        {hasMiddle ? (
          <>Artinya: <span className="font-bold">1 {satuanBesar}</span> berisi <span className="font-bold">{row.konversiQty2 || '...'} {satuanAntara}</span>, dan <span className="font-bold">1 {satuanAntara}</span> berisi <span className="font-bold">{row.konversiQty3 || '...'} {satuanKecil}</span>. Total <span className="font-bold">1 {satuanBesar}</span> = <span className="font-bold">{totalKecil || '...'} {satuanKecil}</span>.</>
        ) : (
          <>Artinya: <span className="font-bold">1 {satuanBesar}</span> langsung berisi <span className="font-bold">{row.konversiQty3 || '...'} {satuanKecil}</span>.</>
        )}
      </div>
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
  sewaHargaPajak: string;
  sewaCaraPembayaran: string;
  sewaDurasiBulan: number;
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
  rewardHargaPajak: string;
  target: string;
  rewardMode: DiskonMode;
  rewardValue: number;
  rewardPeriodeAwal: string; rewardPeriodeAkhir: string;
  rewardKeterangan: string;
  rewardPpnAktif: boolean; rewardPpnRate: string;
  rewardPphAktif: boolean; rewardPphRate: string;
  // Promosi
  mediaTipe: string; mediaKeterangan: string;
  promosiNominal: number;
  promosiHargaPajak: string;
  promosiCaraPembayaran: string;
  promosiPeriodeAwal: string;
  promosiDurasiBulan: number;
  promosiPpnAktif: boolean; promosiPpnRate: string;
  promosiPphAktif: boolean; promosiPphRate: string;
  // Listing (satu memo bisa mendaftarkan lebih dari satu produk)
  listingProducts: ListingProductRow[];
  listingPkp: boolean | null; listingReturn: boolean | null; listingBiayaLabel: boolean | null;
  listingNominal: number; listingHargaPajak: string;
  listingTempoPembayaran: string; listingCaraPembayaran: string;
  listingPpnAktif: boolean; listingPpnRate: string;
  listingPphAktif: boolean; listingPphRate: string;
  // Event dan BLBMS
  eventJenis: string; eventJenisLainnya: string;
  eventBentuk: string;
  eventMediaJenis: string[];
  eventMediaDetails: EventMediaDetailRow[];
  eventNominal: number;
  eventHargaPajak: string;
  eventCaraPembayaran: string;
  eventDurasiBulan: number;
  eventPeriodeAwal: string; eventPeriodeAkhir: string;
  eventKeterangan: string;
  eventPpnAktif: boolean; eventPpnRate: string;
  eventPphAktif: boolean; eventPphRate: string;
}

interface EventMediaDetailRow {
  id: string;
  mediaJenis: string;
  nama: string;
  nominal: number;
  tanggalMulai: string;
  tanggalSelesai: string;
}

function PendapatanStep({ state, setField, errors, mode = 'detail' }: { state: PendapatanState; setField: <K extends keyof PendapatanState>(f: K, v: PendapatanState[K]) => void; errors: FormErrors; mode?: 'jenis' | 'detail' }) {
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
  const addEventMediaDetail = (mediaJenis: string) => {
    setField('eventMediaDetails', [
      ...state.eventMediaDetails,
      { id: `${mediaJenis}-${Date.now()}`, mediaJenis, nama: '', nominal: 0, tanggalMulai: state.eventPeriodeAwal || '', tanggalSelesai: '' },
    ]);
  };
  const updateEventMediaDetail = (id: string, patch: Partial<EventMediaDetailRow>) => {
    setField('eventMediaDetails', state.eventMediaDetails.map((row) => row.id === id ? { ...row, ...patch } : row));
  };
  const removeEventMediaDetail = (id: string) => setField('eventMediaDetails', state.eventMediaDetails.filter((row) => row.id !== id));
  const eventDetailDuration = (row: EventMediaDetailRow) => {
    if (!row.tanggalMulai || !row.tanggalSelesai) return 'Pilih tanggal mulai dan selesai.';
    const start = new Date(`${row.tanggalMulai}T00:00:00`);
    const end = new Date(`${row.tanggalSelesai}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 'Tanggal selesai harus setelah tanggal mulai.';
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    let anchor = new Date(start);
    anchor.setMonth(anchor.getMonth() + months);
    if (anchor > end) {
      months -= 1;
      anchor = new Date(start);
      anchor.setMonth(anchor.getMonth() + months);
    }
    const days = Math.floor((end.getTime() - anchor.getTime()) / 86400000) + 1;
    return `${months > 0 ? `${months} bulan` : ''}${months > 0 && days > 0 ? ' ' : ''}${days > 0 ? `${days} hari` : ''}` || '0 hari';
  };
  const eventUsesMediaDetails = state.eventBentuk === 'Media Display Produk';

  return (
    <Card title={mode === 'jenis' ? 'Pilih Jenis Program' : 'Detail Program Lain-lain'} icon={Building2} subtitle={mode === 'jenis' ? 'Pilih jenis program yang ingin diajukan' : 'Lengkapi detail berdasarkan jenis program yang dipilih'}>
      {mode === 'jenis' && (
        <>
      <div>
        <Label req>Jenis Program</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VISIBLE_PENDAPATAN_OPTIONS.map((o) => {
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
        </>
      )}

      {mode === 'detail' && (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jenis Program</p>
            <p className="mt-1 text-[13px] font-bold text-slate-800">{PENDAPATAN_OPTIONS.find((o) => o.key === state.jenis)?.label || '-'}</p>
          </div>

          <div>
            <Label req>Nama Program / Kegiatan</Label>
            <input
              type="text"
              value={state.namaProgram}
              onChange={(e) => setField('namaProgram', e.target.value)}
              className={errors.namaProgram ? inpErr : inp}
              placeholder="cth: Program Event Reguler"
            />
            <FieldError message={errors.namaProgram} />
          </div>

      {state.jenis === 'sewa-visibility' && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <Label req>Jenis Sewa / Visibility</Label>
            <SingleChoiceChips options={SEWA_VISIBILITY_JENIS.map((s) => ({ key: s, label: s }))} value={state.sewaJenis} onChange={(v) => setField('sewaJenis', v)} />
            <FieldError message={errors.sewaJenis} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label req>Nilai Sewa per Bulan (Rp)</Label>
              <input type="number" min={0} value={state.sewaNominal || ''} onChange={(e) => setField('sewaNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" />
              <p className="mt-1 text-[11px] text-slate-400">Nominal diisi per bulan.</p>
            </div>
            <div>
              <Label req>Harga Tersebut</Label>
              <SingleChoiceChips options={[{ key: 'exclude', label: 'Exclude Pajak', tone: 'rose' }, { key: 'include', label: 'Include Pajak', tone: 'emerald' }]} value={state.sewaHargaPajak} onChange={(v) => setField('sewaHargaPajak', v)} />
            </div>
          </div>
          <div>
            <Label req>Cara Pembayaran</Label>
            <SingleChoiceChips options={SEWA_CARA_PEMBAYARAN_OPTIONS.map((s) => ({ key: s, label: s }))} value={state.sewaCaraPembayaran} onChange={(v) => setField('sewaCaraPembayaran', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label req>Mulai Sewa</Label><input type="date" value={state.sewaPeriodeAwal} onChange={(e) => setField('sewaPeriodeAwal', e.target.value)} className={inp} /></div>
            <div>
              <Label req>Durasi Sewa</Label>
              <div className="relative">
                <input type="number" min={1} value={state.sewaDurasiBulan || ''} onChange={(e) => setField('sewaDurasiBulan', parseInt(e.target.value) || 0)} className={`${inp} pr-16`} placeholder="cth: 3" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">bulan</span>
              </div>
            </div>
          </div>
          <PaymentDueWarning dueDate={addMonthsDateLabel(periodEndDateValue(state.sewaPeriodeAwal, state.sewaDurasiBulan), 2)} />
          <div><Label>Keterangan</Label><textarea rows={3} value={state.sewaKeterangan} onChange={(e) => setField('sewaKeterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Catatan tambahan terkait sewa/visibility..." /></div>
          <div className="border-t border-slate-100 pt-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
              Ketentuan Pajak
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Sewa/visibility adalah objek jasa/sewa — tentukan pajak yang berlaku</p>
            <KetentuanPajakSection
              ppnAktif={state.sewaPpnAktif} ppnRate={state.sewaPpnRate} onPpnAktif={(v) => { setField('sewaPpnAktif', v); setField('sewaPpnRate', v ? 'PPN 11%' : ''); }} onPpnRate={(v) => setField('sewaPpnRate', v)}
              pphAktif={state.sewaPphAktif} pphRate={state.sewaPphRate} onPphAktif={(v) => setField('sewaPphAktif', v)} onPphRate={(v) => setField('sewaPphRate', v)}
              errors={{ ppnRate: errors.sewaPpnRate, pphRate: errors.sewaPphRate }}
              ppnOptions={['PPN 11%']}
              pphOptions={SEWA_PPH_RATE_OPTIONS}
            />
          </div>
        </div>
      )}

      {state.jenis === 'reward-insentif' && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <Label req>Jenis Reward / Insentif</Label>
            <SingleChoiceChips options={REWARD_JENIS_OPTIONS.map((s) => ({ key: s, label: s }))} value={state.rewardJenis} onChange={(v) => setField('rewardJenis', v)} />
            <RewardTypeNote type={state.rewardJenis} />
            <FieldError message={errors.rewardJenis} />
          </div>
          <div>
            <Label req>Bentuk Reward / Insentif</Label>
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
              <Label req>Cara Pembayaran</Label>
              <SingleChoiceChips
                options={SEWA_CARA_PEMBAYARAN_OPTIONS.map((s) => ({ key: s, label: s }))}
                value={state.rewardPembayaran}
                onChange={(v) => setField('rewardPembayaran', v)}
              />
              <FieldError message={errors.rewardPembayaran} />
            </div>
          )}
          {state.rewardBentuk === 'Uang' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Nominal (Rp)</Label>
                <input type="number" min={0} value={state.rewardNominal || ''} onChange={(e) => setField('rewardNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" />
                <FieldError message={errors.rewardNominal} />
              </div>
              <div>
                <Label req>Harga Tersebut</Label>
                <SingleChoiceChips options={[{ key: 'exclude', label: 'Exclude Pajak', tone: 'rose' }, { key: 'include', label: 'Include Pajak', tone: 'emerald' }]} value={state.rewardHargaPajak} onChange={(v) => setField('rewardHargaPajak', v)} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label req>Tanggal Mulai Periode</Label><input type="date" value={state.rewardPeriodeAwal} onChange={(e) => setField('rewardPeriodeAwal', e.target.value)} className={inp} /></div>
            <div>
              <Label req>Tanggal Selesai Periode</Label>
              <input type="date" value={state.rewardPeriodeAkhir} onChange={(e) => setField('rewardPeriodeAkhir', e.target.value)} className={inp} />
            </div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
            Durasi: {dateRangeDurationLabel(state.rewardPeriodeAwal, state.rewardPeriodeAkhir) || 'Pilih tanggal mulai dan tanggal selesai.'}
          </div>
          <PaymentDueWarning dueDate={addMonthsDateLabel(state.rewardPeriodeAkhir, 2)} />
          <div><Label>Keterangan</Label><textarea rows={3} value={state.rewardKeterangan} onChange={(e) => setField('rewardKeterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Catatan tambahan terkait reward/insentif..." /></div>
          <div className="border-t border-slate-100 pt-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
              Ketentuan Pajak
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Reward/rabat/insentif tergolong hadiah — tentukan pajak yang berlaku</p>
            <KetentuanPajakSection
              ppnAktif={state.rewardPpnAktif} ppnRate={state.rewardPpnRate} onPpnAktif={(v) => { setField('rewardPpnAktif', v); setField('rewardPpnRate', v ? 'PPN 11%' : ''); }} onPpnRate={(v) => setField('rewardPpnRate', v)}
              pphAktif={state.rewardPphAktif} pphRate={state.rewardPphRate} onPphAktif={(v) => { setField('rewardPphAktif', v); setField('rewardPphRate', v ? 'PPh Pasal 23 - 15%' : ''); }} onPphRate={(v) => setField('rewardPphRate', v)}
              errors={{ ppnRate: errors.rewardPpnRate, pphRate: errors.rewardPphRate }}
              ppnOptions={['PPN 11%']}
              pphOptions={['PPh Pasal 23 - 15%', 'PPh Pasal 23 - 2%']}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label req>Nilai Sewa per Bulan (Rp)</Label>
              <input type="number" min={0} value={state.promosiNominal || ''} onChange={(e) => setField('promosiNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" />
              <p className="mt-1 text-[11px] text-slate-400">Nominal promosi diisi per bulan.</p>
            </div>
            <div>
              <Label req>Harga Tersebut</Label>
              <SingleChoiceChips options={[{ key: 'exclude', label: 'Exclude Pajak', tone: 'rose' }, { key: 'include', label: 'Include Pajak', tone: 'emerald' }]} value={state.promosiHargaPajak} onChange={(v) => setField('promosiHargaPajak', v)} />
            </div>
          </div>
          <div>
            <Label req>Cara Pembayaran</Label>
            <SingleChoiceChips options={SEWA_CARA_PEMBAYARAN_OPTIONS.map((s) => ({ key: s, label: s }))} value={state.promosiCaraPembayaran} onChange={(v) => setField('promosiCaraPembayaran', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label req>Tanggal Mulai Sewa</Label><input type="date" value={state.promosiPeriodeAwal} onChange={(e) => setField('promosiPeriodeAwal', e.target.value)} className={inp} /></div>
            <div>
              <Label req>Durasi Sewa</Label>
              <div className="relative">
                <input type="number" min={1} value={state.promosiDurasiBulan || ''} onChange={(e) => setField('promosiDurasiBulan', parseInt(e.target.value) || 0)} className={`${inp} pr-16`} placeholder="cth: 3" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">bulan</span>
              </div>
            </div>
          </div>
          <PaymentDueWarning dueDate={addMonthsDateLabel(periodEndDateValue(state.promosiPeriodeAwal, state.promosiDurasiBulan), 2)} />
          <div><Label>Keterangan Media</Label><textarea rows={3} value={state.mediaKeterangan} onChange={(e) => setField('mediaKeterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="cth: Brosur mingguan / Instagram Ads" /></div>
          <div className="border-t border-slate-100 pt-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
              Ketentuan Pajak Promosi
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Khusus promosi, PPN hanya 11% dan PPh hanya Pasal 23 2%.</p>
            <KetentuanPajakSection
              ppnAktif={state.promosiPpnAktif} ppnRate={state.promosiPpnRate} onPpnAktif={(v) => { setField('promosiPpnAktif', v); setField('promosiPpnRate', v ? 'PPN 11%' : ''); }} onPpnRate={(v) => setField('promosiPpnRate', v)}
              pphAktif={state.promosiPphAktif} pphRate={state.promosiPphRate} onPphAktif={(v) => { setField('promosiPphAktif', v); setField('promosiPphRate', v ? 'PPh Pasal 23 - 2%' : ''); }} onPphRate={(v) => setField('promosiPphRate', v)}
              errors={{ ppnRate: errors.promosiPpnRate, pphRate: errors.promosiPphRate }}
              ppnOptions={['PPN 11%']}
              pphOptions={['PPh Pasal 23 - 2%']}
            />
          </div>
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
                  <ListingConversionEditor row={row} onChange={(field, value) => updateListingRow(i, field, value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label req>Diskon Reguler (%)</Label><input type="number" min={0} value={row.diskonReguler || ''} onChange={(e) => updateListingRow(i, 'diskonReguler', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label req>Harga per Pcs</Label>
                    <input type="number" min={0} value={row.hargaPerPcs || ''} onChange={(e) => updateListingRow(i, 'hargaPerPcs', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" />
                    <p className="mt-1 text-[11px] text-slate-400">Harga per produk sudah include PPN.</p>
                  </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Biaya Listing (Rp)</Label>
                <input type="number" min={0} value={state.listingNominal || ''} onChange={(e) => setField('listingNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" />
              </div>
              <div>
                <Label req>Nominal Tersebut</Label>
                <SingleChoiceChips options={[{ key: 'exclude', label: 'Exclude Pajak', tone: 'rose' }, { key: 'include', label: 'Include Pajak', tone: 'emerald' }]} value={state.listingHargaPajak} onChange={(v) => setField('listingHargaPajak', v)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label req>PKP (Bisa Faktur Pajak)?</Label><YesNoToggle value={state.listingPkp} onChange={(v) => setField('listingPkp', v)} /></div>
              <div><Label req>Bisa Return?</Label><YesNoToggle value={state.listingReturn} onChange={(v) => setField('listingReturn', v)} /></div>
              <div><Label req>Biaya Label Rp 15,-?</Label><YesNoToggle value={state.listingBiayaLabel} onChange={(v) => setField('listingBiayaLabel', v)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req>Tempo Pembayaran</Label>
                <div className="relative">
                  <input type="number" min={0} value={state.listingTempoPembayaran} onChange={(e) => setField('listingTempoPembayaran', e.target.value)} className={`${inp} pr-14`} placeholder="cth: 30" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">hari</span>
                </div>
              </div>
              <div>
                <Label req>Cara Pembayaran Listing</Label>
                <SingleChoiceChips options={SEWA_CARA_PEMBAYARAN_OPTIONS.map((s) => ({ key: s, label: s }))} value={state.listingCaraPembayaran} onChange={(v) => setField('listingCaraPembayaran', v)} />
              </div>
            </div>
            <div><Label req>Dikenakan PPN / PPh?</Label>
              <p className="text-[11px] text-slate-400 mb-3">Berlaku untuk seluruh produk pada listing ini — pilih tarif jika PPN dan/atau PPh dikenakan</p>
              <KetentuanPajakSection
                ppnAktif={state.listingPpnAktif} ppnRate={state.listingPpnRate} onPpnAktif={(v) => { setField('listingPpnAktif', v); setField('listingPpnRate', v ? 'PPN 11%' : ''); }} onPpnRate={(v) => setField('listingPpnRate', v)}
                pphAktif={state.listingPphAktif} pphRate={state.listingPphRate} onPphAktif={(v) => { setField('listingPphAktif', v); setField('listingPphRate', v ? 'PPh Pasal 23 - 2%' : ''); }} onPphRate={(v) => setField('listingPphRate', v)}
                errors={{ ppnRate: errors.listingPpnRate, pphRate: errors.listingPphRate }}
                ppnOptions={['PPN 11%']}
                pphOptions={['PPh Pasal 23 - 2%']}
              />
            </div>
          </div>
        </div>
      )}

      {state.jenis === 'event-blbms' && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <Label req>Nama Event</Label>
              {state.eventJenis && (
                <button
                  type="button"
                  onClick={() => setField('eventJenis', '')}
                  className="mb-1 text-[11px] font-bold text-amber-700 hover:text-amber-800"
                >
                  Ganti
                </button>
              )}
            </div>
            <SingleChoiceChips
              options={(state.eventJenis ? [state.eventJenis] : EVENT_JENIS_OPTIONS).map((s) => ({ key: s, label: s }))}
              value={state.eventJenis}
              onChange={(v) => setField('eventJenis', v)}
            />
            <FieldError message={errors.eventJenis} />
          </div>
          <div>
            <Label req>Kategori Media</Label>
            <SingleChoiceChips
              options={EVENT_MEDIA_CATEGORIES.map((s) => ({ key: s, label: s }))}
              value={state.eventBentuk}
              onChange={(v) => {
                setField('eventBentuk', v);
                setField('eventMediaJenis', []);
                setField('eventMediaDetails', []);
              }}
            />
            <FieldError message={errors.eventBentuk} />
          </div>
          {state.eventBentuk && (
            <div>
              <Label req>{eventUsesMediaDetails ? 'Jenis Media (bisa lebih dari satu)' : 'Jenis Media'}</Label>
              {eventUsesMediaDetails ? (
                <MultiChoiceChips
                  options={(EVENT_MEDIA_BY_CATEGORY[state.eventBentuk] || []).map((s) => ({ key: s, label: s }))}
                  value={state.eventMediaJenis}
                  onChange={(values) => {
                    setField('eventMediaJenis', values);
                    setField('eventMediaDetails', state.eventMediaDetails.filter((row) => values.includes(row.mediaJenis)));
                  }}
                />
              ) : (
                <SingleChoiceChips
                  options={(EVENT_MEDIA_BY_CATEGORY[state.eventBentuk] || []).map((s) => ({ key: s, label: s }))}
                  value={state.eventMediaJenis[0] || ''}
                  onChange={(value) => {
                    setField('eventMediaJenis', value ? [value] : []);
                    setField('eventMediaDetails', []);
                  }}
                />
              )}
              <FieldError message={errors.eventMediaJenis} />
            </div>
          )}
          {eventUsesMediaDetails && state.eventMediaJenis.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div>
                <p className="text-[12px] font-black uppercase tracking-wider text-slate-500">Detail Jenis Media</p>
                <p className="mt-1 text-[11px] text-slate-400">Isi detail per media, masukkan nama Media untuk Produk dengan nominal dan periode masing-masing.</p>
              </div>
              {state.eventMediaJenis.map((media) => (
                <div key={media} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-slate-800">{media}</p>
                    <button type="button" onClick={() => addEventMediaDetail(media)} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white"><Plus className="h-3.5 w-3.5" />Tambah Detail</button>
                  </div>
                  {(state.eventMediaDetails.filter((row) => row.mediaJenis === media).length ? state.eventMediaDetails.filter((row) => row.mediaJenis === media) : []).map((row) => (
                    <div key={row.id} className="rounded-xl border border-slate-200 p-3 space-y-3">
                      <div className="flex justify-between gap-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Detail {media}</p>
                        <button type="button" onClick={() => removeEventMediaDetail(row.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><Label req>Nama {media}</Label><input type="text" value={row.nama} onChange={(e) => updateEventMediaDetail(row.id, { nama: e.target.value })} className={inp} placeholder={`cth: ${media} Nama Clip Strip`} /></div>
                        <div><Label req>Nilai Sewa (Rp)</Label><input type="number" min={0} value={row.nominal || ''} onChange={(e) => updateEventMediaDetail(row.id, { nominal: parseFloat(e.target.value) || 0 })} className={inp} placeholder="0" /></div>
                      </div>
                      <DateRangeLikePicker
                        start={row.tanggalMulai}
                        end={row.tanggalSelesai}
                        onStart={(value) => updateEventMediaDetail(row.id, { tanggalMulai: value })}
                        onEnd={(value) => updateEventMediaDetail(row.id, { tanggalSelesai: value })}
                      />
                      <p className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-600">Durasi: {eventDetailDuration(row)}</p>
                    </div>
                  ))}
                  {state.eventMediaDetails.filter((row) => row.mediaJenis === media).length === 0 && (
                    <button type="button" onClick={() => addEventMediaDetail(media)} className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 py-3 text-[12px] font-bold text-amber-700">Tambah detail {media}</button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label req>Nilai Sewa per Bulan (Rp)</Label>
              <input type="number" min={0} value={state.eventNominal || ''} onChange={(e) => setField('eventNominal', parseFloat(e.target.value) || 0)} className={inp} placeholder="0" />
              <p className="mt-1 text-[11px] text-slate-400">Nominal event diisi per bulan.</p>
            </div>
            <div>
              <Label req>Harga Tersebut</Label>
              <SingleChoiceChips options={[{ key: 'exclude', label: 'Exclude Pajak', tone: 'rose' }, { key: 'include', label: 'Include Pajak', tone: 'emerald' }]} value={state.eventHargaPajak} onChange={(v) => setField('eventHargaPajak', v)} />
            </div>
          </div>
          <div>
            <Label req>Cara Pembayaran</Label>
            <SingleChoiceChips options={SEWA_CARA_PEMBAYARAN_OPTIONS.map((s) => ({ key: s, label: s }))} value={state.eventCaraPembayaran} onChange={(v) => setField('eventCaraPembayaran', v)} />
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label req>Tanggal Mulai Sewa</Label><input type="date" value={state.eventPeriodeAwal} onChange={(e) => setField('eventPeriodeAwal', e.target.value)} className={inp} /></div>
              <div><Label req>Tanggal Selesai Sewa</Label><input type="date" value={state.eventPeriodeAkhir} onChange={(e) => setField('eventPeriodeAkhir', e.target.value)} className={inp} /></div>
            </div>
            <p className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
              Durasi: {dateRangeDurationLabel(state.eventPeriodeAwal, state.eventPeriodeAkhir) || 'Pilih tanggal mulai dan tanggal selesai.'}
            </p>
          </div>
          <PaymentDueWarning dueDate={addMonthsDateLabel(state.eventPeriodeAkhir, 2)} />
          <div><Label>Keterangan</Label><textarea rows={3} value={state.eventKeterangan} onChange={(e) => setField('eventKeterangan', e.target.value)} className={`${inp} min-h-24 resize-y`} placeholder="Catatan tambahan terkait event/BLBMS..." /></div>
          <div className="border-t border-slate-100 pt-5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-800 mb-1">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black">%</span>
              Ketentuan Pajak
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Event/BLBMS adalah objek jasa/sewa — tentukan pajak yang berlaku</p>
            <KetentuanPajakSection
              ppnAktif={state.eventPpnAktif} ppnRate={state.eventPpnRate} onPpnAktif={(v) => setField('eventPpnAktif', v)} onPpnRate={(v) => setField('eventPpnRate', v)}
              pphAktif={state.eventPphAktif} pphRate={state.eventPphRate} onPphAktif={(v) => setField('eventPphAktif', v)} onPphRate={(v) => setField('eventPphRate', v)}
              errors={{ ppnRate: errors.eventPpnRate, pphRate: errors.eventPphRate }}
            />
          </div>
        </div>
      )}
        </>
      )}
    </Card>
  );
}

/* ───────────────────────── Step: Catatan ───────────────────────── */
function NotesStep({
  catatan, setCatatan, jenisMemo, programInfo, setProgramField, errors,
}: {
  catatan: string; setCatatan: (v: string) => void;
  jenisMemo: JenisMemo;
  programInfo: ProgramInfoState;
  setProgramField: <K extends keyof ProgramInfoState>(f: K, v: ProgramInfoState[K]) => void;
  errors: FormErrors;
}) {
  const paymentDueDate = addMonthsDateLabel(programInfo.periodeAkhir, 2);
  return (
    <Card title="Pembayaran & Catatan" icon={FileText} subtitle="Lengkapi cara pembayaran dan tambahkan catatan memo bila diperlukan">
      {jenisMemo === 'memo-program' && (
        <div>
          <Label req>Cara Pembayaran</Label>
          <SingleChoiceChips options={CARA_PEMBAYARAN_OPTIONS.map((o) => ({ key: o, label: o }))} value={programInfo.caraPembayaran} onChange={(v) => setProgramField('caraPembayaran', v)} />
          <FieldError message={errors.caraPembayaran} />
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <div className="flex items-start gap-2">
              <Info className="warning-info-animate mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-[12px] font-semibold leading-relaxed">
                {paymentDueDate
                  ? `Batas pembayar maksimal sampai tanggal ${paymentDueDate}.`
                  : 'Batas pembayar maksimal akan tampil setelah Periode Sampai diisi.'}
              </p>
            </div>
          </div>
        </div>
      )}
      <div>
        <Label>Catatan (Memo Internal) - Opsional</Label>
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

function SewaProductList({ products, rows, print = false }: { products: Product[]; rows: Record<string, ProductQtyRow>; print?: boolean }) {
  if (products.length === 0) return null;

  return (
    <ul className={print ? 'space-y-1' : 'space-y-1 text-right'}>
      {products.map((product) => {
        const row = rows[product.plu];
        const qty = row?.qty ? `${row.qty} ${row.satuan}` : '';

        return (
          <li key={product.plu} className={print ? 'font-semibold text-slate-800' : ''}>
            {product.nama}{qty ? ` (${qty})` : ''}
          </li>
        );
      })}
    </ul>
  );
}

function UpdateProductDetailTable({
  products, fields, display, print = false,
}: {
  products: Product[];
  fields: string[];
  display: (plu: string, field: string) => React.ReactNode;
  print?: boolean;
}) {
  if (products.length === 0 || fields.length === 0) return null;

  return (
    <div className={print ? 'overflow-visible' : 'rounded-xl border border-slate-200 overflow-hidden'}>
      <table className={`${print ? 'text-[9.5px]' : 'text-[11px]'} w-full border-collapse`}>
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-2 py-1 text-left">PLU</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Produk</th>
            {fields.map((field) => (
              <th key={field} className="border border-slate-300 px-2 py-1 text-left">{PRODUK_UPDATE_FIELDS.find((item) => item.key === field)?.label || field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.plu}>
              <td className="border border-slate-200 px-2 py-1 font-mono">{product.plu}</td>
              <td className="border border-slate-200 px-2 py-1 font-semibold">{product.nama}</td>
              {fields.map((field) => (
                <td key={`${product.plu}-${field}`} className="border border-slate-200 px-2 py-1">{display(product.plu, field) || '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventMediaDetailTables({ mediaTypes, details, print = false }: { mediaTypes: string[]; details: EventMediaDetailRow[]; print?: boolean }) {
  if (mediaTypes.length === 0) return null;
  return (
    <div className="space-y-3">
      {mediaTypes.map((media) => {
        const rows = details.filter((row) => row.mediaJenis === media);
        return (
          <div key={media} className={print ? '' : 'rounded-xl border border-slate-200 overflow-hidden'}>
            <p className={`${print ? 'mb-1 text-[10px]' : 'bg-slate-50 px-3 py-2 text-[11px]'} font-black uppercase tracking-wider text-slate-600`}>{media}</p>
            <table className={`${print ? 'text-[9.5px]' : 'text-[11px]'} w-full border-collapse`}>
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-1 text-left">Nama Detail</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Nilai Sewa</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Periode</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Durasi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-slate-200 px-2 py-1 font-semibold">{row.nama || '-'}</td>
                    <td className="border border-slate-200 px-2 py-1">Rp {row.nominal.toLocaleString('id-ID')}</td>
                    <td className="border border-slate-200 px-2 py-1">{row.tanggalMulai || '-'} s/d {row.tanggalSelesai || '-'}</td>
                    <td className="border border-slate-200 px-2 py-1">{dateRangeDurationLabel(row.tanggalMulai, row.tanggalSelesai) || '-'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="border border-slate-200 px-2 py-1 text-slate-400" colSpan={4}>Belum ada detail media.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function OnFakturDetailTable({ products, rows, print = false }: { products: Product[]; rows: Record<string, OnFakturProductRow>; print?: boolean }) {
  if (products.length === 0) return null;

  return (
    <div className={print ? 'overflow-visible' : 'rounded-xl border border-slate-200 overflow-hidden'}>
      <p className={`${print ? 'mb-1 text-[10px]' : 'bg-amber-50 px-3 py-2 text-[11px]'} font-black uppercase tracking-wider text-amber-700`}>On Faktur</p>
      <table className={`${print ? 'text-[9.5px]' : 'text-[11px]'} w-full border-collapse`}>
        <thead>
          <tr className="bg-amber-50">
            <th className="border border-slate-300 px-2 py-1 text-left">PLU</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Produk</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Potongan</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Syarat</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Alokasi</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Budget</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const row = rows[product.plu] || emptyOnFakturProductRow();
            const potongan = row.diskonValue ? (row.diskonMode === 'persen' ? `${row.diskonValue}%` : `Rp ${row.diskonValue.toLocaleString('id-ID')}`) : '-';
            const syarat = [
              row.bandedAktif ? `Banded: ${row.banded || '-'}` : '',
              row.strataMinQty ? `Strata: ${row.strataMinQty} ${row.strataSatuan}` : '',
            ].filter(Boolean).join(' | ') || '-';

            return (
              <tr key={`on-${product.plu}`}>
                <td className="border border-slate-200 px-2 py-1 font-mono">{product.plu}</td>
                <td className="border border-slate-200 px-2 py-1 font-semibold">{product.nama}</td>
                <td className="border border-slate-200 px-2 py-1">{potongan}</td>
                <td className="border border-slate-200 px-2 py-1">{syarat}</td>
                <td className="border border-slate-200 px-2 py-1">{row.alokasiQty ? `${row.alokasiQty} PCS` : '-'}</td>
                <td className="border border-slate-200 px-2 py-1">{row.budgetAktif ? `Rp ${row.budgetNominal.toLocaleString('id-ID')}` : '-'}</td>
                <td className="border border-slate-200 px-2 py-1">{row.keterangan || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OffFakturDetailTable({ products, rows, print = false }: { products: Product[]; rows: Record<string, OffFakturProductRow>; print?: boolean }) {
  if (products.length === 0) return null;

  return (
    <div className={print ? 'overflow-visible' : 'rounded-xl border border-slate-200 overflow-hidden'}>
      <p className={`${print ? 'mb-1 text-[10px]' : 'bg-indigo-50 px-3 py-2 text-[11px]'} font-black uppercase tracking-wider text-indigo-700`}>Off Faktur</p>
      <table className={`${print ? 'text-[9.5px]' : 'text-[11px]'} w-full border-collapse`}>
        <thead>
          <tr className="bg-indigo-50">
            <th className="border border-slate-300 px-2 py-1 text-left">PLU</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Produk</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Potongan</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Benefit</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Alokasi</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Budget</th>
            <th className="border border-slate-300 px-2 py-1 text-left">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const row = rows[product.plu] || emptyOffFakturProductRow();
            const potongan = row.diskonValue ? (row.diskonMode === 'persen' ? `${row.diskonValue}% ${DISKON_BASIS_OPTIONS.find((o) => o.key === row.diskonBasis)?.label || ''}` : `Rp ${row.diskonValue.toLocaleString('id-ID')}`) : '-';
            const benefit = [
              row.kuponVoucherAktif ? `Kupon: ${row.kuponVoucher || '-'}` : '',
              row.freeProdukAktif ? `Free: ${row.freeProdukKeterangan || '-'}` : '',
            ].filter(Boolean).join(' | ') || '-';

            return (
              <tr key={`off-${product.plu}`}>
                <td className="border border-slate-200 px-2 py-1 font-mono">{product.plu}</td>
                <td className="border border-slate-200 px-2 py-1 font-semibold">{product.nama}</td>
                <td className="border border-slate-200 px-2 py-1">{potongan}</td>
                <td className="border border-slate-200 px-2 py-1">{benefit}</td>
                <td className="border border-slate-200 px-2 py-1">{row.offAlokasiQty ? `${row.offAlokasiQty} PCS` : '-'}</td>
                <td className="border border-slate-200 px-2 py-1">{row.budgetAktif ? `Rp ${row.budgetNominal.toLocaleString('id-ID')}` : '-'}</td>
                <td className="border border-slate-200 px-2 py-1">{row.keterangan || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReviewStep({
  identity, outlets, jenisMemo, updateInfo, programInfo, onProducts, onRows, offProducts, offRows, budgetLink, pendapatan, catatan,
  signature, setSignature, agreed, setAgreed, paymentAgreed, setPaymentAgreed, errors,
}: {
  identity: IdCardData | null; outlets: string[]; jenisMemo: JenisMemo;
  updateInfo: UpdateInfoState; programInfo: ProgramInfoState;
  onProducts: Product[]; onRows: Record<string, OnFakturProductRow>;
  offProducts: Product[]; offRows: Record<string, OffFakturProductRow>;
  budgetLink: BudgetLinkState;
  pendapatan: PendapatanState;
  catatan: string; signature: string; setSignature: (v: string) => void; agreed: boolean; setAgreed: (v: boolean) => void; paymentAgreed: boolean; setPaymentAgreed: (v: boolean) => void; errors: FormErrors;
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
    if (f === 'hargaBeli' && value) return `Rp ${Number(value).toLocaleString('id-ID')} / PCS, include PPN, sebelum diskon/reguler`;
    if (f === 'diskonReguler' && value) return `${value}%`;
    if (f === 'jatuhTempo' && value) return `${value} hari`;
    return value;
  };
  const vendorFieldDisplay = (field: string) => field === 'picList' ? formatVendorPicRows(updateInfo.vendorValues[field] || getVendorOldValue(identity, field)) : updateInfo.vendorValues[field];

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
              {jenisMemo === 'pendapatan-lain' && 'Memo Lain-lain'}
            </p>
          </div>
        </div>

        {jenisMemo === 'update-informasi' && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Detail Update</p>
            {updateInfo.jenisUpdate === 'produk' ? (
              <UpdateProductDetailTable products={updateInfo.selectedProducts} fields={updateInfo.produkFields} display={produkFieldDisplay} />
            ) : (
              <div className="rounded-xl border border-slate-200 p-4 divide-y divide-slate-100">
                {updateInfo.vendorFields.map((f) => (
                  <Row key={f} label={VENDOR_UPDATE_FIELDS.find((x) => x.key === f)?.label} value={vendorFieldDisplay(f)} />
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
              <Row label="Cara Pembayaran" value={programInfo.caraPembayaran} />
              <Row label="Redaksi" value={programInfo.redaksi} />
              <Row label="Periode" value={programInfo.periodeAwal && programInfo.periodeAkhir ? `${programInfo.periodeAwal} s/d ${programInfo.periodeAkhir}` : ''} />
            </div>

            {hasOn && onProducts.length > 0 && (
              <div className="mt-3">
                <OnFakturDetailTable products={onProducts} rows={onRows} />
              </div>
            )}

            {hasOff && offProducts.length > 0 && (
              <div className="mt-3">
                <OffFakturDetailTable products={offProducts} rows={offRows} />
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {pendapatan.jenis === 'sewa-visibility' ? 'Detail Sewa / Visibility'
                : pendapatan.jenis === 'event-blbms' ? 'Detail Event / BLBMS'
                  : 'Detail Lain-lain'}
            </p>
            <div className="rounded-xl border border-slate-200 p-4 divide-y divide-slate-100">
              <Row label="Nama Program" value={pendapatan.namaProgram} />
              <Row label="Jenis Program" value={PENDAPATAN_OPTIONS.find((o) => o.key === pendapatan.jenis)?.label} />
              {pendapatan.jenis === 'sewa-visibility' && (
                <>
                  <Row label="Jenis Sewa/Visibility" value={pendapatan.sewaJenis} />
                  <Row label="Nilai Sewa" value={pendapatan.sewaNominal ? `Rp ${pendapatan.sewaNominal.toLocaleString('id-ID')} / bulan (${pendapatan.sewaHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})` : ''} />
                  <Row label="Cara Pembayaran" value={pendapatan.sewaCaraPembayaran} />
                  <Row label="Periode" value={sewaPeriodLabel(pendapatan.sewaPeriodeAwal, pendapatan.sewaDurasiBulan)} />
                  <Row label="Keterangan" value={pendapatan.sewaKeterangan} />
                  <Row label="PPN" value={pendapatan.sewaPpnAktif ? pendapatan.sewaPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.sewaPphAktif ? pendapatan.sewaPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
              {pendapatan.jenis === 'reward-insentif' && (
                <>
                  <Row label="Jenis" value={pendapatan.rewardJenis} />
                  <Row label="Bentuk" value={pendapatan.rewardBentuk} />
                  {pendapatan.rewardBentuk === 'Uang' && <Row label="Cara Pembayaran" value={pendapatan.rewardPembayaran} />}
                  {pendapatan.rewardBentuk === 'Uang' && <Row label="Nominal" value={pendapatan.rewardNominal ? `Rp ${pendapatan.rewardNominal.toLocaleString('id-ID')} (${pendapatan.rewardHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})` : ''} />}
                  <Row label="Periode" value={dateRangeDurationLabel(pendapatan.rewardPeriodeAwal, pendapatan.rewardPeriodeAkhir)} />
                  <Row label="Keterangan" value={pendapatan.rewardKeterangan} />
                  <Row label="PPN" value={pendapatan.rewardPpnAktif ? pendapatan.rewardPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.rewardPphAktif ? pendapatan.rewardPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
              {pendapatan.jenis === 'promosi' && (
                <>
                  <Row label="Jenis Media" value={pendapatan.mediaTipe} />
                  <Row label="Nilai Sewa" value={pendapatan.promosiNominal ? `Rp ${pendapatan.promosiNominal.toLocaleString('id-ID')} / bulan (${pendapatan.promosiHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})` : ''} />
                  <Row label="Cara Pembayaran" value={pendapatan.promosiCaraPembayaran} />
                  <Row label="Periode" value={sewaPeriodLabel(pendapatan.promosiPeriodeAwal, pendapatan.promosiDurasiBulan)} />
                  <Row label="Keterangan Media" value={pendapatan.mediaKeterangan} />
                  <Row label="PPN" value={pendapatan.promosiPpnAktif ? pendapatan.promosiPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.promosiPphAktif ? pendapatan.promosiPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
              {pendapatan.jenis === 'listing' && (
                <>
                  <Row label="PKP" value={yn(pendapatan.listingPkp)} />
                  <Row label="Bisa Return" value={yn(pendapatan.listingReturn)} />
                  <Row label="Biaya Label Rp 15,-" value={yn(pendapatan.listingBiayaLabel)} />
                  <Row label="Nominal Listing" value={`Rp ${pendapatan.listingNominal.toLocaleString('id-ID')} (${pendapatan.listingHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})`} />
                  <Row label="Tempo Pembayaran" value={pendapatan.listingTempoPembayaran ? `${pendapatan.listingTempoPembayaran} hari` : ''} />
                  <Row label="Cara Pembayaran" value={pendapatan.listingCaraPembayaran} />
                  <Row label="PPN" value={pendapatan.listingPpnAktif ? pendapatan.listingPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.listingPphAktif ? pendapatan.listingPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
              {pendapatan.jenis === 'event-blbms' && (
                <>
                  <Row label="Nama Event" value={pendapatan.eventJenis} />
                  <Row label="Kategori Media" value={pendapatan.eventBentuk} />
                  <Row label="Jenis Media" value={pendapatan.eventMediaJenis.join(', ')} />
                  <Row label="Nilai Sewa" value={pendapatan.eventNominal ? `Rp ${pendapatan.eventNominal.toLocaleString('id-ID')} / bulan (${pendapatan.eventHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})` : ''} />
                  <Row label="Cara Pembayaran" value={pendapatan.eventCaraPembayaran} />
                  <Row label="Periode" value={dateRangeDurationLabel(pendapatan.eventPeriodeAwal, pendapatan.eventPeriodeAkhir)} />
                  <Row label="Keterangan" value={pendapatan.eventKeterangan} />
                  <Row label="PPN" value={pendapatan.eventPpnAktif ? pendapatan.eventPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                  <Row label="PPh" value={pendapatan.eventPphAktif ? pendapatan.eventPphRate || 'Aktif' : 'Tidak dikenakan'} />
                </>
              )}
            </div>
            {pendapatan.jenis === 'event-blbms' && pendapatan.eventBentuk === 'Media Display Produk' && pendapatan.eventMediaJenis.length > 0 && (
              <div className="mt-3">
                <EventMediaDetailTables mediaTypes={pendapatan.eventMediaJenis} details={pendapatan.eventMediaDetails} />
              </div>
            )}
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
                    <Row label="Harga per Pcs" value={r.hargaPerPcs ? `Rp ${r.hargaPerPcs.toLocaleString('id-ID')} (Include PPN)` : ''} />
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
        {jenisMemo !== 'update-informasi' && (
          <>
            <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
              <input type="checkbox" checked={paymentAgreed} onChange={(e) => setPaymentAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500" />
              <span className="text-[12px] font-semibold text-red-700 leading-relaxed">Saya bersedia melakukan pembayaran sebelum 2 bulan setelah program berakhir.</span>
            </label>
            <FieldError message={errors.paymentAgreed} />
          </>
        )}
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
        return { plu: p.plu, nama: p.nama, qty: r.offAlokasiQty || '-', potongan: r.diskonValue ? (r.diskonMode === 'persen' ? `${r.diskonValue}%` : `Rp ${r.diskonValue.toLocaleString('id-ID')}`) : '-', total: r.budgetAktif && r.budgetNominal ? `Rp ${r.budgetNominal.toLocaleString('id-ID')}` : '-' };
      }),
    ];
    if (budgetLink.nominal) rows.push({ plu: '-', nama: budgetLink.keterangan || 'Budget', qty: '-', potongan: '-', total: `Rp ${budgetLink.nominal.toLocaleString('id-ID')}` });
    return rows;
  }
  if (jenisMemo === 'pendapatan-lain' && pendapatan.jenis === 'listing') {
    return pendapatan.listingProducts.map((r, i) => ({ plu: r.barcodePcs || '-', nama: r.namaProduk || `Produk #${i + 1}`, qty: formatListingConversion({ qty1: r.konversiQty1, satuan1: r.konversiSatuan1, qty2: r.konversiQty2, satuan2: r.konversiSatuan2, qty3: r.konversiQty3, satuan3: r.konversiSatuan3 }) || '-', potongan: r.diskonReguler ? `${r.diskonReguler}%` : '-', total: r.hargaPerPcs ? `Rp ${r.hargaPerPcs.toLocaleString('id-ID')}` : '-' }));
  }
  if (jenisMemo === 'pendapatan-lain') {
    const total = pendapatan.sewaNominal || pendapatan.promosiNominal || pendapatan.rewardNominal || pendapatan.listingNominal || pendapatan.eventNominal || 0;
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
    : pendapatan.jenis === 'sewa-visibility'
      ? sewaPeriodLabel(pendapatan.sewaPeriodeAwal, pendapatan.sewaDurasiBulan) || '-'
      : pendapatan.jenis === 'promosi'
        ? sewaPeriodLabel(pendapatan.promosiPeriodeAwal, pendapatan.promosiDurasiBulan) || '-'
        : pendapatan.jenis === 'reward-insentif'
          ? dateRangeDurationLabel(pendapatan.rewardPeriodeAwal, pendapatan.rewardPeriodeAkhir) || '-'
          : dateRangeDurationLabel(pendapatan.eventPeriodeAwal, pendapatan.eventPeriodeAkhir) || '-';
  const programName = programInfo.namaProgram || pendapatan.namaProgram || memoTypeLabel(jenisMemo);
  const credential = `KREDENSIAL KEASLIAN DOKUMEN | ${memoNo} | Supplier: ${identity?.supplier?.name || '-'} | Program: ${programName} | Periode: ${periode} | Outlet: ${outlets.join(', ') || '-'}`;
  const qrCells = makeQrCells(credential);
  const totalLabel = rows.find((r) => String(r.total).startsWith('Rp'))?.total || '-';
  const updateFieldValue = (product: Product, field: string) => {
    const key = `${product.plu}::${field}`;
    if (field === 'gramasi') return `${updateInfo.produkValues[key] || ''} ${updateInfo.produkUnits[key] || ''}`.trim();
    if (field === 'konversi') return formatListingConversion(updateInfo.produkKonversi[key]);
    if (field === 'hargaBeli' && updateInfo.produkValues[key]) return `Rp ${Number(updateInfo.produkValues[key]).toLocaleString('id-ID')} / PCS, include PPN, sebelum diskon/reguler`;
    if (field === 'diskonReguler' && updateInfo.produkValues[key]) return `${updateInfo.produkValues[key]}%`;
    if (field === 'jatuhTempo' && updateInfo.produkValues[key]) return `${updateInfo.produkValues[key]} hari`;
    return updateInfo.produkValues[key] || '-';
  };
  const vendorFieldValue = (field: string) => field === 'picList' ? formatVendorPicRows(updateInfo.vendorValues[field] || getVendorOldValue(identity, field)) : updateInfo.vendorValues[field];
  const detailTitle = jenisMemo === 'update-informasi' ? 'Detail Update Informasi'
    : jenisMemo === 'memo-program' ? 'Detail Program'
      : pendapatan.jenis === 'sewa-visibility' ? 'Detail Sewa / Visibility'
        : pendapatan.jenis === 'event-blbms' ? 'Detail Event / BLBMS'
          : 'Detail Lain-lain';

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
        <div className="flex justify-between items-center border-b-2 border-slate-950 pb-6">
          <div className="flex items-center gap-4">
            <img src={mannaKampusLogo} alt="Logo" className="memo-print-logo h-24 w-24 object-contain shrink-0" />
            <div><h1 className="text-[18px] font-black tracking-tight">BUYER MEMO SYSTEM</h1><p className="text-[11px] font-bold text-slate-400 uppercase">{memoTypeLabel(jenisMemo)}</p></div>
          </div>
          <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">No Memo</p><p className="text-[18px] font-black">{memoNo}</p><p className="text-[10px] text-slate-400">Tgl: {submittedAt.toLocaleDateString('id-ID')}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 text-[12px]">
          {[
            ['Supplier', identity?.supplier?.name || '-'],
            ['Program', programName],
            ['Periode', periode],
            ['PIC Supplier', identity?.picName || '-'],
            ['', programMethodLabel(jenisMemo, programInfo, pendapatan)],
          ].map(([label, value]) => (
            <div key={label} className="memo-print-info-card min-w-0 border border-slate-200 rounded px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
              <p className="memo-print-info-value mt-1 font-bold">{value}</p>
            </div>
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
                {updateInfo.jenisUpdate === 'produk' && (
                  <UpdateProductDetailTable
                    products={updateInfo.selectedProducts}
                    fields={updateInfo.produkFields}
                    display={(plu, field) => {
                      const product = updateInfo.selectedProducts.find((item) => item.plu === plu);
                      return product ? updateFieldValue(product, field) : '-';
                    }}
                    print
                  />
                )}
                {updateInfo.jenisUpdate === 'vendor' && (
                  <div className="memo-detail-card rounded border border-slate-200 p-3">
                    {updateInfo.vendorFields.map((field) => (
                      <PrintInfoRow key={field} label={VENDOR_UPDATE_FIELDS.find((f) => f.key === field)?.label || field} value={vendorFieldValue(field)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {jenisMemo === 'memo-program' && (
              <div className="space-y-3">
                <PrintInfoRow label="Cara Pembayaran" value={programInfo.caraPembayaran || '-'} />
                <PrintInfoRow label="Redaksi" value={programInfo.redaksi} />
                {onProducts.length > 0 && <OnFakturDetailTable products={onProducts} rows={onRows} print />}
                {offProducts.length > 0 && <OffFakturDetailTable products={offProducts} rows={offRows} print />}
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
                    <PrintInfoRow label="Nilai Sewa" value={`Rp ${pendapatan.sewaNominal.toLocaleString('id-ID')} / bulan (${pendapatan.sewaHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})`} />
                    <PrintInfoRow label="Cara Pembayaran" value={pendapatan.sewaCaraPembayaran || '-'} />
                    <PrintInfoRow label="Periode" value={sewaPeriodLabel(pendapatan.sewaPeriodeAwal, pendapatan.sewaDurasiBulan)} />
                    <PrintInfoRow label="Keterangan" value={pendapatan.sewaKeterangan || '-'} />
                    <PrintInfoRow label="PPN" value={pendapatan.sewaPpnAktif ? pendapatan.sewaPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                    <PrintInfoRow label="PPh" value={pendapatan.sewaPphAktif ? pendapatan.sewaPphRate || 'Aktif' : 'Tidak dikenakan'} />
                  </div>
                )}
                {pendapatan.jenis === 'reward-insentif' && (
                  <div className="memo-detail-card rounded border border-slate-200 p-3">
                    <PrintInfoRow label="Jenis" value={pendapatan.rewardJenis} />
                    <PrintInfoRow label="Bentuk" value={pendapatan.rewardBentuk} />
                    <PrintInfoRow label="Cara Pembayaran" value={pendapatan.rewardPembayaran || '-'} />
                    <PrintInfoRow label="Nominal" value={pendapatan.rewardNominal ? `Rp ${pendapatan.rewardNominal.toLocaleString('id-ID')} (${pendapatan.rewardHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})` : '-'} />
                    <PrintInfoRow label="Periode" value={dateRangeDurationLabel(pendapatan.rewardPeriodeAwal, pendapatan.rewardPeriodeAkhir)} />
                    <PrintInfoRow label="Keterangan" value={pendapatan.rewardKeterangan || '-'} />
                  </div>
                )}
                {pendapatan.jenis === 'promosi' && (
                  <div className="memo-detail-card rounded border border-slate-200 p-3">
                    <PrintInfoRow label="Media" value={pendapatan.mediaTipe} />
                    <PrintInfoRow label="Nilai Sewa" value={`Rp ${pendapatan.promosiNominal.toLocaleString('id-ID')} / bulan (${pendapatan.promosiHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})`} />
                    <PrintInfoRow label="Cara Pembayaran" value={pendapatan.promosiCaraPembayaran || '-'} />
                    <PrintInfoRow label="Periode" value={sewaPeriodLabel(pendapatan.promosiPeriodeAwal, pendapatan.promosiDurasiBulan)} />
                    <PrintInfoRow label="Keterangan" value={pendapatan.mediaKeterangan} />
                    <PrintInfoRow label="PPN" value={pendapatan.promosiPpnAktif ? pendapatan.promosiPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                    <PrintInfoRow label="PPh" value={pendapatan.promosiPphAktif ? pendapatan.promosiPphRate || 'Aktif' : 'Tidak dikenakan'} />
                  </div>
                )}
                {pendapatan.jenis === 'event-blbms' && (
                  <div className="memo-detail-card rounded border border-slate-200 p-3">
                    <PrintInfoRow label="Nama Event" value={pendapatan.eventJenis} />
                    <PrintInfoRow label="Kategori Media" value={pendapatan.eventBentuk} />
                    <PrintInfoRow label="Jenis Media" value={pendapatan.eventMediaJenis.join(', ')} />
                    <PrintInfoRow label="Nominal" value={`Rp ${pendapatan.eventNominal.toLocaleString('id-ID')} / bulan (${pendapatan.eventHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})`} />
                    <PrintInfoRow label="Cara Pembayaran" value={pendapatan.eventCaraPembayaran || '-'} />
                    <PrintInfoRow label="Periode" value={dateRangeDurationLabel(pendapatan.eventPeriodeAwal, pendapatan.eventPeriodeAkhir)} />
                    <PrintInfoRow label="Keterangan" value={pendapatan.eventKeterangan || '-'} />
                    {pendapatan.eventBentuk === 'Media Display Produk' && (
                      <div className="mt-3">
                        <EventMediaDetailTables mediaTypes={pendapatan.eventMediaJenis} details={pendapatan.eventMediaDetails} print />
                      </div>
                    )}
                  </div>
                )}
                {pendapatan.jenis === 'listing' && pendapatan.listingProducts.map((row, i) => (
                  <div key={i} className="memo-detail-card rounded border border-slate-200 p-3">
                    <p className="mb-2 text-[12px] font-black">{row.namaProduk || `Produk #${i + 1}`}</p>
                    <PrintInfoRow label="Barcode PCS" value={row.barcodePcs} />
                    <PrintInfoRow label="Barcode Karton" value={row.barcodeKarton} />
                    <PrintInfoRow label="Konversi" value={formatListingConversion({ qty1: row.konversiQty1, satuan1: row.konversiSatuan1, qty2: row.konversiQty2, satuan2: row.konversiSatuan2, qty3: row.konversiQty3, satuan3: row.konversiSatuan3 })} />
                    <PrintInfoRow label="Diskon Reguler" value={`${row.diskonReguler}%`} />
                    <PrintInfoRow label="Harga PCS" value={`Rp ${row.hargaPerPcs.toLocaleString('id-ID')} (Include PPN)`} />
                  </div>
                ))}
                {pendapatan.jenis === 'listing' && (
                  <>
                    <PrintInfoRow label="PKP" value={pendapatan.listingPkp === null ? '-' : pendapatan.listingPkp ? 'Ya' : 'Tidak'} />
                    <PrintInfoRow label="Return" value={pendapatan.listingReturn === null ? '-' : pendapatan.listingReturn ? 'Ya' : 'Tidak'} />
                    <PrintInfoRow label="Biaya Label" value={pendapatan.listingBiayaLabel === null ? '-' : pendapatan.listingBiayaLabel ? 'Ya' : 'Tidak'} />
                    <PrintInfoRow label="Nominal Listing" value={`Rp ${pendapatan.listingNominal.toLocaleString('id-ID')} (${pendapatan.listingHargaPajak === 'include' ? 'Include Pajak' : 'Exclude Pajak'})`} />
                    <PrintInfoRow label="Pembayaran" value={`${pendapatan.listingTempoPembayaran || '-'} hari - ${pendapatan.listingCaraPembayaran || '-'}`} />
                    <PrintInfoRow label="PPN" value={pendapatan.listingPpnAktif ? pendapatan.listingPpnRate || 'Aktif' : 'Tidak dikenakan'} />
                    <PrintInfoRow label="PPh" value={pendapatan.listingPphAktif ? pendapatan.listingPphRate || 'Aktif' : 'Tidak dikenakan'} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="memo-signature-block">
          <div className="grid grid-cols-2 gap-10 mt-5 text-center text-[11px]">
            <div><p className="font-bold">Buyer</p><div className="h-14 border-b border-slate-400" /><p className="mt-1.5 text-slate-500"></p></div>
            <div><p className="font-bold">Supplier</p><div className="h-14 border-b border-slate-400 flex items-end justify-center">{signature && <img src={signature} alt="Tanda tangan supplier" className="max-h-12 max-w-40 object-contain" />}</div><p className="mt-1.5 text-slate-500">{identity?.picName || 'Nama & Tanda Tangan'}</p></div>
          </div>
          {jenisMemo !== 'update-informasi' && (
            <div className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-800">
              Supplier menyatakan bersedia melakukan pembayaran sebelum 2 bulan setelah program berakhir.
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex items-end justify-between gap-6">
          <div className="text-[8.5px] text-slate-500 leading-relaxed"><p className="font-black text-slate-600">Kredensial Keaslian Dokumen</p><p className="font-mono break-all">{credential}</p></div>
          <div className="grid gap-0.5 border border-slate-300 p-1 bg-white w-[70px] h-[70px] shrink-0" style={{ gridTemplateColumns: 'repeat(21, 1fr)' }}>{qrCells.map((active, i) => <span key={i} className={active ? 'bg-slate-950' : 'bg-white'} />)}</div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Main wizard ───────────────────────── */
const INITIAL_UPDATE_INFO: UpdateInfoState = { jenisUpdate: '', selectedProducts: [], produkFields: [], produkValues: {}, produkUnits: {}, produkKonversi: {}, vendorFields: [], vendorValues: {}, vendorBank: '', vendorRekening: '' };
const INITIAL_PROGRAM_INFO: ProgramInfoState = { namaProgram: '', tipe: [], ppnAktif: false, ppnRate: '', pphAktif: false, pphRate: '', redaksi: '', caraPembayaran: '', periodeAwal: '', periodeAkhir: '' };
const INITIAL_BUDGET_LINK: BudgetLinkState = { keterangan: '', nominal: 0 };
const INITIAL_PENDAPATAN: PendapatanState = {
  jenis: '', namaProgram: '',
  sewaJenis: '', sewaProducts: [], sewaProductRows: {}, sewaNominal: 0, sewaHargaPajak: 'exclude', sewaCaraPembayaran: '', sewaDurasiBulan: 0, sewaPeriodeAwal: '', sewaPeriodeAkhir: '', sewaKeterangan: '',
  sewaPpnAktif: false, sewaPpnRate: '', sewaPphAktif: false, sewaPphRate: '',
  rewardJenis: '', rewardBentuk: '', rewardPembayaran: '', rewardBank: '', rewardNoRekening: '', rewardNominal: 0, rewardHargaPajak: 'exclude', rewardProducts: [], rewardProductRows: {}, target: '', rewardMode: 'persen', rewardValue: 0, rewardPeriodeAwal: '', rewardPeriodeAkhir: '', rewardKeterangan: '',
  rewardPpnAktif: false, rewardPpnRate: '', rewardPphAktif: false, rewardPphRate: '',
  mediaTipe: '', mediaKeterangan: '', promosiNominal: 0, promosiHargaPajak: 'exclude', promosiCaraPembayaran: '', promosiPeriodeAwal: '', promosiDurasiBulan: 0,
  promosiPpnAktif: false, promosiPpnRate: '', promosiPphAktif: false, promosiPphRate: '',
  listingProducts: [emptyListingProductRow()],
  listingPkp: true, listingReturn: true, listingBiayaLabel: false, listingNominal: 0, listingHargaPajak: 'exclude', listingTempoPembayaran: '', listingCaraPembayaran: '',
  listingPpnAktif: false, listingPpnRate: '', listingPphAktif: false, listingPphRate: '',
  eventJenis: '', eventJenisLainnya: '', eventBentuk: '', eventMediaJenis: [], eventMediaDetails: [], eventNominal: 0, eventHargaPajak: 'exclude', eventCaraPembayaran: '', eventDurasiBulan: 0, eventPeriodeAwal: '', eventPeriodeAkhir: '', eventKeterangan: '',
  eventPpnAktif: false, eventPpnRate: '', eventPphAktif: false, eventPphRate: '',
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
  const [onGroups, setOnGroups] = useState<OnFakturGroup[]>([emptyOnFakturGroup()]);

  const [offProductScope, setOffProductScope] = useState<ProductScope>('per-plu');
  const [offSelectedSubCategory, setOffSelectedSubCategory] = useState('');
  const [offGroups, setOffGroups] = useState<OffFakturGroup[]>([emptyOffFakturGroup()]);

  const [budgetLink, setBudgetLink] = useState<BudgetLinkState>(INITIAL_BUDGET_LINK);

  const [pendapatan, setPendapatan] = useState<PendapatanState>(INITIAL_PENDAPATAN);

  const [catatan, setCatatan] = useState('');
  const [signature, setSignature] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [paymentAgreed, setPaymentAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subCategories = Array.from(new Set(PRODUCT_CATALOG.map((p) => p.subKategori)));

  const setUF = <K extends keyof UpdateInfoState>(f: K, v: UpdateInfoState[K]) => setUpdateInfo((p) => ({ ...p, [f]: v }));
  const setPF = <K extends keyof ProgramInfoState>(f: K, v: ProgramInfoState[K]) => setProgramInfo((p) => ({ ...p, [f]: v }));
  const setBL = <K extends keyof BudgetLinkState>(f: K, v: BudgetLinkState[K]) => setBudgetLink((p) => ({ ...p, [f]: v }));
  const setPendF = <K extends keyof PendapatanState>(f: K, v: PendapatanState[K]) => setPendapatan((p) => ({ ...p, [f]: v }));

  const steps = getSteps(jenisMemo, programInfo.tipe);
  const currentKey = steps[Math.min(step, steps.length - 1)].key;

  const onProducts = onGroups.flatMap((group) => group.products);
  const onRows = onGroups.reduce<Record<string, OnFakturProductRow>>((acc, group) => {
    group.products.forEach((product) => {
      acc[product.plu] = {
        ...(group.rows[product.plu] || emptyOnFakturProductRow()),
        diskonMode: group.diskonMode,
        diskonBasis: group.diskonBasis,
        diskonValue: group.diskonValue,
      };
    });
    return acc;
  }, {});
  const offProducts = offGroups.flatMap((group) => group.products);
  const offRows = offGroups.reduce<Record<string, OffFakturProductRow>>((acc, group) => {
    group.products.forEach((product) => {
      acc[product.plu] = {
        ...(group.rows[product.plu] || emptyOffFakturProductRow()),
        diskonMode: group.diskonMode,
        diskonBasis: group.diskonBasis,
        diskonValue: group.diskonValue,
      };
    });
    return acc;
  }, {});

  /* Keep per-product rows in sync with the selected product scope — On Faktur and Off Faktur tracked independently */
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
    setOnProductScope('per-plu'); setOnSelectedSubCategory(''); setOnGroups([emptyOnFakturGroup()]);
    setOffProductScope('per-plu'); setOffSelectedSubCategory(''); setOffGroups([emptyOffFakturGroup()]);
    setBudgetLink(INITIAL_BUDGET_LINK); setPendapatan(INITIAL_PENDAPATAN);
  };

  const syncOnGroupRows = (products: Product[], rows: Record<string, OnFakturProductRow>) => {
    const next: Record<string, OnFakturProductRow> = {};
    products.forEach((product) => { next[product.plu] = rows[product.plu] || emptyOnFakturProductRow(); });
    return next;
  };
  const syncOffGroupRows = (products: Product[], rows: Record<string, OffFakturProductRow>) => {
    const next: Record<string, OffFakturProductRow> = {};
    products.forEach((product) => { next[product.plu] = rows[product.plu] || emptyOffFakturProductRow(); });
    return next;
  };
  const updateOnGroup = <K extends keyof OnFakturGroup>(index: number, field: K, val: OnFakturGroup[K]) =>
    setOnGroups((prev) => prev.map((group, i) => i === index ? { ...group, [field]: val } : group));
  const updateOffGroup = <K extends keyof OffFakturGroup>(index: number, field: K, val: OffFakturGroup[K]) =>
    setOffGroups((prev) => prev.map((group, i) => i === index ? { ...group, [field]: val } : group));
  const updateOnGroupProducts = (index: number, products: Product[]) =>
    setOnGroups((prev) => prev.map((group, i) => i === index ? { ...group, products, rows: syncOnGroupRows(products, group.rows) } : group));
  const updateOffGroupProducts = (index: number, products: Product[]) =>
    setOffGroups((prev) => prev.map((group, i) => i === index ? { ...group, products, rows: syncOffGroupRows(products, group.rows) } : group));
  const updateOnGroupRow = (index: number, plu: string, field: keyof OnFakturProductRow, val: string | number | boolean) =>
    setOnGroups((prev) => prev.map((group, i) => i === index ? { ...group, rows: { ...group.rows, [plu]: { ...(group.rows[plu] || emptyOnFakturProductRow()), [field]: val } } } : group));
  const updateOffGroupRow = (index: number, plu: string, field: keyof OffFakturProductRow, val: string | number | boolean) =>
    setOffGroups((prev) => prev.map((group, i) => i === index ? { ...group, rows: { ...group.rows, [plu]: { ...(group.rows[plu] || emptyOffFakturProductRow()), [field]: val } } } : group));
  const addOnGroup = () => setOnGroups((prev) => [...prev, emptyOnFakturGroup()]);
  const addOffGroup = () => setOffGroups((prev) => [...prev, emptyOffFakturGroup()]);
  const removeOnGroup = (index: number) => setOnGroups((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));
  const removeOffGroup = (index: number) => setOffGroups((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));

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
              const middleEmpty = !row?.qty2 && !row?.satuan2;
              const middleComplete = Boolean(row?.qty2 && row?.satuan2);
              return Boolean(row && row.qty1 > 0 && row.satuan1 && row.qty3 > 0 && row.satuan3 && (middleEmpty || middleComplete));
            }
            const valOk = (updateInfo.produkValues[key2] || '').trim();
            const unitOk = f === 'gramasi' ? (updateInfo.produkUnits[key2] || '').trim() : true;
            return Boolean(valOk) && Boolean(unitOk);
          }));
        if (updateInfo.selectedProducts.length > 0 && updateInfo.produkFields.length > 0 && !allFilled) e.produkValues = 'Lengkapi data baru (termasuk satuan) untuk setiap produk & data yang dipilih.';
      }
      if (updateInfo.jenisUpdate === 'vendor') {
        if (updateInfo.vendorFields.length === 0) e.vendorFields = 'Pilih minimal satu data yang akan diupdate.';
        const vendorFilled = updateInfo.vendorFields.every((f) => {
          if (f === 'picList') {
            const picRows = parseVendorPicRows(updateInfo.vendorValues[f] || getVendorOldValue(identity, f));
            return picRows.length > 0 && picRows.every((row) => row.nama.trim() && row.kontak.trim());
          }
          return (updateInfo.vendorValues[f] || '').trim();
        });
        if (updateInfo.vendorFields.length > 0 && !vendorFilled) e.vendorValues = 'Lengkapi seluruh data baru.';
      }
    }
    if (key === 'program-info') {
      if (!programInfo.namaProgram.trim()) e.namaProgram = 'Nama program wajib diisi.';
      if (programInfo.tipe.length === 0) e.tipe = 'Pilih minimal satu tipe program.';
      if (programInfo.ppnAktif && !programInfo.ppnRate) e.ppnRate = 'Pilih tarif PPN.';
      if (programInfo.pphAktif && !programInfo.pphRate) e.pphRate = 'Pilih tarif PPh.';
      if (!programInfo.redaksi.trim()) e.redaksi = 'Redaksi wajib diisi.';
      if (!programInfo.periodeAwal) e.periodeAwal = 'Periode dari wajib diisi.';
      if (!programInfo.periodeAkhir) e.periodeAkhir = 'Periode sampai wajib diisi.';
      if (programInfo.periodeAwal && programInfo.periodeAkhir && programInfo.periodeAkhir < programInfo.periodeAwal) e.periodeAkhir = 'Periode sampai tidak boleh sebelum periode dari.';
    }
    if (key === 'program-detail') {
      const hasOn = programInfo.tipe.includes('on-faktur');
      const hasOff = programInfo.tipe.includes('off-faktur');
      if (hasOn) {
        const emptyGroup = onGroups.some((group) => group.products.length === 0);
        const invalid = onGroups.some((group) => !(group.diskonValue > 0));
        const bandedInvalid = onGroups.some((group) => group.products.some((p) => group.rows[p.plu]?.bandedAktif && !group.rows[p.plu]?.banded.trim()));
        const budgetInvalid = onGroups.some((group) => group.products.some((p) => group.rows[p.plu]?.budgetAktif && !(group.rows[p.plu]?.budgetNominal > 0)));
        if (emptyGroup) e.onProduk = 'Pilih minimal satu produk untuk setiap kelompok potongan On Faktur.';
        if (invalid) e.onProduk = e.onProduk || 'Isi nilai potongan untuk setiap kelompok On Faktur.';
        if (bandedInvalid) e.onProduk = e.onProduk || 'Isi keterangan banded untuk produk On Faktur yang memilih Ya.';
        if (budgetInvalid) e.onProduk = e.onProduk || 'Isi nominal budget untuk produk On Faktur yang memakai budget.';
      }
      if (hasOff) {
        const emptyGroup = offGroups.some((group) => group.products.length === 0);
        const invalid = offGroups.some((group) => !(group.diskonValue > 0));
        const basisInvalid = offGroups.some((group) => group.diskonMode === 'persen' && !group.diskonBasis);
        const kuponInvalid = offGroups.some((group) => group.products.some((p) => group.rows[p.plu]?.kuponVoucherAktif && !group.rows[p.plu]?.kuponVoucher.trim()));
        const freeProdukInvalid = offGroups.some((group) => group.products.some((p) => group.rows[p.plu]?.freeProdukAktif && !group.rows[p.plu]?.freeProdukKeterangan.trim()));
        const budgetInvalid = offGroups.some((group) => group.products.some((p) => group.rows[p.plu]?.budgetAktif && !(group.rows[p.plu]?.budgetNominal > 0)));
        if (emptyGroup) e.offProduk = 'Pilih minimal satu produk untuk setiap kelompok potongan Off Faktur.';
        if (invalid) e.offProduk = e.offProduk || 'Isi nilai potongan untuk setiap kelompok Off Faktur.';
        if (kuponInvalid) e.offProduk = e.offProduk || 'Isi keterangan kupon/voucher untuk produk Off Faktur yang memilih Ya.';
        if (freeProdukInvalid) e.offProduk = e.offProduk || 'Isi keterangan free produk untuk produk Off Faktur yang memilih Ya.';
        if (basisInvalid) e.offProduk = e.offProduk || 'Pilih basis persentase CBP/RBP untuk produk Off Faktur.';
        if (budgetInvalid) e.offProduk = e.offProduk || 'Isi nominal budget untuk produk Off Faktur yang memakai budget.';
      }
    }
    if (key === 'catatan') {
      if (jenisMemo === 'memo-program' && !programInfo.caraPembayaran) e.caraPembayaran = 'Pilih cara pembayaran.';
    }
    if (key === 'pendapatan-jenis') {
      if (!pendapatan.jenis) e.jenis = 'Pilih jenis program pendapatan.';
    }
    if (key === 'pendapatan') {
      if (!pendapatan.namaProgram.trim()) e.namaProgram = 'Nama program wajib diisi.';
      if (!pendapatan.jenis) e.jenis = 'Pilih jenis program pendapatan.';
      if (pendapatan.jenis === 'sewa-visibility') {
        if (!pendapatan.sewaJenis) e.sewaJenis = 'Pilih jenis sewa/visibility.';
        if (!pendapatan.sewaNominal) e.sewaJenis = e.sewaJenis || 'Lengkapi nilai sewa.';
        if (!pendapatan.sewaHargaPajak) e.sewaJenis = e.sewaJenis || 'Pilih include atau exclude pajak.';
        if (!pendapatan.sewaCaraPembayaran) e.sewaJenis = e.sewaJenis || 'Pilih cara pembayaran.';
        if (!pendapatan.sewaPeriodeAwal || !pendapatan.sewaDurasiBulan) e.sewaJenis = e.sewaJenis || 'Lengkapi tanggal mulai dan durasi sewa.';
        if (!pendapatan.sewaPpnAktif && !pendapatan.sewaPphAktif) e.sewaPpnRate = 'Aktifkan PPN dan/atau PPh untuk sewa/visibility ini.';
        if (pendapatan.sewaPpnAktif && !pendapatan.sewaPpnRate) e.sewaPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.sewaPphAktif && !pendapatan.sewaPphRate) e.sewaPphRate = 'Pilih tarif PPh.';
      }
      if (pendapatan.jenis === 'reward-insentif') {
        if (!pendapatan.rewardJenis) e.rewardJenis = 'Pilih reward atau insentif.';
        if (!pendapatan.rewardBentuk) e.rewardBentuk = 'Pilih uang, barang, hadiah, atau trip.';
        if (pendapatan.rewardBentuk === 'Uang' && !pendapatan.rewardPembayaran) e.rewardPembayaran = 'Pilih cara pembayaran.';
        if (pendapatan.rewardBentuk === 'Uang' && !pendapatan.rewardNominal) e.rewardNominal = 'Isi nominal.';
        if (pendapatan.rewardBentuk === 'Uang' && !pendapatan.rewardHargaPajak) e.rewardNominal = e.rewardNominal || 'Pilih include atau exclude pajak.';
        if (!pendapatan.rewardPeriodeAwal || !pendapatan.rewardPeriodeAkhir) e.target = e.target || 'Lengkapi tanggal mulai dan tanggal sampai.';
        if (!pendapatan.rewardPpnAktif && !pendapatan.rewardPphAktif) e.rewardPpnRate = 'Aktifkan PPN dan/atau PPh untuk reward/insentif ini.';
        if (pendapatan.rewardPpnAktif && !pendapatan.rewardPpnRate) e.rewardPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.rewardPphAktif && !pendapatan.rewardPphRate) e.rewardPphRate = 'Pilih tarif PPh.';
      }
      if (pendapatan.jenis === 'promosi') {
        if (!pendapatan.mediaTipe) e.jenis = 'Pilih jenis media.';
        if (!pendapatan.promosiNominal) e.jenis = e.jenis || 'Lengkapi nilai sewa promosi.';
        if (!pendapatan.promosiHargaPajak) e.jenis = e.jenis || 'Pilih include atau exclude pajak.';
        if (!pendapatan.promosiCaraPembayaran) e.jenis = e.jenis || 'Pilih cara pembayaran.';
        if (!pendapatan.promosiPeriodeAwal || !pendapatan.promosiDurasiBulan) e.jenis = e.jenis || 'Lengkapi tanggal mulai dan durasi sewa.';
        if (!pendapatan.promosiPpnAktif && !pendapatan.promosiPphAktif) e.promosiPpnRate = 'Aktifkan PPN dan/atau PPh untuk promosi ini.';
        if (pendapatan.promosiPpnAktif && !pendapatan.promosiPpnRate) e.promosiPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.promosiPphAktif && !pendapatan.promosiPphRate) e.promosiPphRate = 'Pilih tarif PPh.';
      }
      if (pendapatan.jenis === 'listing') {
        const rowsValid = pendapatan.listingProducts.length > 0 && pendapatan.listingProducts.every((r) =>
          r.namaProduk.trim() &&
          r.barcodePcs.trim() &&
          r.barcodeKarton.trim() &&
          r.konversiQty1 > 0 && r.konversiSatuan1 &&
          r.konversiQty3 > 0 && r.konversiSatuan3 &&
          ((!r.konversiQty2 && !r.konversiSatuan2) || Boolean(r.konversiQty2 && r.konversiSatuan2)) &&
          r.hargaPerPcs > 0
        );
        if (!rowsValid) e.listingProducts = 'Lengkapi data setiap produk yang di-listing.';
        if (pendapatan.listingPkp === null || pendapatan.listingReturn === null || pendapatan.listingBiayaLabel === null || !pendapatan.listingHargaPajak || !pendapatan.listingTempoPembayaran.trim() || !pendapatan.listingCaraPembayaran.trim()) {
          e.listingProducts = e.listingProducts || 'Lengkapi syarat & ketentuan listing.';
        }
        if (!pendapatan.listingPpnAktif && !pendapatan.listingPphAktif) e.listingPpnRate = 'Aktifkan PPN dan/atau PPh untuk listing ini.';
        if (pendapatan.listingPpnAktif && !pendapatan.listingPpnRate) e.listingPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.listingPphAktif && !pendapatan.listingPphRate) e.listingPphRate = 'Pilih tarif PPh.';
      }
      if (pendapatan.jenis === 'event-blbms') {
        if (!pendapatan.eventJenis) e.eventJenis = 'Pilih nama event.';
        if (!pendapatan.eventBentuk) e.eventBentuk = 'Pilih kategori media.';
        if (pendapatan.eventMediaJenis.length === 0) e.eventMediaJenis = pendapatan.eventBentuk === 'Media Display Produk' ? 'Pilih minimal satu jenis media.' : 'Pilih jenis media.';
        if (pendapatan.eventBentuk === 'Media Display Produk') {
          const detailInvalid = pendapatan.eventMediaJenis.some((media) => !pendapatan.eventMediaDetails.some((row) => row.mediaJenis === media && row.nama.trim() && row.nominal >= 0 && row.tanggalMulai && row.tanggalSelesai));
          if (detailInvalid) e.eventMediaJenis = e.eventMediaJenis || 'Lengkapi minimal satu detail untuk setiap jenis media yang dipilih.';
        }
        if (!pendapatan.eventNominal) e.eventJenis = e.eventJenis || 'Lengkapi nilai sewa.';
        if (!pendapatan.eventHargaPajak) e.eventJenis = e.eventJenis || 'Pilih include atau exclude pajak.';
        if (!pendapatan.eventCaraPembayaran) e.eventJenis = e.eventJenis || 'Pilih cara pembayaran.';
        if (!pendapatan.eventPeriodeAwal || !pendapatan.eventPeriodeAkhir) e.eventJenis = e.eventJenis || 'Lengkapi tanggal mulai dan tanggal selesai sewa.';
        if (pendapatan.eventPeriodeAwal && pendapatan.eventPeriodeAkhir && pendapatan.eventPeriodeAkhir < pendapatan.eventPeriodeAwal) e.eventJenis = e.eventJenis || 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
        if (!pendapatan.eventPpnAktif && !pendapatan.eventPphAktif) e.eventPpnRate = 'Aktifkan PPN dan/atau PPh untuk event/BLBMS ini.';
        if (pendapatan.eventPpnAktif && !pendapatan.eventPpnRate) e.eventPpnRate = 'Pilih tarif PPN.';
        if (pendapatan.eventPphAktif && !pendapatan.eventPphRate) e.eventPphRate = 'Pilih tarif PPh.';
      }
    }
    if (key === 'tinjau') {
      if (!signature) e.signature = 'Tanda tangan wajib diisi.';
      if (!agreed) e.agreed = 'Centang persetujuan sebelum submit.';
      if (jenisMemo !== 'update-informasi' && !paymentAgreed) e.paymentAgreed = 'Centang pernyataan kesediaan pembayaran sebelum 2 bulan.';
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
    setOnProductScope('per-plu'); setOnSelectedSubCategory(''); setOnGroups([emptyOnFakturGroup()]);
    setOffProductScope('per-plu'); setOffSelectedSubCategory(''); setOffGroups([emptyOffFakturGroup()]);
    setBudgetLink(INITIAL_BUDGET_LINK); setPendapatan(INITIAL_PENDAPATAN);
    setCatatan(''); setSignature(''); setAgreed(false); setPaymentAgreed(false);
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
            <MannaKampusLogo />
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
          <h1 className="text-[20px] font-extrabold text-slate-900">Memo Buyer</h1>
          <p className="text-[13px] text-slate-500">Langkah {step + 1} dari {steps.length} — {steps[step].label}</p>
        </div>

        {currentKey === 'scan' && <ScanIdStep identity={identity} onScanned={onScanned} error={errors.scan} />}
        {currentKey === 'outlet' && <OutletStep outlets={outlets} outletScope={outletScope} applyOutletScope={applyOutletScope} toggleOutlet={toggleOutlet} error={errors.outlet} />}
        {currentKey === 'jenis-memo' && <JenisMemoStep value={jenisMemo} onChange={onJenisMemoChange} error={errors.jenisMemo} />}
        {currentKey === 'update-informasi' && <UpdateInformasiStep state={updateInfo} setField={setUF} onJenisUpdateChange={onJenisUpdateChange} identity={identity} errors={errors} />}
        {currentKey === 'program-info' && <ProgramInfoStep state={programInfo} setField={setPF} errors={errors} />}
        {currentKey === 'program-detail' && (
          <ProgramDetailStep
            tipe={programInfo.tipe}
            onGroups={onGroups}
            updateOnGroup={updateOnGroup}
            updateOnGroupProducts={updateOnGroupProducts}
            updateOnGroupRow={updateOnGroupRow}
            addOnGroup={addOnGroup}
            removeOnGroup={removeOnGroup}
            onError={errors.onProduk}
            offGroups={offGroups}
            updateOffGroup={updateOffGroup}
            updateOffGroupProducts={updateOffGroupProducts}
            updateOffGroupRow={updateOffGroupRow}
            addOffGroup={addOffGroup}
            removeOffGroup={removeOffGroup}
            offError={errors.offProduk}
          />
        )}
        {currentKey === 'pendapatan-jenis' && <PendapatanStep state={pendapatan} setField={setPendF} errors={errors} mode="jenis" />}
        {currentKey === 'pendapatan' && <PendapatanStep state={pendapatan} setField={setPendF} errors={errors} mode="detail" />}
        {currentKey === 'catatan' && <NotesStep catatan={catatan} setCatatan={setCatatan} jenisMemo={jenisMemo} programInfo={programInfo} setProgramField={setPF} errors={errors} />}
        {currentKey === 'tinjau' && (
          <ReviewStep
            identity={identity} outlets={outlets} jenisMemo={jenisMemo}
            updateInfo={updateInfo} programInfo={programInfo} onProducts={onProducts} onRows={onRows} offProducts={offProducts} offRows={offRows} budgetLink={budgetLink}
            pendapatan={pendapatan} catatan={catatan}
            signature={signature} setSignature={setSignature} agreed={agreed} setAgreed={setAgreed} paymentAgreed={paymentAgreed} setPaymentAgreed={setPaymentAgreed} errors={errors}
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
