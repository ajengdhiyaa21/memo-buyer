import { useState, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Search, Plus, Upload, Download, Filter, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, Shield, Check, Ban, KeyRound,
  Eye, EyeOff, Store, Save, ChevronDown, ShoppingCart, BarChart2,
  Settings, ArrowLeft,
} from 'lucide-react';
import { useApp, OUTLET_META, ALL_OUTLETS } from '../context/AppContext';

/* ── Types ── */
type PageType = 'user' | 'produk' | 'supplier' | 'outlet' | 'hak-akses' | 'jenis-memo' | 'jenis-program' | 'pajak';

/* ── Hak Akses Config (Modal User) ── */
const MODULES = [
  { group: 'Dashboard', key: 'dashboard', label: 'Dashboard', supplierOnly: false },
  { group: 'Master Data', key: 'master-user', label: 'User & Hak Akses', supplierOnly: false },
  { group: 'Master Data', key: 'master-produk', label: 'Produk (Barang)', supplierOnly: false },
  { group: 'Master Data', key: 'master-supplier', label: 'Supplier', supplierOnly: false },
  { group: 'Master Data', key: 'master-jenis-memo', label: 'Jenis Memo', supplierOnly: false },
  { group: 'Master Data', key: 'master-jenis-program', label: 'Jenis Program', supplierOnly: false },
  { group: 'Master Data', key: 'master-outlet', label: 'Outlet', supplierOnly: false },
  { group: 'Master Data', key: 'master-pajak', label: 'Pajak', supplierOnly: false },
  { group: 'Program Supplier', key: 'memo-list', label: 'List Memo', supplierOnly: false },
  { group: 'Program Supplier', key: 'memo-create', label: 'Buat Memo', supplierOnly: false },
  { group: 'Program Supplier', key: 'approval-memo', label: 'Approval Memo', supplierOnly: true },
  { group: 'Program Supplier', key: 'setting-harga', label: 'Setting Harga', supplierOnly: false },
  { group: 'Laporan', key: 'laporan-sellout', label: 'Riwayat Sell Out', supplierOnly: false },
];
const PERMS = ['Lihat', 'Tambah', 'Edit', 'Hapus'] as const;
type PermKey = typeof PERMS[number];

type PermState = Record<string, Record<PermKey, boolean>>;

const defaultPerms = (role: string): PermState => {
  const base: PermState = {};
  MODULES.forEach(({ key, supplierOnly }) => {
    const isSupplierModule = supplierOnly;
    if (role === 'Super Admin') {
      base[key] = { Lihat: true, Tambah: true, Edit: true, Hapus: true };
    } else if (role === 'Supplier') {
      base[key] = {
        Lihat: isSupplierModule || key === 'memo-list',
        Tambah: false, Edit: false, Hapus: false,
      };
    } else if (role === 'Buyer') {
      base[key] = {
        Lihat: key !== 'master-user' && key !== 'master-pajak' && !isSupplierModule,
        Tambah: ['memo-create'].includes(key),
        Edit: ['memo-list'].includes(key),
        Hapus: false,
      };
    } else if (role === 'Admin Harga') {
      base[key] = {
        Lihat: !isSupplierModule,
        Tambah: !['master-user', 'approval-memo'].includes(key),
        Edit: !['master-user', 'approval-memo'].includes(key),
        Hapus: ['master-produk', 'master-supplier'].includes(key),
      };
    } else if (role === 'Op Buyer') {
      base[key] = {
        Lihat: ['dashboard', 'setting-harga', 'laporan-sellout'].includes(key),
        Tambah: false, Edit: false, Hapus: false,
      };
    } else if (role === 'Checker Pembayaran') {
      base[key] = {
        Lihat: ['dashboard', 'laporan-sellout'].includes(key),
        Tambah: false, Edit: false, Hapus: false,
      };
    } else {
      base[key] = { Lihat: ['memo-list', 'laporan-sellout'].includes(key), Tambah: false, Edit: false, Hapus: false };
    }
  });
  return base;
};

/* ── Data ── */
const userData = [
  { id: 'USR-001', nama: 'Andi Susanto', email: 'andi.s@erp.co.id', role: 'Buyer', status: 'Aktif' },
  { id: 'USR-002', nama: 'Budi Hartono', email: 'budi.h@erp.co.id', role: 'Admin Harga', status: 'Aktif' },
  { id: 'USR-003', nama: 'Citra Wulandari', email: 'citra.w@erp.co.id', role: 'Buyer', status: 'Aktif' },
  { id: 'USR-004', nama: 'Dedi Kurniawan', email: 'dedi.k@erp.co.id', role: 'Admin Harga', status: 'Aktif' },
  { id: 'USR-005', nama: 'Eko Prasetyo', email: 'eko.p@erp.co.id', role: 'Supplier', status: 'Inaktif' },
  { id: 'USR-006', nama: 'Fajar Ramadan', email: 'fajar.r@erp.co.id', role: 'Super Admin', status: 'Aktif' },
  { id: 'USR-007', nama: 'Gita Lestari', email: 'gita.l@erp.co.id', role: 'Buyer', status: 'Aktif' },
  { id: 'USR-008', nama: 'Hendra Wijaya', email: 'hendra.w@erp.co.id', role: 'Op Buyer', status: 'Aktif' },
  { id: 'USR-009', nama: 'Indra Kusuma', email: 'indra.k@erp.co.id', role: 'Checker Pembayaran', status: 'Aktif' },
];

