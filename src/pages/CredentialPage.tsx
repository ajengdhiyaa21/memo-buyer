import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

function decodeCredential(value: string | null) {
  if (!value) return null;

  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return null;
  }
}

export function CredentialPage() {
  const params = new URLSearchParams(window.location.search);
  const credential = decodeCredential(params.get('data'));
  const lines = credential?.split('\n').filter(Boolean) ?? [];
  const title = lines[0] ?? 'Kredensial Dokumen';

  return (
    <div className="min-h-screen bg-[#EDF1F8] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-emerald-700 px-5 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">Verifikasi Dokumen</p>
              <h1 className="text-[18px] font-extrabold">{title}</h1>
            </div>
          </div>
        </div>

        {credential ? (
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              <p className="text-[13px] font-semibold text-emerald-800">QR berhasil dibaca. Data kredensial dokumen tampil di bawah.</p>
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {lines.slice(1).map((line) => {
                const [label, ...rest] = line.split(': ');
                return (
                  <div key={line} className="grid grid-cols-[120px_1fr] gap-3 px-3 py-2.5 text-[13px]">
                    <span className="font-bold text-slate-500">{label}</span>
                    <span className="break-words font-semibold text-slate-800">{rest.join(': ') || '-'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
              <p className="text-[13px] font-semibold text-red-800">Data kredensial tidak ditemukan atau link QR tidak valid.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
