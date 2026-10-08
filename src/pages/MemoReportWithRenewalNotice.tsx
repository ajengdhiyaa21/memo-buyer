import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';
import MemoReportAction from './MemoReportGrouped';

type Memo = { id: string; nomorMemo: string; supplierNama: string; jenisMemo: string; ringkasan: string; periodeAkhir?: string; detail?: { label: string; value: string }[] };
const API = 'http://localhost:3001';
const fallback: Memo[] = [
  { id: 'SIM-002', nomorMemo: 'MEM-SIM-002', supplierNama: 'PT. Unilever Indonesia Tbk', jenisMemo: 'pendapatan-lain', ringkasan: 'Sewa Wing Gondola Promo Minuman', periodeAkhir: '2026-10-20' },
  { id: 'SIM-004', nomorMemo: 'MEM-SIM-004', supplierNama: 'PT. Indofood CBP Sukses Makmur', jenisMemo: 'pendapatan-lain', ringkasan: 'Event BLBMS Produk Indofood', periodeAkhir: '2026-10-25' },
  { id: 'SIM-006', nomorMemo: 'MEM-SIM-006', supplierNama: 'PT. Indofood CBP Sukses Makmur', jenisMemo: 'memo-program', ringkasan: 'Program Diskon Mie Instan Oktober', periodeAkhir: '2026-11-10' },
];
const dateLabel = (date?: string) => date ? date.split('-').reverse().join('/') : '-';
const daysLeft = (date?: string) => date ? Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000) : 9999;
const memoKind = (kind: string) => kind === 'memo-program' ? 'Memo Program' : kind === 'pendapatan-lain' ? 'Memo Lain-lain' : kind;

export default function MemoReportWithRenewalNotice() {
  const [rows, setRows] = useState<Memo[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { fetch(`${API}/api/memo`).then((response) => response.json()).then((data) => setRows(Array.isArray(data) ? data : fallback)).catch(() => setRows(fallback)); }, []);
  const attention = useMemo(() => rows.filter((memo) => daysLeft(memo.periodeAkhir) <= 30).sort((a, b) => daysLeft(a.periodeAkhir) - daysLeft(b.periodeAkhir)), [rows]);
  return <><MemoReportAction />{attention.length > 0 && <div className="fixed bottom-5 right-5 z-40 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-amber-300 bg-white shadow-2xl"><button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-left text-white"><span className="flex items-center gap-2 text-sm font-bold"><AlertTriangle className="h-5 w-5 animate-bounce"/>{attention.length} memo perlu perhatian perpanjangan</span>{open ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>}</button>{open && <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">{attention.map((memo) => { const days = daysLeft(memo.periodeAkhir); return <div className="px-4 py-3" key={memo.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-slate-800">{memo.supplierNama}</p><p className="mt-0.5 text-[11px] text-slate-500">{memo.nomorMemo} · {memoKind(memo.jenisMemo)}</p><p className="mt-1 text-xs text-slate-700">{memo.ringkasan}</p></div><CalendarClock className={`mt-0.5 h-4 w-4 shrink-0 ${days < 0 ? 'text-red-600' : 'text-amber-600'}`}/></div><p className={`mt-2 text-[11px] font-bold ${days < 0 ? 'text-red-700' : 'text-amber-700'}`}>{days < 0 ? `Sudah lewat ${Math.abs(days)} hari — segera perpanjang` : `Berakhir ${dateLabel(memo.periodeAkhir)} — ${days} hari lagi`}</p></div>; })}</div>}</div>}</>;
}