const produkData = [
  { id: 'PRD-001', nama: 'Indomie Goreng 85g', kategori: 'Makanan', subKategori: 'Mie Instan', supplier: 'PT. Indofood CBP Sukses Makmur', outlets: 'MK1: 120, MK2: 96, MK3: 88, MK8: 64', satuan: 'PCS', status: 'Aktif' },
  { id: 'PRD-002', nama: 'Indomie Kuah 70g', kategori: 'Makanan', subKategori: 'Mie Instan', supplier: 'PT. Indofood CBP Sukses Makmur', outlets: 'MK5: 110, MK6: 84, MK7: 72, MINI1: 45', satuan: 'PCS', status: 'Aktif' },
  { id: 'PRD-003', nama: 'Sunlight Jeruk 400ml', kategori: 'Home Care', subKategori: 'Sabun Cuci Piring', supplier: 'PT. Unilever Indonesia Tbk', outlets: 'MK1: 54, MK5: 48, MK6: 42, MINI2: 20', satuan: 'BTL', status: 'Aktif' },
  { id: 'PRD-004', nama: 'Rinso Anti Noda 900g', kategori: 'Home Care', subKategori: 'Detergen', supplier: 'PT. Unilever Indonesia Tbk', outlets: 'MK2: 64, MK3: 50, MK7: 36, MINI3: 18', satuan: 'PCS', status: 'Aktif' },
  { id: 'PRD-005', nama: 'So Klin Softener 1L', kategori: 'Home Care', subKategori: 'Pelembut', supplier: 'PT. Wings Surya', outlets: 'MK1: 38, MK4: 31, MK6: 28, MINI1: 14', satuan: 'BTL', status: 'Aktif' },
  { id: 'PRD-006', nama: 'Dancow Full Cream 1kg', kategori: 'Dairy', subKategori: 'Susu Bubuk', supplier: 'PT. Nestle Indonesia', outlets: 'MK3: 25, MK5: 22, MK8: 18, MINI2: 9', satuan: 'KG', status: 'Aktif' },
  { id: 'PRD-007', nama: 'Roma Kelapa 330g', kategori: 'Snack', subKategori: 'Biskuit', supplier: 'PT. Mayora Indah Tbk', outlets: 'MK1: 70, MK2: 62, MK7: 44, MINI3: 24', satuan: 'PCS', status: 'Aktif' },
];

const supplierData = [
  { id: 'PRI-001', tipe: 'Principle', nama: 'PT. Indofood CBP Sukses Makmur', principle: '-', pic: 'Hendra S.', telp: '021-5795-1234', status: 'Aktif' },
  { id: 'PRI-002', tipe: 'Principle', nama: 'PT. Unilever Indonesia Tbk', principle: '-', pic: 'Dewi K.', telp: '021-8282-1234', status: 'Aktif' },
  { id: 'SUP-001', tipe: 'Supplier', nama: 'CV. Sumber Rejeki', principle: 'PT. Indofood CBP Sukses Makmur', pic: 'Ari P.', telp: '0274-552-100', status: 'Aktif' },
  { id: 'SUP-002', tipe: 'Supplier', nama: 'PT. Mitra Distribusi Nusantara', principle: 'PT. Unilever Indonesia Tbk', pic: 'Rina K.', telp: '0274-552-200', status: 'Aktif' },
  { id: 'SUP-003', tipe: 'Supplier', nama: 'UD. Makmur Jaya', principle: '-', pic: 'Bagas W.', telp: '0274-552-300', status: 'Aktif' },
  { id: 'SUP-004', tipe: 'Supplier', nama: 'PT. Wings Surya', principle: '-', pic: 'Arman T.', telp: '031-8971-2345', status: 'Aktif' },
  { id: 'SUP-005', tipe: 'Supplier', nama: 'PT. Nestle Indonesia', principle: '-', pic: 'Maria S.', telp: '021-5262-3456', status: 'Aktif' },
];

const outletData = [
  { id: 'OTL-001', kode: 'MK1', nama: 'MK1 - Manna Kampus 1', kota: 'Yogyakarta', alamat: 'Babarsari', tipe: 'Supermarket', status: 'Aktif' },
  { id: 'OTL-002', kode: 'MK2', nama: 'MK2 - Manna Kampus 2', kota: 'Yogyakarta', alamat: 'Simanjuntak', tipe: 'Supermarket', status: 'Aktif' },
  { id: 'OTL-003', kode: 'MK3', nama: 'MK3 - Manna Kampus 3', kota: 'Yogyakarta', alamat: 'Supeno', tipe: 'Supermarket', status: 'Aktif' },
  { id: 'OTL-004', kode: 'MK4', nama: 'MK4 - Manna Kampus 4', kota: 'Yogyakarta', alamat: 'Palagan', tipe: 'Supermarket', status: 'Aktif' },
  { id: 'OTL-005', kode: 'MK5', nama: 'MK5 - Manna Kampus 5', kota: 'Yogyakarta', alamat: 'Godean', tipe: 'Supermarket', status: 'Aktif' },
  { id: 'OTL-006', kode: 'MK6', nama: 'MK6 - Manna Kampus 6', kota: 'Yogyakarta', alamat: 'Imogiri', tipe: 'Supermarket', status: 'Aktif' },
  { id: 'OTL-007', kode: 'MK7', nama: 'MK7 - Manna Kampus 7', kota: 'Yogyakarta', alamat: 'Keloran', tipe: 'Supermarket', status: 'Aktif' },
  { id: 'OTL-008', kode: 'MK8', nama: 'MK8 - Manna Kampus 8', kota: 'Yogyakarta', alamat: 'Condong Catur', tipe: 'Supermarket', status: 'Inaktif' },
  { id: 'OTL-009', kode: 'MINI1', nama: 'MINI1 - Mini Manna Kampus 1', kota: 'Yogyakarta', alamat: 'Pelemsewu', tipe: 'Mini Market', status: 'Aktif' },
  { id: 'OTL-010', kode: 'MINI2', nama: 'MINI2 - Mini Manna Kampus 2', kota: 'Yogyakarta', alamat: 'Diro', tipe: 'Mini Market', status: 'Aktif' },
  { id: 'OTL-011', kode: 'MINI3', nama: 'MINI3 - Mini Manna Kampus 3', kota: 'Yogyakarta', alamat: 'Minomartani', tipe: 'Mini Market', status: 'Aktif' },
];

const jenisMemoData = [
  { id: 'JM-001', kode: '01-PRG', nama: 'Program', keterangan: 'MK1 - Memo untuk program promosi supplier', status: 'Aktif' },
  { id: 'JM-002', kode: '02-PRI', nama: 'Perubahan Informasi', keterangan: 'MK2 - Memo perubahan data / informasi', status: 'Aktif' },
  { id: 'JM-003', kode: '05-SEW', nama: 'Sewa', keterangan: 'MK5 - Memo sewa gondola, area display, dll', status: 'Aktif' },
  { id: 'JM-004', kode: '07-BND', nama: 'Banded', keterangan: 'MK7 - Memo bundling produk supplier', status: 'Aktif' },
  { id: 'JM-005', kode: '10-OTH', nama: 'Lainnya', keterangan: 'MINI2 - Jenis memo di luar kategori utama', status: 'Inaktif' },
];

