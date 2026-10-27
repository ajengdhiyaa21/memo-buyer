import type { Memo } from "../pages/MemoReportGrouped"

export type MemoStatus = "Draft" | "Approved" | "Rejected"
export type EditedField = { key: string; label: string; before: string; after: string }
export type EditHistory = { at: string; by: string; role: string; note?: string; fields: EditedField[] }
export type WorkflowMemo = Memo & { status: MemoStatus; parentId?: string; version: number; editedFields: EditedField[]; editHistory: EditHistory[]; approvedAt?: string; approvedBy?: string; rejectedAt?: string; rejectedBy?: string; rejectReason?: string; supplierId?: string; picName?: string; picPhone?: string }

const KEY = "supplier-memo-history"
export const text = (value: unknown) => Array.isArray(value) ? value.join(", ") : value == null ? "" : String(value)

export function readMemos(): WorkflowMemo[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]")
    if (!Array.isArray(raw)) return []
    return raw.map((memo) => ({ ...memo, status: memo.status || "Draft", version: Number(memo.version || 1), editedFields: memo.editedFields || [], editHistory: memo.editHistory || [] }))
  } catch { return [] }
}
export function writeMemos(memos: WorkflowMemo[]) { localStorage.setItem(KEY, JSON.stringify(memos)) }
export function updateMemo(id: string, updater: (memo: WorkflowMemo) => WorkflowMemo) { const next = readMemos().map((memo) => memo.id === id ? updater(memo) : memo); writeMemos(next); return next.find((memo) => memo.id === id) }
export function createEditedMemo(parent: WorkflowMemo, values: Partial<WorkflowMemo>, history: EditHistory) {
  const existing = readMemos()
  const version = Math.max(parent.version, ...existing.filter((m) => m.parentId === parent.id).map((m) => m.version)) + 1
  const edited: WorkflowMemo = { ...parent, ...values, id: `${parent.id}-v${version}`, parentId: parent.id, version, status: "Draft", editedFields: history.fields, editHistory: [...parent.editHistory, history] }
  writeMemos([...existing, edited])
  return edited
}
export const getCurrentRole = () => localStorage.getItem("bm-role") || ""
export const fieldValue = (memo: Memo, key: string) => key === "outlets" ? memo.outlets.join(", ") : text((memo as any)[key] ?? (memo.data as any)?.[key])



