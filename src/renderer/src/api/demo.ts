/**
 * Demo data layer.
 *
 * Used when the renderer runs outside Electron (plain browser / `yarn dev:web`)
 * or when VITE_DEMO=1. Everything is in memory: orders you ring up and bills you
 * settle survive until reload, nothing is written anywhere.
 *
 * The dataset is a mid-sized Mumbai café on a busy weeknight, with the clock
 * pinned at 8:45 PM so dashboards always look like dinner service.
 */
import { computeTotals } from '@shared/billing'
import type {
  Bill,
  DiningTable,
  InventoryItem,
  Menu,
  MenuItem,
  OrderLine,
  Outlet,
  SalesSummary
} from '@shared/models'
import type { BistroApi } from '@shared/types'

const today = new Date()
export const DEMO_NOW = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  20,
  45
).getTime()
const bootedAt = Date.now()
/** Demo wall clock: pinned to 8:45 PM and ticking from there. */
export const demoNow = () => DEMO_NOW + (Date.now() - bootedAt)
const minsAgo = (m: number) => DEMO_NOW - m * 60_000
const daysAgo = (d: number) => DEMO_NOW - d * 86_400_000

const outlet: Outlet = {
  name: 'Kesar Café & Kitchen',
  tagline: 'All-day Indian café',
  address: '14, Hill Road, Bandra West, Mumbai 400050',
  phone: '+91 22 2640 1188',
  gstin: '27AAKFK4821M1Z5',
  fssai: '11521998000417'
}

const menu: Menu = {
  categories: [
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'chaat', name: 'Chaat & Snacks' },
    { id: 'mains', name: 'Mains' },
    { id: 'breads', name: 'Breads' },
    { id: 'rice', name: 'Rice & Biryani' },
    { id: 'drinks', name: 'Beverages' },
    { id: 'desserts', name: 'Desserts' }
  ],
  items: (
    [
      ['breakfast', 'Kanda Poha', 90, 'veg'],
      ['breakfast', 'Misal Pav', 130, 'veg', true],
      ['breakfast', 'Masala Dosa', 140, 'veg'],
      ['breakfast', 'Idli Sambar', 110, 'veg'],
      ['breakfast', 'Akuri on Toast', 160, 'egg'],
      ['breakfast', 'Aloo Paratha', 150, 'veg'],
      ['chaat', 'Vada Pav', 50, 'veg', true],
      ['chaat', 'Pani Puri', 80, 'veg'],
      ['chaat', 'Sev Puri', 90, 'veg'],
      ['chaat', 'Dahi Batata Puri', 110, 'veg'],
      ['chaat', 'Paneer Tikka', 280, 'veg', true],
      ['chaat', 'Chicken 65', 290, 'nonveg'],
      ['chaat', 'Prawns Koliwada', 360, 'nonveg'],
      ['chaat', 'Keema Pav', 240, 'nonveg'],
      ['mains', 'Paneer Butter Masala', 320, 'veg', true],
      ['mains', 'Dal Makhani', 260, 'veg'],
      ['mains', 'Pindi Chole', 220, 'veg'],
      ['mains', 'Kadai Veg', 260, 'veg'],
      ['mains', 'Butter Chicken', 380, 'nonveg', true],
      ['mains', 'Mutton Rogan Josh', 460, 'nonveg', false, false],
      ['mains', 'Malvani Fish Curry', 420, 'nonveg'],
      ['mains', 'Egg Curry', 220, 'egg'],
      ['breads', 'Butter Naan', 60, 'veg', true],
      ['breads', 'Garlic Naan', 75, 'veg'],
      ['breads', 'Tandoori Roti', 35, 'veg'],
      ['breads', 'Lachha Paratha', 70, 'veg'],
      ['breads', 'Pav (2 pcs)', 30, 'veg'],
      ['rice', 'Jeera Rice', 160, 'veg'],
      ['rice', 'Veg Dum Biryani', 280, 'veg'],
      ['rice', 'Chicken Dum Biryani', 340, 'nonveg', true],
      ['rice', 'Mutton Biryani', 420, 'nonveg'],
      ['rice', 'Curd Rice', 150, 'veg'],
      ['drinks', 'Cutting Chai', 30, 'veg', true],
      ['drinks', 'Masala Chai', 45, 'veg'],
      ['drinks', 'Filter Coffee', 60, 'veg'],
      ['drinks', 'Sweet Lassi', 90, 'veg'],
      ['drinks', 'Fresh Lime Soda', 80, 'veg'],
      ['drinks', 'Kokum Sharbat', 70, 'veg'],
      ['drinks', 'Cold Coffee', 140, 'veg'],
      ['desserts', 'Gulab Jamun', 90, 'veg'],
      ['desserts', 'Rasmalai', 120, 'veg', true],
      ['desserts', 'Kulfi Falooda', 160, 'veg'],
      ['desserts', 'Gajar Halwa', 130, 'veg'],
      ['desserts', 'Shrikhand', 110, 'veg']
    ] as [string, string, number, MenuItem['diet'], boolean?, boolean?][]
  ).map(([categoryId, name, price, diet, popular = false, available = true]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    categoryId,
    name,
    price,
    diet,
    popular,
    available
  }))
}

