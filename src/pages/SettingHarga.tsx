import React, { useState } from 'react';
import {
  CheckCircle2, DollarSign, Package,
  Save, FileText, Info, ArrowLeft,
  Clock, ChevronRight, ChevronDown, MessageSquare,
  Printer, UserCheck, CalendarClock, Ban, X, Table2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Report } from '../data/sellOutData';

/* ── Types ── */
interface PriceItem {
  plu: string; nama: string; qty: number; satuan: string;
  hargaNormal: number; program: string; potonganPct: number;
  potonganRp: number; override: boolean;
}
interface DiscountGroup {
  id: number;
  keterangan: string;
  discountMode: 'rp' | 'pct';
  discountValue: number;
  items: PriceItem[];
}

/* 🔶 Status baru untuk lifecycle setting harga */
type MemoSettingStatus = 'Menunggu Setting' | 'Sudah Disetting' | 'Sell Out Generated';

interface SettingMemo {
  id: string; supplier: string;
  picName: string; picPhone: string;
  buyer: string; program: string;
  periode: string; jenisMemo: string; jenisProgram: string;
  metode: string; catatan: string; redaksi: string;
  ppnRate: number; pphRate: number; ppnAktif: boolean; pphAktif: boolean;
  tanggalApproved: string; totalItem: number; items: PriceItem[];
  groups: DiscountGroup[];
  outlets: string[];
  status: MemoSettingStatus;
  settingBy?: string;
  settingAt?: string;
  sellOutId?: string;
  /* 🔶 field tracking baru untuk Sell Out */
  generatedBy?: string;
  generatedAt?: string;
}

/* ── PPN & PPh options ── */
const PPN_OPTIONS = [
  { value: 0, label: 'Tidak ada PPN' },
  { value: 10, label: 'PPN 10% (sebelum 2022)' },
  { value: 11, label: 'PPN 11%' },
  { value: 12, label: 'PPN 12%' },
];
const PPH_OPTIONS = [
  { value: 0, label: 'Tidak ada PPh' },
  { value: 1.5, label: 'PPh Pasal 22 — 1.5%' },
  { value: 2, label: 'PPh Pasal 22 — 2%' },
  { value: 2.5, label: 'PPh Pasal 23 — 2.5%' },
  { value: 15, label: 'PPh Pasal 4 Ayat 2 — 15%' },
];

/* ── Sample approved memos ── */
const INITIAL_MEMOS: SettingMemo[] = [
  {
    id: 'BM-2023-1041', supplier: 'PT. Indofood Sukses Makmur',
    picName: 'Andi Susanto', picPhone: '0812-3456-7890',
    buyer: 'Budi H', program: 'Rafaksi Akhir Tahun 2023',
    periode: '2023-11-01 s/d 2023-11-30', jenisMemo: 'Rafaksi', jenisProgram: 'Promo Reguler',
    metode: 'Off Faktur', ppnRate: 11, pphRate: 1.5,
    ppnAktif: true, pphAktif: false,
    catatan: 'Program rafaksi khusus untuk produk mie instan.',
    redaksi: 'Harga dipotong langsung pada tagihan sesuai kesepakatan promo akhir tahun.',
    tanggalApproved: '21 Nov 2023', totalItem: 3, outlets: ['MK1', 'MK2', 'MK3', 'MINI1'],
    status: 'Menunggu Setting',
    items: [
      { plu: '8001234', nama: 'Indomie Goreng 85g', qty: 200, satuan: 'Karton', hargaNormal: 95000, program: 'Rafaksi', potonganPct: 10, potonganRp: 9500, override: false },
      { plu: '8001235', nama: 'Indomie Kuah Ayam 70g', qty: 150, satuan: 'Karton', hargaNormal: 82000, program: 'Rafaksi', potonganPct: 10, potonganRp: 8200, override: false },
      { plu: '8001236', nama: 'Indomie Soto 70g', qty: 100, satuan: 'Karton', hargaNormal: 82000, program: 'Rafaksi', potonganPct: 9.15, potonganRp: 7500, override: false },
    ],
    groups: [
      {
        id: 1, keterangan: 'Rafaksi Indomie Goreng & Kuah', discountMode: 'pct', discountValue: 10,
        items: [
          { plu: '8001234', nama: 'Indomie Goreng 85g', qty: 200, satuan: 'Karton', hargaNormal: 95000, program: 'Rafaksi', potonganPct: 10, potonganRp: 9500, override: false },
          { plu: '8001235', nama: 'Indomie Kuah Ayam 70g', qty: 150, satuan: 'Karton', hargaNormal: 82000, program: 'Rafaksi', potonganPct: 10, potonganRp: 8200, override: false },
        ],
      },
      {
        id: 2, keterangan: 'Rafaksi Indomie Soto', discountMode: 'pct', discountValue: 9.15,
        items: [
          { plu: '8001236', nama: 'Indomie Soto 70g', qty: 100, satuan: 'Karton', hargaNormal: 82000, program: 'Rafaksi', potonganPct: 9.15, potonganRp: 7500, override: false },
        ],
      },
    ],
  },
  {
    id: 'BM-2023-1039', supplier: 'PT. Wings Surya',
    picName: 'Dedi Kurniawan', picPhone: '0856-1122-3344',
    buyer: 'Eko Prasetyo', program: 'Diskon Reguler Softener',
    periode: '2023-11-15 s/d 2023-12-15', jenisMemo: 'Diskon', jenisProgram: 'Diskon Reguler',
    metode: 'Off Faktur', ppnRate: 11, pphRate: 1.5,
    ppnAktif: true, pphAktif: true,
    catatan: 'Diskon untuk pencapaian target Q4.',
    redaksi: '',
    tanggalApproved: '20 Nov 2023', totalItem: 1, outlets: ['MK4', 'MK5', 'MK6'],
    status: 'Menunggu Setting',
    items: [
      { plu: '8003001', nama: 'So Klin Softener 1L', qty: 300, satuan: 'Pcs', hargaNormal: 18000, program: 'Diskon', potonganPct: 13.89, potonganRp: 2500, override: false },
    ],
    groups: [
      {
        id: 1, keterangan: 'Diskon So Klin Softener', discountMode: 'pct', discountValue: 13.89,
        items: [
          { plu: '8003001', nama: 'So Klin Softener 1L', qty: 300, satuan: 'Pcs', hargaNormal: 18000, program: 'Diskon', potonganPct: 13.89, potonganRp: 2500, override: false },
        ],
      },
    ],
  }
];

