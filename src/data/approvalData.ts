export interface ApprovalItem {
  plu: string; nama: string; qty: number; satuan: string;
  hargaNormal: number; program: string; potongan: number;
}

export type MemoStatus = 'menunggu_buyer' | 'menunggu_checker' | 'approved_checker' | 'ditolak';

// Tambahan: Interface untuk mencatat riwayat approval
export interface ApprovalLog {
  by: string;
  at: string;
  note?: string;
}

export interface ApprovalMemoData {
  id: string; tanggal: string; supplier: string; buyer: string;
  jenisMemo: string; program: string; metode: string; periode: string;
  outlets: string[]; status: MemoStatus; catatan: string; items: ApprovalItem[];
  ppn: boolean; pph: boolean; submittedAt: string; submittedBy: string;
  // Tambahan field log
  buyerApproval?: ApprovalLog;
  checkerApproval?: ApprovalLog;
  rejectLog?: ApprovalLog;
}

export const MEMOS: ApprovalMemoData[] = [
  {
    id: 'BM-2023-1041', tanggal: '20 Nov 2023', supplier: 'PT. Indofood Sukses Makmur',
    buyer: 'Andi Saputra', jenisMemo: 'Rafaksi', program: 'Rafaksi Harga',
    metode: 'Off Faktur', periode: '01 Nov – 30 Nov 2023',
    outlets: ['MK1', 'MK2', 'MK3'],
    status: 'menunggu_checker', catatan: 'Program rafaksi untuk produk mie instant periode November 2023.',
    submittedAt: '20 Nov 2023, 09:15', submittedBy: 'Budi Hartono', ppn: true, pph: false,
    buyerApproval: { by: 'Andi Saputra', at: '20 Nov 2023, 10:00' }, // Dummy log buyer
    items: [
      { plu: '8001234', nama: 'Indomie Goreng 85g', qty: 200, satuan: 'Karton', hargaNormal: 95000, program: 'Rafaksi', potongan: 9500 },
      { plu: '8001236', nama: 'Indomie Soto 70g', qty: 100, satuan: 'Karton', hargaNormal: 82000, program: 'Rafaksi', potongan: 7500 },
    ],
  },
  {
    id: 'BM-2023-1040', tanggal: '19 Nov 2023', supplier: 'PT. Unilever Indonesia',
    buyer: 'Citra Wulandari', jenisMemo: 'Visibility', program: 'Visibility Display',
    metode: 'On Faktur', periode: '01 Nov – 30 Nov 2023',
    outlets: ['MK4', 'MK5'],
    status: 'menunggu_buyer', catatan: 'Pemasangan display produk di area prime gondola.',
    submittedAt: '19 Nov 2023, 14:30', submittedBy: 'Citra Wulandari', ppn: false, pph: false,
    items: [
      { plu: '8002001', nama: 'Sunsilk Hijab Shampo 180ml', qty: 50, satuan: 'Pcs', hargaNormal: 28000, program: 'Visibility', potongan: 5000 },
      { plu: '8002002', nama: 'Dove Body Lotion 250ml', qty: 80, satuan: 'Pcs', hargaNormal: 45000, program: 'Visibility', potongan: 8000 },
    ],
  },
  {
    id: 'BM-2023-1039', tanggal: '18 Nov 2023', supplier: 'PT. Wings Surya',
    buyer: 'Dedi Kurniawan', jenisMemo: 'Diskon', program: 'Diskon Reguler',
    metode: 'Off Faktur', periode: '15 Nov – 15 Des 2023',
    outlets: ['MK5', 'MK6'],
    status: 'approved_checker', catatan: 'Diskon reguler Q4.',
    submittedAt: '18 Nov 2023, 10:00', submittedBy: 'Dedi Kurniawan', ppn: true, pph: true,
    buyerApproval: { by: 'Dedi Kurniawan', at: '18 Nov 2023, 11:30' },
    checkerApproval: { by: 'System Admin', at: '18 Nov 2023, 14:00' },
    items: [
      { plu: '8003001', nama: 'So Klin Softener 1L', qty: 300, satuan: 'Pcs', hargaNormal: 18000, program: 'Diskon', potongan: 2500 },
    ],
  },
  {
    id: 'BM-2023-1038', tanggal: '17 Nov 2023', supplier: 'PT. Nestle Indonesia',
    buyer: 'Andi Saputra', jenisMemo: 'Banded', program: 'Banded Pack',
    metode: 'On Faktur', periode: '01 Des – 31 Des 2023',
    outlets: ['MK3', 'MK4'],
    status: 'ditolak', catatan: 'Bundling produk.',
    submittedAt: '17 Nov 2023, 08:45', submittedBy: 'Andi Saputra', ppn: false, pph: false,
    rejectLog: { by: 'System Admin', at: '17 Nov 2023, 09:30', note: 'Anggaran tidak sesuai, mohon direvisi.' },
    items: [
      { plu: '8004001', nama: 'Dancow Full Cream 1kg', qty: 100, satuan: 'Karton', hargaNormal: 65000, program: 'Banded', potongan: 7000 },
    ],
  },
];