const item = (name: string) => {
  const found = menu.items.find((i) => i.name === name)
  if (!found) throw new Error(`demo: no menu item ${name}`)
  return found
}

const line = (name: string, qty: number, sent = true, note?: string): OrderLine => {
  const it = item(name)
  return {
    itemId: it.id,
    name: it.name,
    price: it.price,
    diet: it.diet,
    qty,
    sentToKitchen: sent,
    note
  }
}

const tables: DiningTable[] = [
  { id: 't1', label: 'T1', area: 'Indoor', seats: 2, status: 'free', order: [] },
  {
    id: 't2',
    label: 'T2',
    area: 'Indoor',
    seats: 2,
    status: 'occupied',
    guests: 2,
    seatedAt: minsAgo(38),
    server: 'Ravi',
    order: [
      line('Paneer Tikka', 1),
      line('Dal Makhani', 1),
      line('Butter Naan', 3),
      line('Sweet Lassi', 2)
    ]
  },
  {
    id: 't3',
    label: 'T3',
    area: 'Indoor',
    seats: 4,
    status: 'occupied',
    guests: 4,
    seatedAt: minsAgo(12),
    server: 'Sneha',
    order: [line('Pani Puri', 2), line('Sev Puri', 1), line('Fresh Lime Soda', 4)]
  },
  {
    id: 't4',
    label: 'T4',
    area: 'Indoor',
    seats: 4,
    status: 'occupied',
    guests: 3,
    seatedAt: minsAgo(24),
    server: 'Ravi',
    order: [
      line('Chicken 65', 1),
      line('Butter Chicken', 1),
      line('Paneer Butter Masala', 1),
      line('Garlic Naan', 2, true),
      line('Butter Naan', 2, false),
      line('Chicken Dum Biryani', 1, false, 'Less spicy'),
      line('Kokum Sharbat', 3, false)
    ]
  },
  {
    id: 't5',
    label: 'T5',
    area: 'Indoor',
    seats: 2,
    status: 'billing',
    guests: 2,
    seatedAt: minsAgo(64),
    server: 'Imran',
    order: [line('Masala Dosa', 2), line('Filter Coffee', 2), line('Gulab Jamun', 1)]
  },
  { id: 't6', label: 'T6', area: 'Indoor', seats: 4, status: 'free', order: [] },
  {
    id: 't7',
    label: 'T7',
    area: 'Indoor',
    seats: 4,
    status: 'reserved',
    order: [],
    reservation: { name: 'Mehta', time: '9:15 PM', guests: 4 }
  },
  {
    id: 't8',
    label: 'T8',
    area: 'Indoor',
    seats: 8,
    status: 'occupied',
    guests: 7,
    seatedAt: minsAgo(51),
    server: 'Sneha',
    order: [
      line('Paneer Tikka', 2),
      line('Prawns Koliwada', 1),
      line('Butter Chicken', 2),
      line('Dal Makhani', 1),
      line('Butter Naan', 8),
      line('Mutton Biryani', 1),
      line('Jeera Rice', 2),
      line('Sweet Lassi', 4),
      line('Cold Coffee', 3)
    ]
  },
  {
    id: 'r1',
    label: 'R1',
    area: 'Terrace',
    seats: 4,
    status: 'occupied',
    guests: 3,
    seatedAt: minsAgo(31),
    server: 'Imran',
    order: [line('Keema Pav', 2), line('Vada Pav', 3), line('Cutting Chai', 3)]
  },
  { id: 'r2', label: 'R2', area: 'Terrace', seats: 4, status: 'free', order: [] },
  {
    id: 'r3',
    label: 'R3',
    area: 'Terrace',
    seats: 6,
    status: 'billing',
    guests: 5,
    seatedAt: minsAgo(72),
    server: 'Ravi',
    order: [
      line('Chicken Dum Biryani', 2),
      line('Veg Dum Biryani', 1),
      line('Malvani Fish Curry', 1),
      line('Garlic Naan', 4),
      line('Kulfi Falooda', 3)
    ]
  },
  {
    id: 'r4',
    label: 'R4',
    area: 'Terrace',
    seats: 2,
    status: 'reserved',
    order: [],
    reservation: { name: 'D’Souza', time: '9:30 PM', guests: 2 }
  },
  {
    id: 'ta1',
    label: 'TA-1',
    area: 'Counter',
    seats: 1,
    status: 'occupied',
    guests: 1,
    seatedAt: minsAgo(6),
    server: 'Counter',
    order: [line('Chicken Dum Biryani', 2), line('Gulab Jamun', 2)]
  },
  { id: 'ta2', label: 'TA-2', area: 'Counter', seats: 1, status: 'free', order: [] }
]

