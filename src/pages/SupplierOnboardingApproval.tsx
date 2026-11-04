import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Search, XCircle } from "lucide-react";
import {
  decideSupplierOnboarding,
  seedSupplierOnboardingDummies,
  type SupplierOnboarding,
} from "../lib/supplierOnboardingStore";

const statusTone: Record<string, string> = {
  Draft: "bg-amber-50 text-amber-700",
  Approved: "bg-blue-50 text-blue-700",
  Released: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

export default function SupplierOnboardingApproval() {
  const role = localStorage.getItem("bm-role") || "";
  const [items, setItems] = useState<SupplierOnboarding[]>([]);
  const [selected, setSelected] = useState<SupplierOnboarding | null>(null);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const load = () => setItems(seedSupplierOnboardingDummies());
  useEffect(load, []);
  const allowed = role === "Pembelian" || role === "EDP";
  const pendingStatus = role === "EDP" ? "Approved" : "Draft";
  const rows = useMemo(
    () =>
      items.filter(
        (item) =>
          !search ||
          `${item.namaSupplier} ${item.npwp}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [items, search],
  );
  const decide = (approved: boolean) => {
    if (!selected) return;
    decideSupplierOnboarding(
      selected.id,
      role as "Pembelian" | "EDP",
      approved,
      note,
    );
    setSelected(null);
    setNote("");
    load();
  };
  if (!allowed)
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
        Halaman ini hanya dapat diakses oleh Pembelian atau EDP.
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
          {role}
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">
          Approval Supplier Baru
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {role === "EDP"
            ? "Verifikasi data setelah disetujui Pembelian dan terbitkan ID Supplier."
            : "Periksa kelengkapan pendaftaran sebelum diteruskan ke EDP."}
        </p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari supplier atau NPWP..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
            {items.filter((item) => item.status === pendingStatus).length}{" "}
            menunggu tindakan
          </span>
        </div>
      </section>
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Supplier</th>
              <th className="px-5 py-3">Jenis</th>
              <th className="px-5 py-3">NPWP</th>
              <th className="px-5 py-3">Kota</th>
              <th className="px-5 py-3">Tanggal Pengajuan</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">ID Supplier</th>
              <th className="px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((item) => (
              <tr className="hover:bg-amber-50/30" key={item.id}>
                <td className="px-5 py-4 font-semibold text-slate-800">
                  {item.namaSupplier}
                  <p className="mt-1 text-xs font-normal text-slate-400">
                    {item.pics[0]?.name || "—"}
                  </p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  {item.jenisUsaha === "Lainnya"
                    ? item.jenisUsahaLainnya
                    : item.jenisUsaha}
                </td>
                <td className="px-5 py-4 font-mono text-xs">{item.npwp}</td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  {item.kota}
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {new Date(item.submittedAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-xs font-bold text-emerald-700">
                  {item.supplierId || "—"}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setSelected(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="py-14 text-center text-sm text-slate-500">
            Belum ada pendaftaran supplier.
          </div>
        )}
      </section>
      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">
          <div className="mx-auto my-8 max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-black text-slate-800">
                  {selected.namaSupplier}
                </h2>
                <p className="text-xs text-slate-500">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-sm font-bold text-slate-500"
              >
                Tutup
              </button>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <section>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Informasi usaha
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-slate-400">NPWP</dt>
                    <dd className="font-semibold">{selected.npwp}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Alamat</dt>
                    <dd className="font-semibold">
                      {selected.alamat}, {selected.kota} {selected.kodePos}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Jatuh tempo faktur</dt>
                    <dd className="font-semibold">
                      {selected.jatuhTempoFaktur} hari
                    </dd>
                  </div>
                </dl>
              </section>
              <section>
                <p className="text-xs font-bold uppercase text-slate-400">
                  PIC & Bank
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {selected.pics.map((pic, index) => (
                    <p key={index}>
                      <b>{pic.name}</b> · {pic.phone}
                    </p>
                  ))}
                  {selected.banks.map((bank, index) => (
                    <p key={index} className="text-slate-600">
                      {bank.bank} · {bank.account} · {bank.holder}
                    </p>
                  ))}
                </div>
              </section>
              {selected.signature && (
                <section className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Tanda Tangan
                  </p>
                  <img
                    src={selected.signature}
                    alt="Tanda tangan supplier"
                    className="mt-2 h-24 rounded-xl border bg-slate-50"
                  />
                </section>
              )}
              {selected.status === pendingStatus && (
                <section className="sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700">
                    Catatan {role}
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-amber-500"
                      placeholder="Tambahkan catatan jika diperlukan"
                    />
                  </label>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => decide(false)}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                      Tolak
                    </button>
                    <button
                      onClick={() => decide(true)}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {role === "EDP"
                        ? "Setujui & Terbitkan ID"
                        : "Setujui & Kirim ke EDP"}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
