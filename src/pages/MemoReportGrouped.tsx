import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Search,
  TriangleAlert,
} from "lucide-react"
import { useNavigate } from "react-router"
import { renderToStaticMarkup } from "react-dom/server"
import QRCode from "react-qr-code"
import { FilterCard } from "../components/FilterCard"
import "../styles/memo-report.css"
import mannaKampusLogo from "../../logo.png"

export type Memo = {
  id: string
  nomorMemo: string
  tanggalSubmit: string
  supplierNama: string
  outlets: string[]
  jenisMemo: string
  ringkasan: string
  detail: { label: string value: string }[]
  data?: Record<string, unknown>
  statusPembayaran?: string
  periodeAwal?: string
  periodeAkhir?: string
}
type Vendor = { name: string memos: Memo[] }
const API = "http://localhost:3001"
const DEMO_MODE = true
const accountingUnpaidDummy: Memo[] = [
  { id: "DUMMY-SEWA-001", nomorMemo: "MEM-SEWA-001", tanggalSubmit: "2026-10-01", supplierNama: "PT. Nestle Indonesia", outlets: ["MK1", "MK2", "MK8"], jenisMemo: "memo-lain-lain", ringkasan: "Sewa Gondola Promo Akhir Tahun", detail: [], statusPembayaran: "belum-bayar", periodeAwal: "2026-10-01", periodeAkhir: "2026-10-25", data: { pendapatan: { jenis: "sewa", statusPembayaran: "belum-bayar" } } },
  { id: "DUMMY-SEWA-002", nomorMemo: "MEM-SEWA-002", tanggalSubmit: "2026-10-03", supplierNama: "PT. Unilever Indonesia Tbk", outlets: ["MK5", "MK6", "MINI1"], jenisMemo: "memo-lain-lain", ringkasan: "Sewa Area Display Produk", detail: [], statusPembayaran: "belum-bayar", periodeAwal: "2026-10-10", periodeAkhir: "2026-11-05", data: { pendapatan: { jenis: "sewa", statusPembayaran: "belum-bayar" } } },
  { id: "DUMMY-SEWA-003", nomorMemo: "MEM-SEWA-003", tanggalSubmit: "2026-10-05", supplierNama: "PT. Wings Surya", outlets: ["MK3", "MK8", "MINI4"], jenisMemo: "memo-lain-lain", ringkasan: "Sewa Space Promosi Desember", detail: [], statusPembayaran: "belum-bayar", periodeAwal: "2026-11-15", periodeAkhir: "2026-12-15", data: { pendapatan: { jenis: "sewa", statusPembayaran: "belum-bayar" } } },
]
const labels: Record<string, string> = {
  "memo-lain-lain": "Memo Lain-lain",
  "memo-program": "Memo Program",
  "pendapatan-lain": "Memo Lain-lain",
  "pendapatan-lain-lain": "Memo Lain-lain",
  "Pendapatan Lain-lain": "Memo Lain-lain",
  "Pendapatan Lain Lain": "Memo Lain-lain",
  "pendapatan lain-lain": "Memo Lain-lain",
  "pendapatan lain lain": "Memo Lain-lain",
  "Pendapatan Lain-lain": "Memo Lain-lain",
  "Pendapatan Lain Lain": "Memo Lain-lain",
  "pendapatan lain-lain": "Memo Lain-lain",
  "pendapatan lain lain": "Memo Lain-lain",
  "update-informasi": "Update Informasi",
}
const memoTypeOptions = [
  { key: "memo-program", label: "Memo Program" },
  { key: "memo-lain-lain", label: "Memo Lain-lain" },
  { key: "update-informasi", label: "Update Informasi" },
]
export const normalizeMemoType = (value: string) => {
  const normalized = value.toLowerCase().replace(/\s+/g, "-")
  return normalized.includes("lain") ? "memo-lain-lain" : normalized
}
const DEMO_SIGNATURE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="90" viewBox="0 0 240 90"><path d="M8 62c18-35 18-35 23-3 4 25 10-42 18-30 8 11-4 41 8 34 12-7 14-31 21-25 8 7-4 30 8 25 13-5 18-29 25-23 7 6 0 24 13 22 15-2 19-23 26-18 8 5 0 20 15 18 14-2 18-18 27-13 7 4 3 15 14 11 8-3 10-11 19-8 8 3 9 7 19 3" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  )
const fallback: Memo[] = [
  {
    id: "SIM-001",
    nomorMemo: "MEM-SIM-001",
    tanggalSubmit: "2026-09-10",
    supplierNama: "PT. Indofood CBP Sukses Makmur",
    outlets: ["MK1", "MK2", "MK3"],
    jenisMemo: "memo-program",
    ringkasan: "Program Display Produk Akhir Tahun",
    detail: [
      { label: "Kategori Media", value: "DISPLAY" },
      { label: "Jenis Media", value: "N-GONDOLA" },
      { label: "Qty", value: "3" },
      { label: "Total", value: "Rp 3.000.000,00" },
    ],
    data: {
      identity: {
        supplier: { id: "PRI-001", name: "PT. Indofood CBP Sukses Makmur" },
        picName: "Rahmat Hidayat",
      },
      outlets: ["MK1", "MK2", "MK3"],
      jenisMemo: "memo-program",
      programInfo: {
        namaProgram: "Program Display Produk Akhir Tahun",
        tipe: ["on-faktur"],
        ppnAktif: true,
        ppnRate: "PPN 11%",
        pphAktif: true,
        pphRate: "PPh Pasal 23 - 2%",
        redaksi: "Program display produk akhir tahun",
        periodeAwal: "2026-10-01",
        periodeAkhir: "2026-10-31",
      },
      onProducts: [
        { plu: "100001", namaProduk: "Mie Instan", kategori: "Makanan" },
      ],
      onRows: {
        "100001": { qty: 3, nominal: 3000000, keterangan: "End Gondola" },
      },
      offProducts: [],
      offRows: {},
      catatan: "Data simulasi mengikuti field Memo Program pada form supplier.",
    },
    periodeAwal: "2026-10-01",
    periodeAkhir: "2026-10-31",
  },
  {
    id: "SIM-004",
    nomorMemo: "MEM-SIM-004",
    tanggalSubmit: "2026-09-25",
    supplierNama: "PT. Indofood CBP Sukses Makmur",
    outlets: ["MK1", "MK3"],
    jenisMemo: "pendapatan-lain",
    ringkasan: "Event BLBMS Produk Indofood",
    detail: [
      { label: "Kategori Media", value: "Media Display Produk" },
      { label: "Jenis Media", value: "End Gondola" },
      { label: "Total", value: "Rp 10.000.000,00" },
    ],
    data: {
      signature: DEMO_SIGNATURE,
      identity: {
        supplier: { id: "PRI-001", name: "PT. Indofood CBP Sukses Makmur" },
        picName: "Rahmat Hidayat",
      },
      outlets: ["MK1", "MK3"],
      jenisMemo: "pendapatan-lain",
      pendapatan: {
        jenis: "event-blbms",
        eventJenis: "Belanja Luar Biasa Murah Spektakuler (BLBMS)",
        eventBentuk: "Media Display Produk",
        eventPeriodeAwal: "2026-10-01",
        eventPeriodeAkhir: "2026-10-25",
        eventMediaJenis: ["End Gondola"],
        eventMediaDetails: [
          {
            id: "DEMO-MEDIA-004",
            mediaJenis: "End Gondola",
            nama: "End Gondola Produk Indofood",
            area: "Area Food and Drink",
            pos: "MK1, MK3",
            nominal: 10000000,
            hargaPajak: "exclude",
            caraPembayaran: "Transfer",
            tanggalMulai: "2026-10-01",
            tanggalSelesai: "2026-10-25",
            durasiBulan: 1,
          },
        ],
        eventNominal: 10000000,
        eventHargaPajak: "exclude",
        eventCaraPembayaran: "Transfer",
        eventDurasiBulan: 1,
        eventKeterangan: "Event BLBMS produk Indofood",
        eventPpnAktif: true,
        eventPpnRate: "PPN 11%",
        eventPphAktif: true,
        eventPphRate: "PPh Pasal 23 - 2%",
      },
      catatan: "Data simulasi mengikuti field Event pada form supplier.",
    },
    periodeAwal: "2026-10-01",
    periodeAkhir: "2026-10-25",
  },
  {
    id: "SIM-005",
    nomorMemo: "MEM-SIM-005",
    tanggalSubmit: "2026-09-28",
    supplierNama: "PT. Wings Surya",
    outlets: ["MK5", "MK6", "MINI1"],
    jenisMemo: "pendapatan-lain",
    ringkasan: "Listing Produk Wings",
    detail: [
      { label: "Kategori Media", value: "Listing" },
      { label: "Jenis Media", value: "Listing Produk" },
      { label: "Total", value: "Rp 2.400.000" },
    ],
    data: {
      identity: {
        supplier: { id: "SUP-004", name: "PT. Wings Surya" },
        picName: "Siti Aminah",
      },
      outlets: ["MK5", "MK6", "MINI1"],
      jenisMemo: "pendapatan-lain",
      pendapatan: {
        jenis: "listing",
        namaProgram: "Listing Produk Wings",
        listingProducts: [
          {
            namaProduk: "So Klin Pewangi 770ml",
            barcodePcs: "8998866100012",
            barcodeKarton: "8998866100012-CTN",
            konversiQty1: 12,
            konversiSatuan1: "PCS / BOX",
            konversiQty2: 4,
            konversiSatuan2: "BOX / KARTON",
            konversiQty3: 0,
            konversiSatuan3: "",
            hargaPerPcs: 18000,
            diskonReguler: 5,
          },
          {
            namaProduk: "Mie Sedap Goreng 90g",
            barcodePcs: "8998866200023",
            barcodeKarton: "8998866200023-CTN",
            konversiQty1: 40,
            konversiSatuan1: "PCS / BOX",
            konversiQty2: 6,
            konversiSatuan2: "BOX / KARTON",
            konversiQty3: 0,
            konversiSatuan3: "",
            hargaPerPcs: 3500,
            diskonReguler: 3,
          },
        ],
        listingPkp: true,
        listingReturn: true,
        listingBiayaLabel: false,
        listingNominal: 2400000,
        listingHargaPajak: "exclude",
        listingTempoPembayaran: "30",
        listingCaraPembayaran: "Transfer",
        listingPpnAktif: false,
        listingPphAktif: false,
        listingPeriodeAkhir: "2026-12-31",
      },
    },
    periodeAwal: "2026-10-01",
    periodeAkhir: "2026-12-31",
  },
  {
    id: "SIM-006",
    nomorMemo: "MEM-SIM-006",
    tanggalSubmit: "2026-10-01",
    supplierNama: "PT. Indofood CBP Sukses Makmur",
    outlets: ["MK1", "MK2", "MK3", "MK8"],
    jenisMemo: "memo-program",
    ringkasan: "Program Diskon Mie Instan Oktober",
    detail: [
      { label: "Kategori Media", value: "Potongan Produk" },
      { label: "Jenis Media", value: "On Faktur dan Off Faktur" },
      { label: "Total", value: "Rp 18.750.000" },
    ],
    data: {
      programInfo: {
        namaProgram: "Program Diskon Mie Instan Oktober",
        tipe: ["on-faktur", "off-faktur"],
        periodeAwal: "2026-10-10",
        periodeAkhir: "2026-11-10",
      },
    },
    periodeAwal: "2026-10-10",
    periodeAkhir: "2026-11-10",
  },
  {
    id: "SIM-007",
    nomorMemo: "MEM-SIM-007",
    tanggalSubmit: "2026-10-03",
    supplierNama: "PT. Unilever Indonesia Tbk",
    outlets: ["MK5", "MK6"],
    jenisMemo: "pendapatan-lain",
    ringkasan: "Perpanjangan Wing Gondola",
    detail: [
      { label: "Kategori Media", value: "Media Display Produk" },
      { label: "Jenis Media", value: "Wing Gondola" },
      { label: "Total", value: "Rp 8.500.000" },
    ],
    data: {
      pendapatan: {
        jenis: "sewa-visibility",
        namaProgram: "Sewa Wing Gondola Promo Minuman",
        sewaPeriodeAkhir: "2026-10-20",
        mediaTipe: "Wing Gondola",
      },
    },
    periodeAwal: "2026-10-01",
    periodeAkhir: "2026-10-20",
  },
  {
    id: "SIM-008",
    nomorMemo: "MEM-SIM-008",
    tanggalSubmit: "2026-10-04",
    supplierNama: "PT. Mitra Distribusi Nusantara",
    outlets: ["MK1", "MK3", "MK8"],
    jenisMemo: "pendapatan-lain",
    ringkasan: "Event BLBMS Produk Minuman",
    detail: [
      { label: "Kategori Media", value: "Media Display Produk" },
      { label: "Jenis Media", value: "End Gondola" },
      { label: "Total", value: "Rp 11.500.000" },
    ],
    data: {
      pendapatan: {
        jenis: "event-blbms",
        eventJenis: "Belanja Luar Biasa Murah Spektakuler (BLBMS)",
        eventBentuk: "Media Display Produk",
        eventPeriodeAwal: "2026-11-01",
        eventPeriodeAkhir: "2026-11-30",
        eventMediaJenis: ["End Gondola"],
      },
    },
    periodeAwal: "2026-11-01",
    periodeAkhir: "2026-11-30",
  },
  {
    id: "SIM-009",
    nomorMemo: "MEM-SIM-009",
    tanggalSubmit: "2026-10-05",
    supplierNama: "CV. Sumber Rejeki",
    outlets: ["MK2"],
    jenisMemo: "pendapatan-lain",
    ringkasan: "Event Display Produk Teh",
    detail: [
      { label: "Kategori Media", value: "Media Display Produk" },
      { label: "Jenis Media", value: "End Gondola" },
      { label: "Total", value: "Rp 4.500.000" },
    ],
    data: {
      pendapatan: {
        jenis: "event-blbms",
        eventJenis: "Regular Event",
        eventBentuk: "Media Display Produk",
        eventPeriodeAwal: "2026-12-01",
        eventPeriodeAkhir: "2026-12-30",
        eventMediaJenis: ["End Gondola"],
      },
    },
    periodeAwal: "2026-12-01",
    periodeAkhir: "2026-12-30",
  },
]
const demoSuppliers = [
  "PT. Indofood CBP Sukses Makmur",
  "PT. Unilever Indonesia Tbk",
  "PT. Mitra Distribusi Nusantara",
  "PT. Wings Surya",
  "CV. Sumber Rejeki",
  "PT. Mayora Indah Tbk",
  "PT. Nestle Indonesia",
  "PT. Sari Roti Indonesia",
]
const demoEvents = [
  {
    name: "Belanja Luar Biasa Murah Spektakuler (BLBMS)",
    media: ["End Gondola", "Wing Gondola"],
  },
  { name: "Regular Event", media: ["Fasilitas Display", "Troli Belanja"] },
  { name: "Pra Ramadhan & Lebaran", media: ["Clip Strip", "Shelving"] },
  {
    name: "Anniversary",
    media: ["Fasilitas Display", "Troli Belanja"],
  },
  { name: "Tahun Ajaran Baru", media: ["End Gondola", "Fasilitas Display"] },
]
const demoSupplierData = (supplier: string, index: number) => ({
  supplier: {
    id: `DEMO-${String(index + 1).padStart(3, "0")}`,
    name: supplier,
  },
  picName: "PIC Supplier",
})
const demoOutlets = [
  "MK1",
  "MK2",
  "MK3",
  "MK5",
  "MK6",
  "MK7",
  "MK8",
  "MINI1",
  "MINI2",
  "MINI3",
]
const extraFallback: Memo[] = Array.from({ length: 24 }, (_, index) => {
  const event = demoEvents[index % demoEvents.length]
  const supplier = demoSuppliers[index % demoSuppliers.length]
  const month = String((index % 4) + 9).padStart(2, "0")
  const startDay = String((index % 4) + 1).padStart(2, "0")
  const endDay = String(
    Math.min(Number(startDay) + 20 + (index % 7), 28),
  ).padStart(2, "0")
  const start = `2026-${month}-${startDay}`
  const end = `2026-${month}-${endDay}`
  const outletCount = (index % 4) + 2
  const outlets = Array.from(
    { length: outletCount },
    (_, outletIndex) => demoOutlets[(index + outletIndex) % demoOutlets.length],
  )
  return {
    id: `SIM-${String(index + 10).padStart(3, "0")}`,
    nomorMemo: `MEM-SIM-${String(index + 10).padStart(3, "0")}`,
    tanggalSubmit: `2026-${month}-${String(Math.min((index % 9) + 1, 28)).padStart(2, "0")}`,
    supplierNama: supplier,
    outlets,
    jenisMemo: "pendapatan-lain",
    ringkasan: `${event.name} - ${event.media[index % event.media.length]}`,
    detail: [
      { label: "Kategori Media", value: "Media Display Produk" },
      { label: "Jenis Media", value: event.media[index % event.media.length] },
      { label: "Qty", value: String((index % 5) + 1) },
      {
        label: "Total",
        value: `Rp ${(4500000 + index * 625000).toLocaleString("id-ID")}`,
      },
    ],
    data: {
      identity: demoSupplierData(supplier, index),
      outlets,
      jenisMemo: "pendapatan-lain",
      pendapatan: {
        jenis: "event-blbms",
        eventJenis: event.name,
        eventBentuk: "Media Display Produk",
        eventPeriodeAwal: start,
        eventPeriodeAkhir: end,
        eventMediaJenis: [event.media[index % event.media.length]],
        eventMediaDetails: [
          {
            id: `DEMO-MEDIA-${index + 1}`,
            mediaJenis: event.media[index % event.media.length],
            nama: `${event.media[index % event.media.length]} - ${supplier}`,
            area: "Area Food and Drink",
            pos: outlets[0],
            nominal: 4500000 + index * 625000,
            hargaPajak: "exclude",
            caraPembayaran: "Transfer",
            tanggalMulai: start,
            tanggalSelesai: end,
            durasiBulan: 1,
          },
        ],
        eventNominal: 4500000 + index * 625000,
        eventHargaPajak: "exclude",
        eventCaraPembayaran: "Transfer",
        eventDurasiBulan: 1,
        eventKeterangan: "Pengajuan media event",
        eventPpnAktif: true,
        eventPpnRate: "PPN 11%",
        eventPphAktif: true,
        eventPphRate: "PPh Pasal 23 - 2%",
      },
      catatan:
        "Data simulasi mengikuti field pengajuan Event pada form supplier.",
    },
    periodeAwal: start,
    periodeAkhir: end,
  }
})
export const demoRows = [...fallback, ...extraFallback]
const fmt = (v?: string) => (v ? v.split("-").reverse().join("/") : "-")
const memoIncome = (memo: Memo) =>
  (memo.data?.pendapatan || {}) as Record<string, any>