const inv = (
  name: string,
  category: InventoryItem['category'],
  unit: string,
  onHand: number,
  par: number,
  reorderAt: number,
  costPerUnit: number,
  supplier: string,
  restockedDaysAgo: number
): InventoryItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name,
  category,
  unit,
  onHand,
  par,
  reorderAt,
  costPerUnit,
  supplier,
  lastRestocked: daysAgo(restockedDaysAgo)
})

const inventory: InventoryItem[] = [
  inv('Mutton (curry cut)', 'Meat & Seafood', 'kg', 0.8, 8, 3, 780, 'Bandra Meat Co.', 3),
  inv('Paneer', 'Dairy', 'kg', 3.2, 12, 4, 360, 'Gokul Dairy', 2),
  inv('Surmai (fish)', 'Meat & Seafood', 'kg', 2.1, 6, 2.5, 920, 'Sassoon Dock Traders', 1),
  inv('Fresh cream', 'Dairy', 'L', 2, 8, 3, 220, 'Gokul Dairy', 2),
  inv('Pav', 'Dry Goods', 'pcs', 64, 240, 80, 4, 'Yazdani Bakery', 0),
  inv('Coffee powder', 'Beverages', 'kg', 0.6, 3, 1, 840, 'Coorg Estates', 9),
  inv('Takeaway containers', 'Packaging', 'pcs', 180, 500, 200, 7, 'PackRight Supplies', 6),
  inv('Kokum', 'Dry Goods', 'kg', 0.4, 2, 0.5, 410, 'Konkan Naturals', 12),
  inv('Chicken (boneless)', 'Meat & Seafood', 'kg', 6.5, 15, 5, 290, 'Bandra Meat Co.', 1),
  inv('Prawns', 'Meat & Seafood', 'kg', 3.4, 6, 2, 640, 'Sassoon Dock Traders', 1),
  inv('Butter', 'Dairy', 'kg', 4.5, 10, 4, 520, 'Gokul Dairy', 2),
  inv('Milk', 'Dairy', 'L', 18, 40, 15, 62, 'Gokul Dairy', 0),
  inv('Curd', 'Dairy', 'kg', 6, 12, 4, 90, 'Gokul Dairy', 1),
  inv('Tomatoes', 'Produce', 'kg', 14, 30, 12, 38, 'Vashi APMC', 1),
  inv('Onions', 'Produce', 'kg', 42, 60, 20, 32, 'Vashi APMC', 1),
  inv('Potatoes', 'Produce', 'kg', 35, 50, 15, 28, 'Vashi APMC', 1),
  inv('Coriander', 'Produce', 'bunch', 12, 30, 10, 12, 'Vashi APMC', 0),
  inv('Basmati rice', 'Dry Goods', 'kg', 38, 50, 20, 118, 'Lakshmi Grains', 5),
  inv('Maida', 'Dry Goods', 'kg', 11, 25, 10, 42, 'Lakshmi Grains', 5),
  inv('Atta', 'Dry Goods', 'kg', 22, 30, 10, 44, 'Lakshmi Grains', 5),
  inv('Cooking oil', 'Dry Goods', 'L', 24, 45, 15, 148, 'Lakshmi Grains', 4),
  inv('Ghee', 'Dairy', 'kg', 3, 5, 1.5, 640, 'Gokul Dairy', 4),
  inv('Tea leaves', 'Beverages', 'kg', 2.4, 4, 1, 460, 'Assam Leaf Co.', 7),
  inv('Sugar', 'Dry Goods', 'kg', 18, 25, 8, 46, 'Lakshmi Grains', 5)
]