const jenisProgramData = [
  { id: 'JP-001', kode: '01-RAF', nama: 'Rafaksi', deskripsi: 'MK1 - Potongan harga langsung dari supplier', status: 'Aktif' },
  { id: 'JP-002', kode: '02-VIS', nama: 'Visibility', deskripsi: 'MK2 - Biaya penempatan & display produk', status: 'Aktif' },
  { id: 'JP-003', kode: '05-DIS', nama: 'Diskon', deskripsi: 'MK5 - Program diskon pembelian produk', status: 'Aktif' },
  { id: 'JP-004', kode: '07-BND', nama: 'Banded', deskripsi: 'MK7 - Program bundling / paket produk', status: 'Aktif' },
  { id: 'JP-005', kode: '08-FRP', nama: 'Free Product', deskripsi: 'MK8 - Produk bonus / gratis dari supplier', status: 'Aktif' },
  { id: 'JP-006', kode: '10-SEW', nama: 'Sewa Space', deskripsi: 'MINI2 - Biaya sewa area display tertentu', status: 'Inaktif' },
];

const pajakData = [
  { id: 'PAJ-001', jenis: 'PPN', persentase: 11, keterangan: 'Pajak Pertambahan Nilai (berlaku umum)', status: 'Aktif' },
  { id: 'PAJ-002', jenis: 'PPh 22', persentase: 1.5, keterangan: 'Pajak Penghasilan Pasal 22 (impor)', status: 'Aktif' },
  { id: 'PAJ-003', jenis: 'PPh 23', persentase: 2, keterangan: 'Pajak Penghasilan Pasal 23 (jasa)', status: 'Aktif' },
  { id: 'PAJ-004', jenis: 'PPh 4(2)', persentase: 10, keterangan: 'PPh Final Pasal 4 ayat 2 (sewa)', status: 'Aktif' },
  { id: 'PAJ-005', jenis: 'PPN BM', persentase: 20, keterangan: 'PPN Barang Mewah', status: 'Inaktif' },
];

/* ── Shared UI ── */
const roleBadge: Record<string, string> = {
  'Super Admin': 'bg-amber-50 text-amber-800 border border-amber-300',
  'Buyer': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Admin Harga': 'bg-violet-50 text-violet-700 border border-violet-200',
  'Supplier': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Op Buyer': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Checker Pembayaran': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'Aktif';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
      {isActive ? <Check className="w-2.5 h-2.5" /> : <Ban className="w-2.5 h-2.5" />}
      {status}
    </span>
  );
}

