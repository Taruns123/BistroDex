import { NavRail, TopBar } from '@renderer/components/Shell'
import { Bills } from '@renderer/screens/Bills'
import { Dashboard } from '@renderer/screens/Dashboard'
import { Floor } from '@renderer/screens/Floor'
import { Inventory } from '@renderer/screens/Inventory'
import { Register } from '@renderer/screens/Register'
import { usePos, useRoute } from '@renderer/state/pos'
import { Logo } from '@renderer/components/Shell'

const titles = {
  dashboard: 'Good evening, Anita',
  register: 'New order',
  floor: 'Floor',
  bills: 'Bills',
  inventory: 'Stock'
} as const

const App = () => {
  const route = useRoute()
  const { ready, tables, inventory, outlet } = usePos()

  if (!ready) {
    return (
      <div className="grid h-full place-items-center bg-espresso">
        <div className="flex flex-col items-center gap-4 text-white/70">
          <Logo />
          <span className="text-sm">Opening the till…</span>
        </div>
      </div>
    )
  }

  const billing = tables.filter((t) => t.status === 'billing').length
  const low = inventory.filter((i) => i.onHand <= i.reorderAt).length
  const table =
    route.screen === 'register' ? tables.find((t) => t.id === (route.tableId ?? 't4')) : undefined

  return (
    <div className="flex h-full">
      <NavRail route={route} badges={{ floor: billing, inventory: low }} />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={
            table
              ? `${table.label} · ${table.order.length ? 'Running order' : 'New order'}`
              : titles[route.screen]
          }
          subtitle={table ? `${outlet?.name} · ${table.area} · dine-in` : undefined}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          {route.screen === 'dashboard' && <Dashboard />}
          {route.screen === 'register' && <Register tableId={route.tableId} />}
          {route.screen === 'floor' && <Floor />}
          {route.screen === 'bills' && <Bills billNo={route.billNo} />}
          {route.screen === 'inventory' && <Inventory />}
        </div>
      </main>
    </div>
  )
}

export default App
