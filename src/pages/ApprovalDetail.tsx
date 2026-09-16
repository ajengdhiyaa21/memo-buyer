import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Building2, User, Tag,
  Layers, DollarSign, Calendar, Package, MessageSquare, AlertTriangle, FileText, Check
} from 'lucide-react';
import clsx from 'clsx';
import { MEMOS, type ApprovalMemoData, type MemoStatus, type ApprovalLog } from '../data/approvalData';

const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

function StatusBadge({ status }: { status: MemoStatus }) {
  const cfg = {
    menunggu_buyer:   { label: 'Menunggu Buyer',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',   Icon: Clock },
    menunggu_checker: { label: 'Menunggu Checker', cls: 'bg-blue-50 text-blue-700 border-blue-200',       Icon: Clock },
    approved_checker: { label: 'Disetujui Checker',cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    ditolak:          { label: 'Ditolak',          cls: 'bg-red-50 text-red-600 border-red-200',          Icon: XCircle },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold border whitespace-nowrap ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function ConfirmModal({ memo, action, onClose, onConfirm }: {
  memo: ApprovalMemoData; action: 'approve' | 'reject';
  onClose: () => void; onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  const isApprove = action === 'approve';

  // Tentukan deskripsi berdasarkan status saat ini
  let desc = 'Memo akan ditolak dan dikembalikan ke pembuat. Berikan alasan yang jelas.';
  if (isApprove) {
    desc = memo.status === 'menunggu_buyer'
      ? 'Memo akan disetujui oleh Buyer dan diteruskan ke Checker Pembayaran.'
      : 'Memo akan disetujui oleh Checker dan diteruskan ke proses Setting Harga.';
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div className="bg-white w-full sm:max-w-md pointer-events-auto overflow-hidden shadow-2xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
          <div className={`px-5 py-4 ${isApprove ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : 'bg-gradient-to-r from-red-50 to-rose-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isApprove ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {isApprove ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-slate-800">{isApprove ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}</h3>
                <p className="text-[12px] text-slate-500 mt-0.5 truncate">{memo.id}</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className={`flex items-start gap-3 rounded-xl p-3.5 border ${isApprove ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isApprove ? 'text-emerald-600' : 'text-red-500'}`} />
              <p className="text-[12px] leading-relaxed text-slate-700">{desc}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-700">
                {isApprove ? 'Catatan (opsional)' : 'Alasan Penolakan *'}
              </label>
              <textarea
                rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder={isApprove ? 'Tambahkan catatan jika diperlukan...' : 'Tuliskan alasan penolakan dengan jelas...'}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-slate-50 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 resize-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl text-[13px] text-slate-600 hover:bg-slate-100 transition-colors font-medium">Batal</button>
            <button
              onClick={() => onConfirm(note)}
              disabled={!isApprove && !note.trim()}
              className={clsx(
                'w-full sm:w-auto px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed',
                isApprove
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-500/25'
              )}
            >
              {isApprove ? 'Ya, Setujui Memo' : 'Ya, Tolak Memo'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State lokal untuk simulasi pembaruan UI secara langsung
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [status, setStatus] = useState<MemoStatus | null>(null);
  const [buyerLog, setBuyerLog] = useState<ApprovalLog | null>(null);
  const [checkerLog, setCheckerLog] = useState<ApprovalLog | null>(null);
  const [rejectLog, setRejectLog] = useState<ApprovalLog | null>(null);

  // SIMULASI AKUN SAAT INI (Bisa diganti dengan data dari useAuth)
  const currentUser = 'John Doe (Admin)';
  // SIMULASI ROLE (Kita sediakan array agar Anda bisa mensimulasikan akses ganda, atau ubah sesuai hook Anda)
  const userRoles: string[] = ['OP Buyer', 'Checker Pembayaran'];

  const base = MEMOS.find((m) => m.id === id);
  if (!base) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 px-4 text-center">
        <XCircle className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-[14px] text-muted-foreground">Memo tidak ditemukan.</p>
        <button onClick={() => navigate('/program-supplier/approval')} className="px-4 py-2 rounded-xl text-[13px] font-medium border border-border hover:bg-muted transition-colors">
          Kembali
        </button>
      </div>
    );
  }

  // Memo yang ditampilkan tergabung dengan state lokal jika sudah ada perubahan
  const memo: ApprovalMemoData = {
    ...base,
    status: status ?? base.status,
    buyerApproval: buyerLog ?? base.buyerApproval,
    checkerApproval: checkerLog ?? base.checkerApproval,
    rejectLog: rejectLog ?? base.rejectLog
  };

  const grandTotal = memo.items.reduce((s, it) => s + (it.hargaNormal - it.potongan) * it.qty, 0);

  // Hak Akses Tombol Approval
  const canApproveBuyer = memo.status === 'menunggu_buyer' && userRoles.includes('OP Buyer');
  const canApproveChecker = memo.status === 'menunggu_checker' && userRoles.includes('Checker Pembayaran');
  const canAction = canApproveBuyer || canApproveChecker;

  const handleConfirm = (note: string) => {
    if (!action) return;

    // Format tanggal & jam hari ini
    const now = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    const logData = { by: currentUser, at: now, note };

    if (action === 'approve') {
      if (memo.status === 'menunggu_buyer') {
        setStatus('menunggu_checker');
        setBuyerLog(logData);
      } else if (memo.status === 'menunggu_checker') {
        setStatus('approved_checker');
        setCheckerLog(logData);
      }
    } else {
      setStatus('ditolak');
      setRejectLog(logData);
    }
    setAction(null);
  };

  return (
    <div className="w-full space-y-5 pb-10">
      {/* Back + title + actions — stacks on mobile, one row on larger screens. Normal flow (no sticky) to avoid scroll-repaint glitches. */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/program-supplier/approval')}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[15px] font-bold text-foreground truncate">{memo.id}</h1>
              <StatusBadge status={memo.status} />
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{memo.supplier} · {memo.tanggal}</p>
          </div>
        </div>

        {/* Action buttons */}
        {(canAction || memo.status === 'approved_checker') && (
          <div className="flex items-center gap-2 flex-wrap sm:ml-auto sm:flex-nowrap w-full sm:w-auto">
            {canAction && (
              <>
                <button
                  onClick={() => setAction('reject')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all whitespace-nowrap"
                >
                  <XCircle className="w-3.5 h-3.5" />Tolak
                </button>
                <button
                  onClick={() => setAction('approve')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #059669, #0D9488)', boxShadow: '0 2px 8px rgba(5,150,105,0.35)' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />Setujui
                </button>
              </>
            )}

            {memo.status === 'approved_checker' && (
              <button
                onClick={() => alert('Fitur cetak PDF dipicu di sini!')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/25 whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5" />Cetak PDF Bukti
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:items-start gap-5">
        {/* Kolom Kiri: Info Memo & Outlets (Makan 2 kolom jika di layar besar) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info grid */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Informasi Memo</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Building2, label: 'Supplier', value: memo.supplier },
                { icon: User, label: 'Buyer', value: memo.buyer },
                { icon: Tag, label: 'Jenis Memo', value: memo.jenisMemo },
                { icon: Layers, label: 'Program', value: memo.program },
                { icon: DollarSign, label: 'Metode', value: memo.metode },
                { icon: Calendar, label: 'Periode', value: memo.periode },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-slate-800 leading-snug break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Outlets + tax + catatan */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Outlet Tujuan</p>
              <div className="flex flex-wrap gap-1.5">
                {memo.outlets.map((o) => (
                  <span key={o} className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-700 border border-slate-200">{o}</span>
                ))}
              </div>
            </div>

            {(memo.ppn || memo.pph) && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Pajak</p>
                <div className="flex gap-2 flex-wrap">
                  {memo.ppn && <span className="px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-[11px] font-semibold">PPN 11%</span>}
                  {memo.pph && <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold">PPh 1.5%</span>}
                </div>
              </div>
            )}

            {memo.catatan && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Catatan</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-blue-800 leading-relaxed break-words">{memo.catatan}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Approval — sticky hanya di layar besar */}
        <div className="lg:col-span-1 lg:self-start">
          <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5 lg:sticky lg:top-24">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Jejak Persetujuan</p>

            <div className="relative">
              {/* Garis penghubung timeline — satu garis lurus dari tengah lingkaran pertama sampai terakhir */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200" />

              <div className="space-y-4">
                {/* Diajukan */}
                <div className="relative flex items-start gap-3">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border-2 border-card">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-800 break-words">Diajukan oleh {memo.submittedBy}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{memo.submittedAt}</p>
                  </div>
                </div>

                {/* Approval Buyer */}
                <div className="relative flex items-start gap-3">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-card ${memo.buyerApproval ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {memo.buyerApproval ? <Check className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className={`flex-1 min-w-0 p-2.5 rounded-xl border ${memo.buyerApproval ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100 border-dashed'}`}>
                    <p className={`text-[11px] font-semibold break-words ${memo.buyerApproval ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {memo.buyerApproval ? `Disetujui Buyer (${memo.buyerApproval.by})` : 'Menunggu Approval Buyer'}
                    </p>
                    {memo.buyerApproval && <p className="text-[10px] text-emerald-600 mt-0.5">{memo.buyerApproval.at}</p>}
                  </div>
                </div>

                {/* Ditolak (Hanya muncul jika status ditolak) */}
                {memo.status === 'ditolak' && memo.rejectLog && (
                  <div className="relative flex items-start gap-3">
                    <div className="relative z-10 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 border-2 border-card">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0 p-2.5 rounded-xl border bg-red-50 border-red-100">
                      <p className="text-[11px] font-semibold text-red-800 break-words">Ditolak oleh {memo.rejectLog.by}</p>
                      <p className="text-[10px] text-red-600 mt-0.5">{memo.rejectLog.at}</p>
                      <p className="text-[11px] text-red-700 mt-1 italic break-words">"{memo.rejectLog.note}"</p>
                    </div>
                  </div>
                )}

                {/* Approval Checker (Sembunyikan jika ditolak sebelum sampai sini) */}
                {memo.status !== 'ditolak' && (
                  <div className="relative flex items-start gap-3">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-card ${memo.checkerApproval ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      {memo.checkerApproval ? <Check className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className={`flex-1 min-w-0 p-2.5 rounded-xl border ${memo.checkerApproval ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100 border-dashed'}`}>
                      <p className={`text-[11px] font-semibold break-words ${memo.checkerApproval ? 'text-emerald-800' : 'text-slate-500'}`}>
                        {memo.checkerApproval ? `Disetujui Checker (${memo.checkerApproval.by})` : 'Menunggu Approval Checker'}
                      </p>
                      {memo.checkerApproval && <p className="text-[10px] text-emerald-600 mt-0.5">{memo.checkerApproval.at}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rincian barang tetap di bawah, mengambil lebar penuh */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />{memo.items.length} Rincian Barang
        </p>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-[560px] sm:min-w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2.5 text-left font-semibold text-slate-500">PLU / Nama</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500">Qty</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500 hidden sm:table-cell">Hrg Normal</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500 hidden sm:table-cell">Potongan</th>
                <th className="px-3 py-2.5 text-right font-semibold text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {memo.items.map((it, i) => {
                const total = (it.hargaNormal - it.potongan) * it.qty;
                return (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-800">{it.nama}</p>
                      <p className="text-slate-400 text-[10px] font-mono">{it.plu}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">{it.qty} <span className="text-slate-400 text-[10px]">{it.satuan}</span></td>
                    <td className="px-3 py-2.5 text-right text-slate-500 whitespace-nowrap hidden sm:table-cell">{fmt(it.hargaNormal)}</td>
                    <td className="px-3 py-2.5 text-right text-red-600 font-medium whitespace-nowrap hidden sm:table-cell">-{fmt(it.potongan)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-800 whitespace-nowrap">{fmt(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3 rounded-xl border border-amber-200"
          style={{ background: 'linear-gradient(135deg, #FEF9F0, #FEF3C7)' }}>
          <span className="text-[13px] font-semibold text-amber-800">Grand Total</span>
          <span className="text-[18px] font-bold text-amber-900">{fmt(grandTotal)}</span>
        </div>
      </div>

      {/* Confirm modal */}
      {action && (
        <ConfirmModal
          memo={memo}
          action={action}
          onClose={() => setAction(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}