let billSeq = 4812
const bill = (
  minutesAgo: number,
  tableLabel: string,
  server: string,
  guests: number,
  paymentMode: Bill['paymentMode'],
  lines: OrderLine[],
  discountPct = 0
): Bill => ({
  billNo: `KC/26-27/${String(billSeq++).padStart(5, '0')}`,
  tableLabel,
  server,
  guests,
  paymentMode,
  lines,
  discountPct,
  createdAt: minsAgo(minutesAgo)
})

const bills: Bill[] = [
  bill(162, 'T6', 'Sneha', 2, 'upi', [line('Misal Pav', 2), line('Cutting Chai', 2)]),
  bill(148, 'TA-2', 'Counter', 1, 'cash', [line('Vada Pav', 4), line('Masala Chai', 2)]),
  bill(131, 'R2', 'Imran', 4, 'card', [
    line('Paneer Tikka', 1),
    line('Chicken 65', 1),
    line('Butter Chicken', 1),
    line('Dal Makhani', 1),
    line('Butter Naan', 5),
    line('Sweet Lassi', 2)
  ]),
  bill(117, 'T1', 'Ravi', 2, 'upi', [line('Chicken Dum Biryani', 2), line('Fresh Lime Soda', 2)]),
  bill(
    104,
    'T3',
    'Sneha',
    3,
    'upi',
    [line('Pindi Chole', 1), line('Lachha Paratha', 3), line('Jeera Rice', 1), line('Rasmalai', 3)],
    10
  ),
  bill(92, 'TA-1', 'Counter', 1, 'upi', [line('Veg Dum Biryani', 1), line('Gulab Jamun', 2)]),
  bill(78, 'T7', 'Ravi', 4, 'card', [
    line('Prawns Koliwada', 1),
    line('Malvani Fish Curry', 1),
    line('Butter Chicken', 1),
    line('Garlic Naan', 4),
    line('Jeera Rice', 1),
    line('Kokum Sharbat', 4)
  ]),
  bill(63, 'R4', 'Imran', 2, 'cash', [
    line('Pani Puri', 1),
    line('Dahi Batata Puri', 1),
    line('Cold Coffee', 2)
  ]),
  bill(49, 'T6', 'Sneha', 4, 'upi', [
    line('Paneer Butter Masala', 1),
    line('Kadai Veg', 1),
    line('Butter Naan', 4),
    line('Veg Dum Biryani', 1),
    line('Sweet Lassi', 4)
  ]),
  bill(33, 'T1', 'Ravi', 2, 'upi', [
    line('Egg Curry', 1),
    line('Tandoori Roti', 4),
    line('Masala Chai', 2)
  ]),
  bill(21, 'R2', 'Imran', 5, 'card', [
    line('Chicken 65', 2),
    line('Chicken Dum Biryani', 2),
    line('Mutton Biryani', 1),
    line('Kulfi Falooda', 2),
    line('Fresh Lime Soda', 5)
  ]),
  bill(9, 'TA-2', 'Counter', 1, 'upi', [line('Keema Pav', 1), line('Cutting Chai', 1)])
].reverse()

