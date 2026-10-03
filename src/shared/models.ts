export type NoteInfo = {
  title: string
  lastEditTime: number
}

export type NoteContent = string

export type TableInfo = {
  tableNumber: any
  lastEditTime: number
}

export type TableContent = Record<string, any>

export type BillInfo = {
  bill_no: string
  total_amount: number
  status: string
}

export type BillContent = string

/* ------------------------------------------------------------------ */
/* POS domain (BistroDex)                                              */
/* ------------------------------------------------------------------ */

export type Diet = 'veg' | 'nonveg' | 'egg'

export type Outlet = {
  name: string
  tagline: string
  address: string
  phone: string
  gstin: string
  fssai: string
}

export type MenuCategory = { id: string; name: string }

export type MenuItem = {
  id: string
  name: string
  categoryId: string
  price: number
  diet: Diet
  popular?: boolean
  available: boolean
  prepMins?: number
}

export type Menu = { categories: MenuCategory[]; items: MenuItem[] }

export type OrderLine = {
  itemId: string
  name: string
  price: number
  qty: number
  diet: Diet
  note?: string
  sentToKitchen?: boolean
}

export type TableStatus = 'free' | 'occupied' | 'billing' | 'reserved'

export type DiningTable = {
  id: string
  label: string
  area: 'Indoor' | 'Terrace' | 'Counter'
  seats: number
  status: TableStatus
  guests?: number
  seatedAt?: number
  server?: string
  order: OrderLine[]
  reservation?: { name: string; time: string; guests: number }
}

export type PaymentMode = 'upi' | 'card' | 'cash'

export type Bill = {
  billNo: string
  tableLabel: string
  server: string
  guests: number
  createdAt: number
  lines: OrderLine[]
  discountPct: number
  paymentMode: PaymentMode
}

export type InventoryItem = {
  id: string
  name: string
  category: 'Produce' | 'Dairy' | 'Meat & Seafood' | 'Dry Goods' | 'Beverages' | 'Packaging'
  unit: string
  onHand: number
  par: number
  reorderAt: number
  costPerUnit: number
  supplier: string
  lastRestocked: number
}

export type SalesSummary = {
  asOf: number
  hourly: { hour: number; amount: number }[]
  orders: number
  covers: number
  yesterdayNetSales: number
  topItems: { name: string; qty: number; revenue: number; diet: Diet }[]
  paymentMix: { mode: PaymentMode; amount: number }[]
}