function ActionButtons({ onEdit, onDelete, onView }: { onEdit: () => void; onDelete: () => void; onView?: () => void }) {
  return (
    <div className="flex justify-end items-center gap-1">
      {onView && (
        <button onClick={onView} className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Riwayat Penjualan">
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}
      <button onClick={onEdit} className="p-1.5 text-muted-foreground hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDelete} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Hak Akses Modal ── */
function HakAksesModal({ user, onClose }: { user: typeof userData[0]; onClose: () => void }) {
  const [perms, setPerms] = useState<PermState>(defaultPerms(user.role));

  const toggle = (moduleKey: string, perm: PermKey) => {
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [perm]: !prev[moduleKey][perm] },
    }));
  };

  const toggleAllRow = (moduleKey: string) => {
    const all = PERMS.every((p) => perms[moduleKey][p]);
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: { Lihat: !all, Tambah: !all, Edit: !all, Hapus: !all },
    }));
  };

  const groups = MODULES.reduce<Record<string, typeof MODULES>>((acc, m) => {
    if (!acc[m.group]) acc[m.group] = [];
    acc[m.group].push(m);
    return acc;
  }, {});

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 text-sm font-bold flex items-center justify-center">
                {user.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-foreground">{user.nama}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleBadge[user.role] ?? ''}`}>
                    <Shield className="w-2.5 h-2.5" />{user.role}
                  </span>
                  <span className="ml-2">{user.email}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
            <p className="text-[11px] text-amber-700 font-medium">
              <KeyRound className="w-3 h-3 inline mr-1" />
              Atur hak akses per modul. Centang izin yang diperbolehkan untuk user ini.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted border-b border-border">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Modul</th>
                  {PERMS.map((p) => (
                    <th key={p} className="px-3 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">{p}</th>
                  ))}
                  <th className="px-3 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Semua</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groups).map(([groupName, modules]) => (
                  <Fragment key={`group-${groupName}`}>
                    <tr className="bg-stone-50 border-y border-border">
                      <td colSpan={6} className="px-5 py-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{groupName}</span>
                      </td>
                    </tr>
                    {modules.map((mod) => {
                      const allChecked = PERMS.every((p) => perms[mod.key]?.[p]);
                      return (
                        <tr key={mod.key} className={`border-b border-border hover:bg-muted/30 transition-colors ${mod.supplierOnly ? 'bg-amber-50/40' : ''}`}>
                          <td className="px-5 py-3 text-[13px] font-medium text-foreground pl-8">
                            <div className="flex items-center gap-2">
                              {mod.label}
                              {mod.supplierOnly && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                  Supplier Only
                                </span>
                              )}
                            </div>
                          </td>
                          {PERMS.map((p) => (
                            <td key={p} className="px-3 py-3 text-center">
                              <button
                                onClick={() => toggle(mod.key, p)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                  perms[mod.key]?.[p]
                                    ? 'bg-amber-700 border-amber-700 text-white'
                                    : 'border-border hover:border-amber-400'
                                }`}
                              >
                                {perms[mod.key]?.[p] && <Check className="w-2.5 h-2.5" />}
                              </button>
                            </td>
                          ))}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => toggleAllRow(mod.key)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                allChecked ? 'bg-stone-700 border-stone-700 text-white' : 'border-border hover:border-stone-400'
                              }`}
                            >
                              {allChecked && <Check className="w-2.5 h-2.5" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors">
              Batal
            </button>
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all active:scale-[0.98] shadow-sm">
              Simpan Hak Akses
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Add/Edit Modal ── */
function DataModal({ type, onClose }: { type: PageType; onClose: () => void }) {
  const [showPwd, setShowPwd] = useState(false);
  const [assignedOutlets, setAssignedOutlets] = useState<string[]>([]);
  const inputCls = "w-full px-3 py-2 border border-border rounded-lg text-[13px] bg-card focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all placeholder:text-muted-foreground";

  const formFields: Record<PageType, Array<{ label: string; type: string; placeholder: string; options?: string[]; isPwd?: boolean }>> = {
    user: [
      { label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap user' },
      { label: 'Email', type: 'email', placeholder: 'email@example.com' },
      { label: 'Role', type: 'select', placeholder: '', options: ['Super Admin', 'Buyer', 'Admin Harga', 'Op Buyer', 'Checker Pembayaran'] },
      { label: 'Password', type: 'password', placeholder: 'Min. 8 karakter', isPwd: true },
      { label: 'Status', type: 'select', placeholder: '', options: ['Aktif', 'Inaktif'] },
    ],
    produk: [
      { label: 'Kode / PLU', type: 'text', placeholder: 'Kode produk / PLU' },
      { label: 'Nama Produk', type: 'text', placeholder: 'Nama produk lengkap' },
      { label: 'Kategori', type: 'text', placeholder: 'Kategori produk' },
      { label: 'Sub Kategori', type: 'text', placeholder: 'Sub kategori produk' },
      { label: 'Supplier', type: 'select', placeholder: '', options: supplierData.map((s) => s.nama) },
      { label: 'Satuan', type: 'select', placeholder: '', options: ['PCS', 'BTL', 'KG', 'CTN', 'DUS'] },
      { label: 'Status', type: 'select', placeholder: '', options: ['Aktif', 'Inaktif'] },
    ],
    supplier: [
      { label: 'Tipe', type: 'select', placeholder: '', options: ['Principle', 'Supplier'] },
      { label: 'Nama Supplier / Principle', type: 'text', placeholder: 'Nama perusahaan' },
      { label: 'Principle', type: 'select', placeholder: '', options: ['Tidak Ada', ...supplierData.filter((s) => s.tipe === 'Principle').map((s) => s.nama)] },
      { label: 'Nama PIC', type: 'text', placeholder: 'Nama contact person' },
      { label: 'No. Telepon', type: 'text', placeholder: '021-xxxx-xxxx' },
      { label: 'Status', type: 'select', placeholder: '', options: ['Aktif', 'Inaktif'] },
    ],
    outlet: [
      { label: 'Kode Outlet', type: 'text', placeholder: 'e.g. MK9, MINI4' },
      { label: 'Nama Outlet', type: 'text', placeholder: 'Nama lengkap outlet' },
      { label: 'Kota', type: 'text', placeholder: 'Kota lokasi outlet' },
      { label: 'Alamat', type: 'text', placeholder: 'Alamat lengkap outlet' },
      { label: 'Tipe', type: 'select', placeholder: '', options: ['Supermarket', 'Mini Market'] },
      { label: 'Status', type: 'select', placeholder: '', options: ['Aktif', 'Inaktif'] },
    ],
    'jenis-memo': [
      { label: 'Kode Memo', type: 'text', placeholder: 'Contoh: 01-PRG' },
      { label: 'Nama Jenis Memo', type: 'text', placeholder: 'Nama jenis memo' },
      { label: 'Keterangan', type: 'text', placeholder: 'Deskripsi singkat' },
      { label: 'Status', type: 'select', placeholder: '', options: ['Aktif', 'Inaktif'] },
    ],
    'jenis-program': [
      { label: 'Kode Program', type: 'text', placeholder: 'Contoh: 01-RAF' },
      { label: 'Nama Program', type: 'text', placeholder: 'Nama program promosi' },
      { label: 'Deskripsi', type: 'text', placeholder: 'Penjelasan program' },
      { label: 'Status', type: 'select', placeholder: '', options: ['Aktif', 'Inaktif'] },
    ],
    pajak: [
      { label: 'Jenis Pajak', type: 'text', placeholder: 'e.g. PPN, PPh 23' },
      { label: 'Persentase (%)', type: 'number', placeholder: 'e.g. 11' },
      { label: 'Keterangan', type: 'text', placeholder: 'Keterangan pajak' },
      { label: 'Status', type: 'select', placeholder: '', options: ['Aktif', 'Inaktif'] },
    ],
    'hak-akses': [],
  };

  const fields = formFields[type] || [];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Tambah Data Baru</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Isi semua field yang diperlukan</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {fields.map((f) => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-[12px] font-semibold text-foreground">{f.label}</label>
                {f.type === 'select' ? (
                  <select className={inputCls}>
                    <option value="">Pilih {f.label}...</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.isPwd ? (
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} className={`${inputCls} pr-10`} placeholder={f.placeholder} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <input type={f.type} className={inputCls} placeholder={f.placeholder} />
                )}
              </div>
            ))}

            {type === 'user' && (
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-foreground flex items-center justify-between">
                  <span>Assigned Outlets</span>
                  <button
                    type="button"
                    onClick={() => setAssignedOutlets(assignedOutlets.length === ALL_OUTLETS.length ? [] : [...ALL_OUTLETS])}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    {assignedOutlets.length === ALL_OUTLETS.length ? 'Hapus Semua' : 'Pilih Semua'}
                  </button>
                </label>
                <div className="grid grid-cols-3 gap-2 p-3.5 bg-muted/40 border border-border rounded-xl">
                  {ALL_OUTLETS.map((o) => {
                    const active = assignedOutlets.includes(o);
                    return (
                      <label key={o} className="flex items-center gap-2 cursor-pointer group">
                        <button
                          type="button"
                          onClick={() => setAssignedOutlets((prev) => active ? prev.filter((x) => x !== o) : [...prev, o])}
                          className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                          style={active ? { background:'#B45309', borderColor:'#B45309' } : { borderColor:'#CBD5E1' }}
                        >
                          {active && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                        <span className="text-[12px] font-medium text-foreground group-hover:text-amber-700 transition-colors">{o}</span>
                      </label>
                    );
                  })}
                </div>
                {assignedOutlets.length > 0 && (
                  <p className="text-[11px] text-amber-700 font-medium">{assignedOutlets.length} outlet dipilih: {assignedOutlets.join(', ')}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors">Batal</button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all active:scale-[0.98]">Simpan Data</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Table Renderers ── */
function UserTable({ data, search }: { data: typeof userData; search: string }) {
  const filtered = data.filter(
    (r) => r.nama.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted/70 border-b border-border">
          {['ID', 'Nama User', 'Email', 'Role', 'Status', 'Aksi'].map((h, i) => (
            <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
            <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.id}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {r.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <span className="text-[13px] font-semibold text-foreground">{r.nama}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{r.email}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${roleBadge[r.role] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                <Shield className="w-2.5 h-2.5" />{r.role}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap"><ActionButtons onEdit={() => {}} onDelete={() => {}} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProdukTable({ data, search }: { data: typeof produkData; search: string }) {
  const navigate = useNavigate();
  const filtered = data.filter((r) =>
    r.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.kategori.toLowerCase().includes(search.toLowerCase()) ||
    r.subKategori.toLowerCase().includes(search.toLowerCase()) ||
    r.supplier.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted/70 border-b border-border">
          {['PLU / Kode', 'Nama Produk', 'Kategori', 'Sub Kategori', 'Supplier', 'Satuan', 'Status', 'Aksi'].map((h, i) => (
            <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
            <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.id}</td>
            <td className="px-4 py-3 text-[13px] font-semibold text-foreground whitespace-nowrap">{r.nama}</td>
            <td className="px-4 py-3">
              <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground">{r.kategori}</span>
            </td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{r.subKategori}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground min-w-[180px]">{r.supplier}</td>
            <td className="px-4 py-3 text-[12px] text-foreground font-medium whitespace-nowrap">{r.satuan}</td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap">
              <ActionButtons
                onEdit={() => {}}
                onDelete={() => {}}
                onView={() => navigate(`/purchasing/penjualan/laporan/${r.id}`)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SupplierTable({ data, search }: { data: typeof supplierData; search: string }) {
  const filtered = data.filter((r) =>
    r.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.tipe.toLowerCase().includes(search.toLowerCase()) ||
    r.principle.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted/70 border-b border-border">
          {['ID', 'Tipe', 'Nama', 'Principle', 'Nama PIC', 'Telepon', 'Status', 'Aksi'].map((h, i) => (
            <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
            <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.id}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${r.tipe === 'Principle' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{r.tipe}</span>
            </td>
            <td className="px-4 py-3 text-[13px] font-semibold text-foreground min-w-[190px]">{r.nama}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground min-w-[190px]">{r.principle}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{r.pic}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{r.telp}</td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap"><ActionButtons onEdit={() => {}} onDelete={() => {}} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OutletTable({ data, search }: { data: typeof outletData; search: string }) {
  const filtered = data.filter(
    (r) => r.nama.toLowerCase().includes(search.toLowerCase()) || r.kode.toLowerCase().includes(search.toLowerCase()) || r.kota.toLowerCase().includes(search.toLowerCase())
  );
  const tipeBadge: Record<string, string> = {
    'Supermarket': 'bg-blue-50 text-blue-700 border-blue-200',
    'Mini Market': 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted/70 border-b border-border">
          {['ID', 'Kode', 'Nama Outlet', 'Kota', 'Alamat', 'Tipe', 'Status', 'Aksi'].map((h, i) => (
            <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
            <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.id}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[11px] font-bold font-mono">{r.kode}</span>
            </td>
            <td className="px-4 py-3 text-[13px] font-semibold text-foreground">{r.nama}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{r.kota}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground max-w-[200px] truncate">{r.alamat}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${tipeBadge[r.tipe] ?? ''}`}>{r.tipe}</span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap"><ActionButtons onEdit={() => {}} onDelete={() => {}} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function JenisMemoTable({ data, search }: { data: typeof jenisMemoData; search: string }) {
  const filtered = data.filter((r) => r.nama.toLowerCase().includes(search.toLowerCase()) || r.kode.toLowerCase().includes(search.toLowerCase()));
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted/70 border-b border-border">
          {['Kode', 'Nama Jenis Memo', 'Keterangan / Deskripsi', 'Status', 'Aksi'].map((h, i) => (
            <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[11px] font-bold font-mono">{r.kode}</span>
            </td>
            <td className="px-4 py-3 text-[13px] font-semibold text-foreground whitespace-nowrap">{r.nama}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground">{r.keterangan}</td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap"><ActionButtons onEdit={() => {}} onDelete={() => {}} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function JenisProgramTable({ data, search }: { data: typeof jenisProgramData; search: string }) {
  const filtered = data.filter((r) => r.nama.toLowerCase().includes(search.toLowerCase()) || r.kode.toLowerCase().includes(search.toLowerCase()));
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted/70 border-b border-border">
          {['Kode', 'Nama Program', 'Deskripsi', 'Status Aktif', 'Aksi'].map((h, i) => (
            <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="px-2 py-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-md text-[11px] font-bold font-mono">{r.kode}</span>
            </td>
            <td className="px-4 py-3 text-[13px] font-semibold text-foreground whitespace-nowrap">{r.nama}</td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground">{r.deskripsi}</td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap"><ActionButtons onEdit={() => {}} onDelete={() => {}} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PajakTable({ data, search }: { data: typeof pajakData; search: string }) {
  const filtered = data.filter((r) => r.jenis.toLowerCase().includes(search.toLowerCase()));
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-muted/70 border-b border-border">
          {['ID', 'Jenis Pajak', 'Persentase (%)', 'Keterangan', 'Status', 'Aksi'].map((h, i) => (
            <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 2 ? 'text-center' : i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
            <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.id}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="text-[13px] font-bold text-foreground">{r.jenis}</span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-center">
              <span className="inline-block px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[13px] font-bold">{r.persentase}%</span>
            </td>
            <td className="px-4 py-3 text-[12px] text-muted-foreground">{r.keterangan}</td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap"><ActionButtons onEdit={() => {}} onDelete={() => {}} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ══════════════════════════════════════════════════════
   HAK AKSES MATRIX
═══════════════════════════════════════════════════════ */
const ROLE_MODULES = [
  { group: 'Data Master',       key: 'dashboard',        label: 'Dashboard' },
  { group: 'Data Master',       key: 'master-user',      label: 'User & Hak Akses' },
  { group: 'Data Master',       key: 'master-produk',    label: 'Produk (Barang)' },
  { group: 'Data Master',       key: 'master-outlet',    label: 'Outlet' },
  { group: 'Data Master',       key: 'master-supplier',  label: 'Supplier' },
  { group: 'Data Master',       key: 'master-hak-akses', label: 'Hak Akses (Role)' },
  { group: 'Data Master',       key: 'master-jenis-memo',    label: 'Jenis Memo' },
  { group: 'Data Master',       key: 'master-jenis-prog',    label: 'Jenis Program' },
  { group: 'Data Master',       key: 'master-pajak',     label: 'Pajak' },
  { group: 'Program Supplier',  key: 'memo-list',        label: 'List Memo' },
  { group: 'Program Supplier',  key: 'memo-create',      label: 'Buat Memo' },
  { group: 'Program Supplier',  key: 'approval',         label: 'Antrian Approval' },
  { group: 'Program Supplier',  key: 'setting-harga',    label: 'Setting Harga' },
  { group: 'Laporan',           key: 'sellout',          label: 'Riwayat Sell Out' },
] as const;

const ROLE_PERMS = ['Lihat', 'Tambah', 'Edit', 'Hapus', 'Approve', 'Export'] as const;
type RolePerm = typeof ROLE_PERMS[number];
type PermMatrix = Record<string, Record<string, Record<RolePerm, boolean>>>;

// Tambahkan Role default untuk men-generate matrixnya
const DEFAULT_ROLES = ['Super Admin', 'Buyer', 'Admin Harga', 'Op Buyer', 'Checker Pembayaran'];

function buildDefaultMatrix(roles: string[]): PermMatrix {
  const m: PermMatrix = {};
  roles.forEach((role) => {
    m[role] = {};
    ROLE_MODULES.forEach(({ key }) => {
      // Super admin is guaranteed to have all true
      const all = role === 'Super Admin';
      const buyer = role === 'Buyer';
      const admin = role === 'Admin Harga';
      const opBuyer = role === 'Op Buyer';
      const checker = role === 'Checker Pembayaran';

      m[role][key] = {
        Lihat:   all || buyer || admin || (opBuyer && ['dashboard', 'setting-harga', 'sellout'].includes(key)) || (checker && ['dashboard', 'sellout'].includes(key)),
        Tambah:  all || (buyer && ['memo-create'].includes(key)) || (admin && !['master-user','approval'].includes(key)),
        Edit:    all || (buyer && ['memo-list'].includes(key)) || (admin && !['master-user','approval'].includes(key)),
        Hapus:   all || (admin && ['master-produk','master-supplier'].includes(key)),
        Approve: all || (buyer && key === 'approval'),
        Export:  all || buyer || admin || opBuyer || checker,
      };
    });
  });
  return m;
}

const PERM_COLORS: Record<RolePerm, string> = {
  Lihat:   '#3B82F6',
  Tambah:  '#10B981',
  Edit:    '#F59E0B',
  Hapus:   '#EF4444',
  Approve: '#8B5CF6',
  Export:  '#06B6D4',
};

/* ── Permission Matrix Modal (per role) ── */
function PermissionModal({ roleName, matrix, onClose, onSave }: {
  roleName: string; matrix: PermMatrix; onClose: () => void;
  onSave: (m: PermMatrix) => void;
}) {
  const [local, setLocal] = useState<PermMatrix>(matrix);

  const toggle = (mod: string, perm: RolePerm) => {
    setLocal((prev) => ({
      ...prev,
      [roleName]: { ...prev[roleName], [mod]: { ...prev[roleName][mod], [perm]: !prev[roleName][mod][perm] } },
    }));
  };

  const toggleAll = (mod: string) => {
    const allOn = ROLE_PERMS.every((p) => local[roleName][mod][p]);
    setLocal((prev) => ({
      ...prev,
      [roleName]: { ...prev[roleName], [mod]: Object.fromEntries(ROLE_PERMS.map((p) => [p, !allOn])) as Record<RolePerm, boolean> },
    }));
  };

  const groups = ROLE_MODULES.reduce<Record<string, typeof ROLE_MODULES[number][]>>((acc, m) => {
    if (!acc[m.group]) acc[m.group] = [];
    acc[m.group].push(m);
    return acc;
  }, {});

  const activeMatrix = local[roleName] ?? {};

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl border border-border flex flex-col max-h-[92vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-amber-700" style={{ width:18, height:18 }} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-foreground">Atur Izin — {roleName}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Centang izin yang diperbolehkan untuk role ini</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-2.5 border-b border-border bg-muted/30 shrink-0 flex items-center gap-4 flex-wrap">
            {ROLE_PERMS.map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ background: PERM_COLORS[p] }} />
                <span className="text-[11px] font-semibold text-foreground">{p}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 border-b border-border">
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground min-w-[160px]">Modul</th>
                  {ROLE_PERMS.map((p) => (
                    <th key={p} className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider w-14" style={{ color: PERM_COLORS[p] }}>{p}</th>
                  ))}
                  <th className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-14">Semua</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groups).map(([groupName, mods]) => (
                  <Fragment key={groupName}>
                    <tr className="border-y border-border" style={{ background:'#F8FAFC' }}>
                      <td colSpan={ROLE_PERMS.length + 2} className="px-5 py-1.5">
                        <div className="flex items-center gap-2">
                          {groupName === 'Data Master'      && <Settings className="w-3 h-3 text-slate-400" />}
                          {groupName === 'Program Supplier' && <ShoppingCart className="w-3 h-3 text-slate-400" />}
                          {groupName === 'Laporan'          && <BarChart2 className="w-3 h-3 text-slate-400" />}
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{groupName}</span>
                        </div>
                      </td>
                    </tr>
                    {mods.map((mod) => {
                      const row = activeMatrix[mod.key] ?? ({} as Record<RolePerm, boolean>);
                      const allChecked = ROLE_PERMS.every((p) => row[p]);
                      return (
                        <tr key={mod.key} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-2.5 pl-9 text-[12px] font-medium text-foreground">{mod.label}</td>
                          {ROLE_PERMS.map((perm) => (
                            <td key={perm} className="px-2 py-2.5 text-center">
                              <button
                                onClick={() => toggle(mod.key, perm)}
                                className="w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all"
                                style={row[perm] ? { background: PERM_COLORS[perm], borderColor: PERM_COLORS[perm] } : { borderColor: '#CBD5E1' }}
                              >
                                {row[perm] && <Check className="w-2.5 h-2.5 text-white" />}
                              </button>
                            </td>
                          ))}
                          <td className="px-2 py-2.5 text-center">
                            <button
                              onClick={() => toggleAll(mod.key)}
                              className="w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all"
                              style={allChecked ? { background:'#374151', borderColor:'#374151' } : { borderColor:'#CBD5E1' }}
                            >
                              {allChecked && <Check className="w-2.5 h-2.5 text-white" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-border bg-muted/20 shrink-0">
            <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors">Batal</button>
            <button onClick={() => { onSave(local); onClose(); }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all">
              <Save className="w-3.5 h-3.5" />Simpan Izin
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Role data ── */
const DEFAULT_ROLE_DATA = [
  { id: 'ROLE-001', nama: 'Super Admin', deskripsi: 'Akses penuh ke semua fitur dan konfigurasi sistem', userCount: 1, status: 'Aktif' },
  { id: 'ROLE-002', nama: 'Buyer', deskripsi: 'Membuat, submit, dan melacak memo program supplier', userCount: 3, status: 'Aktif' },
  { id: 'ROLE-003', nama: 'Admin Harga', deskripsi: 'Setting harga, approve memo, dan akses laporan', userCount: 2, status: 'Aktif' },
  { id: 'ROLE-004', nama: 'Op Buyer', deskripsi: 'Eksekusi tagihan dan generate laporan sell out', userCount: 2, status: 'Aktif' },
  { id: 'ROLE-005', nama: 'Checker Pembayaran', deskripsi: 'Pengecekan dan validasi pembayaran tagihan supplier', userCount: 1, status: 'Aktif' },
];

function HakAksesMatrix() {
  const [roleData, setRoleData] = useState(DEFAULT_ROLE_DATA);
  const [roleNames, setRoleNames] = useState<string[]>(DEFAULT_ROLES);
  const [matrix, setMatrix] = useState<PermMatrix>(() => buildDefaultMatrix(DEFAULT_ROLES));
  const [editPerm, setEditPerm] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [search, setSearch] = useState('');

  const addRole = () => {
    const name = newRoleName.trim();
    if (!name || roleNames.includes(name)) return;
    const newId = `ROLE-${String(roleData.length + 1).padStart(3, '0')}`;
    setRoleData((prev) => [...prev, { id: newId, nama: name, deskripsi: newRoleDesc.trim() || '-', userCount: 0, status: 'Aktif' }]);
    setRoleNames((prev) => [...prev, name]);
    setMatrix((prev) => ({ ...prev, ...buildDefaultMatrix([name]) }));
    setNewRoleName('');
    setNewRoleDesc('');
    setAddOpen(false);
  };

  const filtered = roleData.filter((r) => r.nama.toLowerCase().includes(search.toLowerCase()) || r.deskripsi.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[15px] font-bold text-foreground">Manajemen Role</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Kelola role dan atur izin akses per modul untuk setiap peran</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-sm transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />Tambah Role
        </button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="flex items-center bg-muted/60 rounded-xl px-3 py-2 border border-border focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition-all w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama role atau deskripsi..."
              className="bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted/70 border-b border-border">
                {['ID', 'Nama Role', 'Deskripsi', 'Jumlah User', 'Status', 'Aksi'].map((h, i) => (
                  <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${i >= 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{r.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold border ${roleBadge[r.nama] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      <Shield className="w-3 h-3" />{r.nama}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground max-w-[260px]">{r.deskripsi}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-[12px] font-bold text-foreground">{r.userCount}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditPerm(r.nama)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        <KeyRound className="w-3 h-3" />Atur Izin
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission modal */}
      {editPerm && (
        <PermissionModal
          roleName={editPerm}
          matrix={matrix}
          onClose={() => setEditPerm(null)}
          onSave={(m) => setMatrix(m)}
        />
      )}

      {/* Add Role modal */}
      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setAddOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-[14px] font-bold text-foreground">Tambah Role Baru</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground">Nama Role</label>
                  <input
                    autoFocus type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Finance, Supervisor..."
                    className="w-full px-3 py-2 border border-border rounded-lg text-[13px] bg-card focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all placeholder:text-muted-foreground"
                    onKeyDown={(e) => { if (e.key === 'Enter') addRole(); }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground">Deskripsi</label>
                  <input
                    type="text" value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Deskripsi singkat role ini..."
                    className="w-full px-3 py-2 border border-border rounded-lg text-[13px] bg-card focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/30">
                <button onClick={() => setAddOpen(false)} className="px-4 py-2 border border-border rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                <button onClick={addRole} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all active:scale-[0.98]">Simpan Role</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRODUCT OUTLET CARD GRID
═══════════════════════════════════════════════════════ */
const OUTLET_PRODUCT_COUNT: Record<string, number> = {
  MK1:5, MK2:4, MK3:5, MK4:3, MK5:4, MK6:2, MK7:3, MK8:1, MINI1:4, MINI2:3, MINI3:2,
};

const CARD_GRADIENTS = [
  'linear-gradient(135deg,#1E3A5F,#2563EB)',
  'linear-gradient(135deg,#065F46,#059669)',
  'linear-gradient(135deg,#581C87,#7C3AED)',
  'linear-gradient(135deg,#92400E,#D97706)',
  'linear-gradient(135deg,#0F172A,#334155)',
  'linear-gradient(135deg,#7F1D1D,#DC2626)',
  'linear-gradient(135deg,#164E63,#0891B2)',
  'linear-gradient(135deg,#1E1B4B,#4F46E5)',
  'linear-gradient(135deg,#14532D,#15803D)',
  'linear-gradient(135deg,#4A1942,#A21CAF)',
  'linear-gradient(135deg,#7C2D12,#EA580C)',
];

function ProductOutletGrid({ outlets, onSelect }: { outlets: string[]; onSelect: (o: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[15px] font-bold text-foreground">Master Data Produk</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">Pilih outlet untuk melihat dan mengelola data produk</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {outlets.map((code, idx) => {
          const meta = OUTLET_META[code];
          const count = OUTLET_PRODUCT_COUNT[code] ?? 0;
          return (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              style={{ background: CARD_GRADIENTS[idx % CARD_GRADIENTS.length], boxShadow:'0 4px 16px -4px rgba(0,0,0,0.2)' }}
            >
              {/* Decorative circle */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-white" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10 bg-white" />

              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white">
                    {meta?.tipe === 'Supermarket' ? 'SM' : 'MM'}
                  </span>
                </div>
                <p className="text-[22px] font-extrabold text-white tracking-tight leading-none">{code}</p>
                <p className="text-[11px] text-white/70 mt-1 leading-tight">{meta?.kota}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[20px] font-extrabold text-white/90">{count}</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Produk</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ChevronDown className="w-4 h-4 text-white -rotate-90" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Config map ── */
const pageConfig: Record<PageType, { title: string; subtitle: string; addLabel: string; count: number }> = {
  user: { title: 'User & Hak Akses', subtitle: 'Kelola akun dan hak akses pengguna sistem.', addLabel: 'Tambah User', count: userData.length },
  produk: { title: 'Produk (Barang)', subtitle: 'Kelola daftar produk dan barang.', addLabel: 'Tambah Produk', count: produkData.length },
  supplier: { title: 'Supplier', subtitle: 'Kelola daftar mitra supplier.', addLabel: 'Tambah Supplier', count: supplierData.length },
  outlet: { title: 'Outlet', subtitle: 'Kelola daftar outlet dan cabang toko.', addLabel: 'Tambah Outlet', count: outletData.length },
  'hak-akses': { title: 'Hak Akses (Role)', subtitle: 'Kelola izin akses berdasarkan role pengguna.', addLabel: 'Tambah Role', count: 5 },
  'jenis-memo': { title: 'Jenis Memo', subtitle: 'Kelola kategori dan jenis memo.', addLabel: 'Tambah Jenis Memo', count: jenisMemoData.length },
  'jenis-program': { title: 'Jenis Program', subtitle: 'Kelola jenis-jenis program promosi supplier.', addLabel: 'Tambah Program', count: jenisProgramData.length },
  pajak: { title: 'Pajak', subtitle: 'Kelola jenis dan persentase pajak.', addLabel: 'Tambah Pajak', count: pajakData.length },
};

/* ── Main Component ── */
export function MasterData() {
  const { type = 'user' } = useParams<{ type: PageType }>();
  const pageType = (type as string) in pageConfig ? (type as PageType) : 'user';
  const cfg = pageConfig[pageType];
  const { currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [produkOutlet, setProdukOutlet] = useState<string | null>(null);

  /* Reset produkOutlet when leaving produk page */
  if (pageType !== 'produk' && produkOutlet !== null) setProdukOutlet(null);

  /* ── Special full-page renders ── */
  if (pageType === 'hak-akses') return <HakAksesMatrix />;

  if (pageType === 'produk' && !produkOutlet) {
    return <ProductOutletGrid outlets={currentUser.assignedOutlets} onSelect={setProdukOutlet} />;
  }

  const renderTable = () => {
    switch (pageType) {
      case 'user':          return <UserTable data={userData} search={search} />;
      case 'produk':        return <ProdukTable data={produkData} search={search} />;
      case 'supplier':      return <SupplierTable data={supplierData} search={search} />;
      case 'outlet':        return <OutletTable data={outletData} search={search} />;
      case 'jenis-memo':    return <JenisMemoTable data={jenisMemoData} search={search} />;
      case 'jenis-program': return <JenisProgramTable data={jenisProgramData} search={search} />;
      case 'pajak':         return <PajakTable data={pajakData} search={search} />;
      default:              return null;
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Produk breadcrumb */}
          {pageType === 'produk' && produkOutlet && (
            <div className="flex items-center gap-2 mb-1.5">
              <button onClick={() => setProdukOutlet(null)} className="flex items-center gap-1.5 text-[12px] text-amber-700 hover:text-amber-900 font-semibold transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />Ganti Outlet
              </button>
              <span className="text-slate-300">/</span>
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">{produkOutlet}</span>
            </div>
          )}
          <h1 className="text-lg font-bold text-foreground">
            {pageType === 'produk' && produkOutlet ? `Produk — ${produkOutlet}` : cfg.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{cfg.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {pageType === 'produk' && produkOutlet && (
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border border-border text-foreground bg-card hover:bg-muted transition-all">
              <Upload className="w-4 h-4" />Import Excel
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-sm shadow-amber-700/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            {cfg.addLabel}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center bg-muted rounded-lg px-3 py-1.5 w-64 border border-border focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-600/15 transition-all">
            <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari ${cfg.title.toLowerCase()}...`}
              className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-colors">
              <Filter className="w-3.5 h-3.5" />Filter
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-colors">
              <Upload className="w-3.5 h-3.5" />Import Excel
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-colors">
              <Download className="w-3.5 h-3.5" />Export Excel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">{renderTable()}</div>

        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-muted-foreground">Total <span className="font-semibold text-foreground">{cfg.count}</span> data</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 rounded-md bg-amber-700 text-white text-[11px] font-bold">1</span>
            <button className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showModal && <DataModal type={pageType} onClose={() => setShowModal(false)} />}
    </div>
  );
}