const summary: SalesSummary = {
  asOf: DEMO_NOW,
  hourly: [
    [8, 1240],
    [9, 3420],
    [10, 2860],
    [11, 1980],
    [12, 4650],
    [13, 8920],
    [14, 7340],
    [15, 2410],
    [16, 2180],
    [17, 3260],
    [18, 4870],
    [19, 8640],
    [20, 12660]
  ].map(([hour, amount]) => ({ hour, amount })),
  orders: 87,
  covers: 214,
  yesterdayNetSales: 57_210,
  topItems: [
    { name: 'Chicken Dum Biryani', qty: 38, revenue: 12_920, diet: 'nonveg' },
    { name: 'Butter Chicken', qty: 31, revenue: 11_780, diet: 'nonveg' },
    { name: 'Paneer Butter Masala', qty: 27, revenue: 8_640, diet: 'veg' },
    { name: 'Butter Naan', qty: 96, revenue: 5_760, diet: 'veg' },
    { name: 'Misal Pav', qty: 44, revenue: 5_720, diet: 'veg' },
    { name: 'Cutting Chai', qty: 126, revenue: 3_780, diet: 'veg' }
  ],
  paymentMix: [
    { mode: 'upi', amount: 37_370 },
    { mode: 'card', amount: 15_460 },
    { mode: 'cash', amount: 11_600 }
  ]
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
const wait = <T>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(clone(v)), ms))

export const demoApi: BistroApi = {
  getOutlet: () => wait(outlet),
  getMenu: () => wait(menu),
  getFloor: () => wait(tables),
  getInventory: () => wait(inventory),
  listBills: () => wait(bills),
  getSalesSummary: () => wait(summary),

  saveTableOrder: async (tableId, lines) => {
    const table = tables.find((t) => t.id === tableId)
    if (!table) throw new Error(`Unknown table ${tableId}`)
    table.order = clone(lines)
    if (lines.length && (table.status === 'free' || table.status === 'reserved')) {
      table.status = 'occupied'
      table.seatedAt = demoNow()
      table.guests = table.reservation?.guests ?? Math.min(2, table.seats)
      table.server = table.server ?? 'Ravi'
    }
    return wait(table, 40)
  },

  settleTable: async (tableId, paymentMode, discountPct) => {
    const table = tables.find((t) => t.id === tableId)
    if (!table || !table.order.length) throw new Error(`Nothing to bill on ${tableId}`)
    const b: Bill = {
      billNo: `KC/26-27/${String(billSeq++).padStart(5, '0')}`,
      tableLabel: table.label,
      server: table.server ?? 'Ravi',
      guests: table.guests ?? 1,
      createdAt: demoNow(),
      lines: clone(table.order),
      discountPct,
      paymentMode
    }
    bills.unshift(b)
    const { total } = computeTotals(b.lines, discountPct)
    summary.orders += 1
    summary.covers += b.guests
    summary.hourly[summary.hourly.length - 1].amount += total
    summary.paymentMix.find((p) => p.mode === paymentMode)!.amount += total
    Object.assign(table, { status: 'free', order: [], guests: undefined, seatedAt: undefined })
    return wait(b, 200)
  }
}
