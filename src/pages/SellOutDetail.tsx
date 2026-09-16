import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Package, Download, Eye, Printer, X, Table2, XCircle,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { reports, type Report } from '../data/sellOutData';

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[3px]" onClick={onClose} />
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

function credentialUrl(credential: string) {
  const encoded = btoa(unescape(encodeURIComponent(credential)));
  const origin = window.location.hostname === 'localhost'
    ? `http://192.168.0.173:${window.location.port || '8443'}`
    : window.location.origin;
  return `${origin}/credential?data=${encodeURIComponent(encoded)}`;
}

function ExcelPreviewModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const itemTotal = report.items.reduce((s, i) => s + i.total, 0);

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 32px 80px -16px rgba(0,0,0,0.3)', maxHeight: '90vh' }}>
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0" style={{ background: '#1D6F42' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Table2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-200">Preview Excel</p>
              <h3 className="text-[14px] font-bold text-white truncate">{report.laporan}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors">
              <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Download</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          <div className="p-4 bg-[#F8F8F8] min-w-[700px]">
            <div className="bg-white border border-[#D0D7DE] rounded-sm overflow-hidden text-[12px] font-mono">
              <div className="bg-[#1D6F42] px-4 py-2">
                <p className="text-white font-bold text-[13px]">LAPORAN SELL OUT — {report.laporan.toUpperCase()}</p>
                <p className="text-green-200 text-[10px] mt-0.5">{report.id} | {report.supplier} | Periode: {report.periode}</p>
              </div>
              <table className="w-full border-collapse text-[11px]">
                <tbody>
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="px-3 py-1.5 bg-[#E8F5E9] font-semibold text-[#1D6F42] w-32 border-r border-[#E2E8F0]">Supplier</td>
                    <td className="px-3 py-1.5 text-slate-700">{report.supplier}</td>
                    <td className="px-3 py-1.5 bg-[#E8F5E9] font-semibold text-[#1D6F42] w-24 border-x border-[#E2E8F0]">Tgl Buat</td>
                    <td className="px-3 py-1.5 text-slate-700">{report.tanggal}</td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="px-3 py-1.5 bg-[#E8F5E9] font-semibold text-[#1D6F42] border-r border-[#E2E8F0]">Periode</td>
                    <td className="px-3 py-1.5 text-slate-700">{report.periode}</td>
                    <td className="px-3 py-1.5 bg-[#E8F5E9] font-semibold text-[#1D6F42] border-x border-[#E2E8F0]">ID</td>
                    <td className="px-3 py-1.5 text-slate-700 font-mono">{report.id}</td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="px-3 py-1.5 bg-[#E8F5E9] font-semibold text-[#1D6F42] border-r border-[#E2E8F0]">Outlet</td>
                    <td className="px-3 py-1.5 text-slate-700" colSpan={3}>
                      <div className="flex flex-wrap gap-1">
                        {report.outlets.map((o) => (
                          <span key={o} className="px-1.5 py-0.5 bg-[#E8F5E9] border border-[#A7F3D0] rounded text-[10px] font-bold text-[#065F46]">{o}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full border-collapse text-[11px] border-t-2 border-[#1D6F42]">
                <thead>
                  <tr style={{ background: '#1D6F42' }}>
                    {['No', 'PLU', 'Nama Barang', 'Qty', 'Satuan', 'Hrg Normal', 'Program', 'Potongan', 'Total'].map((h, i) => (
                      <th key={h} className="px-3 py-2 text-left font-bold text-white whitespace-nowrap border-r border-white/20 last:border-0"
                        style={{ textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item, i) => (
                    <tr key={item.plu} className="border-b border-[#E2E8F0]" style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F9FBF9' }}>
                      <td className="px-3 py-2 text-slate-500 border-r border-[#E2E8F0]">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-slate-600 border-r border-[#E2E8F0]">{item.plu}</td>
                      <td className="px-3 py-2 text-slate-800 font-medium border-r border-[#E2E8F0]">{item.nama}</td>
                      <td className="px-3 py-2 text-right text-slate-700 border-r border-[#E2E8F0]">{item.qty}</td>
                      <td className="px-3 py-2 text-slate-500 border-r border-[#E2E8F0]">Pcs</td>
                      <td className="px-3 py-2 text-right text-slate-600 border-r border-[#E2E8F0]">{fmt(item.hargaNormal)}</td>
                      <td className="px-3 py-2 text-right text-[#1D6F42] font-semibold border-r border-[#E2E8F0]">{fmt(item.program)}</td>
                      <td className="px-3 py-2 text-right text-red-600 border-r border-[#E2E8F0]">({fmt(item.potongan)})</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-800">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#E8F5E9' }} className="border-t-2 border-[#1D6F42]">
                    <td colSpan={3} className="px-3 py-2 font-bold text-[#1D6F42]">SUBTOTAL</td>
                    <td className="px-3 py-2 text-right font-bold text-[#1D6F42]">{report.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td colSpan={4} />
                    <td className="px-3 py-2 text-right font-bold text-[#1D6F42]">{fmt(itemTotal)}</td>
                  </tr>
                  <tr style={{ background: '#F9FBF9' }}>
                    <td colSpan={8} className="px-3 py-1.5 text-right text-[11px] text-slate-500">PPN (11%)</td>
                    <td className="px-3 py-1.5 text-right text-[11px] font-semibold text-violet-700">{fmt(report.ppn)}</td>
                  </tr>
                  <tr style={{ background: '#F9FBF9' }}>
                    <td colSpan={8} className="px-3 py-1.5 text-right text-[11px] text-slate-500">PPh (2%)</td>
                    <td className="px-3 py-1.5 text-right text-[11px] font-semibold text-blue-700">({fmt(report.pph)})</td>
                  </tr>
                  <tr style={{ background: '#1D6F42' }}>
                    <td colSpan={8} className="px-3 py-2 text-right font-bold text-white text-[12px]">TOTAL AKHIR</td>
                    <td className="px-3 py-2 text-right font-bold text-white text-[13px]">{fmt(report.total)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="px-4 py-2 text-[10px] text-slate-400 border-t border-[#E2E8F0]">
                Digenerate oleh Buyer Memo System · {new Date().toLocaleDateString('id-ID')} · Dokumen ini sah tanpa tanda tangan
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PdfPreviewModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const documentCode = `BD-TSO-${report.tanggal.replaceAll('-', '')}`;
  const auditRows = [
    { label: 'Cetak', employeeId: 'KRY-0091', name: 'Rina Oktaviani', date: `${new Date().toLocaleDateString('id-ID')} 10:30` },
    { label: 'Setting Harga', employeeId: 'KRY-0042', name: 'Budi Hartono', date: '25-11-2023 16:45' },
    { label: 'Approve Buyer', employeeId: 'KRY-0002', name: 'Andi Susanto', date: '23-11-2023 09:10' },
    { label: 'Approve Checker Pembayaran', employeeId: 'KRY-0027', name: 'Indra Kusuma', date: '24-11-2023 14:20' },
  ];
  const credential = [
    'KREDENSIAL KEASLIAN DOKUMEN',
    'Tipe: Laporan Sell Out',
    `Kode Dokumen: ${documentCode}`,
    `ID Laporan: ${report.id}`,
    `Supplier: ${report.supplier}`,
    `Periode: ${report.periode}`,
    `Tanggal Sell Out: ${report.tanggal}`,
    `Total: ${fmt(report.total)}`,
    ...auditRows.map((row) => `${row.label}: ${row.employeeId}/${row.name}/${row.date}`),
  ].join('\n');
  const qrUrl = credentialUrl(credential);
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 32px 80px -16px rgba(0,0,0,0.3)', maxHeight: '90vh' }}>
        <div className="print:hidden px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-red-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-200">Preview PDF</p>
              <h3 className="text-[14px] font-bold text-white truncate">{report.laporan}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors">
              <Printer className="w-3.5 h-3.5" /><span className="hidden sm:inline">Cetak</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-auto bg-[#E5E7EB]" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          <div className="sellout-print-page mx-auto my-4 bg-white shadow-xl" style={{ width: 595, minHeight: 842, padding: '36px 48px', fontFamily: 'Inter, sans-serif' }}>
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center text-white text-[10px] font-bold">BM</div>
                  <div>
                    <p className="text-[13px] font-extrabold text-slate-900">BUYER MEMO SYSTEM</p>
                    <p className="text-[9px] text-slate-400 tracking-wide uppercase">Management System</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Jl. Sudirman No. 99, Jakarta Pusat · (021) 5555-0100</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Laporan Sell Out</p>
                <p className="text-[15px] font-extrabold text-slate-900 mt-0.5">{documentCode}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Tgl: {report.tanggal}</p>
              </div>
            </div>
            <div className="text-center mb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Laporan Sell Out Program Supplier</p>
              <p className="text-[17px] font-extrabold text-slate-900 mt-0.5">{report.laporan}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Supplier', value: report.supplier },
                { label: 'Periode', value: report.periode },
                { label: 'Tanggal Generate', value: report.tanggal },
                { label: 'Kode Dokumen', value: documentCode },
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
                {report.outlets.map((o) => (
                  <span key={o} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[9px] font-bold text-amber-800">{o}</span>
                ))}
              </div>
            </div>
            <table className="w-full border-collapse text-[10px] mb-4">
              <thead>
                <tr style={{ background: '#111827' }}>
                  {['No', 'PLU', 'Nama Barang', 'Qty', 'Hrg Normal', 'Potongan', 'Total'].map((h, i) => (
                    <th key={h} className="px-2.5 py-2 text-white font-bold whitespace-nowrap"
                      style={{ textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.items.map((item, i) => (
                  <tr key={item.plu} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }} className="border-b border-slate-200">
                    <td className="px-2.5 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-2.5 py-2 font-mono text-slate-500">{item.plu}</td>
                    <td className="px-2.5 py-2 text-slate-800 font-medium">{item.nama}</td>
                    <td className="px-2.5 py-2 text-right text-slate-700">{item.qty}</td>
                    <td className="px-2.5 py-2 text-right text-slate-600">{fmt(item.hargaNormal)}</td>
                    <td className="px-2.5 py-2 text-right text-red-600">({fmt(item.potongan)})</td>
                    <td className="px-2.5 py-2 text-right font-bold text-slate-900">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-56 space-y-1 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{fmt(report.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">PPN (11%)</span><span className="font-semibold text-violet-700">+{fmt(report.ppn)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">PPh (2%)</span><span className="font-semibold text-blue-700">-{fmt(report.pph)}</span></div>
                <div className="flex justify-between pt-1.5 border-t-2 border-slate-800">
                  <span className="font-extrabold text-slate-900">TOTAL AKHIR</span>
                  <span className="font-extrabold text-amber-700 text-[12px]">{fmt(report.total)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 mt-6 pt-3 border-t border-slate-200">
              <div className="max-w-[330px] text-[7.5px] leading-snug text-slate-500">
                <p className="font-bold text-slate-700 mb-1">Audit Dokumen</p>
                {auditRows.map((row) => (
                  <p key={row.label}>
                    {row.label}: {row.employeeId}/{row.name}/{row.date}
                  </p>
                ))}
                <p className="font-bold text-slate-700 mt-2">Kredensial Keaslian Dokumen</p>
                <p className="break-all">{documentCode}</p>
              </div>
              <Barcode value={qrUrl} />
            </div>
            <div className="hidden">
              {['Dibuat oleh', 'Diperiksa oleh', 'Disetujui oleh'].map((r) => (
                <div key={r} className="text-center">
                  <div className="h-12 border-b border-slate-300 mb-1" />
                  <p>{r}</p>
                </div>
              ))}
            </div>
            <div className="hidden">
              Dokumen ini digenerate oleh Buyer Memo System · {new Date().toLocaleDateString('id-ID')} · Konfidensial
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function SellOutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [previewExcel, setPreviewExcel] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(false);

  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <XCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-[14px] text-muted-foreground">Laporan tidak ditemukan.</p>
        <button onClick={() => navigate('/laporan/sell-out')}
          className="px-4 py-2 rounded-xl text-[13px] font-medium border border-border hover:bg-muted transition-colors">
          Kembali
        </button>
      </div>
    );
  }

  const qtyTotal = report.items.reduce((s, i) => s + i.qty, 0);
  const itemTotal = report.items.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5 w-full pb-10">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/laporan/sell-out')}
          className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 mt-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[16px] font-bold text-foreground truncate">{report.laporan}</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5 break-words">{report.id} · {report.supplier} · {report.tanggal}</p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 shrink-0">
              <button onClick={() => setPreviewExcel(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all">
                <Eye className="w-3.5 h-3.5" /><span className="truncate">Preview Excel</span>
              </button>
              <button onClick={() => setPreviewPdf(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all">
                <Printer className="w-3.5 h-3.5" /><span className="truncate">Preview PDF</span>
              </button>
              <button className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #B45309, #D97706)', boxShadow: '0 2px 8px rgba(180,83,9,0.3)' }}>
                <Download className="w-3.5 h-3.5" />Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Laporan — satu card berisi beberapa sub-bagian, seperti pola di halaman Detail Memo */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5 space-y-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Informasi Laporan</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Supplier', value: report.supplier },
              { label: 'Periode', value: report.periode },
              { label: 'Tanggal Generate', value: report.tanggal },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
                <p className="text-[13px] font-semibold text-slate-800 leading-snug break-words">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-5 border-t border-border">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Ringkasan Finansial</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Subtotal', value: fmt(report.subtotal), highlight: false },
              { label: 'PPN (11%)', value: fmt(report.ppn), highlight: false },
              { label: 'PPh (2%)', value: fmt(report.pph), highlight: false },
              { label: 'Total Akhir', value: fmt(report.total), highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-xl p-3 border min-w-0 ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 truncate ${highlight ? 'text-amber-700' : 'text-slate-400'}`}>{label}</p>
                <p className={`font-bold leading-snug break-words ${highlight ? 'text-amber-900 text-[15px]' : 'text-[13px] text-slate-800'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outlet Berlaku */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Outlet Berlaku</p>
        <div className="flex flex-wrap gap-1.5">
          {report.outlets.map((o) => (
            <span key={o} className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-semibold text-amber-800">{o}</span>
          ))}
        </div>
      </div>

      {/* Rincian barang */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />{report.items.length} Rincian Barang
        </p>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-[560px] w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">PLU / Nama</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500 whitespace-nowrap">Qty</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500 whitespace-nowrap">Hrg Normal</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500 whitespace-nowrap">Program</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500 whitespace-nowrap">Potongan</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500 whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-slate-800 whitespace-nowrap">{it.nama}</p>
                    <p className="text-slate-400 text-[10px] font-mono">{it.plu}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">{it.qty}</td>
                  <td className="px-3 py-2.5 text-right text-slate-500 whitespace-nowrap">{fmt(it.hargaNormal)}</td>
                  <td className="px-3 py-2.5 text-right text-amber-700 font-semibold whitespace-nowrap">{fmt(it.program)}</td>
                  <td className="px-3 py-2.5 text-right text-red-600 whitespace-nowrap">-{fmt(it.potongan)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-800 whitespace-nowrap">{fmt(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-xl border border-amber-200"
          style={{ background: 'linear-gradient(135deg, #FEF9F0, #FEF3C7)' }}>
          <div>
            <span className="text-[13px] font-semibold text-amber-800">Grand Total</span>
            <span className="text-[11px] text-amber-600 ml-2">· {qtyTotal} unit</span>
          </div>
          <span className="text-[18px] font-bold text-amber-900">{fmt(itemTotal)}</span>
        </div>
      </div>

      {previewExcel && <ExcelPreviewModal report={report} onClose={() => setPreviewExcel(false)} />}
      {previewPdf && <PdfPreviewModal report={report} onClose={() => setPreviewPdf(false)} />}
    </div>
  );
}
