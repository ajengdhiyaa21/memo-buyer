export interface SellOutItem {
  plu: string;
  nama: string;
  qty: number;
  hargaNormal: number;
  program: number;
  potongan: number;
  total: number;
}

export interface Report {
  id: string;
  tanggal: string;
  laporan: string;
  supplier: string;
  periode: string;
  outlets: string[];
  subtotal: number;
  ppn: number;
  pph: number;
  total: number;
  items: SellOutItem[];
}

export const reports: Report[] = [
  {
    id: 'SO-2023-11-01', tanggal: '26-11-2023', laporan: 'Laporan Sell Out Nov',
    supplier: 'PT. Indofood CBP', periode: '01-11-2023 s/d 25-11-2023',
    outlets: ['MK1', 'MK2', 'MK3', 'MINI1'],
    subtotal: 12500000, ppn: 1375000, pph: 250000, total: 13625000,
    items: [
      { plu: 'PRD-001', nama: 'Indomie Goreng 85g',    qty: 200, hargaNormal: 3500,  program: 3200,  potongan: 300,  total: 640000  },
      { plu: 'PRD-002', nama: 'Indomie Kuah 70g',      qty: 150, hargaNormal: 3200,  program: 2900,  potongan: 300,  total: 435000  },
      { plu: 'PRD-003', nama: 'Pop Mie Cup 75g',       qty: 100, hargaNormal: 4000,  program: 3700,  potongan: 300,  total: 370000  },
    ],
  },
  {
    id: 'SO-2023-11-02', tanggal: '20-11-2023', laporan: 'Sell Out Special Promo',
    supplier: 'PT. Unilever Indonesia', periode: '01-11-2023 s/d 15-11-2023',
    outlets: ['MK4', 'MK5', 'MINI2', 'MINI3'],
    subtotal: 8200000, ppn: 902000, pph: 164000, total: 9102000,
    items: [
      { plu: 'PRD-010', nama: 'Sunlight Jeruk 400ml',  qty: 120, hargaNormal: 12000, program: 11000, potongan: 1000, total: 1320000 },
      { plu: 'PRD-011', nama: 'Rinso Anti Noda 900g',  qty: 80,  hargaNormal: 25000, program: 23000, potongan: 2000, total: 1840000 },
    ],
  },
  {
    id: 'SO-2023-10-05', tanggal: '05-11-2023', laporan: 'Laporan Sell Out Okt',
    supplier: 'PT. Wings Surya', periode: '01-10-2023 s/d 31-10-2023',
    outlets: ['MK1', 'MK2', 'MK3', 'MK4', 'MK5', 'MK6', 'MK7'],
    subtotal: 24500000, ppn: 2695000, pph: 490000, total: 27195000,
    items: [
      { plu: 'PRD-020', nama: 'So Klin Softener 1L',   qty: 300, hargaNormal: 18000, program: 16500, potongan: 1500, total: 4950000 },
      { plu: 'PRD-021', nama: 'Mie Sedap Goreng 90g',  qty: 500, hargaNormal: 3300,  program: 3000,  potongan: 300,  total: 1500000 },
      { plu: 'PRD-022', nama: 'GIV Body Soap 90g',     qty: 250, hargaNormal: 4500,  program: 4000,  potongan: 500,  total: 1000000 },
    ],
  },
];
