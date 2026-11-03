import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, PenLine, Send, UserPlus } from "lucide-react"
import { submitSupplierOnboarding, type SupplierBank, type SupplierPic } from "../lib/supplierOnboardingStore"
import mannaKampusLogo from "../../logo.png"
import FormCard from "../components/supplier-form/FormCard"
import SignaturePad from "../components/supplier-form/SignaturePad"

const banks = ["Bank BCA", "Bank Mandiri", "Bank BNI", "Bank BRI", "Bank CIMB Niaga", "Bank Danamon", "Bank Permata", "Bank Syariah Indonesia", "Bank Mega", "Lainnya"]
const input = "mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
const label = "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400"
type SupplierForm = { namaSupplier: string; jenisUsaha: string; jenisUsahaLainnya: string; statusPajak: string; npwp: string; alamat: string; kota: string; kodePos: string; telepon: string; fax: string; pics: SupplierPic[]; jatuhTempoFaktur: string; banks: SupplierBank[] }
const initial: SupplierForm = { namaSupplier: "", jenisUsaha: "", jenisUsahaLainnya: "", statusPajak: "", npwp: "", alamat: "", kota: "", kodePos: "", telepon: "", fax: "", pics: [{ name: "", phone: "" }, { name: "", phone: "" }, { name: "", phone: "" }], jatuhTempoFaktur: "", banks: [{ bank: "", account: "", holder: "" }] }

function Header() { return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm"><div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6"><div className="flex items-center gap-3"><img src={mannaKampusLogo} alt="Manna Kampus" className="h-9 w-auto object-contain"/><div className="leading-tight"><p className="text-[13px] font-bold text-slate-800">Buyer Memo System</p><p className="text-[10px] text-slate-400">Formulir Pengajuan Memo Supplier</p></div></div><span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 sm:inline-flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"/>Akses Supplier</span></div><div className="h-[3px] bg-gradient-to-r from-amber-700 via-amber-500 to-[#EDF1F8]"/></header> }
function Steps({ current }: { current: number }) { const steps = ["Data Supplier", "Tinjau & Tanda Tangan"]; return <div className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-4">{steps.map((name, index) => <div className="flex items-center" key={name}><div className="flex w-[132px] flex-col items-center gap-1.5"><div className={`flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-bold ${index < current ? "border-amber-300 bg-amber-100 text-amber-700" : index === current ? "border-amber-600 bg-amber-600 text-white shadow-md shadow-amber-600/30" : "border-slate-200 bg-slate-100 text-slate-400"}`}>{index < current ? <CheckCircle2 className="h-4 w-4"/> : index + 1}</div><span className={`text-center text-[10.5px] font-semibold ${index === current ? "text-amber-700" : "text-slate-400"}`}>{name}</span></div>{index === 0 && <div className={`-mt-5 h-[2px] w-12 ${current ? "bg-amber-300" : "bg-slate-200"}`}/>}</div>)}</div></div> }

function Signature({ onChange }: { onChange: (value: string) => void }) { const ref = useRef<HTMLCanvasElement>(null); const drawing = useRef(false); const pos = (e: React.PointerEvent<HTMLCanvasElement>) => { const c = ref.current; if (!c) return null; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height } }; const begin = (e: React.PointerEvent<HTMLCanvasElement>) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); const p = pos(e), ctx = ref.current?.getContext("2d"); if (p && ctx) { ctx.beginPath(); ctx.moveTo(p.x, p.y) } }; const draw = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const p = pos(e), ctx = ref.current?.getContext("2d"); if (p && ctx) { ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke(); onChange(ref.current?.toDataURL("image/png") || "") } }; const clear = () => { const c = ref.current; c?.getContext("2d")?.clearRect(0, 0, c.width, c.height); onChange("") }; return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><PenLine className="h-4 w-4" /></span><div><h2 className="text-base font-black text-slate-800">Tanda Tangan</h2><p className="mt-1 text-xs text-slate-500">Bubuhkan tanda tangan sebagai persetujuan atas data supplier.</p></div></div><button onClick={clear} className="text-xs font-bold text-amber-700">Hapus & Ulangi</button></div><canvas ref={ref} width={720} height={220} onPointerDown={begin} onPointerMove={draw} onPointerUp={() => { drawing.current = false }} className="mt-4 h-36 w-full touch-none rounded-xl border border-dashed border-slate-300 bg-slate-50"/></section> }

