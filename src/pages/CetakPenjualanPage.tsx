import { useState } from 'react';
import { Printer, ArrowLeft, FileText, Building2, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

/* ── Shared data type (mirror of SettingHarga) ── */
interface PriceItem {
  plu: string; nama: string; qty: number; satuan: string;
  hargaNormal: number; program: string; potonganPct: number; potonganRp: number;
}
interface SettingMemo {
  id: string; supplier: string; buyer: string; program: string;
  periode: string; jenisMemo: string; metode: string;
  ppnRate: number; pphRate: number; ppnAktif: boolean; pphAktif: boolean;
  tanggalApproved: string; totalItem: number; items: PriceItem[];
  outlets: string[];
}

const APPROVED_MEMOS: SettingMemo[] = [
  {
    id: 'BM-2023-1041', supplier: 'PT. Indofood Sukses Makmur',
    buyer: 'Andi Saputra', program: 'Rafaksi Harga',
    periode: '01 Nov – 30 Nov 2023', jenisMemo: 'Rafaksi',
    metode: 'Off Faktur', ppnRate: 11, pphRate: 1.5,
    ppnAktif: true, pphAktif: false,
    tanggalApproved: '21 Nov 2023', totalItem: 3,
    outlets: ['MK1', 'MK2', 'MK3', 'MINI1'],
    items: [
      { plu: '8001234', nama: 'Indomie Goreng 85g', qty: 200, satuan: 'Karton', hargaNormal: 95000, program: 'Rafaksi', potonganPct: 10, potonganRp: 9500 },
      { plu: '8001235', nama: 'Indomie Kuah Ayam 70g', qty: 150, satuan: 'Karton', hargaNormal: 82000, program: 'Rafaksi', potonganPct: 10, potonganRp: 8200 },
      { plu: '8001236', nama: 'Indomie Soto 70g', qty: 100, satuan: 'Karton', hargaNormal: 82000, program: 'Rafaksi', potonganPct: 9.15, potonganRp: 7500 },
    ],
  },
  {
    id: 'BM-2023-1039', supplier: 'PT. Wings Surya',
    buyer: 'Dedi Kurniawan', program: 'Diskon Reguler',
    periode: '15 Nov – 15 Des 2023', jenisMemo: 'Diskon',
    metode: 'Off Faktur', ppnRate: 11, pphRate: 1.5,
    ppnAktif: true, pphAktif: true,
    tanggalApproved: '20 Nov 2023', totalItem: 1,
    outlets: ['MK4', 'MK5', 'MK6'],
    items: [
      { plu: '8003001', nama: 'So Klin Softener 1L', qty: 300, satuan: 'Pcs', hargaNormal: 18000, program: 'Diskon', potonganPct: 13.89, potonganRp: 2500 },
    ],
  },
  {
    id: 'BM-2023-1037', supplier: 'PT. Mayora Indah',
    buyer: 'Eko Prasetyo', program: 'Free Product',
    periode: '01 Sep – 30 Sep 2023', jenisMemo: 'Free Product',
    metode: 'On Faktur', ppnRate: 11, pphRate: 1.5,
    ppnAktif: false, pphAktif: false,
    tanggalApproved: '15 Nov 2023', totalItem: 1,
    outlets: ['MK7', 'MK8', 'MINI2', 'MINI3'],
    items: [
      { plu: '8005001', nama: 'Roma Kelapa 330g', qty: 250, satuan: 'Pcs', hargaNormal: 18000, program: 'Free Product', potonganPct: 8.33, potonganRp: 1500 },
    ],
  },
];

const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

/* ── Print Preview ── */
function PrintView({ memo, onBack }: { memo: SettingMemo; onBack: () => void }) {
  const rows = memo.items.map((item, i) => ({
    no: i + 1,
    plu: item.plu,
    nama: item.nama,
    qty: item.qty,
    satuan: item.satuan,
    harga: item.hargaNormal,
    potongan: item.potonganRp,
    klaim: item.potonganRp * item.qty,
  }));

  const grandTotal = rows.reduce((s, r) => s + r.klaim, 0);
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);

  return (
    <div className="space-y-4">
      {/* Print controls — hidden when printing */}
      <div className="print:hidden flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all shadow-sm active:scale-[0.98]"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak / PDF
        </button>
      </div>

      {/* Print Document */}
      <div className="bg-white rounded-xl border border-border shadow-sm print:shadow-none print:border-none print:rounded-none p-8 max-w-4xl mx-auto">

        {/* ── Document Header ── */}
        <div className="text-center mb-6 pb-5 border-b-2 border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">ERP Portal — Buyer Memo System</p>
          <h1 className="text-[22px] font-black text-slate-900 uppercase tracking-wide">Laporan Penjualan</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Klaim Program Supplier</p>
        </div>

        {/* ── Info Grid ── */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-2.5 mb-6 text-[12px]">
          <div className="flex gap-2 items-start">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 font-semibold">Supplier</span>
              <p className="text-slate-900 font-bold">{memo.supplier}</p>
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 font-semibold">No. Memo / Program</span>
              <p className="text-slate-900 font-bold">{memo.id} — {memo.program}</p>
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 font-semibold">Outlet</span>
              <p className="text-slate-900 font-bold">{memo.outlets.join(', ')}</p>
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 font-semibold">Periode Program</span>
              <p className="text-slate-900 font-bold">{memo.periode}</p>
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-slate-400 font-semibold text-[11px] mt-0.5">Jenis Memo</span>
            <p className="text-slate-900 font-semibold ml-1">{memo.jenisMemo}</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-slate-400 font-semibold text-[11px] mt-0.5">Metode</span>
            <p className="text-slate-900 font-semibold ml-1">{memo.metode}</p>
          </div>
        </div>

        {/* ── Items Table ── */}
        <table className="min-w-full text-[12px] mb-0">
          <thead>
            <tr className="border-y-2 border-slate-800">
              <th className="py-2.5 text-center font-bold text-slate-800 w-8">No.</th>
              <th className="py-2.5 text-left font-bold text-slate-800 min-w-[90px]">PLU / SKU</th>
              <th className="py-2.5 text-left font-bold text-slate-800">Nama Barang</th>
              <th className="py-2.5 text-center font-bold text-slate-800 w-16">Sat.</th>
              <th className="py-2.5 text-right font-bold text-slate-800 w-16">Qty</th>
              <th className="py-2.5 text-right font-bold text-slate-800 w-28">Harga (Rp)</th>
              <th className="py-2.5 text-right font-bold text-slate-800 w-28">Potongan (Rp)</th>
              <th className="py-2.5 text-right font-bold text-slate-800 w-32">Klaim / Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.plu} className="border-b border-slate-200">
                <td className="py-2.5 text-center text-slate-500">{row.no}</td>
                <td className="py-2.5 font-mono text-[11px] text-slate-500">{row.plu}</td>
                <td className="py-2.5 font-semibold text-slate-900">{row.nama}</td>
                <td className="py-2.5 text-center text-slate-500">{row.satuan}</td>
                <td className="py-2.5 text-right text-slate-900 font-semibold">{row.qty.toLocaleString('id-ID')}</td>
                <td className="py-2.5 text-right text-slate-600">{row.harga.toLocaleString('id-ID')}</td>
                <td className="py-2.5 text-right text-slate-600">{row.potongan.toLocaleString('id-ID')}</td>
                <td className="py-2.5 text-right font-bold text-slate-900">{fmt(row.klaim)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-slate-50/80">
              <td colSpan={4} className="py-2.5 text-left pl-2 font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Subtotal</td>
              <td className="py-2.5 text-right font-bold text-slate-900">{totalQty.toLocaleString('id-ID')}</td>
              <td colSpan={2} />
              <td className="py-2.5 text-right font-bold text-slate-900">{fmt(grandTotal)}</td>
            </tr>
            {memo.ppnAktif && (
              <tr>
                <td colSpan={7} className="py-1.5 text-right text-[11px] text-slate-500 font-semibold">PPN {memo.ppnRate}%</td>
                <td className="py-1.5 text-right text-[11px] text-slate-500">{fmt(grandTotal * memo.ppnRate / 100)}</td>
              </tr>
            )}
            {memo.pphAktif && (
              <tr>
                <td colSpan={7} className="py-1.5 text-right text-[11px] text-slate-500 font-semibold">PPh {memo.pphRate}%</td>
                <td className="py-1.5 text-right text-[11px] text-slate-500">{fmt(grandTotal * memo.pphRate / 100)}</td>
              </tr>
            )}
            <tr className="border-y-2 border-slate-800">
              <td colSpan={7} className="py-3 text-right font-black text-slate-900 text-[13px]">Grand Total Klaim</td>
              <td className="py-3 text-right font-black text-slate-900 text-[14px]">
                {fmt(
                  grandTotal +
                  (memo.ppnAktif ? grandTotal * memo.ppnRate / 100 : 0) +
                  (memo.pphAktif ? grandTotal * memo.pphRate / 100 : 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ── Notes ── */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-500">Catatan: </span>
          Dokumen ini merupakan laporan resmi klaim program supplier berdasarkan memo yang telah disetujui. Data harga mengacu pada Setting Harga yang telah dikonfirmasi.
        </div>

        {/* ── Signature ── */}
        <div className="grid grid-cols-3 gap-6 mt-8 pt-4 border-t border-slate-200 text-[11px]">
          {['Dibuat Oleh (Buyer)', 'Disetujui (Finance)', 'Mengetahui (Supplier)'].map((label) => (
            <div key={label} className="text-center">
              <p className="font-semibold text-slate-600 mb-16">{label}</p>
              <div className="border-b-2 border-slate-300 mb-1.5" />
              <p className="text-slate-400">Nama &amp; Tanda Tangan</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Memo List ── */
export function CetakPenjualanPage() {
  const [printMemo, setPrintMemo] = useState<SettingMemo | null>(null);

  if (printMemo) {
    return <PrintView memo={printMemo} onBack={() => setPrintMemo(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Printer className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <h1 className="text-[18px] font-bold text-foreground">Cetak Penjualan</h1>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Daftar memo yang telah melalui Setting Harga. Klik <strong>Cetak</strong> untuk mencetak laporan klaim supplier.
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-[13px] font-semibold text-foreground">Memo Siap Cetak</p>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-700">{APPROVED_MEMOS.length} memo siap</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {['No. Memo', 'Supplier', 'Program', 'Outlet', 'Periode', 'Tgl Approved', 'Item', 'Aksi'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${i === 7 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {APPROVED_MEMOS.map((memo) => {
                const grandTotal = memo.items.reduce((s, item) => s + item.potonganRp * item.qty, 0);
                return (
                  <tr key={memo.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[12px] font-mono font-bold text-amber-700">{memo.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-3 h-3 text-amber-700" />
                        </div>
                        <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">{memo.supplier}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground">{memo.program}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 flex-wrap max-w-[160px]">
                        {memo.outlets.slice(0, 3).map((o) => (
                          <span key={o} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">{o}</span>
                        ))}
                        {memo.outlets.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">+{memo.outlets.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                        {memo.periode}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{memo.tanggalApproved}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{memo.totalItem} item</p>
                        <p className="text-[11px] text-muted-foreground">{fmt(grandTotal)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setPrintMemo(memo)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all active:scale-[0.98] shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
