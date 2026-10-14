import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const role = localStorage.getItem('bm-role') || currentUser.role

  return (
    <main className="max-w-5xl space-y-5">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-900 px-6 py-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Akun Pengguna</p>
          <h1 className="mt-1 text-2xl font-black">Profil Saya</h1>
          <p className="mt-1 text-sm text-slate-300">Informasi akun yang sedang digunakan.</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 sm:col-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 font-bold text-white">{currentUser.initials}</div>
            <div><p className="font-bold text-slate-900">{currentUser.nama}</p><p className="text-sm text-slate-500">{role}</p></div>
          </div>
          <Info label="Nama Pengguna" value={currentUser.nama} />
          <Info label="Username / Email" value={currentUser.email} />
          <Info label="Role" value={role} />
          <Info label="ID Pengguna" value={currentUser.id} />
        </div>
        <div className="flex justify-end border-t border-slate-100 p-5">
          <button type="button" onClick={() => navigate('/profile/password')} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700">
            <KeyRound className="h-4 w-4" /> Ubah Password
          </button>
        </div>
      </section>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>
}

export function ChangePassword() {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const role = localStorage.getItem('bm-role') || currentUser.role
  const defaults: Record<string, string> = { Akuntansi: 'akuntansi123', Pembelian: 'pembelian123' }
  const [values, setValues] = useState({ old: '', next: '', confirm: '' })
  const [message, setMessage] = useState('')
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const current = localStorage.getItem(`bm-password-${role}`) || defaults[role]
    if (values.old !== current) return setMessage('Password lama tidak sesuai.')
    if (values.next.length < 6) return setMessage('Password baru minimal 6 karakter.')
    if (values.next !== values.confirm) return setMessage('Konfirmasi password belum sama.')
    localStorage.setItem(`bm-password-${role}`, values.next)
    setValues({ old: '', next: '', confirm: '' })
    setMessage('Password berhasil diubah.')
  }
  return <main className="max-w-5xl space-y-5"><button type="button" onClick={() => navigate('/profile')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Kembali ke Profil</button><section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Keamanan Akun</p><h1 className="mt-1 text-2xl font-black text-slate-900">Ubah Password</h1><p className="mt-1 text-sm text-slate-500">Perbarui password akun {role}.</p></div><form onSubmit={submit} className="space-y-4">{([{ key: 'old', label: 'Password Lama' }, { key: 'next', label: 'Password Baru' }, { key: 'confirm', label: 'Konfirmasi Password Baru' }] as const).map((field) => <label key={field.key} className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">{field.label}</span><input required type="password" value={values[field.key]} onChange={(e) => setValues((current) => ({ ...current, [field.key]: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" /></label>)}{message && <p className={`text-xs font-semibold ${message.includes('berhasil') ? 'text-emerald-600' : 'text-red-600'}`}>{message}</p>}<div className="flex justify-end"><button type="submit" className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700">Simpan Password</button></div></form></section></main>
}
