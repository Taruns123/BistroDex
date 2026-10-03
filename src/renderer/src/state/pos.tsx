import { api } from '@renderer/api'
import type {
  Bill,
  DiningTable,
  InventoryItem,
  Menu,
  OrderLine,
  Outlet,
  PaymentMode,
  SalesSummary
} from '@shared/models'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

type PosState = {
  ready: boolean
  outlet?: Outlet
  menu: Menu
  tables: DiningTable[]
  bills: Bill[]
  inventory: InventoryItem[]
  summary?: SalesSummary
  setOrder: (tableId: string, lines: OrderLine[]) => void
  sendToKitchen: (tableId: string) => void
  settle: (tableId: string, mode: PaymentMode, discountPct: number) => Promise<Bill>
}

const PosContext = createContext<PosState | null>(null)

export const PosProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false)
  const [outlet, setOutlet] = useState<Outlet>()
  const [menu, setMenu] = useState<Menu>({ categories: [], items: [] })
  const [tables, setTables] = useState<DiningTable[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [summary, setSummary] = useState<SalesSummary>()

  useEffect(() => {
    Promise.all([
      api.getOutlet(),
      api.getMenu(),
      api.getFloor(),
      api.listBills(),
      api.getInventory(),
      api.getSalesSummary()
    ]).then(([o, m, t, b, i, s]) => {
      setOutlet(o)
      setMenu(m)
      setTables(t)
      setBills(b)
      setInventory(i)
      setSummary(s)
      setReady(true)
    })
  }, [])

  const patchTable = (updated: DiningTable) =>
    setTables((ts) => ts.map((t) => (t.id === updated.id ? updated : t)))

  const setOrder = useCallback((tableId: string, lines: OrderLine[]) => {
    // optimistic: the till must never wait on disk
    setTables((ts) => ts.map((t) => (t.id === tableId ? { ...t, order: lines } : t)))
    api.saveTableOrder(tableId, lines).then(patchTable)
  }, [])

  const sendToKitchen = useCallback(
    (tableId: string) => {
      const table = tables.find((t) => t.id === tableId)
      if (!table) return
      setOrder(
        tableId,
        table.order.map((l) => ({ ...l, sentToKitchen: true }))
      )
    },
    [tables, setOrder]
  )

  const settle = useCallback(async (tableId: string, mode: PaymentMode, discountPct: number) => {
    const bill = await api.settleTable(tableId, mode, discountPct)
    const [t, s] = await Promise.all([api.getFloor(), api.getSalesSummary()])
    setTables(t)
    setSummary(s)
    setBills((bs) => [bill, ...bs])
    return bill
  }, [])

  return (
    <PosContext.Provider
      value={{
        ready,
        outlet,
        menu,
        tables,
        bills,
        inventory,
        summary,
        setOrder,
        sendToKitchen,
        settle
      }}
    >
      {children}
    </PosContext.Provider>
  )
}

export const usePos = () => {
  const ctx = useContext(PosContext)
  if (!ctx) throw new Error('usePos must be used inside <PosProvider>')
  return ctx
}

/* ---------------- tiny hash router ---------------- */

export type Route =
  | { screen: 'dashboard' }
  | { screen: 'register'; tableId?: string }
  | { screen: 'floor' }
  | { screen: 'inventory' }
  | { screen: 'bills'; billNo?: string }

const parse = (hash: string): Route => {
  const [screen, param] = hash.replace(/^#\/?/, '').split('/')
  switch (screen) {
    case 'register':
      return { screen, tableId: param }
    case 'floor':
    case 'inventory':
      return { screen }
    case 'bills':
      return { screen, billNo: param ? decodeURIComponent(param) : undefined }
    default:
      return { screen: 'dashboard' }
  }
}

export const go = (path: string) => {
  window.location.hash = `#/${path}`
}

export const useRoute = () => {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