export const memoPaymentStatus = (memo: Memo) =>
  String(
    memo.statusPembayaran ||
      (memo.data as any)?.statusPembayaran ||
      memoIncome(memo).statusPembayaran ||
      "",
  )
    .trim()
    .toLowerCase()
export const isUnpaidMemo = (memo: Memo) =>
  ["belum-bayar", "belum dibayar", "unpaid", "belum bayar"].includes(
    memoPaymentStatus(memo),
  )
const memoTotal = (memo: Memo) =>
  memo.detail.find((field) => field.label.toLowerCase() === "total")?.value ||
  "-"
const endDate = (memo: Memo) =>
  memo.periodeAkhir ||
  memoIncome(memo).eventPeriodeAkhir ||
  memoIncome(memo).sewaPeriodeAkhir ||
  memoIncome(memo).promosiPeriodeAkhir ||
  memoIncome(memo).listingPeriodeAkhir ||
  ""
const daysUntil = (date?: string) =>
  date
    ? Math.ceil(
        (new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000,
      )
    : 9999
const isLease = (memo: Memo) =>
  normalizeMemoType(memo.jenisMemo) === "memo-lain-lain" &&
  !["listing", "reward-insentif"].includes(String(memoIncome(memo).jenis || ""))
const isEvent = (memo: Memo) => memoIncome(memo).jenis === "event-blbms"
const eventName = (memo: Memo) =>
  String(memoIncome(memo).eventJenis || memo.ringkasan || "Event lainnya")
const mediaNames = (memo: Memo) => {
  const income = memoIncome(memo)
  const direct = Array.isArray(income.eventMediaJenis)
    ? income.eventMediaJenis
    : []
  const detail = Array.isArray(income.eventMediaDetails)
    ? income.eventMediaDetails
        .map((row: any) => row.mediaJenis || row.nama)
        .filter(Boolean)
    : []
  return Array.from(
    new Set(
      [...direct, ...detail, income.mediaTipe].filter(Boolean).map(String),
    ),
  )
}
const aliases: Record<string, string> = {
  programInfo: "Informasi Program",
  tipe: "Tipe Program",
  jenis: "Jenis Program",
  namaProgram: "Nama Program",
  namaProduk: "Nama Produk",
  produk: "Produk",
  products: "Produk",
  onProducts: "On Faktur — Produk",
  offProducts: "Off Faktur — Produk",
  onRows: "On Faktur — Detail",
  offRows: "Off Faktur — Detail",
  eventJenis: "Jenis Event",
  eventBentuk: "Kategori Media",
  eventMediaJenis: "Jenis Media",
  eventMediaDetails: "Produk / Rincian Input",
  eventPeriodeAwal: "Periode Mulai",
  eventPeriodeAkhir: "Periode Selesai",
  sewaPeriodeAwal: "Periode Mulai",
  sewaPeriodeAkhir: "Periode Selesai",
  promosiPeriodeAwal: "Periode Mulai",
  promosiPeriodeAkhir: "Periode Selesai",
  eventNominal: "Nilai Sewa",
  sewaNominal: "Nilai Sewa",
  promosiNominal: "Nilai Sewa",
  eventCaraPembayaran: "Cara Pembayaran",
}
const valueLabels: Record<string, string> = {
  "memo-program": "Memo Program",
  "pendapatan-lain": "Memo Lain-lain",
  "pendapatan-lain-lain": "Memo Lain-lain",
  "update-informasi": "Update Informasi",
  "event-blbms": "Event",
  "reward-insentif": "Reward Insentif",
  listing: "Listing",
  "sewa-visibility": "Sewa / Visibility",
  promosi: "Promosi",
  "on-faktur": "On Faktur",
  "off-faktur": "Off Faktur",
}
const labelOf = (key: string) =>
  key === "pendapatan"
    ? "Program"
    : aliases[key] ||
      key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase())