function ReviewGroup({ title, rows }: { title: string; rows: Array<[string, string]> }) { return <div><p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p><div className="overflow-hidden rounded-xl border border-slate-200"><div className="divide-y divide-slate-100">{rows.map(([label, value]) => <div className="grid grid-cols-[40%_60%] px-3 py-2 text-[11px]" key={label}><span className="text-slate-400">{label}</span><span className="break-words font-semibold text-slate-800">{value || "-"}</span></div>)}</div></div></div> }
function SupplierReview({ data }: { data: SupplierForm }) { return <div className="space-y-3"><ReviewGroup title="Identitas Supplier" rows={[["Nama Supplier", data.namaSupplier], ["Jenis Usaha", data.jenisUsaha === "Lainnya" ? data.jenisUsahaLainnya : data.jenisUsaha], ["Status Pajak", data.statusPajak], ["NPWP", data.npwp]]}/><ReviewGroup title="Alamat & Kontak" rows={[["Alamat", data.alamat], ["Kota", `${data.kota || "-"}${data.kodePos ? ` ${data.kodePos}` : ""}`], ["Jatuh Tempo Faktur", data.jatuhTempoFaktur ? `${data.jatuhTempoFaktur} hari` : "-"], ["PIC Utama", `${data.pics[0]?.name || "-"} - ${data.pics[0]?.phone || "-"}`]]}/><ReviewGroup title="PIC Supplier" rows={data.pics.map((pic, index) => [`PIC ${index + 1}`, `${pic.name || "-"} - ${pic.phone || "-"}`])}/><ReviewGroup title="Rekening Bank Supplier" rows={data.banks.map((bank, index) => [`Bank ${index + 1}`, `${bank.bank || "-"} - ${bank.account || "-"} - ${bank.holder || "-"}`])}/></div> }
function Preview({ data, close }: { data: SupplierForm; close: () => void }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4"><div className="mx-auto my-8 max-w-3xl rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><div><p className="font-black text-slate-800">Preview Pendaftaran Supplier</p><p className="text-xs text-slate-500">Dokumen sebelum dikirim ke Pembelian.</p></div><button onClick={close} className="text-sm font-bold text-slate-500">Tutup</button></div><div className="space-y-5 p-6 text-sm"><section><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Informasi usaha</p><h1 className="mt-2 text-xl font-black text-slate-900">{data.namaSupplier || "-"}</h1><p className="mt-1 text-slate-600">{data.jenisUsaha === "Lainnya" ? data.jenisUsahaLainnya : data.jenisUsaha} - NPWP {data.npwp || "-"}</p></section><div className="grid gap-4 sm:grid-cols-2"><p><b>Alamat</b><br/>{data.alamat || "-"}<br/>{data.kota || "-"}, {data.kodePos || "-"}</p><p><b>Kontak</b><br/>Tel. {data.telepon || "-"}<br/>Fax {data.fax || "-"}<br/>Jatuh tempo: {data.jatuhTempoFaktur || "-"} hari</p></div><section><b>PIC</b><div className="mt-2 grid gap-2 sm:grid-cols-3">{data.pics.map((item, index) => <div className="rounded-xl bg-slate-50 p-3" key={index}><p className="font-semibold">{item.name || "-"}</p><p className="text-xs text-slate-500">{item.phone || "-"}</p></div>)}</div></section><section><b>Rekening Bank</b><div className="mt-2 overflow-hidden rounded-xl border"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-3 py-2">Bank</th><th className="px-3 py-2">A/C</th><th className="px-3 py-2">Atas Nama</th></tr></thead><tbody>{data.banks.map((item, index) => <tr className="border-t" key={index}><td className="px-3 py-2">{item.bank || "-"}</td><td className="px-3 py-2">{item.account || "-"}</td><td className="px-3 py-2">{item.holder || "-"}</td></tr>)}</tbody></table></div></section></div><div className="flex justify-end border-t px-6 py-4"><button onClick={() => window.print()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Cetak / Simpan PDF</button></div></div></div> }

export default function SupplierRegistrationPage() {
  const [step, setStep] = useState(0), [data, setData] = useState<SupplierForm>(initial), [signature, setSignature] = useState(""), [preview, setPreview] = useState(false), [submitted, setSubmitted] = useState(false)
  useEffect(() => {
    if (step === 0) {
      const nextButton = Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.trim().startsWith("Lanjut")) as HTMLButtonElement | undefined
      if (nextButton) nextButton.disabled = false
    }
    document.querySelectorAll("label, p").forEach((labelElement) => {
      if (labelElement.tagName === "LABEL" && labelElement.querySelector("input") && /Telepon/i.test(labelElement.textContent || "")) {
        ;(labelElement as HTMLElement).style.display = "none"
      }
      if (/Jenis Usaha\s*\*/i.test(labelElement.textContent || "")) {
        const textNode = Array.from(labelElement.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes("*"))
        if (textNode) textNode.textContent = textNode.textContent.replace(/\s*\*/, "")
      }
      const walker = document.createTreeWalker(labelElement, NodeFilter.SHOW_TEXT)
      const textNodes: Text[] = []
      let node: Node | null
      while ((node = walker.nextNode())) if (node.textContent?.includes("*")) textNodes.push(node as Text)
      textNodes.forEach((textNode) => {
        const parts = (textNode.textContent || "").split("*")
        if (parts.length < 2) return
        const fragment = document.createDocumentFragment()
        parts.forEach((part, index) => {
          if (part) fragment.appendChild(document.createTextNode(part))
          if (index < parts.length - 1) {
            const mark = document.createElement("span")
            mark.className = "text-red-400 ml-0.5"
            mark.textContent = "*"
            fragment.appendChild(mark)
          }
        })
        textNode.replaceWith(fragment)
      })
    })
    const businessTypeLabel = Array.from(document.querySelectorAll("label")).find((element) => element.textContent?.includes("Jenis Usaha"))
    if (businessTypeLabel && businessTypeLabel.parentElement && !businessTypeLabel.parentElement.querySelector("[data-tax-status]")) {
      const taxLabel = document.createElement("label")
      taxLabel.dataset.taxStatus = "true"
      taxLabel.className = "block text-[11px] font-bold uppercase tracking-wider text-slate-400"
      taxLabel.textContent = "Status Pajak *"
      const taxSelect = document.createElement("select")
      taxSelect.className = "mt-0 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      taxSelect.innerHTML = '<option value="">Pilih status pajak</option><option value="PKP">PKP</option><option value="PTKP">PTKP</option>'
      taxSelect.value = data.statusPajak
      taxSelect.onchange = () => setData((old) => ({ ...old, statusPajak: taxSelect.value }))
      taxLabel.appendChild(taxSelect)
      businessTypeLabel.parentElement.appendChild(taxLabel)
    }
    const npwpLabel = Array.from(document.querySelectorAll("label")).find((element) => element.textContent?.includes("NPWP"))
    const taxStatusLabel = document.querySelector("[data-tax-status]")
    if (npwpLabel && taxStatusLabel) npwpLabel.after(taxStatusLabel)
    if (step === 1) {
      const reviewHeading = Array.from(document.querySelectorAll("h2")).find((element) => element.textContent?.trim() === "Tinjau Inputan")
      const reviewSection = reviewHeading?.closest("section")
      if (reviewHeading && reviewSection) {
        reviewSection.className = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        reviewHeading.textContent = "Tinjau Ringkasan Supplier"
        const currentSubtitle = reviewHeading.parentElement?.querySelector("p")
        if (currentSubtitle) currentSubtitle.textContent = "Periksa kembali seluruh data sebelum mengirim pendaftaran."
        const reviewHeader = reviewHeading.parentElement?.parentElement
        if (reviewHeader) {
          reviewHeader.className = "flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-amber-50 px-5 py-4"
          if (!reviewHeader.querySelector("[data-review-icon]")) {
            const icon = document.createElement("span")
            icon.dataset.reviewIcon = "true"
            icon.className = "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-700"
            icon.textContent = "✓"
            reviewHeader.prepend(icon)
          }
        }
        const originalGrid = reviewSection.querySelector(":scope > .mt-4.grid") as HTMLElement | null
        if (originalGrid) originalGrid.style.display = "none"
        if (!reviewSection.querySelector("[data-review-extra]")) {
          const extra = document.createElement("div")
          extra.dataset.reviewExtra = "true"
          extra.className = "space-y-4 px-5 py-5"
          const makeCard = (title: string, rows: Array<[string, string]>) => {
            const group = document.createElement("div")
            group.className = "space-y-1.5"
            const card = document.createElement("div")
            card.className = "overflow-hidden rounded-xl border border-slate-200 bg-white"
            const heading = document.createElement("p")
            heading.className = "px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
            heading.textContent = title
            group.appendChild(heading)
            rows.forEach(([key, value]) => {
              const row = document.createElement("div")
              row.className = "grid grid-cols-[40%_60%] border-b border-slate-100 px-3 py-2 text-[11px] last:border-0"
              const keyNode = document.createElement("span")
              keyNode.className = "text-slate-400"
              keyNode.textContent = key
              const valueNode = document.createElement("span")
              valueNode.className = "font-semibold text-slate-800 break-words"
              valueNode.textContent = value || "-"
              row.append(keyNode, valueNode)
              card.appendChild(row)
            })
            group.appendChild(card)
            return group
          }
          extra.append(
            makeCard("Identitas Supplier", [["Nama Supplier", data.namaSupplier], ["Jenis Usaha", data.jenisUsaha || "-"], ["Status Pajak", data.statusPajak], ["NPWP", data.npwp]]),
            makeCard("Alamat & Kontak", [["Alamat", data.alamat], ["Kota", `${data.kota} ${data.kodePos}`], ["Jatuh Tempo Faktur", `${data.jatuhTempoFaktur} hari`], ["PIC Utama", `${data.pics[0]?.name || "-"} - ${data.pics[0]?.phone || "-"}`]]),
            makeCard("PIC Supplier", data.pics.map((pic, index) => [`PIC ${index + 1}`, `${pic.name || "-"} - ${pic.phone || "-"}`])),
            makeCard("Rekening Bank Supplier", data.banks.map((bank, index) => [`Bank ${index + 1}`, `${bank.bank || "-"} - ${bank.account || "-"} - ${bank.holder || "-"}`])),
          )
          reviewSection.appendChild(extra)
        }
      }
      const signatureHeading = Array.from(document.querySelectorAll("h2")).find((element) => element.textContent?.trim() === "Tanda Tangan")
      const signatureSection = signatureHeading?.closest("section")
      if (signatureHeading && signatureSection) {
        signatureSection.className = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        const signatureHeader = signatureHeading.parentElement?.parentElement
        if (signatureHeader) {
          signatureHeader.className = "flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-amber-50 px-5 py-4"
        }
      }
    }
    const dueLabel = Array.from(document.querySelectorAll("label")).find((element) => element.textContent?.includes("Jatuh Tempo Faktur"))
    const dueInput = dueLabel?.querySelector("input[type=number]") as HTMLInputElement | null
    if (dueInput && !dueInput.dataset.unitAttached) {
      const wrapper = document.createElement("div")
      wrapper.className = "flex items-center gap-2"
      const unit = document.createElement("span")
      unit.className = "text-[13px] font-semibold text-slate-500"
      unit.textContent = "hari"
      dueInput.classList.remove("w-full")
      dueInput.classList.add("flex-1")
      dueInput.replaceWith(wrapper)
      wrapper.append(dueInput, unit)
      dueInput.dataset.unitAttached = "true"
    }
    const bankHeading = Array.from(document.querySelectorAll("h2")).find((element) => element.textContent?.trim() === "Rekening Bank Supplier")
    const bankSection = bankHeading?.closest("section")
    if (bankSection) {
      bankSection.querySelectorAll("[data-bank-delete]").forEach((element) => element.remove())
      const bankInputs = Array.from(bankSection.querySelectorAll('select'))
      bankInputs.forEach((bankInput, index) => {
        const card = bankInput.closest("div.rounded-xl") as HTMLDivElement | null
        if (!card) return
        card.style.position = "relative"
        const existingTitle = card.querySelector("[data-bank-title]") as HTMLParagraphElement | null
        if (existingTitle) {
          existingTitle.textContent = `Rekening Bank ${index + 1}`
        } else {
          const title = document.createElement("p")
          title.dataset.bankTitle = "true"
          title.className = "mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:col-span-3"
          title.textContent = `Rekening Bank ${index + 1}`
          card.prepend(title)
        }
        if (data.banks.length <= 1) return
        const removeButton = document.createElement("button")
        removeButton.type = "button"
        removeButton.dataset.bankDelete = "true"
        removeButton.title = "Hapus rekening bank"
        removeButton.className = "absolute right-3 top-2 text-slate-400 hover:text-red-500"
        removeButton.textContent = "×"
        removeButton.onclick = () => setData((old) => old.banks.length > 1 ? { ...old, banks: old.banks.filter((_, bankIndex) => bankIndex !== index) } : old)
        card.appendChild(removeButton)
      })
      bankSection.querySelector("[data-bank-add]")?.remove()
      {
        const addButton = document.createElement("button")
        addButton.type = "button"
        addButton.dataset.bankAdd = "true"
        addButton.className = "mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
        addButton.textContent = "+ Tambah Rekening Bank"
        addButton.onclick = () => setData((old) => ({ ...old, banks: [...old.banks, { bank: "", account: "", holder: "" }] }))
        bankSection.appendChild(addButton)
      }
    }
    if (false) { const picHeading = Array.from(document.querySelectorAll("h2")).find((element) => element.textContent?.trim() === "PIC Supplier")
    const picSection = picHeading?.closest("section")
    if (picSection) {
      picSection.querySelectorAll("[data-pic-delete]").forEach((element) => element.remove())
      picSection.querySelector("[data-pic-add]")?.remove()
      const picInputs = Array.from(picSection.querySelectorAll('input[placeholder="Nama PIC"]'))
      picInputs.forEach((picInput, index) => {
        const card = picInput.closest("div.rounded-xl") as HTMLDivElement | null
        if (!card) return
        card.style.position = "relative"
        const removeButton = document.createElement("button")
        removeButton.type = "button"
        removeButton.dataset.picDelete = "true"
        removeButton.title = "Hapus PIC"
        removeButton.className = "absolute right-3 top-3 text-slate-400 hover:text-red-500"
        removeButton.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 6h18\"/><path d=\"M8 6V4h8v2\"/><path d=\"M19 6l-1 14H6L5 6\"/></svg>"
        removeButton.onclick = () => setData((old) => old.pics.length > 1 ? { ...old, pics: old.pics.filter((_, picIndex) => picIndex !== index) } : old)
        card.appendChild(removeButton)
      })
      const addPic = document.createElement("button")
      addPic.type = "button"
      addPic.dataset.picAdd = "true"
      addPic.className = "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50"
      addPic.textContent = "+ Tambah PIC"
      addPic.onclick = () => setData((old) => ({ ...old, pics: [...old.pics, { name: "", phone: "" }] }))
      picSection.appendChild(addPic)
    }
    }
  }, [step, data.banks.length, data.pics.length])
  useEffect(() => {
    const primaryPhone = data.pics[0]?.phone || ""
    if (data.telepon !== primaryPhone) setData((old) => ({ ...old, telepon: primaryPhone }))
  }, [data.pics])
  const update = <K extends keyof SupplierForm>(key: K, value: SupplierForm[K]) => setData((old) => ({ ...old, [key]: value }))
  useEffect(() => {
    if (data.jatuhTempoFaktur !== "" && Number(data.jatuhTempoFaktur) < 0) update("jatuhTempoFaktur", "0")
  }, [data.jatuhTempoFaktur])
  const updatePic = (index: number, key: keyof SupplierPic, value: string) => update("pics", data.pics.map((item, i) => i === index ? { ...item, [key]: value } : item))
  const updateBank = (index: number, key: keyof SupplierBank, value: string) => update("banks", data.banks.map((item, i) => i === index ? { ...item, [key]: value } : item))
  const valid = Boolean(data.namaSupplier && data.statusPajak && (data.statusPajak !== "PKP" || data.npwp) && data.alamat && data.kota && data.kodePos && data.pics[0].name && data.pics[0].phone && data.jatuhTempoFaktur && signature)
  const submit = () => { submitSupplierOnboarding({ ...data, pics: data.pics.filter((item) => item.name || item.phone), banks: data.banks.filter((item) => item.bank || item.account || item.holder), signature }); setSubmitted(true) }
  if (submitted) return <div className="min-h-screen bg-[#EDF1F8]"><Header/><div className="p-6"><div className="mx-auto mt-20 max-w-xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600"/><h1 className="mt-4 text-xl font-black text-slate-900">Pengajuan pendaftaran berhasil dikirim</h1><p className="mt-2 text-sm text-slate-500">Data supplier Anda sedang menunggu verifikasi. ID Supplier akan diterbitkan setelah pengajuan disetujui.</p><a href="/supplier/form" className="mt-6 inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white">Kembali ke Form Supplier</a></div></div></div>
  return <div className="min-h-screen bg-[#EDF1F8]"><Header/><Steps current={step}/><main className="mx-auto max-w-4xl px-4 py-8 pb-28 sm:px-6"><div className="mb-6 text-center"><h1 className="text-[20px] font-extrabold text-slate-900">Pendaftaran Supplier Baru</h1><p className="mt-1 text-[13px] text-slate-500">Langkah {step + 1} dari 2 - {step === 0 ? "Data Supplier" : "Tinjau & Tanda Tangan"}</p></div>{step === 0 ? <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-800">Informasi Usaha</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className={label}>Nama Supplier *<input className={input} value={data.namaSupplier} onChange={(e) => update("namaSupplier", e.target.value)}/></label><label className={label}>Jenis Usaha *<select className={input} value={data.jenisUsaha} onChange={(e) => update("jenisUsaha", e.target.value)}><option value="">Pilih jenis usaha</option><option>PT</option><option>CV</option><option>UD</option><option>Lainnya</option></select></label>{data.jenisUsaha === "Lainnya" && <label className={label}>Jenis Usaha Lainnya<input className={input} value={data.jenisUsahaLainnya} onChange={(e) => update("jenisUsahaLainnya", e.target.value)}/></label>}<label className={label}>NPWP *<input className={input} value={data.npwp} onChange={(e) => update("npwp", e.target.value)}/></label><label className={`${label} sm:col-span-2`}>Alamat *<textarea className={`${input} min-h-20`} value={data.alamat} onChange={(e) => update("alamat", e.target.value)}/></label><label className={label}>Kota *<input className={input} value={data.kota} onChange={(e) => update("kota", e.target.value)}/></label><label className={label}>Kode Pos *<input className={input} value={data.kodePos} onChange={(e) => update("kodePos", e.target.value)}/></label><label className={label}>Telepon *<input className={input} value={data.telepon} onChange={(e) => update("telepon", e.target.value)}/></label><label className={label}>Fax<input className={input} value={data.fax} onChange={(e) => update("fax", e.target.value)}/></label><label className={label}>Jatuh Tempo Faktur (hari) *<input type="number" min="0" className={input} value={data.jatuhTempoFaktur} onChange={(e) => update("jatuhTempoFaktur", e.target.value)}/></label></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-800">PIC Supplier</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{data.pics.map((pic, index) => <div className="rounded-xl border border-slate-100 bg-slate-50 p-3" key={index}><p className="text-xs font-bold text-slate-500">PIC {index + 1}{index === 0 ? " *" : ""}</p><input className={input} placeholder="Nama PIC" value={pic.name} onChange={(e) => updatePic(index, "name", e.target.value)}/><input className={input} placeholder="No. HP" value={pic.phone} onChange={(e) => updatePic(index, "phone", e.target.value)}/></div>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-800">Rekening Bank Supplier</h2><div className="mt-4 space-y-3">{data.banks.map((bank, index) => <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-3" key={index}><select className={input} value={bank.bank} onChange={(e) => updateBank(index, "bank", e.target.value)}><option value="">Nama bank {index + 1}</option>{banks.map((name) => <option key={name}>{name}</option>)}</select><input className={input} placeholder="No. rekening (A/C)" value={bank.account} onChange={(e) => updateBank(index, "account", e.target.value)}/><input className={input} placeholder="Atas nama (A/N)" value={bank.holder} onChange={(e) => updateBank(index, "holder", e.target.value)}/></div>)}</div></section></div> : <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-base font-black text-slate-800">Tinjau Inputan</h2><p className="mt-1 text-xs text-slate-500">Pastikan seluruh data sudah benar sebelum dikirim.</p></div><button onClick={() => setPreview(true)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Eye className="h-4 w-4"/>Preview PDF</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{[["Nama Supplier", data.namaSupplier], ["Jenis Usaha", data.jenisUsaha === "Lainnya" ? data.jenisUsahaLainnya : data.jenisUsaha], ["NPWP", data.npwp], ["Alamat", `${data.alamat}, ${data.kota} ${data.kodePos}`], ["Telepon", data.telepon], ["Jatuh Tempo Faktur", `${data.jatuhTempoFaktur} hari`]].map(([key, value]) => <div className="rounded-xl bg-slate-50 p-3" key={key}><p className="text-[10px] font-bold uppercase text-slate-400">{key}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || "-"}</p></div>)}</div></section><FormCard title="Tanda Tangan" icon={PenLine} subtitle="Bubuhkan tanda tangan sebagai persetujuan atas data supplier."><SignaturePad value={signature} onChange={setSignature}/></FormCard></div>}</main><div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"><div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6"><button onClick={() => step ? setStep(0) : window.location.assign("/supplier/form")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[13px] font-semibold text-slate-600"><ArrowLeft className="h-4 w-4"/>Kembali</button>{step === 0 ? <button disabled={!data.namaSupplier || !data.jenisUsaha} onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-md shadow-amber-700/30 disabled:opacity-50">Lanjut<ArrowRight className="h-4 w-4"/></button> : <button disabled={!valid} onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-md shadow-amber-700/30 disabled:opacity-50"><Send className="h-4 w-4"/>Kirim Pendaftaran</button>}</div></div>{preview && <Preview data={data} close={() => setPreview(false)}/>}</div>
}
