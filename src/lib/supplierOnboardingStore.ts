export const SUPPLIER_ONBOARDING_KEY = "supplier-onboarding-v1"

export type SupplierOnboardingStatus =
  | "Menunggu Pembelian"
  | "Approved"
  | "Released"
  | "Rejected"

export type SupplierBank = { bank: string; account: string; holder: string }
export type SupplierPic = { name: string; phone: string }

export type SupplierOnboarding = {
  id: string
  submittedAt: string
  status: SupplierOnboardingStatus
  supplierId?: string
  namaSupplier: string
  jenisUsaha: string
  jenisUsahaLainnya?: string
  statusPajak?: string
  npwp: string
  alamat: string
  kota: string
  kodePos: string
  telepon: string
  fax: string
  pics: SupplierPic[]
  jatuhTempoFaktur: string
  banks: SupplierBank[]
  signature: string
  purchaseNote?: string
  edpNote?: string
  purchaseDecisionAt?: string
  edpDecisionAt?: string
}

export const readSupplierOnboarding = (): SupplierOnboarding[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(SUPPLIER_ONBOARDING_KEY) || "[]")
    return Array.isArray(raw) ? raw.map((item) => ({ ...item, status: item.status === "Menunggu EDP" ? "Approved" : item.status === "Disetujui" ? "Released" : item.status === "Ditolak Pembelian" || item.status === "Ditolak EDP" ? "Rejected" : item.status })) : []
  } catch { return [] }
}

const write = (items: SupplierOnboarding[]) => localStorage.setItem(SUPPLIER_ONBOARDING_KEY, JSON.stringify(items))

const DUMMY_SUPPLIER_ONBOARDING: SupplierOnboarding[] = [
  { id: "DEMO-SUP-001", submittedAt: "2026-10-28T08:30:00.000Z", status: "Menunggu Pembelian", namaSupplier: "PT Sinar Pangan Nusantara", jenisUsaha: "PT", npwp: "01.234.567.8-901.000", alamat: "Jl. Magelang No. 18", kota: "Yogyakarta", kodePos: "55281", telepon: "0274-555101", fax: "0274-555102", pics: [{ name: "Rina Kartika", phone: "0812-3456-7801" }], jatuhTempoFaktur: "30", banks: [{ bank: "Bank BCA", account: "1234567890", holder: "PT Sinar Pangan Nusantara" }], signature: "" },
  { id: "DEMO-SUP-002", submittedAt: "2026-10-27T09:45:00.000Z", status: "Approved", namaSupplier: "CV Berkah Jaya Abadi", jenisUsaha: "CV", npwp: "02.345.678.9-012.000", alamat: "Jl. Kaliurang Km 7", kota: "Sleman", kodePos: "55581", telepon: "0274-600221", fax: "", pics: [{ name: "Dimas Pratama", phone: "0813-2200-1144" }], jatuhTempoFaktur: "45", banks: [{ bank: "Bank Mandiri", account: "1380012233445", holder: "CV Berkah Jaya Abadi" }], signature: "", purchaseNote: "Data dan dokumen telah lengkap.", purchaseDecisionAt: "2026-10-28T10:00:00.000Z" },
  { id: "DEMO-SUP-003", submittedAt: "2026-10-24T07:15:00.000Z", status: "Released", supplierId: "SUP-2026-0001", namaSupplier: "PT Mitra Distribusi Sejahtera", jenisUsaha: "PT", npwp: "03.456.789.0-123.000", alamat: "Jl. Solo Km 9", kota: "Yogyakarta", kodePos: "55282", telepon: "0274-700334", fax: "0274-700335", pics: [{ name: "Sari Wulandari", phone: "0812-9000-2244" }], jatuhTempoFaktur: "30", banks: [{ bank: "Bank BNI", account: "0192837465", holder: "PT Mitra Distribusi Sejahtera" }], signature: "", purchaseDecisionAt: "2026-10-25T08:00:00.000Z", edpDecisionAt: "2026-10-26T09:00:00.000Z" },
  { id: "DEMO-SUP-004", submittedAt: "2026-10-22T09:00:00.000Z", status: "Rejected", namaSupplier: "UD Makmur Sentosa", jenisUsaha: "UD", npwp: "04.567.890.1-234.000", alamat: "Jl. Wates No. 45", kota: "Bantul", kodePos: "55711", telepon: "0274-811220", fax: "", pics: [{ name: "Ardi Saputra", phone: "0813-8112-0099" }], jatuhTempoFaktur: "30", banks: [{ bank: "Bank BRI", account: "001234567890", holder: "UD Makmur Sentosa" }], signature: "", purchaseDecisionAt: "2026-10-23T08:00:00.000Z", edpDecisionAt: "2026-10-24T08:00:00.000Z", edpNote: "NPWP perlu dilengkapi kembali." },
]

/** Menambahkan data contoh sekali saja, tanpa mengganti pengajuan supplier yang sudah ada. */
export const seedSupplierOnboardingDummies = (): SupplierOnboarding[] => {
  const existing = readSupplierOnboarding()
  const existingIds = new Set(existing.map((item) => item.id))
  const additions = DUMMY_SUPPLIER_ONBOARDING.filter((item) => !existingIds.has(item.id))
  if (!additions.length) return existing
  const next = [...additions, ...existing]
  write(next)
  return next
}

export const submitSupplierOnboarding = (data: Omit<SupplierOnboarding, "id" | "submittedAt" | "status">) => {
  const item: SupplierOnboarding = { ...data, id: `SUP-REQ-${Date.now()}`, submittedAt: new Date().toISOString(), status: "Menunggu Pembelian" }
  write([item, ...readSupplierOnboarding()])
  return item
}

export const decideSupplierOnboarding = (id: string, role: "Pembelian" | "EDP", approved: boolean, note: string) => {
  const existing = readSupplierOnboarding()
  const next = existing.map((item) => {
    if (item.id !== id) return item
    if (role === "Pembelian" && item.status === "Menunggu Pembelian") return { ...item, status: approved ? "Approved" as const : "Rejected" as const, purchaseNote: note, purchaseDecisionAt: new Date().toISOString() }
    if (role === "EDP" && item.status === "Approved") {
      const approvedCount = existing.filter((entry) => entry.status === "Released").length + 1
      return { ...item, status: approved ? "Released" as const : "Rejected" as const, supplierId: approved ? `SUP-${new Date().getFullYear()}-${String(approvedCount).padStart(4, "0")}` : undefined, edpNote: note, edpDecisionAt: new Date().toISOString() }
    }
    return item
  })
  write(next)
  return next.find((item) => item.id === id)
}