const hiddenDetailKeys = new Set([
  "signature",
  "suppliersignature",
  "supplier_signature",
])
const flatten = (value: unknown, path = ""): Array<{
  label: string
  value: string
}> => {
  if (value === null || value === undefined || value === "") return []
  const leafKey = path.split("/").pop()?.trim().toLowerCase() || ""
  if (hiddenDetailKeys.has(leafKey)) return []
  if (Array.isArray(value))
    return value.flatMap((item, i) => flatten(item, `${path}[${i + 1}]`))
  if (typeof value === "object")
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, item]) => flatten(item, path ? `${path} / ${key}` : key),
    )
  const text = String(value)
  if (/^data:image\//i.test(text)) return []
  return [{ label: path, value: text }]
}
const grouped = (fields: Array<{ label: string value: string }>) =>
  Object.entries(
    fields.reduce<Record<string, Array<{ label: string value: string }>>>(
      (acc, field) => {
        const parts = field.label.split(" / ")
        const group = parts.length > 1 ? parts[0] : "detail"
        const label = parts[parts.length - 1]
        ;(acc[group] ||= []).push({ label, value: field.value })
        return acc
      },
      {},
    ),
  )
const prettyLabel = (raw: string) => {
  const parts = raw.split(" / ")
  const leaf = parts.pop() || raw
  const match = leaf.match(/\[(\d+)\]/)
  const key = leaf.replace(/\[\d+\]/, "")
  const scope = parts
    .filter(Boolean)
    .map((part) => part.replace(/\[(\d+)\]/, (_, n) => ` #${n}`))
    .join(" — ")
  return `${scope ? `${labelOf(scope)} — ` : ""}${labelOf(key)}${
    match ? ` #${match[1]}` : ""
  }`
}
const textValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return ""
  if (typeof value === "string") return value
  if (Array.isArray(value))
    return value
      .map((item) => textValue(item))
      .filter(Boolean)
      .join(", ")
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${labelOf(key)}: ${textValue(item)}`)
      .join(" | ")
  }
  return String(value)
}
const prettyValue = (value: unknown) =>
  textValue(value)
    .split(", ")
    .map((part) => valueLabels[part.trim()] || part)
    .join(", ")
    .replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, "$3/$2/$1")
    .replace(/\s+End Periode\s*:/gi, "\nEnd Periode:")
    .replace(/,\s+/g, "\n• ")
const excelEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
const excelCell = (value: string) =>
  excelEscape(prettyValue(value)).replace(/\n/g, "<br>")
