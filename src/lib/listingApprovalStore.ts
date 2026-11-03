export type ListingApprovalStatus = "Draft" | "Approved" | "Released" | "Rejected"
export type ListingApprovalProduct = { plu: string; namaProduk: string; barcodePcs?: string; barcodeKarton?: string; konversiQty1?: number; konversiSatuan1?: string; konversiQty2?: number; konversiSatuan2?: string; konversiQty3?: number; konversiSatuan3?: string; hargaPerPcs?: number; diskonReguler?: number; statusPajak?: string }
export type ListingApproval = {
  id: string
  memoId: string
  nomorMemo: string
  supplierNama: string
  submittedAt: string
  status: ListingApprovalStatus
  products: ListingApprovalProduct[]
  listingDetails?: Record<string, unknown>
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
    const listing = memo.data.pendapatan || {}
    const listingDetails = { listingPkp: listing.listingPkp, listingReturn: listing.listingReturn, listingBiayaLabel: listing.listingBiayaLabel, listingNominal: listing.listingNominal, listingHargaPajak: listing.listingHargaPajak, listingTempoPembayaran: listing.listingTempoPembayaran, listingCaraPembayaran: listing.listingCaraPembayaran, listingPpnAktif: listing.listingPpnAktif, listingPpnRate: listing.listingPpnRate, listingPphAktif: listing.listingPphAktif, listingPphRate: listing.listingPphRate }
    const existing = byMemo.get(memo.id)
    const products = (listing.listingProducts || []).map((product: any) => ({ plu: product.plu || product.barcodePcs || "-", namaProduk: product.namaProduk || "-", barcodePcs: product.barcodePcs || "", barcodeKarton: product.barcodeKarton || "", konversiQty1: product.konversiQty1 || 0, konversiSatuan1: product.konversiSatuan1 || "", konversiQty2: product.konversiQty2 || 0, konversiSatuan2: product.konversiSatuan2 || "", konversiQty3: product.konversiQty3 || 0, konversiSatuan3: product.konversiSatuan3 || "", hargaPerPcs: product.hargaPerPcs || 0, diskonReguler: product.diskonReguler || 0, statusPajak: product.statusPajak || "" }))
    const mergedProducts = products.map((product: ListingApprovalProduct) => ({ ...product, ...(existing?.products.find((saved) => saved.plu === product.plu) || {}) }))
    return existing ? { ...existing, products: mergedProducts, listingDetails } : { id: `LIST-${memo.id}`, memoId: memo.id, nomorMemo: memo.nomorMemo || memo.id, supplierNama: memo.supplierNama || "-", submittedAt: memo.tanggalSubmit || new Date().toISOString(), status: "Draft" as const, products: mergedProducts, listingDetails }
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