const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

const nowLabel = () =>
  new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';

/* ── Status badge helper ── */
const STATUS_CFG: Record<MemoSettingStatus, { cls: string; dot: string; label: string }> = {
  'Menunggu Setting': { cls: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500', label: 'Belum Disetting' },
  'Sudah Disetting': { cls: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500', label: 'Sudah Disetting' },
  'Sell Out Generated': { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', label: 'Sell Out Generated' },
};

/* ── Compute financial summary from groups ── */
function computeSummary(groups: DiscountGroup[], ppnAktif: boolean, ppnRate: number, pphAktif: boolean, pphRate: number) {
  const allItems = groups.flatMap((g) => g.items);
  const subTotal = allItems.reduce((s, it) => s + (it.hargaNormal - it.potonganRp) * it.qty, 0);
  const totalPotongan = allItems.reduce((s, it) => s + it.potonganRp * it.qty, 0);
  const ppnAmt = ppnAktif ? subTotal * ppnRate / 100 : 0;
  const pphAmt = pphAktif ? subTotal * pphRate / 100 : 0;
  const grandTotal = subTotal + ppnAmt - pphAmt;
  return { allItems, subTotal, totalPotongan, ppnAmt, pphAmt, grandTotal };
}

/* ── Confirm modal: Generate Sell Out ── */
function ConfirmGenerateModal({ memo, onClose, onConfirm }: { memo: SettingMemo; onClose: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl w-full max-w-sm pointer-events-auto overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-emerald-50/50">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">Generate Sell Out</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">{memo.id}</p>
            </div>
          </div>
          <div className="p-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3 mb-4">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-blue-800 leading-relaxed">
                Laporan Sell Out akan digenerate berdasarkan harga yang sudah disetting terakhir kali. Status memo berubah menjadi <strong className="font-bold">Sell Out Generated</strong> dan akan muncul di Riwayat Sell Out.
              </p>
            </div>
            <p className="text-[13px] text-slate-600">Lanjutkan proses generate sell out?</p>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-[13px] text-slate-600 hover:bg-slate-50 transition-colors font-medium">Batal</button>
            <button onClick={onConfirm} className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #059669, #0D9488)', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>
              Ya, Generate Sell Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Print / Cetak preview modal ── */
function PrintPreviewModal({ memo, onClose }: { memo: SettingMemo; onClose: () => void }) {
  const { allItems, subTotal, totalPotongan, ppnAmt, pphAmt, grandTotal } = computeSummary(
    memo.groups, memo.ppnAktif, memo.ppnRate, memo.pphAktif, memo.pphRate
  );

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[3px]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl">
          <div className="bg-white rounded-2xl w-full overflow-hidden shadow-2xl" style={{ maxHeight: '90vh' }}>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-red-700">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-red-200">Preview Cetak</p>
                  <h3 className="text-[14px] font-bold text-white truncate">{memo.id} · {memo.program}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /><span className="hidden sm:inline">Cetak</span>
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 text-white/60 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-auto bg-[#E5E7EB]" style={{ maxHeight: 'calc(90vh - 56px)' }}>
              <div className="mx-auto my-4 bg-white shadow-xl" style={{ width: 560, minHeight: 700, padding: '32px 40px', fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center text-white text-[10px] font-bold">BM</div>
                      <div>
                        <p className="text-[13px] font-extrabold text-slate-900">BUYER MEMO SYSTEM</p>
                        <p className="text-[9px] text-slate-400 tracking-wide uppercase">Dokumen Setting Harga</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Memo</p>
                    <p className="text-[15px] font-extrabold text-slate-900 mt-0.5">{memo.id}</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${STATUS_CFG[memo.status].cls}`}>
                      {STATUS_CFG[memo.status].label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Supplier', value: memo.supplier },
                    { label: 'Program', value: memo.program },
                    { label: 'Periode', value: memo.periode },
                    { label: 'Skema', value: memo.metode },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-slate-200 rounded p-2.5">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="text-[11px] font-semibold text-slate-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {memo.settingBy && (
                  <div className="border border-blue-200 bg-blue-50 rounded p-2.5 mb-4 flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <p className="text-[10px] text-blue-800">
                      Disetting oleh <span className="font-bold">{memo.settingBy}</span> pada <span className="font-bold">{memo.settingAt}</span>
                    </p>
                  </div>
                )}

                <table className="w-full border-collapse text-[10px] mb-4">
                  <thead>
                    <tr style={{ background: '#111827' }}>
                      {['No', 'PLU', 'Nama Barang', 'Qty', 'Hrg Normal', 'Potongan', 'Hrg Net', 'Total'].map((h, i) => (
                        <th key={h} className="px-2 py-2 text-white font-bold whitespace-nowrap"
                          style={{ textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allItems.map((it, i) => {
                      const hargaNet = it.hargaNormal - it.potonganRp;
                      return (
                        <tr key={it.plu + i} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }} className="border-b border-slate-200">
                          <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                          <td className="px-2 py-2 font-mono text-slate-500">{it.plu}</td>
                          <td className="px-2 py-2 text-slate-800 font-medium">{it.nama}</td>
                          <td className="px-2 py-2 text-right text-slate-700">{it.qty}</td>
                          <td className="px-2 py-2 text-right text-slate-600">{fmt(it.hargaNormal)}</td>
                          <td className="px-2 py-2 text-right text-red-600">-{fmt(it.potonganRp)}</td>
                          <td className="px-2 py-2 text-right text-slate-700">{fmt(hargaNet)}</td>
                          <td className="px-2 py-2 text-right font-bold text-slate-900">{fmt(hargaNet * it.qty)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-56 space-y-1 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{fmt(subTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total Potongan</span><span className="font-semibold text-red-600">-{fmt(totalPotongan)}</span></div>
                    {memo.ppnAktif && <div className="flex justify-between"><span className="text-slate-500">PPN ({memo.ppnRate}%)</span><span className="font-semibold text-violet-700">+{fmt(ppnAmt)}</span></div>}
                    {memo.pphAktif && <div className="flex justify-between"><span className="text-slate-500">PPh ({memo.pphRate}%)</span><span className="font-semibold text-blue-700">-{fmt(pphAmt)}</span></div>}
                    <div className="flex justify-between pt-1.5 border-t-2 border-slate-800">
                      <span className="font-extrabold text-slate-900">GRAND TOTAL</span>
                      <span className="font-extrabold text-amber-700 text-[12px]">{fmt(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-3 border-t border-slate-200 text-[8px] text-slate-300 text-center">
                  Dokumen ini digenerate oleh Buyer Memo System · {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Price form (step 2) — hanya Simpan & Cetak ── */
function PriceForm({
  memo, onBack, onSave,
}: {
  memo: SettingMemo;
  onBack: () => void;
  onSave: (updated: Pick<SettingMemo, 'groups' | 'ppnAktif' | 'pphAktif' | 'ppnRate' | 'pphRate' | 'program' | 'periode'>) => void;
}) {
  const [programName, setProgramName] = useState(memo.program);

  const initialDates = memo.periode.split(' s/d ');
  const [periodeDari, setPeriodeDari] = useState(initialDates[0] || '');
  const [periodeSampai, setPeriodeSampai] = useState(initialDates[1] || '');

  const [groups, setGroups] = useState<DiscountGroup[]>(memo.groups);
  const [ppnAktif, setPpnAktif] = useState(memo.ppnAktif);
  const [pphAktif, setPphAktif] = useState(memo.pphAktif);
  const [ppnRate, setPpnRate] = useState(memo.ppnRate);
  const [pphRate, setPphRate] = useState(memo.pphRate);
  const [savedNotif, setSavedNotif] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const [hasSavedThisSession, setHasSavedThisSession] = useState(memo.status !== 'Menunggu Setting');

  const updateGroupDiscountValue = (groupId: number, newValStr: string) => {
    const val = parseFloat(newValStr) || 0;
    setGroups((prev) => prev.map((g) => {
      if (g.id !== groupId) return g;
      const updatedItems = g.items.map((it) => {
        let newPotRp = it.potonganRp;
        let newPotPct = it.potonganPct;
        if (g.discountMode === 'pct') {
          newPotPct = val;
          newPotRp = Math.round((it.hargaNormal * val) / 100);
        } else {
          newPotRp = val;
          newPotPct = it.hargaNormal > 0 ? parseFloat(((val / it.hargaNormal) * 100).toFixed(2)) : 0;
        }
        return { ...it, potonganPct: newPotPct, potonganRp: newPotRp };
      });
      return { ...g, discountValue: val, items: updatedItems };
    }));
  };

  const updateItem = (groupId: number, itemIdx: number, field: keyof PriceItem, val: string) => {
    setGroups((prev) => prev.map((g) => {
      if (g.id !== groupId) return g;
      const newItems = [...g.items];
      const item = { ...newItems[itemIdx] };
      if (field === 'plu') {
        item.plu = val;
      } else if (field === 'nama') {
        item.nama = val;
      } else if (field === 'qty') {
        item.qty = parseInt(val) || 0;
        item.override = true;
      } else if (field === 'hargaNormal') {
        const num = parseFloat(val) || 0;
        item.hargaNormal = num;
        item.potonganRp = Math.round(num * item.potonganPct / 100);
        item.override = true;
      } else if (field === 'potonganPct') {
        const num = parseFloat(val) || 0;
        item.potonganPct = num;
        item.potonganRp = Math.round(item.hargaNormal * num / 100);
        item.override = true;
      } else if (field === 'potonganRp') {
        const num = parseFloat(val) || 0;
        item.potonganRp = num;
        item.potonganPct = item.hargaNormal > 0 ? parseFloat(((num / item.hargaNormal) * 100).toFixed(2)) : 0;
        item.override = true;
      }
      newItems[itemIdx] = item;
      return { ...g, items: newItems };
    }));
  };

  const handleSaveData = () => {
    const periode = periodeDari && periodeSampai ? `${periodeDari} s/d ${periodeSampai}` : memo.periode;
    onSave({ groups, ppnAktif, pphAktif, ppnRate, pphRate, program: programName, periode });
    setHasSavedThisSession(true);
    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 3000);
  };

  const { subTotal, totalPotongan, ppnAmt, pphAmt, grandTotal } = computeSummary(groups, ppnAktif, ppnRate, pphAktif, pphRate);

  const liveMemoForPrint: SettingMemo = {
    ...memo, groups, ppnAktif, pphAktif, ppnRate, pphRate, program: programName, periode: `${periodeDari} s/d ${periodeSampai}`,
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <h1 className="text-[16px] font-bold text-slate-800">Setting Harga — {memo.id}</h1>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">{memo.supplier} · {programName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPrint(true)}
            disabled={!hasSavedThisSession}
            title={!hasSavedThisSession ? 'Simpan perubahan terlebih dahulu sebelum mencetak' : undefined}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak
          </button>
          <button onClick={handleSaveData}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #B45309, #D97706)', boxShadow: '0 4px 12px rgba(180,83,9,0.25)' }}>
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </div>

      {savedNotif && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-[13px] font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Perubahan data berhasil disimpan! Untuk generate sell out, kembali ke daftar memo dan klik tombol "Generate Sell Out".
        </div>
      )}

      {!hasSavedThisSession && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-[13px] font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          Memo ini belum pernah disetting. Cetak &amp; Generate Sell Out baru bisa dilakukan setelah harga disimpan.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #FAFAFA, #FEF9F0)' }}>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[13px] font-bold text-slate-800">{memo.id}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Approved {memo.tanggalApproved}</p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Identitas Supplier</p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Nama Supplier</p>
                    <p className="text-[13px] font-semibold text-slate-800 leading-tight mt-0.5">{memo.supplier}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">PIC & Kontak</p>
                    <p className="text-[13px] font-semibold text-slate-800 leading-tight mt-0.5">
                      {memo.picName} <span className="text-slate-400 font-normal">({memo.picPhone})</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Informasi Program (Dapat Diedit)</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Nama Program *</label>
                    <input
                      type="text"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-800 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Periode Dari *</label>
                      <input
                        type="date"
                        value={periodeDari}
                        onChange={(e) => setPeriodeDari(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Periode Sampai *</label>
                      <input
                        type="date"
                        value={periodeSampai}
                        onChange={(e) => setPeriodeSampai(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Jenis Memo</p>
                      <p className="text-[12px] font-semibold text-slate-800 mt-0.5">{memo.jenisMemo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Jenis Program</p>
                      <p className="text-[12px] font-semibold text-slate-800 mt-0.5">{memo.jenisProgram}</p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Skema Penagihan</p>
                    <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{memo.metode}</span>
                  </div>
                </div>
              </div>

              {memo.settingBy && (
                <>
                  <div className="border-t border-slate-100" />
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-blue-800">Terakhir Disetting</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">oleh <strong>{memo.settingBy}</strong></p>
                      <p className="text-[11px] text-blue-700 flex items-center gap-1 mt-0.5"><CalendarClock className="w-3 h-3" />{memo.settingAt}</p>
                    </div>
                  </div>
                </>
              )}

              {(memo.catatan || memo.redaksi) && (
                <>
                  <div className="border-t border-slate-100" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Catatan & Redaksi</p>
                    <div className="space-y-3">
                      {memo.catatan && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3" /> Memo Internal
                          </p>
                          <p className="text-[12px] text-slate-700 leading-relaxed">{memo.catatan}</p>
                        </div>
                      )}
                      {memo.redaksi && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> Redaksi Cetak
                          </p>
                          <p className="text-[12px] text-slate-700 leading-relaxed">{memo.redaksi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <p className="text-[13px] font-bold text-slate-800">Pengaturan Pajak</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-slate-800">Pajak Pertambahan Nilai (PPN)</p>
                  <p className="text-[10px] text-slate-500">Pilih jenis PPN yang berlaku</p>
                </div>
                <button onClick={() => setPpnAktif(!ppnAktif)}
                  className="relative rounded-full transition-all duration-200 flex items-center shrink-0"
                  style={{ width: 40, height: 24, background: ppnAktif ? '#7C3AED' : '#CBD5E1' }}>
                  <span className="absolute w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                    style={{ left: ppnAktif ? 18 : 2 }} />
                </button>
              </div>
              <div className="relative">
                <select
                  value={ppnRate}
                  onChange={(e) => setPpnRate(Number(e.target.value))}
                  disabled={!ppnAktif}
                  className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-[12px] text-slate-800 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/15 transition-all appearance-none disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                >
                  {PPN_OPTIONS.filter(o => o.value > 0).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {ppnAktif && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span className="text-[11px] text-violet-700 font-semibold">PPN {ppnRate}% aktif</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100" />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-slate-800">Pajak Penghasilan (PPh)</p>
                  <p className="text-[10px] text-slate-500">Pilih jenis PPh yang berlaku</p>
                </div>
                <button onClick={() => setPphAktif(!pphAktif)}
                  className="relative rounded-full transition-all duration-200 flex items-center shrink-0"
                  style={{ width: 40, height: 24, background: pphAktif ? '#2563EB' : '#CBD5E1' }}>
                  <span className="absolute w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                    style={{ left: pphAktif ? 18 : 2 }} />
                </button>
              </div>
              <div className="relative">
                <select
                  value={pphRate}
                  onChange={(e) => setPphRate(Number(e.target.value))}
                  disabled={!pphAktif}
                  className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-[12px] text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 transition-all appearance-none disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                >
                  {PPH_OPTIONS.filter(o => o.value > 0).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {pphAktif && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[11px] text-blue-700 font-semibold">PPh {pphRate}% aktif</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-[13px] font-bold text-slate-800 mb-4">Ringkasan Nilai</p>
            <div className="space-y-2.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500 font-medium">Sub Total</span>
                <span className="font-bold text-slate-800">{fmt(subTotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500 font-medium">Total Potongan</span>
                <span className="font-bold text-red-600">-{fmt(totalPotongan)}</span>
              </div>
              {ppnAktif && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500 font-medium">PPN {ppnRate}%</span>
                  <span className="font-bold text-violet-600">+{fmt(ppnAmt)}</span>
                </div>
              )}
              {pphAktif && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500 font-medium">PPh {pphRate}%</span>
                  <span className="font-bold text-blue-600">-{fmt(pphAmt)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center mt-2">
                <span className="text-[14px] font-bold text-slate-800">Grand Total</span>
                <span className="text-[16px] font-black text-amber-700">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FAFAFA, #FEF9F0)' }}>
            <Package className="w-4 h-4 text-slate-400" />
            <h2 className="text-[14px] font-bold text-slate-800">Rincian Potongan Harga</h2>
            <span className="text-[12px] text-slate-500 ml-1 hidden sm:block">— edit potongan supplier per kelompok atau per produk</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-500 w-28">PLU</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-500">Nama Barang</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-500 w-24">Qty</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-500 w-36">Hrg Normal</th>
                  <th className="px-4 py-3.5 text-center font-semibold text-slate-500 w-40">Potongan</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-500 w-32">Hrg Net</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-500 w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, gi) => (
                  <React.Fragment key={`group-${group.id}`}>
                    <tr className="bg-amber-50/60 border-b border-amber-200/70">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{gi + 1}</span>
                            <span className="text-[13px] font-bold text-amber-900">{group.keterangan}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${group.discountMode === 'pct' ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                              {group.discountMode === 'pct' ? 'Persentase (%)' : 'Nominal (Rp)'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-[11px] text-amber-800 font-semibold">Potongan Supplier:</span>
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                value={group.discountValue}
                                onChange={(e) => updateGroupDiscountValue(group.id, e.target.value)}
                                className="w-24 px-2.5 py-1 border border-amber-300 rounded-lg text-right text-[12px] font-bold bg-white text-amber-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                                step={group.discountMode === 'pct' ? '0.01' : '100'}
                                min="0"
                              />
                              <span className="ml-1.5 text-[11px] font-bold text-amber-800">
                                {group.discountMode === 'pct' ? '%' : 'Rp'}
                              </span>
                            </div>
                            <span className="text-[11px] text-amber-700 ml-1">({group.items.length} item)</span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {group.items.map((it, i) => {
                      const hargaNet = it.hargaNormal - it.potonganRp;
                      const total = hargaNet * it.qty;
                      return (
                        <tr key={it.plu + i + group.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={it.plu}
                              onChange={(e) => updateItem(group.id, i, 'plu', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] font-mono bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 font-mono pl-1">{it.satuan}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={it.nama}
                                onChange={(e) => updateItem(group.id, i, 'nama', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-800"
                              />
                              {it.override && (
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold shrink-0">Edited</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 pl-1">{it.program}</p>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={it.qty}
                              onChange={(e) => updateItem(group.id, i, 'qty', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] text-right bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-800"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={it.hargaNormal}
                              onChange={(e) => updateItem(group.id, i, 'hargaNormal', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12px] text-right bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-800"
                              min="0" step="100"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative flex items-center">
                              {group.discountMode === 'pct' ? (
                                <>
                                  <input type="number" value={it.potonganPct}
                                    onChange={(e) => updateItem(group.id, i, 'potonganPct', e.target.value)}
                                    className="w-full pr-7 pl-3 py-1.5 border border-slate-200 rounded-lg text-right text-[12px] bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-800"
                                    step="0.01" min="0" max="100" />
                                  <span className="absolute right-2.5 text-slate-400 text-[12px] pointer-events-none font-bold">%</span>
                                </>
                              ) : (
                                <input type="number" value={it.potonganRp}
                                  onChange={(e) => updateItem(group.id, i, 'potonganRp', e.target.value)}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-right text-[12px] bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-800"
                                  step="100" min="0" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 text-right font-medium">
                              {group.discountMode === 'rp' ? `${it.potonganPct}%` : fmt(it.potonganRp)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">{fmt(hargaNet)}</td>
                          <td className="px-4 py-3 text-right font-bold text-amber-700">{fmt(total)}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-amber-200 bg-[#FEF9C3]/40 flex items-center gap-2 shrink-0">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-800 font-medium">Mengubah nilai "Potongan Supplier" di baris kelompok akan otomatis memperbarui nilai potongan seluruh produk dalam kelompok tersebut.</p>
          </div>
        </div>
      </div>

      {showPrint && <PrintPreviewModal memo={liveMemoForPrint} onClose={() => setShowPrint(false)} />}
    </div>
  );
}

/* ── Success state (ditampilkan setelah Generate Sell Out dari list) ── */
function SuccessView({ memoId, onBack }: { memoId: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4"
          style={{ boxShadow: '0 8px 24px rgba(5,150,105,0.2)' }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Sell Out Berhasil Digenerate</h2>
        <p className="text-[13px] text-slate-500 mb-6">
          Memo {memoId} telah diproses. Laporan sell out tersedia di Riwayat Sell Out.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />Kembali
          </button>
          <a href="/laporan/sell-out" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }}>
            <FileText className="w-4 h-4" />Lihat Riwayat
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export function SettingHarga() {
  const { selectedOutlet, currentUser, addSellOutReport } = useApp() as ReturnType<typeof useApp> & {
    addSellOutReport?: (report: Report) => void;
  };

  const [memos, setMemos] = useState<SettingMemo[]>(INITIAL_MEMOS);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [successMemoId, setSuccessId] = useState<string | null>(null);
  const [confirmGenerate, setConfirmGenerate] = useState<SettingMemo | null>(null);
  const [printMemo, setPrintMemo] = useState<SettingMemo | null>(null);

  const selectedMemo = memos.find((m) => m.id === selectedMemoId) ?? null;

  const handleSaveMemo = (id: string, updated: Pick<SettingMemo, 'groups' | 'ppnAktif' | 'pphAktif' | 'ppnRate' | 'pphRate' | 'program' | 'periode'>) => {
    setMemos((prev) => prev.map((m) => {
      if (m.id !== id) return m;
      const flatItems = updated.groups.flatMap((g) => g.items);
      return {
        ...m,
        ...updated,
        items: flatItems,
        status: m.status === 'Sell Out Generated' ? m.status : 'Sudah Disetting',
        settingBy: (currentUser as any)?.nama ?? currentUser?.name ?? 'Admin',
        settingAt: nowLabel(),
      };
    }));
  };

  const handleConfirmGenerate = () => {
    if (!confirmGenerate) return;
    const memo = confirmGenerate;
    const { allItems, subTotal, ppnAmt, pphAmt, grandTotal } = computeSummary(
      memo.groups, memo.ppnAktif, memo.ppnRate, memo.pphAktif, memo.pphRate
    );

    const sellOutId = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const operatorName = (currentUser as any)?.nama ?? currentUser?.name ?? 'Admin';

    const report: Report = {
      id: sellOutId,
      laporan: memo.program,
      supplier: memo.supplier,
      periode: memo.periode,
      tanggal: nowLabel(),
      outlets: memo.outlets,
      subtotal: subTotal,
      ppn: ppnAmt,
      pph: pphAmt,
      total: grandTotal,
      items: allItems.map((it) => ({
        plu: it.plu,
        nama: it.nama,
        qty: it.qty,
        hargaNormal: it.hargaNormal,
        program: it.hargaNormal - it.potonganRp,
        potongan: it.potonganRp,
        total: (it.hargaNormal - it.potonganRp) * it.qty,
      })),
    };

    addSellOutReport?.(report);

    setMemos((prev) => prev.map((m) =>
      m.id === memo.id ? { 
        ...m, 
        status: 'Sell Out Generated', 
        sellOutId,
        generatedBy: operatorName,
        generatedAt: nowLabel()
      } : m
    ));

    setConfirmGenerate(null);
    setSuccessId(memo.id);
  };

  if (successMemoId) {
    return <SuccessView memoId={successMemoId} onBack={() => { setSuccessId(null); setSelectedMemoId(null); }} />;
  }

  if (selectedMemo) {
    return (
      <PriceForm
        memo={selectedMemo}
        onBack={() => setSelectedMemoId(null)}
        onSave={(updated) => handleSaveMemo(selectedMemo.id, updated)}
      />
    );
  }

  const visibleMemos = memos.filter((m) => !selectedOutlet || m.outlets.includes(selectedOutlet));
  const menungguCount = memos.filter((m) => m.status === 'Menunggu Setting').length;
  const sudahDisettingCount = memos.filter((m) => m.status === 'Sudah Disetting').length;
  const generatedCount = memos.filter((m) => m.status === 'Sell Out Generated').length;

  return (
    <div className="space-y-5 w-full font-sans text-slate-900">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-5 h-5 text-amber-600" />
          <h1 className="text-[18px] font-bold text-slate-800">Setting Harga</h1>
        </div>
        <p className="text-[13px] text-slate-500">Memo yang telah disetujui dan menunggu konfirmasi potongan harga</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Belum Disetting', value: menungguCount, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
          { label: 'Sudah Disetting', value: sudahDisettingCount, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: UserCheck },
          { label: 'Sell Out Generated', value: generatedCount, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
          { label: 'Total Antrian', value: memos.length, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: FileText },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-[24px] font-black ${color} leading-none`}>{value}</p>
              <p className="text-[12px] font-medium text-slate-500 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #FAFAFA, #FEF9F0)' }}>
          <h2 className="text-[14px] font-bold text-slate-800">Daftar Memo Setting Harga</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Klik "Atur Harga" untuk membuka form potongan harga</p>
        </div>

        {visibleMemos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-[15px] font-bold text-slate-800">Tidak ada memo untuk outlet ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 text-left font-semibold text-slate-500">No. Memo</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">Supplier</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">Jenis / Program</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">Periode</th>
                <th className="px-4 py-3.5 text-center font-semibold text-slate-500">Item</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">Status & Info</th>
                <th className="px-4 py-3.5 text-center font-semibold text-slate-500 w-44">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleMemos.map((m) => {
                const cfg = STATUS_CFG[m.status];
                const sudahDiset = m.status !== 'Menunggu Setting';
                const sudahDiGenerate = m.status === 'Sell Out Generated';

                return (
                  <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-amber-50/40 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <span className="font-mono font-bold text-[13px] text-slate-800">{m.id}</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-slate-800">{m.supplier}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{m.metode}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[11px] font-bold mb-1">{m.jenisMemo}</span>
                      <p className="text-[12px] font-medium text-slate-600 leading-snug">{m.program}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-[12px] font-medium text-slate-600">{m.periode}</td>
                    <td className="px-4 py-4 text-center align-top">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold">{m.totalItem}</span>
                    </td>
                    {/* 🔶 Pembaruan pada kolom Info Setting */}
                    <td className="px-4 py-4 align-top">
                      {sudahDiset ? (
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-start gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Disetting Oleh</p>
                              <p className="text-[12px] font-semibold text-slate-800 leading-tight">{m.settingBy}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{m.settingAt}</p>
                            </div>
                          </div>
                          
                          {sudahDiGenerate && (
                            <div className="flex items-start gap-2 pt-2.5 border-t border-slate-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Digenerate Oleh</p>
                                <p className="text-[12px] font-semibold text-slate-800 leading-tight">{m.generatedBy}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">{m.generatedAt}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Ban className="w-3.5 h-3.5" />
                          <span className="text-[12px]">Belum disetting</span>
                        </div>
                      )}
                    </td>
                    {/* 🔶 Pembaruan pada kolom Aksi */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-2 w-full max-w-[150px] mx-auto">
                        <div className="flex gap-1.5 w-full">
                          <button
                            onClick={() => setSelectedMemoId(m.id)}
                            title="Atur Harga"
                            disabled={sudahDiGenerate}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
                            style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }}
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Atur Harga
                          </button>
                          <button
                            onClick={() => setPrintMemo(m)}
                            title="Cetak"
                            disabled={!sudahDiset}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center justify-center shrink-0"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => setConfirmGenerate(m)}
                          disabled={!sudahDiset || sudahDiGenerate}
                          className={`w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            !sudahDiset || sudahDiGenerate
                              ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-sm active:scale-[0.97]'
                          }`}
                        >
                          <Table2 className="w-3.5 h-3.5" /> 
                          {sudahDiGenerate ? 'Sudah Digenerate' : 'Generate Sell Out'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>

      {confirmGenerate && (
        <ConfirmGenerateModal
          memo={confirmGenerate}
          onClose={() => setConfirmGenerate(null)}
          onConfirm={handleConfirmGenerate}
        />
      )}

      {printMemo && <PrintPreviewModal memo={printMemo} onClose={() => setPrintMemo(null)} />}
    </div>
  );
}