function exportMemoExcel(memo: Memo) {
  const fields = [...memo.detail, ...flatten(memo.data || {})]
  const rows = fields
    .map((field, index) => {
      const parts = field.label.split(" / ")
      const group = parts.length > 1 ? labelOf(parts[0]) : "Ringkasan Memo"
      return `<tr><td class="num">${index + 1}</td><td class="group">${excelEscape(group)}</td><td class="field">${excelEscape(prettyLabel(field.label))}</td><td class="value">${excelCell(field.value)}</td></tr>`
    })
    .join("")
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#172033;margin:24px;font-size:10pt}h1{font-size:18pt;margin:0 0 5px;color:#0f172a}p{margin:3px 0 14px;color:#64748b;font-size:9pt}.meta{border-collapse:collapse;width:100%;margin:0 0 18px;table-layout:fixed}.meta td{border:1px solid #dbe2ea;padding:8px;vertical-align:top;width:25%}.meta b{display:block;color:#64748b;text-transform:uppercase;font-size:8pt;margin-bottom:4px}.meta span{font-weight:bold;font-size:9pt;word-break:break-word}.detail{border-collapse:collapse;width:100%;table-layout:fixed;font-size:9pt}.detail .num-col{width:6%}.detail .group-col{width:22%}.detail .field-col{width:27%}.detail .value-col{width:45%}.detail th{background:#172033;color:#fff;text-align:left;padding:8px;border:1px solid #172033;font-size:8.5pt}.detail td{border:1px solid #cbd5e1;padding:8px;vertical-align:top;white-space:normal;overflow-wrap:anywhere;line-height:1.45}.detail .num{text-align:center;color:#64748b}.detail .group{font-weight:bold;color:#9a5b00;background:#fff8e7}.detail .field{font-weight:600;color:#334155}.detail .value{mso-data-placement:same-cell;word-break:break-word}.note{margin-top:12px;color:#64748b;font-size:8pt}</style></head><body><h1>Detail Input Supplier — ${excelEscape(memo.nomorMemo)}</h1><p>${excelEscape(memo.supplierNama)} · ${excelEscape(labels[memo.jenisMemo] || memo.jenisMemo)}</p><table class="meta"><tr><td><b>Supplier</b><span>${excelEscape(memo.supplierNama)}</span></td><td><b>Jenis Memo</b><span>${excelEscape(labels[memo.jenisMemo] || memo.jenisMemo)}</span></td><td><b>Periode</b><span>${excelEscape(fmt(memo.periodeAwal) + " s/d " + fmt(memo.periodeAkhir))}</span></td><td><b>Outlet</b><span>${excelEscape(memo.outlets.join(", "))}</span></td></tr></table><table class="detail"><colgroup><col class="num-col"><col class="group-col"><col class="field-col"><col class="value-col"></colgroup><thead><tr><th>No</th><th>Kelompok Data</th><th>Field Input</th><th>Nilai</th></tr></thead><tbody>${rows}</tbody></table><p class="note">File ini mengikuti seluruh data input supplier yang tersimpan pada memo.</p></body></html>`
  const url = URL.createObjectURL(
    new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }),
  )
  const link = document.createElement("a")
  link.href = url
  link.download = `${memo.nomorMemo}-detail.xls`
  link.click()
  URL.revokeObjectURL(url)
}
function openLocalMemoPrintHtml(memo: Memo) {
  const fields = grouped([...memo.detail, ...flatten(memo.data || {})])
  const credential = [
    "KREDENSIAL KEASLIAN DOKUMEN",
    memo.nomorMemo,
    memo.supplierNama,
    memo.periodeAwal || "-",
    memo.periodeAkhir || "-",
  ].join(" | ")
  const qrMarkup = renderToStaticMarkup(
    <QRCode value={credential} size={84} level="M" />,
  )
  const memoData = (memo.data || {}) as Record<string, any>
  const signatureCandidates = [
    memoData.signature,
    memoData.supplierSignature,
    memoData.identity?.signature,
    memoData.pendapatan?.signature,
    (memo as Memo & { signature?: string }).signature,
  ]
  const signature =
    signatureCandidates.find(
      (value) => typeof value === "string" && value.startsWith("data:image/"),
    ) as string | undefined || (memo.id === "SIM-004" ? DEMO_SIGNATURE : "")
  const programName = String(
    memoData.programInfo?.namaProgram ||
      memoData.pendapatan?.namaProgram ||
      memoData.pendapatan?.eventJenis ||
      memo.ringkasan ||
      "-",
  )
  const picName = String(memoData.identity?.picName || "Nama & Tanda Tangan")
  const sections = fields
    .map(
      ([key, items]) =>
        '<section class="detail-section"><div class="section-title">' +
        excelEscape(key === "detail" ? "Data Media dan Produk" : labelOf(key)) +
        '</div><div class="section-body">' +
        items
          .map(
            (item) =>
              '<div class="detail-row"><div class="detail-label">' +
              excelEscape(prettyLabel(item.label)) +
              '</div><div class="detail-value">' +
              excelEscape(prettyValue(item.value) || "-").replace(
                /\n/g,
                "<br>",
              ) +
              "</div></div>",
          )
          .join("") +
        "</div></section>",
    )
    .join("")
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><title>' +
    excelEscape(memo.nomorMemo) +
    " - Memo Supplier</title><style>" +
    "@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#eef2f7;color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:11px}.toolbar{position:sticky;top:0;z-index:2;display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;background:#fff;border-bottom:1px solid #dbe3ee}.toolbar button{border:0;border-radius:7px;padding:8px 13px;background:#0f172a;color:#fff;font-weight:700;cursor:pointer}.toolbar .secondary{background:#fff;color:#334155;border:1px solid #cbd5e1}.memo-print-page{width:210mm;min-height:297mm;margin:20px auto;padding:14mm;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.14)}.memo-header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-bottom:18px;border-bottom:2px solid #0f172a}.brand{display:flex;align-items:center;gap:14px}.brand img{width:74px;height:74px;object-fit:contain}.brand h1{margin:0;font-size:17px}.brand p,.memo-number p{margin:4px 0 0;color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.memo-number{text-align:right}.memo-number strong{display:block;margin-top:4px;font-size:17px}.memo-number small{display:block;margin-top:5px;color:#64748b}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}.meta-card{padding:9px 11px;border:1px solid #dbe3ee;border-radius:4px}.meta-card.wide{grid-column:1/-1}.meta-label{color:#94a3b8;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.meta-value{margin-top:5px;font-weight:700;line-height:1.4;word-break:break-word}.outlet-list{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.outlet{padding:4px 7px;border:1px solid #f1c76b;border-radius:4px;background:#fff8e7;color:#8a4b08;font-size:9px;font-weight:700}.detail-section{margin-top:18px;border:1px solid #dbe3ee;border-radius:4px;overflow:hidden;break-inside:avoid}.section-title{padding:8px 10px;background:#0f172a;color:#fff;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.detail-row{display:grid;grid-template-columns:34% 66%;border-top:1px solid #e2e8f0}.detail-row:first-child{border-top:0}.detail-label{padding:8px 10px;background:#f8fafc;color:#475569;font-size:9px;font-weight:800}.detail-value{padding:8px 10px;line-height:1.45;overflow-wrap:anywhere}.signature{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:28px;text-align:center}.signature-box{min-height:72px;border-bottom:1px solid #94a3b8}.signature img{max-width:150px;max-height:62px;object-fit:contain}.signature p{margin:6px 0 0;font-weight:700}.notice{margin-top:14px;padding:8px 10px;border:1px solid #fca5a5;border-radius:4px;background:#fef2f2;color:#b91c1c;font-size:9px;font-weight:800}.credential{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:22px;padding-top:10px;border-top:1px solid #dbe3ee;color:#64748b;font-size:8px;line-height:1.5}.credential strong{display:block;color:#475569}.qr{width:70px;height:70px;flex:0 0 auto}@media print{body{background:#fff}.toolbar{display:none}.memo-print-page{margin:0;box-shadow:none}}" +
    '</style></head><body><div class="toolbar"><button class="secondary" onclick="window.close()">Tutup</button><button onclick="window.print()">Cetak / Simpan PDF</button></div><main class="memo-print-page"><header class="memo-header"><div class="brand"><img src="' +
    mannaKampusLogo +
    '" alt="Manna Kampus"><div><h1>BUYER MEMO SYSTEM</h1><p>' +
    excelEscape(labels[memo.jenisMemo] || memo.jenisMemo) +
    '</p></div></div><div class="memo-number"><p>No Memo</p><strong>' +
    excelEscape(memo.nomorMemo) +
    "</strong><small>Tgl: " +
    excelEscape(fmt(memo.tanggalSubmit)) +
    '</small></div></header><div class="meta-grid"><div class="meta-card"><div class="meta-label">Supplier</div><div class="meta-value">' +
    excelEscape(memo.supplierNama) +
    '</div></div><div class="meta-card"><div class="meta-label">Jenis Memo</div><div class="meta-value">' +
    excelEscape(labels[memo.jenisMemo] || memo.jenisMemo) +
    '</div></div><div class="meta-card"><div class="meta-label">Periode</div><div class="meta-value">' +
    excelEscape(fmt(memo.periodeAwal) + " s/d " + fmt(memo.periodeAkhir)) +
    '</div></div><div class="meta-card"><div class="meta-label">Program</div><div class="meta-value">' +
    excelEscape(programName) +
    '</div></div><div class="meta-card"><div class="meta-label">PIC Supplier</div><div class="meta-value">' +
    excelEscape(picName) +
    '</div></div><div class="meta-card wide"><div class="meta-label">Outlet Berlaku</div><div class="outlet-list">' +
    (memo.outlets.length ? memo.outlets : ["-"])
      .map(
        (outlet) => '<span class="outlet">' + excelEscape(outlet) + "</span>",
      )
      .join("") +
    "</div></div></div>" +
    sections +
    '<div class="signature"><div><div class="signature-box"></div><p>Buyer</p></div><div><div class="signature-box">' +
    (signature
      ? '<img src="' + excelEscape(signature) + '" alt="Tanda tangan supplier">'
      : "") +
    "</div><p>Supplier</p></div></div>" +
    (memo.jenisMemo !== "update-informasi"
      ? '<div class="notice">Supplier menyatakan bersedia melakukan pembayaran sebelum 2 bulan setelah program berakhir.</div>'
      : "") +
    '<div class="credential"><div><strong>Kredensial Keaslian Dokumen</strong>' +
    excelEscape(credential) +
    '</div><div class="qr">' +
    qrMarkup +
    "</div></div></main></body></html>"
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    window.alert("Tab cetak diblokir browser. Izinkan pop-up untuk situs ini.")
    return
  }
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
export function openMemoPrintHtml(memo: Memo) {
  if (DEMO_MODE) {
    openLocalMemoPrintHtml(memo)
    return
  }
  const printWindow = window.open("about:blank", "_blank")
  if (!printWindow) {
    window.alert("Tab cetak diblokir browser. Izinkan pop-up untuk situs ini.")
    return
  }
  printWindow.document.write(
    '<!doctype html><html><body style="font-family:Arial;padding:24px">Memuat dokumen memo...</body></html>',
  )
  printWindow.document.close()
  fetch(`${API}/api/memo/${encodeURIComponent(memo.id)}/pdf`)
    .then((response) => {
      if (!response.ok) throw new Error("HTML memo tidak tersedia")
      return response.text()
    })
    .then((html) => {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    })
    .catch(() => {
      printWindow.close()
      openLocalMemoPrintHtml(memo)
    })
}

