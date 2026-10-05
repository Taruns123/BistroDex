/**
 * Real (desktop) data path for the POS screens.
 *
 * State lives in a single JSON document under ~/BistroDex/bistrodex.json so the
 * till keeps working offline. The renderer never touches this directly: it goes
 * through the IPC channels registered in src/main/index.ts.
 */
import { computeTotals } from '@shared/billing'
import { Bill, DiningTable, InventoryItem, Menu, Outlet, SalesSummary } from '@shared/models'
import {
  GetFloor,
  GetInventory,
  GetMenu,
  GetOutlet,
  GetSalesSummary,
  ListBills,
  SaveTableOrder,
  SettleTable
} from '@shared/types'
import { ensureDir, pathExists, readJson, writeJson } from 'fs-extra'
import { homedir } from 'os'
import path from 'path'

type PosStore = {
  outlet: Outlet
  menu: Menu
  tables: DiningTable[]
  inventory: InventoryItem[]
  bills: Bill[]
}

const storeDir = path.join(homedir(), 'BistroDex')
const storeFile = path.join(storeDir, 'bistrodex.json')

const emptyStore = (): PosStore => ({
  outlet: { name: 'My Restaurant', tagline: '', address: '', phone: '', gstin: '', fssai: '' },
  menu: { categories: [], items: [] },
  tables: [],
  inventory: [],
  bills: []
})

const load = async (): Promise<PosStore> => {
  await ensureDir(storeDir)
  if (!(await pathExists(storeFile))) {
    await writeJson(storeFile, emptyStore(), { spaces: 2 })
  }
  return { ...emptyStore(), ...(await readJson(storeFile)) }
}

const save = (store: PosStore) => writeJson(storeFile, store, { spaces: 2 })

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const getOutlet: GetOutlet = async () => (await load()).outlet
export const getMenu: GetMenu = async () => (await load()).menu
export const getFloor: GetFloor = async () => (await load()).tables
export const getInventory: GetInventory = async () => (await load()).inventory
export const listBills: ListBills = async () =>
  (await load()).bills.sort((a, b) => b.createdAt - a.createdAt)

export const saveTableOrder: SaveTableOrder = async (tableId, lines) => {
  const store = await load()
  const table = store.tables.find((t) => t.id === tableId)
  if (!table) throw new Error(`Unknown table ${tableId}`)
  table.order = lines
  if (lines.length && table.status === 'free') {
    table.status = 'occupied'
    table.seatedAt = Date.now()
  }
  await save(store)
  return table
}

export const settleTable: SettleTable = async (tableId, paymentMode, discountPct) => {
  const store = await load()
  const table = store.tables.find((t) => t.id === tableId)
  if (!table || !table.order.length) throw new Error(`Nothing to bill on ${tableId}`)
  const bill: Bill = {
    billNo: `BD-${String(store.bills.length + 1).padStart(5, '0')}`,
    tableLabel: table.label,
    server: table.server ?? '',
    guests: table.guests ?? 1,
    createdAt: Date.now(),
    lines: table.order,
    discountPct,
    paymentMode
  }
  store.bills.push(bill)
  Object.assign(table, { status: 'free', order: [], guests: undefined, seatedAt: undefined })
  await save(store)
  return bill
}

export const getSalesSummary: GetSalesSummary = async () => {
  const store = await load()
  const since = startOfToday()
  const yesterday = since - 86_400_000
  const today = store.bills.filter((b) => b.createdAt >= since)
  const hourly = new Map<number, number>()
  const items = new Map<string, SalesSummary['topItems'][number]>()
  const mix = new Map<Bill['paymentMode'], number>()

  for (const bill of today) {
    const { total } = computeTotals(bill.lines, bill.discountPct)
    const hour = new Date(bill.createdAt).getHours()
    hourly.set(hour, (hourly.get(hour) ?? 0) + total)
    mix.set(bill.paymentMode, (mix.get(bill.paymentMode) ?? 0) + total)
    for (const l of bill.lines) {
      const it = items.get(l.name) ?? { name: l.name, qty: 0, revenue: 0, diet: l.diet }
      it.qty += l.qty
      it.revenue += l.qty * l.price
      items.set(l.name, it)
    }
  }

  return {
    asOf: Date.now(),
    hourly: [...hourly].map(([hour, amount]) => ({ hour, amount })).sort((a, b) => a.hour - b.hour),
    orders: today.length,
    covers: today.reduce((s, b) => s + b.guests, 0),
    yesterdayNetSales: store.bills
      .filter((b) => b.createdAt >= yesterday && b.createdAt < since)
      .reduce((s, b) => s + computeTotals(b.lines, b.discountPct).total, 0),
    topItems: [...items.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    paymentMix: [...mix].map(([mode, amount]) => ({ mode, amount }))
  }
}
