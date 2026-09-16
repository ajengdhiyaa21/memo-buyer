import { RouterProvider, createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './layouts/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MasterData } from './pages/MasterData';
import { ListMemo } from './pages/ListMemo';
import { CreateMemo } from './pages/CreateMemo';
import { RiwayatSellOut } from './pages/RiwayatSellOut';
import { ApprovalMemo } from './pages/ApprovalMemo';
import { ApprovalDetail } from './pages/ApprovalDetail';
import { MemoDetail } from './pages/MemoDetail';
import { SellOutDetail } from './pages/SellOutDetail';
import { SettingHarga } from './pages/SettingHarga';
import SupplierForm from './pages/SupplierForm';
import { CredentialPage } from './pages/CredentialPage';

// Import komponen Penjualan yang baru dibuat
import { PenjualanMasterPage } from './pages/PenjualanMasterPage';
import { LaporanPenjualanPage } from './pages/LaporanPenjualanPage';
import { DataPenjualanPage } from './pages/DataPenjualanPage';
import { CetakPenjualanPage } from './pages/CetakPenjualanPage';

const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/supplier/form',
    Component: SupplierForm,
  },
  {
    path: '/credential',
    Component: CredentialPage,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: Dashboard },
      
      // Rute spesifik untuk master-data penjualan diletakkan di sini 
      // agar tidak bertabrakan dengan master-data/:type
      { path: 'master-data/penjualan', Component: PenjualanMasterPage },
      { path: 'master-data/:type', Component: MasterData },
      
      { path: 'program-supplier/memo', Component: ListMemo },
      { path: 'program-supplier/memo/create', Component: CreateMemo },
      { path: 'program-supplier/approval', Component: ApprovalMemo },
      { path: 'program-supplier/approval/:id', Component: ApprovalDetail },
      { path: 'program-supplier/memo/:no', Component: MemoDetail },
      { path: 'program-supplier/setting-harga', Component: SettingHarga },
      
      { path: 'laporan/sell-out', Component: RiwayatSellOut },
      { path: 'laporan/sell-out/:id', Component: SellOutDetail },
      
      // Rute baru untuk Purchasing - Penjualan
      { path: 'purchasing/penjualan/laporan', Component: LaporanPenjualanPage }, // Tanpa parameter ID
      { path: 'purchasing/penjualan/laporan/:kode', Component: LaporanPenjualanPage }, // Dengan parameter ID (Opsional)
      { path: 'purchasing/penjualan/data', Component: DataPenjualanPage },
      { path: 'purchasing/penjualan/cetak', Component: CetakPenjualanPage },
      
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
