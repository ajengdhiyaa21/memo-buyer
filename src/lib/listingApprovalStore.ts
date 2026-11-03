export type ListingApprovalStatus = "Draft" | "Approved" | "Released" | "Rejected"
export type ListingApprovalProduct = { plu: string; namaProduk: string }
export type ListingApproval = {
  id: string
  memoId: string
  nomorMemo: string
  supplierNama: string
  submittedAt: string
  status: ListingApprovalStatus
  products: ListingApprovalProduct[]
  purchaseNote?: string
  edpNote?: string
  purchaseDecisionAt?: string
  edpDecisionAt?: string
}

const KEY = "listing-approval-v1"

const readHistory = (): any[] => {
  try { const value = JSON.parse(localStorage.getItem("supplier-memo-history") || "[]"); return Array.isArray(value) ? value : [] } catch { return [] }
}

const readStored = (): ListingApproval[] => {
  try { const value = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : [] } catch { return [] }
}

export const readListingApprovals = (): ListingApproval[] => {
  const stored = readStored().map((item) => ({ ...item, status: item.status === ("Menunggu Pembelian" as ListingApprovalStatus) ? "Draft" as const : item.status }))
  const byMemo = new Map(stored.map((item) => [item.memoId, item]))
  const actual = readHistory().filter((memo) => memo?.data?.jenisMemo === "pendapatan-lain" && memo?.data?.pendapatan?.jenis === "listing")
  const nextActual = actual.map((memo) => {
    const existing = byMemo.get(memo.id)
    const products = (memo.data.pendapatan.listingProducts || []).map((product: any) => ({ plu: product.plu || product.barcodePcs || "-", namaProduk: product.namaProduk || "-" }))
    return existing ? { ...existing, products: existing.products.length ? existing.products : products } : { id: `LIST-${memo.id}`, memoId: memo.id, nomorMemo: memo.nomorMemo || memo.id, supplierNama: memo.supplierNama || "-", submittedAt: memo.tanggalSubmit || new Date().toISOString(), status: "Draft" as const, products }
  })
  const next = [...nextActual, ...stored.filter((item) => !actual.some((memo) => memo.id === item.memoId))]
  const changed = JSON.stringify(next) !== JSON.stringify(stored)
  if (changed) localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

const DUMMY_LISTINGS: ListingApproval[] = [
  { id: "DEMO-LIST-001", memoId: "DEMO-LIST-MEMO-001", nomorMemo: "BM-LIST-2026-001", supplierNama: "PT Sinar Pangan Nusantara", submittedAt: "2026-11-01T08:30:00.000Z", status: "Draft", products: [{ plu: "899100100001", namaProduk: "Minuman Teh Original 350ml" }, { plu: "899100100002", namaProduk: "Biskuit Cokelat 120g" }] },
  { id: "DEMO-LIST-002", memoId: "DEMO-LIST-MEMO-002", nomorMemo: "BM-LIST-2026-002", supplierNama: "CV Berkah Jaya Abadi", submittedAt: "2026-10-31T09:15:00.000Z", status: "Approved", products: [{ plu: "899200200001", namaProduk: "Susu UHT Cokelat 1L" }], purchaseNote: "Data listing telah diperiksa Pembelian.", purchaseDecisionAt: "2026-11-01T10:00:00.000Z" },
]

export const seedListingApprovalDummies = () => {
  const existing = readStored()
  const ids = new Set(existing.map((item) => item.id))
  const additions = DUMMY_LISTINGS.filter((item) => !ids.has(item.id))
  if (additions.length) localStorage.setItem(KEY, JSON.stringify([...additions, ...existing]))
  return readListingApprovals()
}

export const decideListingApproval = (id: string, role: "Pembelian" | "EDP", approved: boolean, note: string, products?: ListingApprovalProduct[]) => {
  const items = readListingApprovals()
  const next = items.map((item) => {
    if (item.id !== id) return item
    if (role === "Pembelian" && item.status === "Draft") return { ...item, status: approved ? "Approved" as const : "Rejected" as const, purchaseNote: note, purchaseDecisionAt: new Date().toISOString() }
    if (role === "EDP" && item.status === "Approved") return { ...item, status: approved ? "Released" as const : "Rejected" as const, products: products || item.products, edpNote: note, edpDecisionAt: new Date().toISOString() }
    return item
  })
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
