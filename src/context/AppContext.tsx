import { createContext, useContext, useState, ReactNode } from 'react';

export const ALL_OUTLETS = ['MK1', 'MK2', 'MK3', 'MK4', 'MK5', 'MK6', 'MK7', 'MK8', 'MINI1', 'MINI2', 'MINI3'];

export const OUTLET_META: Record<string, { nama: string; tipe: 'Supermarket' | 'Mini Market'; kota: string }> = {
  MK1:   { nama: 'MK1 — Manna Kampus 1', tipe: 'Supermarket', kota: 'Babarsari'   },
  MK2:   { nama: 'MK2 — Manna Kampus 2', tipe: 'Supermarket', kota: 'Simanjuntak'  },
  MK3:   { nama: 'MK3 — Manna Kampus 3', tipe: 'Supermarket', kota: 'Supeno'    },
  MK4:   { nama: 'MK4 — Manna Kampus 4', tipe: 'Supermarket', kota: 'Palagan'    },
  MK5:   { nama: 'MK5 — Manna Kampus 5', tipe: 'Supermarket', kota: 'Godean'    },
  MK6:   { nama: 'MK6 — Manna Kampus 6', tipe: 'Supermarket', kota: 'Imogiri'            },
  MK7:   { nama: 'MK7 — Manna Kampus 7', tipe: 'Supermarket', kota: 'Keloran'           },
  MK8:   { nama: 'MK8 — Manna Kampus 8', tipe: 'Supermarket', kota: 'Condong Catur'        },
  MINI1: { nama: 'MINI1 — Mini Market 1',      tipe: 'Mini Market', kota: 'Pelemsewu'   },
  MINI2: { nama: 'MINI2 — Mini Market 2',      tipe: 'Mini Market', kota: 'Diro'  },
  MINI3: { nama: 'MINI3 — Mini Market 3',      tipe: 'Mini Market', kota: 'Minomartani'           },
};

/* ── Role Types ── */
export type UserRole = 'Super Admin' | 'Admin' | 'Buyer' | 'Op Buyer' | 'Checker Pembayaran' | 'Supplier';

/* ── Module Types ── */
export type ModuleKey = 
  | 'dashboard'
  | 'master-user'
  | 'master-produk'
  | 'master-supplier'
  | 'master-outlet'
  | 'master-jenis-memo'
  | 'master-jenis-program'
  | 'master-pajak'
  | 'master-penjualan'
  | 'program-memo'
  | 'program-buat-memo'
  | 'program-approval'
  | 'program-setting-harga'
  | 'laporan-sell-out'
  | 'laporan-penjualan';

export type PermissionType = 'Lihat' | 'Tambah' | 'Edit' | 'Hapus';

export interface ModulePermission {
  Lihat: boolean;
  Tambah: boolean;
  Edit: boolean;
  Hapus: boolean;
}

export interface UserPermissions {
  [moduleKey: string]: ModulePermission;
}

/* ── Default permissions per role ── */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  'Super Admin': {
    'dashboard': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-user': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-produk': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-supplier': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-outlet': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-jenis-memo': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-jenis-program': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-pajak': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-penjualan': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'program-memo': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'program-buat-memo': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'program-approval': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'program-setting-harga': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'laporan-sell-out': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'laporan-penjualan': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
  },
  'Admin': {
    'dashboard': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'master-user': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-produk': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-supplier': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-outlet': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-jenis-memo': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-jenis-program': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-pajak': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'master-penjualan': { Lihat: true, Tambah: true, Edit: true, Hapus: true },
    'program-memo': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'program-buat-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-approval': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-setting-harga': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'laporan-sell-out': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'laporan-penjualan': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
  },
  'Buyer': {
    'dashboard': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'master-user': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-produk': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-supplier': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-outlet': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-program': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-pajak': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-penjualan': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-memo': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'program-buat-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-approval': { Lihat: true, Tambah: false, Edit: true, Hapus: false },
    'program-setting-harga': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'laporan-sell-out': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'laporan-penjualan': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
  },
  'Op Buyer': {
    'dashboard': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'master-user': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-produk': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-supplier': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-outlet': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-program': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-pajak': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-penjualan': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-memo': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'program-buat-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-approval': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-setting-harga': { Lihat: true, Tambah: false, Edit: true, Hapus: false },
    'laporan-sell-out': { Lihat: true, Tambah: true, Edit: false, Hapus: false },
    'laporan-penjualan': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
  },
  'Checker Pembayaran': {
    'dashboard': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'master-user': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-produk': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-supplier': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-outlet': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-program': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-pajak': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-penjualan': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-memo': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'program-buat-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-approval': { Lihat: true, Tambah: false, Edit: true, Hapus: false },
    'program-setting-harga': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'laporan-sell-out': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'laporan-penjualan': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
  },
  'Supplier': {
    'dashboard': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'master-user': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-produk': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-supplier': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-outlet': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-jenis-program': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-pajak': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'master-penjualan': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-memo': { Lihat: true, Tambah: false, Edit: false, Hapus: false },
    'program-buat-memo': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-approval': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'program-setting-harga': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'laporan-sell-out': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
    'laporan-penjualan': { Lihat: false, Tambah: false, Edit: false, Hapus: false },
  },
};

export interface User {
  id: string;
  nama: string;
  initials: string;
  email: string;
  role: UserRole;
  assignedOutlets: string[];
  permissions?: UserPermissions;
}

/* ── Mock current user (swap this with real auth) ── */
const DEFAULT_CURRENT_USER: User = {
  id:              'USR-006',
  nama:            'User',
  initials:        'FR',
  email:           'user@bm.co.id',
  role:            'Super Admin',
  /* In a real system, Buyer gets a subset; here Super Admin sees all */
  assignedOutlets: ALL_OUTLETS,
  permissions:     DEFAULT_ROLE_PERMISSIONS['Super Admin'],
};

type AppContextType = {
  currentUser:      User;
  setCurrentUser:   (user: User) => void;
  selectedOutlet:   string | null;
  setSelectedOutlet:(o: string | null) => void;
  hasPermission:    (module: ModuleKey, permission: PermissionType) => boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_CURRENT_USER);
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);

  const hasPermission = (module: ModuleKey, permission: PermissionType): boolean => {
    if (!currentUser.permissions) return false;
    return currentUser.permissions[module]?.[permission] ?? false;
  };

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, selectedOutlet, setSelectedOutlet, hasPermission }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