export function seedDemoMemos() {
  const now = new Date().toISOString().slice(0, 10)
  const identity = { cardId: "MK-SPV-00456", supplier: { id: "SUP-004", name: "PT. Wings Surya", type: "vendor" }, principal: null, picName: "Siti Aminah", picPhone: "0813-2211-9988", noRekening: "5500098765 - Bank Mandiri" }
  const base = (id: string, no: string, supplier: string, kind: string, summary: string, data: Record<string, unknown>, status: MemoStatus = "Draft"): WorkflowMemo => ({ id, nomorMemo: no, tanggalSubmit: "2026-10-20", supplierNama: supplier, outlets: ["MK1", "MK5", "MK8"], jenisMemo: kind, ringkasan: summary, detail: [{ label: "Produk / Media", value: summary }, { label: "Total", value: "Rp 11.100.000" }], data, periodeAwal: "2026-11-01", periodeAkhir: "2026-11-30", status, version: 1, editedFields: [], editHistory: [], approvedAt: status === "Approved" ? now : undefined, approvedBy: status === "Approved" ? "Buyer Pembelian" : undefined, rejectedAt: status === "Rejected" ? now : undefined, rejectedBy: status === "Rejected" ? "Buyer Pembelian" : undefined, rejectReason: status === "Rejected" ? "Periode program belum sesuai kalender promosi." : undefined })
  const product = (plu: string, name: string) => ({ plu, nama: name, satuan: "PCS", supplierId: "SUP-004", subKategori: "Mie Instan", gramasi: "85 gram", hargaBeli: 2500, konversi: "1 Dus = 40 pcs", jatuhTempo: "30 hari", barcodeBarang: [{ barcode: "8998866200012", konversi: "CTN" }, { barcode: "8998866200013", konversi: "PCS" }] })
  const common = { identity, outlets: ["MK1", "MK5", "MK8"], catatan: "Data dummy untuk simulasi alur approval.", signature: "SIMULATED-SIGNATURE" }
  const programInfo = { namaProgram: "Promo Akhir Tahun Wings", tipe: ["on-faktur", "off-faktur"], ppnAktif: true, ppnRate: "PPN 11%", pphAktif: true, pphRate: "PPh Pasal 23 - 2%", kwitansiAtasNama: "PT. Manna Kampus", redaksi: "Program promosi produk periode November 2026", caraPembayaran: "Transfer", periodeAwal: "2026-11-01", periodeAkhir: "2026-11-30" }
  const makeData = (extra: Record<string, unknown>) => ({ ...common, jenisMemo: extra.jenisMemo, ...extra })
  const rows: WorkflowMemo[] = [
    base("DUMMY-UPDATE", "BM-DUMMY-001", "PT. Wings Surya", "update-informasi", "Update Produk dan Vendor", makeData({ jenisMemo: "update-informasi", updateInfo: { jenisUpdate: "produk", selectedProducts: [product("PRD-001", "Indomie Goreng 85g")], produkFields: ["hargaBeli", "gramasi", "barcodeBarang"], produkValues: { "PRD-001::hargaBeli": "2800", "PRD-001::gramasi": "85 gram" }, produkUnits: {}, produkKonversi: {}, vendorFields: ["email", "npwp"], vendorValues: { email: "vendor@wings.co.id", npwp: "01.234.567.8-999.000" }, vendorBank: "Bank Mandiri", vendorRekening: "5500098765" } })),
    base("DUMMY-PROGRAM", "BM-DUMMY-002", "PT. Indofood CBP Sukses Makmur", "memo-program", "Program On Faktur & Off Faktur", makeData({ jenisMemo: "memo-program", programInfo, onProducts: [product("PRD-001", "Indomie Goreng 85g")], onRows: { "PRD-001": { diskonMode: "persen", diskonBasis: "cbp", diskonValue: 3, bandedAktif: true, banded: "Beli 2 Gratis 1", strataMinQty: 12, strataSatuan: "PCS", alokasiQty: 100, freeProdukAktif: true, freeProdukKeterangan: "Bonus produk", budgetAktif: true, budgetNominal: 2500000, keterangan: "Promo utama" } }, offProducts: [product("PRD-002", "Indomie Kuah 70g")], offRows: { "PRD-002": { diskonMode: "rp", diskonBasis: "rbp", diskonValue: 1000, kuponVoucherAktif: true, kuponVoucher: "Voucher belanja", freeProdukAktif: false, freeProdukKeterangan: "", offAlokasiQty: 80, budgetAktif: false, budgetNominal: 0, keterangan: "Off faktur" } }, budgetLink: { keterangan: "Support promo akhir tahun", nominal: 2500000 } }), "Approved"),
    base("DUMMY-SEWA", "BM-DUMMY-003", "CV. Sumber Rejeki", "pendapatan-lain", "Sewa Wing Gondola", makeData({ jenisMemo: "pendapatan-lain", pendapatan: { jenis: "sewa-visibility", namaProgram: "Sewa Wing Gondola", sewaJenis: "Wing Gondola", sewaProducts: [product("PRD-003", "Pop Mie Cup 75g")], sewaProductRows: { "PRD-003": { qty: 4, satuan: "PCS" } }, sewaNominal: 7500000, sewaHargaPajak: "include PPN", sewaCaraPembayaran: "Transfer", sewaDurasiBulan: 1, sewaPeriodeAwal: "2026-11-01", sewaPeriodeAkhir: "2026-11-30", sewaPpnAktif: true, sewaPpnRate: "PPN 11%", sewaPphAktif: false, sewaPphRate: "", sewaKeterangan: "Display produk akhir tahun" } }), "Approved"),
    base("DUMMY-REWARD", "BM-DUMMY-004", "PT. Nestle Indonesia", "pendapatan-lain", "Reward Target Penjualan", makeData({ jenisMemo: "pendapatan-lain", pendapatan: { jenis: "reward-insentif", namaProgram: "Reward Target Desember", rewardJenis: "Reward", rewardBentuk: "Uang", rewardPembayaran: "Transfer", rewardBank: "BCA", rewardNoRekening: "2200011234", rewardNominal: 5000000, target: "500 karton", rewardMode: "persen", rewardValue: 2, rewardPeriodeAwal: "2026-12-01", rewardPeriodeAkhir: "2026-12-31", rewardPpnAktif: false, rewardPphAktif: true, rewardPphRate: "PPh Pasal 23 - 2%" } })),
    base("DUMMY-PROMO", "BM-DUMMY-005", "PT. Unilever Indonesia Tbk", "pendapatan-lain", "Promosi Digital Signage", makeData({ jenisMemo: "pendapatan-lain", pendapatan: { jenis: "promosi", mediaTipe: "TVC/Digital Signage", mediaKeterangan: "Digital signage 30 hari", promosiNominal: 9000000, promosiHargaPajak: "exclude", promosiCaraPembayaran: "Potong Tagihan", promosiPeriodeAwal: "2026-11-01", promosiDurasiBulan: 1, promosiPpnAktif: true, promosiPpnRate: "PPN 11%", promosiPphAktif: true, promosiPphRate: "PPh Pasal 23 - 2%" } }), "Rejected"),
    base("DUMMY-LISTING", "BM-DUMMY-006", "PT. Mitra Distribusi Nusantara", "pendapatan-lain", "Listing Produk Baru", makeData({ jenisMemo: "pendapatan-lain", pendapatan: { jenis: "listing", listingProducts: [{ namaProduk: "Minuman Baru 250ml", barcodePcs: "8991112223334", barcodeKarton: "8991112223000", konversiQty1: 1, konversiSatuan1: "DUS", konversiQty2: 24, konversiSatuan2: "PCS", konversiQty3: 0, konversiSatuan3: "", diskonReguler: 2, hargaPerPcs: 4500, statusPajak: "bkp" }], listingPkp: true, listingReturn: true, listingBiayaLabel: false, listingNominal: 1500000, listingHargaPajak: "include PPN", listingTempoPembayaran: "30", listingCaraPembayaran: "Transfer", listingPpnAktif: true, listingPpnRate: "PPN 11%" } })),
    base("DUMMY-EVENT", "BM-DUMMY-007", "UD. Makmur Jaya", "pendapatan-lain", "Event BLBMS November", makeData({ jenisMemo: "pendapatan-lain", pendapatan: { jenis: "event-blbms", eventJenis: "Belanja Luar Biasa Murah Spektakuler (BLBMS)", eventBentuk: "Media Display Produk", eventMediaJenis: ["End Gondola", "Wing Gondola"], eventMediaDetails: [{ id: "1", mediaJenis: "End Gondola", nama: "End Gondola Snack", area: "Area Food and Drink", pos: "Dekat kasir", nominal: 4000000, hargaPajak: "include PPN", caraPembayaran: "Transfer", tanggalMulai: "2026-11-01", tanggalSelesai: "2026-11-07", durasiBulan: 1 }], eventNominal: 4000000, eventHargaPajak: "include PPN", eventCaraPembayaran: "Transfer", eventPeriodeAwal: "2026-11-01", eventPeriodeAkhir: "2026-11-07", eventPpnAktif: true, eventPpnRate: "PPN 11%", eventPphAktif: true, eventPphRate: "PPh Pasal 23 - 2%" } }), "Approved")
  ]
  const parent = rows[1]; const child: WorkflowMemo = { ...parent, id: "DUMMY-PROGRAM-v2", parentId: parent.id, version: 2, status: "Approved", editedFields: [{ key: "programInfo.namaProgram", label: "Nama Program", before: "Program Akhir Tahun 2026", after: "Program Akhir Tahun Wings Extended" }, { key: "budgetLink.nominal", label: "Nominal Budget", before: "2500000", after: "3000000" }], editHistory: [{ at: new Date().toISOString(), by: "Buyer Pembelian", role: "Pembelian", note: "Penyesuaian budget dan nama program", fields: [{ key: "programInfo.namaProgram", label: "Nama Program", before: "Program Akhir Tahun 2026", after: "Program Akhir Tahun Wings Extended" }, { key: "budgetLink.nominal", label: "Nominal Budget", before: "2500000", after: "3000000" }] }], approvedAt: now, approvedBy: "Buyer Pembelian" }
  writeMemos([...rows, child]); return rows.length + 1
}