function Buttons({ memo }: { memo: Memo }) {
  const exportExcelLegacy = () => {
    const fields = [...memo.detail, ...flatten(memo.data || {})]
    const rows = fields
      .map((field, index) => {
        const parts = field.label.split(" / ")
        const group = parts.length > 1 ? labelOf(parts[0]) : "Input Memo"
        return (
          '<tr><td class="num">' +
          (index + 1) +
          '</td><td class="group">' +
          excelEscape(group) +
          "</td><td>" +
          excelEscape(prettyLabel(field.label)) +
          '</td><td class="value">' +
          excelCell(field.value) +
          "</td></tr>"
        )
      })
      .join("")
    const html =
      '<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#172033}h1{font-size:18px;margin:0 0 4px}p{margin:2px 0 14px;color:#64748b;font-size:11px}.meta{border-collapse:collapse;margin:0 0 18px}.meta td{padding:5px 14px 5px 0;font-size:11px}.meta b{color:#64748b;text-transform:uppercase;font-size:9px}table{border-collapse:collapse;width:100%;font-size:10px}th{background:#172033;color:#fff;text-align:left;padding:8px}td{border:1px solid #dbe2ea;padding:7px;vertical-align:top}.num{width:34px;text-align:center;color:#64748b}.group{width:150px;font-weight:bold;color:#9a5b00;background:#fff8e7}.value{white-space:normal;line-height:1.5}</style></head><body><h1>Detail Input Supplier — ' +
      excelEscape(memo.nomorMemo) +
      "</h1><p>" +
      excelEscape(memo.supplierNama) +
      " · " +
      excelEscape(labels[memo.jenisMemo] || memo.jenisMemo) +
      '</p><table class="meta"><tr><td><b>Supplier</b><br>' +
      excelEscape(memo.supplierNama) +
      "</td><td><b>Jenis Memo</b><br>" +
      excelEscape(labels[memo.jenisMemo] || memo.jenisMemo) +
      "</td><td><b>Periode</b><br>" +
      excelEscape(fmt(memo.periodeAwal) + " s/d " + fmt(memo.periodeAkhir)) +
      "</td><td><b>Outlet</b><br>" +
      excelEscape(memo.outlets.join(", ")) +
      "</td></tr></table><table><thead><tr><th>No</th><th>Kelompok</th><th>Field Input</th><th>Nilai</th></tr></thead><tbody>" +
      rows +
      "</tbody></table></body></html>"
    const url = URL.createObjectURL(
      new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }),
    )
    const a = document.createElement("a")
    a.href = url
    a.download = memo.nomorMemo + "-detail.xls"
    a.click()
    URL.revokeObjectURL(url)
  }
  const exportExcel = () => exportMemoExcel(memo)
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => openMemoPrintHtml(memo)}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white"
      >
        <FileText className="h-4 w-4" />
        Cetak Memo
      </button>
      <button
        onClick={exportExcel}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
    </div>
  )
}
export function Detail({
  memo,
  back,
  embedded = false,
}: {
  memo: Memo
  back: () => void
  embedded?: boolean
}) {
  const meaningfulFields = flatten(memo.data || {}).filter(
    (field) => !["false", "0"].includes(field.value.trim().toLowerCase()),
  )
  const fields = grouped([...memo.detail, ...meaningfulFields])
  return (
    <div className="space-y-5">
      {!embedded && (
        <>
          <button
        onClick={back}
        className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
          </button>
          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-amber-900 px-6 py-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            DETAIL INPUT SUPPLIER
          </p>
          <h1 className="mt-1 text-2xl font-black">{memo.nomorMemo}</h1>
          <p className="mt-1 text-sm text-slate-300">
            {memo.supplierNama} · {labels[memo.jenisMemo] || memo.jenisMemo}
          </p>
        </div>
        <div className="border-b p-5">
          <Buttons memo={memo} />
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-4">
          <Info label="Supplier" value={memo.supplierNama} />
          <Info
            label="Jenis Memo"
            value={labels[memo.jenisMemo] || memo.jenisMemo}
          />
          <Info label="Outlet" value={memo.outlets.join(", ")} />
          <Info
            label="Periode"
            value={`${fmt(memo.periodeAwal)} s/d ${fmt(memo.periodeAkhir)}`}
          />
        </div>
          </section>
        </>
      )}
      {embedded && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-4">
            <Info label="Supplier" value={memo.supplierNama} />
            <Info label="Jenis Memo" value={labels[memo.jenisMemo] || memo.jenisMemo} />
            <Info label="Outlet" value={memo.outlets.join(", ")} />
            <Info label="Periode" value={`${fmt(memo.periodeAwal)} s/d ${fmt(memo.periodeAkhir)}`} />
          </div>
        </section>
      )}
      <div>
        <h2 className="text-lg font-black text-slate-900">
          Seluruh Data Input Supplier
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Data dikelompokkan berdasarkan bagian form agar lebih mudah dibaca.
        </p>
      </div>
      {fields.map(([key, items]) => (
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          key={key}
        >
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
            <h3 className="text-sm font-extrabold text-slate-800">
              {key === "detail" ? "Data Media dan Produk" : labelOf(key)}
            </h3>
          </div>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {items.map((item, index) => (
              <div className="border-b border-slate-100 px-5 py-3" key={index}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {prettyLabel(item.label)}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">
                  {prettyValue(item.value) || "-"}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
function Info({ label, value }: { label: string value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}
export default function MemoReportGrouped() {
  const nav = useNavigate()
  const role = localStorage.getItem("bm-role")
  const canViewPaymentMonitoring = role === "Akuntansi"
  const [rows, setRows] = useState<Memo[]>([])
  const [vendor, setVendor] = useState<string | null>(null)
  const [memo, setMemo] = useState<Memo | null>(null)
  const [search, setSearch] = useState("")
  const [jenis, setJenis] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [vendorPageSize, setVendorPageSize] = useState(10)
  const [vendorPage, setVendorPage] = useState(1)
  const [memoPageSize, setMemoPageSize] = useState(10)
  const [memoPage, setMemoPage] = useState(1)
  const approvalSummary = useMemo(() => {
    try {
      const records = JSON.parse(localStorage.getItem("memo-purchase-approval") || "{}") as Record<string, { status?: string }>
      const values = Object.values(records)
      return {
        pending: rows.filter((item) => !records[item.id]?.status).length,
        approved: values.filter((item) => item.status === "approved").length,
        rejected: values.filter((item) => item.status === "rejected").length,
      }
    } catch {
      return { pending: rows.length, approved: 0, rejected: 0 }
    }
  }, [rows])
  const readSubmittedMemos = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("supplier-memo-history") || "[]",
      )
      return Array.isArray(saved) ? saved as Memo[] : []
    } catch {
      return []
    }
  }
  const load = () => {
    const saved = readSubmittedMemos()
    if (DEMO_MODE) {
      setRows([...saved, ...(role === "Akuntansi" ? accountingUnpaidDummy : []), ...demoRows])
      return
    }
    fetch(`${API}/api/memo`)
      .then((r) => r.json())
      .then((data) =>
        setRows(
          Array.isArray(data) && data.length
            ? [...saved, ...(role === "Akuntansi" ? accountingUnpaidDummy : []), ...data]
            : [...saved, ...(role === "Akuntansi" ? accountingUnpaidDummy : []), ...demoRows],
        ),
      )
      .catch(() => setRows([...saved, ...(role === "Akuntansi" ? accountingUnpaidDummy : []), ...demoRows]))
  }
  useEffect(() => {
    if (!["Akuntansi", "Pembelian"].includes(role || "")) nav("/login")
    else load()
  }, [role])
  const filtered = useMemo(
    () =>
      rows.filter(
        (item) =>
          (!search ||
            JSON.stringify(item)
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (!jenis || normalizeMemoType(item.jenisMemo) === jenis) &&
          (!from || item.tanggalSubmit >= from) &&
          (!to || item.tanggalSubmit <= to),
      ),
    [rows, search, jenis, from, to],
  )
  const vendors = Object.values(
    filtered.reduce<Record<string, Vendor>>((acc, item) => {
      acc[item.supplierNama] ||= { name: item.supplierNama, memos: [] }
      acc[item.supplierNama].memos.push(item)
      return acc
    }, {}),
  )
  const selected = vendors.find((item) => item.name === vendor)
  const vendorPageCount =
    vendorPageSize === 0
      ? 1
      : Math.max(1, Math.ceil(vendors.length / vendorPageSize))
  const visibleVendors =
    vendorPageSize === 0
      ? vendors
      : vendors.slice(
          (vendorPage - 1) * vendorPageSize,
          vendorPage * vendorPageSize,
        )
  const selectedMemoPageCount =
    memoPageSize === 0
      ? 1
      : Math.max(1, Math.ceil((selected?.memos.length || 0) / memoPageSize))
  const visibleSelectedMemos = selected
    ? memoPageSize === 0
      ? selected.memos
      : selected.memos.slice(
          (memoPage - 1) * memoPageSize,
          memoPage * memoPageSize,
        )
    : []
  useEffect(() => {
    setVendorPage(1)
    setMemoPage(1)
  }, [search, jenis, from, to, vendorPageSize, memoPageSize])
  useEffect(() => {
    if (vendorPage > vendorPageCount) setVendorPage(vendorPageCount)
    if (memoPage > selectedMemoPageCount) setMemoPage(selectedMemoPageCount)
  }, [vendorPage, vendorPageCount, memoPage, selectedMemoPageCount])
  const leaseRows = filtered.filter(isLease)
  const renewalRows = role === "Akuntansi" || role === "Pembelian" ? [] : leaseRows.filter((item) => daysUntil(endDate(item)) <= 45)
  const unpaidRenewalRows = leaseRows.filter(
    (item) =>
      isUnpaidMemo(item) &&
      daysUntil(endDate(item)) >= -60 &&
      daysUntil(endDate(item)) <= 60,
  )
  const paidRenewalRows = leaseRows.filter(
    (item) =>
      !isUnpaidMemo(item) &&
      daysUntil(endDate(item)) >= -60 &&
      daysUntil(endDate(item)) <= 60,
  )
  const eventRows = filtered.filter(isEvent)
  const selectedEvent: string | null = null
  const selectedEventRows: Memo[] = []
  const setSelectedEvent = (_event: string | null) => undefined
  const eventSummary = Object.values(
    eventRows.reduce<Record<string, {
      name: string
      memos: number
      suppliers: Set<string>
      outlets: Set<string>
    }>>((acc, item) => {
      const name = eventName(item)
      acc[name] ||= {
        name,
        memos: 0,
        suppliers: new Set<string>(),
        outlets: new Set<string>(),
      }
      acc[name].memos += 1
      acc[name].suppliers.add(item.supplierNama)
      item.outlets.forEach((outlet) => acc[name].outlets.add(outlet))
      return acc
    }, {}),
  ).sort((a, b) => b.memos - a.memos)
  const mediaSummary = Object.values(
    eventRows.reduce<Record<string, {
      name: string
      count: number
      suppliers: Set<string>
      outlets: Set<string>
    }>>((acc, item) => {
      mediaNames(item).forEach((name) => {
        acc[name] ||= {
          name,
          count: 0,
          suppliers: new Set<string>(),
          outlets: new Set<string>(),
        }
        acc[name].count += 1
        acc[name].suppliers.add(item.supplierNama)
        item.outlets.forEach((outlet) => acc[name].outlets.add(outlet))
      })
      return acc
    }, {}),
  ).sort((a, b) => b.count - a.count)
  const maxMediaCount = Math.max(...mediaSummary.map((item) => item.count), 1)
  const outletSummary = Object.entries(
    filtered.reduce<Record<string, { memos: number suppliers: Set<string> }>>(
      (acc, item) => {
        item.outlets.forEach((outlet) => {
          acc[outlet] ||= { memos: 0, suppliers: new Set<string>() }
          acc[outlet].memos += 1
          acc[outlet].suppliers.add(item.supplierNama)
        })
        return acc
      },
      {},
    ),
  )
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.memos - a.memos)
  const maxOutletMemos = Math.max(...outletSummary.map((item) => item.memos), 1)
  const supplierSummary = Object.values(
    filtered.reduce<Record<string, {
      name: string
      memos: number
      outlets: Set<string>
      events: Set<string>
    }>>((acc, item) => {
      acc[item.supplierNama] ||= {
        name: item.supplierNama,
        memos: 0,
        outlets: new Set<string>(),
        events: new Set<string>(),
      }
      acc[item.supplierNama].memos += 1
      item.outlets.forEach((outlet) =>
        acc[item.supplierNama].outlets.add(outlet),
      )
      if (isEvent(item)) acc[item.supplierNama].events.add(eventName(item))
      return acc
    }, {}),
  ).sort((a, b) => b.memos - a.memos)
  const monthlySummary = Array.from({ length: 8 }, (_, index) => {
    const month = index + 5
    const items = filtered.filter(
      (item) => Number(item.tanggalSubmit.slice(5, 7)) === month,
    )
    return {
      label: new Date(2026, month - 1, 1).toLocaleString("id-ID", {
        month: "short",
      }),
      total: items.length,
      event: items.filter(isEvent).length,
      program: items.filter((item) => item.jenisMemo === "memo-program").length,
    }
  })
  const maxMonthly = Math.max(...monthlySummary.map((item) => item.total), 1)
  if (memo)
    return (
      <main className="memo-report-page min-h-full bg-[#f6f8fb] p-5">
        <Detail memo={memo} back={() => setMemo(null)} />
      </main>
    )
  if (selected)
    return (
      <main className="memo-report-page min-h-full space-y-5 bg-[#f6f8fb] p-5">
        <button
          onClick={() => setVendor(null)}
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke vendor
        </button>
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black">{selected.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pilih memo untuk melihat seluruh input supplier.
          </p>
        </section>
        <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Nomor Memo",
                  "Jenis Memo",
                  "Ringkasan",
                  "Outlet",
                  "Periode",
                  "Aksi",
                ].map((title) => (
                  <th
                    className="px-5 py-3 text-left text-[11px] uppercase text-slate-500"
                    key={title}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleSelectedMemos.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-mono text-xs">
                    {item.nomorMemo}
                  </td>
                  <td className="px-5 py-4">
                    {labels[item.jenisMemo] || item.jenisMemo}
                  </td>
                  <td className="px-5 py-4 font-semibold">{item.ringkasan}</td>
                  <td className="px-5 py-4">{item.outlets.join(", ")}</td>
                  <td
                    className={`px-5 py-4 ${
                      item.periodeAkhir &&
                      (new Date(`${item.periodeAkhir}T00:00:00`).getTime() -
                        Date.now()) /
                        86400000 <=
                        30
                        ? "font-bold text-amber-700"
                        : ""
                    }`}
                  >
                    {fmt(item.periodeAwal)} - {fmt(item.periodeAkhir)}
                    {item.periodeAkhir &&
                      (new Date(`${item.periodeAkhir}T00:00:00`).getTime() -
                        Date.now()) /
                        86400000 <=
                        30 && (
                        <span className="ml-2 animate-pulse rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">
                          Perpanjang
                        </span>
                      )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setMemo(item)}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selected.memos.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>
                Menampilkan {visibleSelectedMemos.length} dari{" "}
                {selected.memos.length} memo
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2">
                  Tampilkan
                  <select
                    value={memoPageSize}
                    onChange={(e) => {
                      setMemoPageSize(Number(e.target.value))
                      setMemoPage(1)
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={0}>Semua</option>
                  </select>
                  memo
                </label>
                {memoPageSize > 0 && (
                  <>
                    <button
                      type="button"
                      disabled={memoPage === 1}
                      onClick={() =>
                        setMemoPage((page) => Math.max(1, page - 1))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <span className="min-w-16 text-center font-semibold text-slate-700">
                      {memoPage} / {selectedMemoPageCount}
                    </span>
                    <button
                      type="button"
                      disabled={memoPage === selectedMemoPageCount}
                      onClick={() =>
                        setMemoPage((page) =>
                          Math.min(selectedMemoPageCount, page + 1),
                        )
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    )
  return (
    <main className="memo-report-page memo-dashboard-page min-h-full space-y-5 bg-[#f6f8fb] p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
            Dashboard Internal
          </p>
          <h1 className="mt-1 text-2xl font-black">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau persebaran memo, event, sewa, dan kebutuhan tindak lanjut untuk {role}.
          </p>
        </div>
      </header>
      <FilterCard variant="dashboard">
          <div className="filter-card__search flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari vendor atau memo..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="filter-card__control filter-card__control--select rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Semua Jenis Memo</option>
            {memoTypeOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="filter-card__control filter-card__control--date rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="filter-card__control filter-card__control--date rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setJenis("")
              setFrom("")
              setTo("")
            }}
            className="filter-card__control filter-card__reset rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Reset filter
          </button>
      </FilterCard>
      <section className="dashboard-reference rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-indigo-600">
              Operational overview
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Monitoring Memo &amp; Sewa
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ringkasan persebaran memo supplier untuk membantu Pembelian dan
              Akuntansi mengambil tindakan.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">
              Filter aktif
            </p>
            <p className="mt-1 text-xs font-black text-slate-700">
              {filtered.length} memo · {eventRows.length} event
            </p>
          </div>
        </div>
        <div className={`grid gap-3 sm:grid-cols-2 ${role === "Pembelian" ? "xl:grid-cols-4" : "xl:grid-cols-5"}`}>
          <div className="dashboard-stat dashboard-stat-indigo">
            <span>Total memo</span>
            <strong>{filtered.length}</strong>
            <small>Seluruh memo supplier</small>
          </div>
          <div className="dashboard-stat dashboard-stat-blue">
            <span>Memo program</span>
            <strong>
              {
                filtered.filter((item) => item.jenisMemo === "memo-program")
                  .length
              }
            </strong>
            <small>On Faktur &amp; Off Faktur</small>
          </div>
          <div className="dashboard-stat dashboard-stat-teal">
            <span>Event</span>
            <strong>{eventRows.length}</strong>
            <small>Memo kegiatan dan sewa</small>
          </div>
          {role !== "Akuntansi" && role !== "Pembelian" && <div className="dashboard-stat dashboard-stat-rose">
            <span>Butuh tindakan</span>
            <strong>{renewalRows.length}</strong>
            <small>End period ≤ 45 hari</small>
          </div>}
          {canViewPaymentMonitoring && (
            <button
              type="button"
              onClick={() => nav("/memo-report/unpaid-renewal")}
              className="dashboard-stat dashboard-stat-amber text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span>Sewa belum dibayar</span>
              <strong>{unpaidRenewalRows.length}</strong>
              <small>Berakhir dalam 60 hari</small>
            </button>
          )}
          {canViewPaymentMonitoring && (
            <button
              type="button"
              onClick={() => nav("/memo-report/unpaid-renewal")}
              className="dashboard-stat dashboard-stat-teal text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span>Sewa sudah dibayar</span>
              <strong>{paidRenewalRows.length}</strong>
              <small>Berakhir dalam 60 hari</small>
            </button>
          )}
          {role === "Pembelian" && (
            <button type="button" onClick={() => nav("/memo-approval")} className="dashboard-stat dashboard-stat-rose text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <span>Approval memo</span>
              <strong>{approvalSummary.pending}</strong>
              <small>{approvalSummary.approved} approved · {approvalSummary.rejected} ditolak</small>
            </button>
          )}
        </div>
        {canViewPaymentMonitoring && (
          <section className="mt-5 rounded-2xl border border-red-100 bg-red-50/40 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                <TriangleAlert className="h-4 w-4 text-red-500" />
                Laporan Pembayaran Sewa
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Prioritas tindak lanjut pembayaran berdasarkan sisa periode sewa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => nav("/memo-report/unpaid-renewal")}
              className="rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-red-700 shadow-sm ring-1 ring-red-100 hover:bg-red-50"
            >
              Lihat semua
            </button>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.35fr]">
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Critical",
                  note: "≤ 7 hari",
                  count: unpaidRenewalRows.filter(
                    (item) => daysUntil(endDate(item)) <= 7,
                  ).length,
                  color: "bg-red-500",
                  track: "bg-red-100",
                },
                {
                  label: "Warning",
                  note: "8–30 hari",
                  count: unpaidRenewalRows.filter((item) => {
                    const days = daysUntil(endDate(item))
                    return days >= 8 && days <= 30
                  }).length,
                  color: "bg-orange-500",
                  track: "bg-orange-100",
                },
                {
                  label: "Upcoming",
                  note: "31–60 hari",
                  count: unpaidRenewalRows.filter(
                    (item) => daysUntil(endDate(item)) >= 31,
                  ).length,
                  color: "bg-amber-400",
                  track: "bg-amber-100",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-900">{item.count}</p>
                  <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${item.track}`}>
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width: `${unpaidRenewalRows.length ? Math.max((item.count / unpaidRenewalRows.length) * 100, item.count ? 8 : 0) : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
              {unpaidRenewalRows.length ? (
                <div className="space-y-2">
                  {unpaidRenewalRows.slice(0, 3).map((item) => {
                    const days = daysUntil(endDate(item))
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => nav(`/memo-report/unpaid-renewal?memo=${encodeURIComponent(item.id)}`)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-left hover:border-red-200 hover:bg-red-50/50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-800">{item.supplierNama}</span>
                          <span className="mt-0.5 block truncate text-[10px] text-slate-500">{item.ringkasan} · {item.nomorMemo}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-black text-red-700">{days} hari</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex min-h-[92px] items-center justify-center text-center">
                  <p className="text-xs text-slate-400">
                    Belum ada memo dengan status pembayaran belum dibayar.
                  </p>
                </div>
              )}
            </div>
          </div>
          </section>
        )}
        <div className={`mt-5 grid gap-4 ${role === "Akuntansi" ? "xl:grid-cols-1" : "xl:grid-cols-[1.45fr_.85fr]"}`}>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-900">
                  Media paling banyak disewa
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Distribusi jenis media pada memo Event.
                </p>
              </div>
              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-500">
                Top {mediaSummary.length}
              </span>
            </div>
            <div className="space-y-4">
              {mediaSummary.length ? (
                mediaSummary.map((media, index) => (
                  <div key={media.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400">
                          0{index + 1}
                        </span>
                        <span className="truncate text-xs font-bold text-slate-700">
                          {media.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-indigo-700">
                        {media.count} memo
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        style={{
                          width: `${(media.count / maxMediaCount) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {media.suppliers.size} supplier · {media.outlets.size}{" "}
                      outlet
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-slate-400">
                  Belum ada data event.
                </p>
              )}
            </div>
          </div>
          <div className={`${role === "Akuntansi" ? "hidden " : ""}rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900">
                  Renewal watchlist
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sewa yang harus segera ditindaklanjuti.
                </p>
              </div>
              <span className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-black text-white">
                {renewalRows.length} alert
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {renewalRows.slice(0, 4).map((item) => {
                const remaining = daysUntil(endDate(item))
                return (
                  <button
                    key={item.id}
                    onClick={() => setMemo(item)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white p-3 text-left hover:border-amber-300"
                  >
                    <span className="min-w-0">
                      <b className="block truncate text-xs text-slate-800">
                        {item.supplierNama}
                      </b>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        {item.ringkasan}
                      </span>
                    </span>
                    <b
                      className={`shrink-0 text-[10px] ${
                        remaining < 0 ? "text-red-600" : "text-amber-700"
                      }`}
                    >
                      {remaining < 0 ? "Lewat" : `${remaining} hari`}
                    </b>
                  </button>
                )
              })}
              {!renewalRows.length && (
                <p className="py-8 text-center text-xs text-emerald-600">
                  Tidak ada sewa yang mendekati end period.
                </p>
              )}
            </div>
            {renewalRows.length > 4 && (
              <p className="mt-3 text-center text-[10px] font-bold text-amber-700">
                +{renewalRows.length - 4} renewal lainnya di detail report
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          <div className="border-b border-slate-100 bg-white px-4 py-3">
            <p className="text-sm font-black text-slate-900">Event</p>
            <p className="mt-1 text-xs text-slate-500">
              Klik event untuk melihat daftar memo yang terkait.
            </p>
          </div>
          <div className="grid gap-px bg-slate-100 md:grid-cols-3">
            {eventSummary.map((event) => (
              <div
                key={event.name}
                role="button"
                tabIndex={0}
                onClick={() =>
                  nav(`/memo-report/event/${encodeURIComponent(event.name)}`)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    nav(`/memo-report/event/${encodeURIComponent(event.name)}`)
                }}
                className="cursor-pointer bg-white p-4 text-left transition hover:bg-indigo-50"
              >
                <p className="truncate text-xs font-black text-slate-800">
                  {event.name}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <strong className="text-xl font-black text-indigo-700">
                      {event.memos}
                    </strong>
                    <span className="ml-1 text-[10px] text-slate-400">
                      memo
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    {event.suppliers.size} supplier
                    <br />
                    {event.outlets.size} outlet
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {false && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                Detail memo event
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {selectedEvent}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan seluruh isi memo yang terkait dengan event ini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-indigo-300"
            >
              Tutup detail
            </button>
          </div>
          <div className="space-y-4">
            {selectedEventRows.map((item) => {
              const fields = [...item.detail, ...flatten(item.data || {})]
              const remaining = daysUntil(endDate(item))
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <p className="font-mono text-xs font-black text-indigo-700">
                        {item.nomorMemo}
                      </p>
                      <h3 className="mt-1 text-base font-black text-slate-900">
                        {item.supplierNama}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.jenisMemo} ·{" "}
                        {item.outlets.join(", ") || "Outlet belum diisi"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                          remaining < 0
                            ? "bg-red-100 text-red-700"
                            : remaining <= 30
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {remaining < 0 ? "Expired" : `${remaining} hari lagi`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMemo(item)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-bold text-white hover:bg-indigo-700"
                      >
                        Buka detail penuh
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Event / Program
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {eventName(item)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Periode
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {fmt(item.periodeAwal)} - {fmt(endDate(item))}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Media
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {mediaNames(item).join(", ") || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {memoTotal(item)}
                      </p>
                    </div>
                  </div>
                  <details
                    open
                    className="mt-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <summary className="cursor-pointer px-4 py-3 text-xs font-black text-slate-700">
                      Seluruh Data Input Supplier ({fields.length} field)
                    </summary>
                    <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                      {fields.map((field, index) => (
                        <div
                          key={`${item.id}-${field.label}-${index}`}
                          className="bg-white p-3"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {prettyLabel(field.label)}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs font-semibold text-slate-800">
                            {prettyValue(field.value) || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                </article>
              )
            })}
          </div>
        </section>
      )}
      <section className="grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-indigo-600">
                Analytics
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                Persebaran Memo
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Jumlah memo yang masuk berdasarkan bulan pada filter aktif.
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-700">
              2026
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2 border-b border-l border-slate-200 px-3 pb-0 pt-4">
            {monthlySummary.map((month) => (
              <div
                key={month.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full items-end justify-center gap-0.5">
                  <div
                    data-chart-tooltip={`${month.total} total memo · ${month.program} memo program`}
                    className="chart-bar-tooltip w-3 rounded-t-md bg-indigo-500 transition-all hover:bg-indigo-700"
                    style={{
                      height: `${Math.max((month.total / maxMonthly) * 100, month.total ? 8 : 0)}%`,
                    }}
                  />
                  <div
                    data-chart-tooltip={`${month.event} memo event`}
                    className="chart-bar-tooltip w-3 rounded-t-md bg-emerald-400 transition-all hover:bg-emerald-600"
                    style={{
                      height: `${Math.max((month.event / maxMonthly) * 100, month.event ? 6 : 0)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-semibold text-slate-500">
            <span>
              <i className="mr-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
              Total Memo
            </span>
            <span>
              <i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Memo Event
            </span>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-600">
              Ranking
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              Event Terpopuler
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Klik event untuk melihat detail isi memo.
            </p>
          </div>
          <div className="space-y-4">
            {eventSummary.slice(0, 5).map((event, index) => (
              <button
                key={event.name}
                data-chart-tooltip={`${event.memos} memo · ${event.suppliers.size} supplier · ${event.outlets.size} outlet`}
                onClick={() =>
                  nav(`/memo-report/event/${encodeURIComponent(event.name)}`)
                }
                className="chart-card-tooltip group w-full text-left"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-slate-700">
                    <b className="mr-2 text-[10px] text-slate-400">
                      0{index + 1}
                    </b>
                    {event.name}
                  </span>
                  <span className="shrink-0 text-xs font-black text-violet-700">
                    {event.memos}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{
                      width: `${(event.memos / Math.max(eventSummary[0]?.memos || 1, 1)) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {event.suppliers.size} supplier · {event.outlets.size} outlet
                </p>
              </button>
            ))}
          </div>
        </section>
      </section>
      <section className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-600">
              Distribution
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              Aktivitas per Outlet
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Outlet dengan jumlah memo paling banyak.
            </p>
          </div>
          <div className="space-y-3">
            {outletSummary.slice(0, 8).map((outlet) => (
              <div
                key={outlet.name}
                data-chart-tooltip={`${outlet.memos} memo · ${outlet.suppliers.size} supplier`}
                className="chart-card-tooltip"
              >
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    {outlet.name}
                  </span>
                  <span className="font-black text-cyan-700">
                    {outlet.memos} memo
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{
                      width: `${(outlet.memos / maxOutletMemos) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {outlet.suppliers.size} supplier terlibat
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-600">
                Vendor activity
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                Supplier dengan Aktivitas Memo Terbanyak
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ringkasan supplier, outlet, dan event pada filter aktif.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              Top {Math.min(supplierSummary.length, 6)}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {supplierSummary.slice(0, 6).map((supplier, index) => (
              <button
                key={supplier.name}
                onClick={() => setVendor(supplier.name)}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-amber-300 hover:bg-amber-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-xs font-bold text-slate-800">
                    {supplier.name}
                  </span>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-amber-700">
                    #{index + 1}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {supplier.memos}
                    </p>
                    <p className="text-[9px] text-slate-400">Memo</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {supplier.outlets.size}
                    </p>
                    <p className="text-[9px] text-slate-400">Outlet</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {supplier.events.size}
                    </p>
                    <p className="text-[9px] text-slate-400">Event</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>
      <div className="hidden">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Memo
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {filtered.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Seluruh memo supplier</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Memo Program
            </p>
            <p className="mt-2 text-2xl font-black text-blue-700">
              {
                filtered.filter((item) => item.jenisMemo === "memo-program")
                  .length
              }
            </p>
            <p className="mt-1 text-xs text-slate-500">Program on/off faktur</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Event
            </p>
            <p className="mt-2 text-2xl font-black text-violet-700">
              {eventRows.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Persebaran event aktif
            </p>
          </div>
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              renewalRows.length
                ? "border-amber-300 bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Perlu Perpanjangan
            </p>
            <p className="mt-2 text-2xl font-black text-amber-800">
              {renewalRows.length}
            </p>
            <p className="mt-1 text-xs text-amber-700">End period ≤ 45 hari</p>
          </div>
        </section>
        {renewalRows.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-amber-900">
                  Peringatan Perpanjangan Sewa
                </h2>
                <p className="mt-1 text-xs text-amber-700">
                  Supplier berikut perlu segera dihubungi sebelum masa sewanya
                  berakhir.
                </p>
              </div>
              <span className="animate-pulse rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black text-white">
                TINDAKAN
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {renewalRows.map((item) => {
                const remaining = daysUntil(endDate(item))
                return (
                  <button
                    key={item.id}
                    onClick={() => setMemo(item)}
                    className="rounded-xl border border-amber-200 bg-white p-3 text-left transition hover:border-amber-400 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {item.supplierNama}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {item.ringkasan}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                          remaining < 0
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {remaining < 0 ? "Lewat" : `${remaining} hari`}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-amber-800">
                      End period: {fmt(endDate(item))}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>
        )}
        {eventSummary.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <h2 className="text-sm font-black text-slate-900">
                Persebaran Event
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ringkasan event berdasarkan jumlah memo, supplier, dan outlet.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {eventSummary.map((event) => (
                <div
                  key={event.name}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-xs font-black text-slate-800">
                    {event.name}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-black text-violet-700">
                        {event.memos}
                      </p>
                      <p className="text-[10px] text-slate-500">Memo</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800">
                        {event.suppliers.size}
                      </p>
                      <p className="text-[10px] text-slate-500">Supplier</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800">
                        {event.outlets.size}
                      </p>
                      <p className="text-[10px] text-slate-500">Outlet</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {mediaSummary.length > 0 && (
          <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-600">
                  Analisis Media Event
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">
                  Jenis media yang paling banyak disewa
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Dihitung dari seluruh memo Event pada filter aktif.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
                {eventRows.length} memo event
              </span>
            </div>
            <div className="space-y-3">
              {mediaSummary.map((media, index) => (
                <div
                  key={media.name}
                  className="rounded-xl border border-white bg-white/80 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-black text-violet-700">
                        {index + 1}
                      </span>
                      <p className="truncate text-xs font-black text-slate-800">
                        {media.name}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-black text-violet-700">
                      {media.count} memo
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
                      style={{
                        width: `${(media.count / maxMediaCount) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">
                    {media.suppliers.size} supplier · {media.outlets.size}{" "}
                    outlet
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        {eventRows.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-black text-slate-900">
                Dashboard masing-masing memo event
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Klik kartu untuk membuka seluruh data input supplier dan halaman
                cetak HTML.
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {eventRows.map((item) => {
                const remaining = daysUntil(endDate(item))
                const media = mediaNames(item)
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-violet-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-violet-600">
                          {item.nomorMemo}
                        </p>
                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          {item.ringkasan}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.supplierNama} · {item.outlets.join(", ")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black ${
                          remaining <= 45
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {remaining < 0
                          ? "Sewa berakhir"
                          : `${remaining} hari tersisa`}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white p-2">
                        <p className="text-[10px] text-slate-400">Event</p>
                        <p className="mt-1 truncate text-xs font-bold text-slate-800">
                          {eventName(item)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-2">
                        <p className="text-[10px] text-slate-400">Media</p>
                        <p className="mt-1 truncate text-xs font-bold text-violet-700">
                          {media.join(", ") || "-"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-2">
                        <p className="text-[10px] text-slate-400">End period</p>
                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {fmt(endDate(item))}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMemo(item)}
                      className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
                    >
                      Lihat detail memo
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>
      <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Vendor",
                "Jumlah Memo",
                "Memo Program",
                "Memo Lain-lain",
                "Outlet",
                "Aksi",
              ].map((title) => (
                <th
                  className="px-5 py-3 text-left text-[11px] uppercase text-slate-500"
                  key={title}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visibleVendors.map((item) => (
              <tr key={item.name}>
                <td className="px-5 py-4 font-bold">{item.name}</td>
                <td className="px-5 py-4">{item.memos.length}</td>
                <td className="px-5 py-4">
                  {
                    item.memos.filter((m) => m.jenisMemo === "memo-program")
                      .length
                  }
                </td>
                <td className="px-5 py-4">
                  {
                    item.memos.filter(
                      (m) =>
                        normalizeMemoType(m.jenisMemo) === "memo-lain-lain",
                    ).length
                  }
                </td>
                <td className="px-5 py-4">
                  {Array.from(
                    new Set(item.memos.flatMap((m) => m.outlets)),
                  ).join(", ")}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setVendor(item.name)}
                    className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    Lihat Memo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            <span>
              Menampilkan {visibleVendors.length} dari {vendors.length} supplier
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2">
                Tampilkan
                <select
                  value={vendorPageSize}
                  onChange={(e) => {
                    setVendorPageSize(Number(e.target.value))
                    setVendorPage(1)
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={0}>Semua</option>
                </select>
                supplier
              </label>
              {vendorPageSize > 0 && (
                <>
                  <button
                    type="button"
                    disabled={vendorPage === 1}
                    onClick={() =>
                      setVendorPage((page) => Math.max(1, page - 1))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="min-w-16 text-center font-semibold text-slate-700">
                    {vendorPage} / {vendorPageCount}
                  </span>
                  <button
                    type="button"
                    disabled={vendorPage === vendorPageCount}
                    onClick={() =>
                      setVendorPage((page) =>
                        Math.min(vendorPageCount, page + 1),
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {vendors.length === 0 && (
          <p className="py-14 text-center text-sm text-slate-500">
            Tidak ada memo ditemukan.
          </p>
        )}
      </section>
    </main>
  )
}
