import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Package, Download, Eye, Printer, X, Table2, XCircle,
  CheckCircle2, Clock, AlertCircle, FileText, MessageSquare,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { memos, type Memo } from '../data/memoData';

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

// Konfigurasi status diperbarui menyesuaikan desain "Menunggu Buyer"
const statusCfg: Record<string, { cls: string; dot: string; icon: React.ElementType }> = {
  'Menunggu Buyer':    { cls: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400', icon: FileText },
  'Menunggu Approval': { cls: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500', icon: Clock },
  'Setting Harga':     { cls: 'bg-blue-50 text-blue-700 border border-blue-200',   dot: 'bg-blue-500',  icon: AlertCircle },
  'Approved':          { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  'Sell Out Generated':{ cls: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500', icon: CheckCircle2 },
  'Draft':             { cls: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400', icon: FileText },
};

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div className="pointer-events-auto w-full flex items-center justify-center">{children}</div>
      </div>
    </>
  );
}

function Barcode({ value }: { value: string }) {
  return (
    <div className="bg-white p-2 border border-slate-300">
      <QRCode value={value} size={126} level="M" />
    </div>
  );
}

const approvalRows = (memo: Memo) => [
  memo.approvalBuyer && { label: 'Approve Buyer', employeeId: 'KRY-0002', name: memo.approvalBuyer.by, date: memo.approvalBuyer.at },
  memo.approvalChecker && { label: 'Approve Checker Pembayaran', employeeId: 'KRY-0009', name: memo.approvalChecker.by, date: memo.approvalChecker.at },
].filter(Boolean) as { label: string; employeeId: string; name: string; date: string }[];

function credentialUrl(credential: string) {
  const encoded = btoa(unescape(encodeURIComponent(credential)));
  const origin = window.location.hostname === 'localhost'
    ? `http://192.168.0.173:${window.location.port || '8443'}`
    : window.location.origin;
  return `${origin}/credential?data=${encodeURIComponent(encoded)}`;
}

function ExcelPreviewModal({ memo, onClose }: { memo: Memo; onClose: () => void }) {
  const grandTotal = memo.items.reduce((s, i) => s + i.total, 0);

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="px-5 py-3.5 flex items-center justify-between gap-3 bg-[#1D6F42]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Table2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-200">Preview Excel</p>
              <h3 className="text-[14px] font-bold text-white truncate">{memo.no} - {memo.program}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-auto bg-[#F8F8F8]" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          <div className="p-4 min-w-[760px]">
            <div className="bg-white border border-[#D0D7DE] text-[11px] font-mono">
              <div className="bg-[#1D6F42] px-4 py-2 text-white font-bold">MEMO PROGRAM SUPPLIER - {memo.no}</div>
              <table className="w-full border-collapse">
                <tbody>
                  {[
                    ['Supplier', memo.supplier, 'Program', memo.program],
                    ['Buyer', memo.buyer, 'Admin', memo.admin],
                    ['Periode', memo.periode, 'Metode', memo.metode],
                    ['Status', memo.status, 'Tanggal', memo.tanggal],
                    ['Outlet', memo.outlets.join(', '), 'Info', memo.info],
                  ].map((row) => (
                    <tr key={row.join('-')} className="border-b border-[#E2E8F0]">
                      <td className="px-3 py-1.5 bg-[#E8F5E9] font-bold text-[#1D6F42] border-r border-[#E2E8F0]">{row[0]}</td>
                      <td className="px-3 py-1.5 border-r border-[#E2E8F0]">{row[1]}</td>
                      <td className="px-3 py-1.5 bg-[#E8F5E9] font-bold text-[#1D6F42] border-r border-[#E2E8F0]">{row[2]}</td>
                      <td className="px-3 py-1.5">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full border-collapse border-t-2 border-[#1D6F42]">
                <thead>
                  <tr className="bg-[#1D6F42] text-white">
                    {['No', 'PLU', 'Nama Barang', 'Qty', 'Harga Normal', 'Program', 'Potongan', 'Total'].map((h, i) => (
                      <th key={h} className="px-3 py-2 text-left border-r border-white/20" style={{ textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {memo.items.map((item, i) => (
                    <tr key={item.plu} className="border-b border-[#E2E8F0]" style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F9FBF9' }}>
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{item.plu}</td>
                      <td className="px-3 py-2">{item.nama}</td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.hargaNormal)}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.program)}</td>
                      <td className="px-3 py-2 text-right">({fmt(item.potongan)})</td>
                      <td className="px-3 py-2 text-right font-bold">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#1D6F42] text-white">
                    <td colSpan={7} className="px-3 py-2 text-right font-bold">GRAND TOTAL</td>
                    <td className="px-3 py-2 text-right font-bold">{fmt(grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PdfPreviewModal({ memo, onClose }: { memo: Memo; onClose: () => void }) {
  const grandTotal = memo.items.reduce((s, i) => s + i.total, 0);
  const approvals = approvalRows(memo);
  const credential = [
    'KREDENSIAL KEASLIAN DOKUMEN',
    'Tipe: Memo Program Supplier',
    `No Memo: ${memo.no}`,
    `Supplier: ${memo.supplier}`,
    `Program: ${memo.program}`,
    `Periode: ${memo.periode}`,
    `Status: ${memo.status}`,
    `Outlet: ${memo.outlets.join(', ')}`,
    `Total: ${fmt(grandTotal)}`,
    ...approvals.map((row) => `${row.label}: ${row.employeeId}/${row.name}/${row.date}`),
  ].join('\n');
  const qrUrl = credentialUrl(credential);

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="px-5 py-3.5 flex items-center justify-between gap-3 bg-red-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-200">Preview PDF</p>
              <h3 className="text-[14px] font-bold text-white truncate">{memo.no} - {memo.program}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/15 hover:bg-white/25">
              <Printer className="w-3.5 h-3.5" />Cetak
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-auto bg-[#E5E7EB]" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          <div className="mx-auto my-4 bg-white shadow-xl" style={{ width: 595, minHeight: 842, padding: '34px 42px', fontFamily: 'Inter, sans-serif' }}>
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-5">
              <div>
                <p className="text-[14px] font-extrabold text-slate-900">BUYER MEMO SYSTEM</p>
                <p className="text-[9px] text-slate-400 tracking-wide uppercase">Memo Program Supplier</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Memo</p>
                <p className="text-[15px] font-extrabold text-slate-900">{memo.no}</p>
                <p className="text-[9px] text-slate-400">Tgl: {memo.tanggal}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Supplier', value: memo.supplier },
                { label: 'Program', value: memo.program },
                { label: 'Periode', value: memo.periode },
                { label: 'Status', value: memo.status },
                { label: 'Buyer', value: memo.buyer },
                { label: 'Metode', value: memo.metode },
              ].map(({ label, value }) => (
                <div key={label} className="border border-slate-200 rounded p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-[11px] font-semibold text-slate-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="border border-slate-200 rounded p-2.5 mb-4">
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Outlet Berlaku</p>
              <div className="flex flex-wrap gap-1">
                {memo.outlets.map((o) => (
                  <span key={o} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[9px] font-bold text-amber-800">{o}</span>
                ))}
              </div>
            </div>
            <table className="w-full border-collapse text-[9px] mb-4">
              <thead>
                <tr className="bg-slate-900 text-white">
                  {['No', 'PLU', 'Nama Barang', 'Qty', 'Potongan', 'Total'].map((h, i) => (
                    <th key={h} className="px-2 py-2" style={{ textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memo.items.map((item, i) => (
                  <tr key={item.plu} className="border-b border-slate-200">
                    <td className="px-2 py-2">{i + 1}</td>
                    <td className="px-2 py-2 font-mono">{item.plu}</td>
                    <td className="px-2 py-2 font-semibold">{item.nama}</td>
                    <td className="px-2 py-2 text-right">{item.qty}</td>
                    <td className="px-2 py-2 text-right">{fmt(item.potongan)}</td>
                    <td className="px-2 py-2 text-right font-bold">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mb-5">
              <div className="w-52 flex justify-between border-t-2 border-slate-900 pt-2 text-[11px] font-extrabold">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 pt-3 border-t border-slate-200">
              <div className="max-w-[320px] text-[7.5px] leading-snug text-slate-500">
                <p className="font-bold text-slate-700 mb-1">Audit Dokumen</p>
                {approvals.length > 0 ? approvals.map((row) => (
                  <p key={row.label}>{row.label}: {row.employeeId}/{row.name}/{row.date}</p>
                )) : (
                  <p>Approval: Belum ada data approval</p>
                )}
                <p className="font-bold text-slate-700 mt-2">Kredensial Keaslian Dokumen</p>
                <p className="break-all">{memo.no}</p>
              </div>
              <Barcode value={qrUrl} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function MemoDetail() {
  const { no } = useParams<{ no: string }>();
  const navigate = useNavigate();
  const [previewExcel, setPreviewExcel] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(false);

  // Jika Anda memakai data statis, asumsikan memo pertama untuk demo jika no tidak cocok
  const memo = memos.find((m) => m.no === no) || memos[0]; 

  if (!memo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white rounded-2xl border border-slate-200">
        <XCircle className="w-10 h-10 text-slate-300" />
        <p className="text-[14px] text-slate-500">Memo tidak ditemukan.</p>
        <button onClick={() => navigate('/program-supplier/memo')}
          className="px-4 py-2 rounded-xl text-[13px] font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
          Kembali
        </button>
      </div>
    );
  }

  const cfg = statusCfg[memo.status] ?? statusCfg['Menunggu Buyer'];
  const StatusIcon = cfg.icon;
  const grandTotal = memo.items.reduce((s, i) => s + i.total, 0);

  return (
    // Menggunakan w-full tanpa max-w agar mengisi penuh area main dari layout
    <div className="flex flex-col gap-6 w-full pb-10 font-sans text-slate-900">
      
      {/* Header Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/program-supplier/memo')}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[18px] font-bold text-slate-800">{memo.no}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${cfg.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" />{memo.status}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">{memo.supplier} · {memo.tanggal}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={() => setPreviewExcel(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold border border-emerald-500 text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50 transition-all">
            <Eye className="w-4 h-4" />Preview Excel
          </button>
          <button onClick={() => setPreviewPdf(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all">
            <Printer className="w-4 h-4" />Preview PDF
          </button>
          <button className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-5">Informasi Memo</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Buyer', value: memo.buyer },
            { label: 'Admin', value: memo.admin },
            { label: 'Supplier', value: memo.supplier },
            { label: 'Program', value: memo.program },
            { label: 'Metode', value: memo.metode },
            { label: 'Informasi', value: memo.info },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-100/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
              <p className="text-[14px] font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-100/50 w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Periode</p>
          <p className="text-[14px] font-semibold text-slate-800">{memo.periode}</p>
        </div>
      </div>

      {/* Outlets + Tax + Catatan Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Outlet Tujuan</p>
          <div className="flex flex-wrap gap-2">
            {memo.outlets.map((o) => (
              <span key={o} className="px-4 py-1.5 bg-[#F1F5F9] rounded-lg text-[12px] font-medium text-slate-600 border border-slate-200/60">{o}</span>
            ))}
          </div>
        </div>

        {memo.metode === 'Off Faktur' && (memo.ppn || memo.pph) && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Pajak</p>
            <div className="flex gap-3 flex-wrap">
              {memo.ppn && <span className="px-4 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-[12px] font-semibold">PPN {memo.ppn}%</span>}
              {memo.pph && <span className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[12px] font-semibold">PPh {memo.pph}%</span>}
            </div>
          </div>
        )}

        {memo.catatan && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Catatan</p>
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-blue-800 leading-relaxed">{memo.catatan}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rincian Barang Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-widest text-slate-600 mb-5 flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400" /> {memo.items.length} Rincian Barang
        </p>
        
        {memo.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Package className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-[13px] font-medium text-slate-500">Belum ada rincian barang</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-3.5 text-left font-semibold">PLU / Nama</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Qty</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Hrg Normal</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Program</th>
                    <th className="px-4 py-3.5 text-left font-semibold">Potongan</th>
                    <th className="px-4 py-3.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memo.items.map((it, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-800">{it.nama}</p>
                        <p className="text-slate-400 text-[11px] font-mono mt-0.5">{it.plu}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-600">{it.qty}</td>
                      <td className="px-4 py-4 text-slate-500">{fmt(it.hargaNormal)}</td>
                      <td className="px-4 py-4 text-amber-600 font-bold">{fmt(it.program)}</td>
                      <td className="px-4 py-4 text-red-500 font-medium">-{fmt(it.potongan)}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">{fmt(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center justify-between px-6 py-4 rounded-xl bg-[#FEF9C3]/70 border border-[#FEF08A]/50">
              <span className="text-[14px] font-bold text-amber-800">Grand Total</span>
              <span className="text-[20px] font-black text-amber-900">{fmt(grandTotal)}</span>
            </div>
          </>
        )}
      </div>

      {previewExcel && <ExcelPreviewModal memo={memo} onClose={() => setPreviewExcel(false)} />}
      {previewPdf && <PdfPreviewModal memo={memo} onClose={() => setPreviewPdf(false)} />}
    </div>
  );
}
