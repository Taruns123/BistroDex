import { now } from '@renderer/api'
import { Button, Chip } from '@renderer/components/ui'
import { cn, num, rupees } from '@renderer/lib/format'
import { usePos } from '@renderer/state/pos'
import type { InventoryItem } from '@shared/models'
import { useState } from 'react'
import { LuAlertTriangle, LuCheckCircle2, LuPackagePlus, LuSearch, LuTruck } from 'react-icons/lu'

type Level = 'critical' | 'low' | 'ok'
const level = (i: InventoryItem): Level =>
  i.onHand / i.par < 0.15 ? 'critical' : i.onHand <= i.reorderAt ? 'low' : 'ok'

const levelMeta: Record<Level, { label: string; chip: string; bar: string }> = {
  critical: { label: 'Critical', chip: 'bg-chili-600 text-white', bar: 'bg-chili-600' },
  low: { label: 'Reorder', chip: 'bg-saffron-100 text-saffron-700', bar: 'bg-saffron-500' },
  ok: { label: 'In stock', chip: 'bg-herb-50 text-herb-700', bar: 'bg-herb-500' }
}

const daysLabel = (ms: number) => {
  const d = Math.round((now() - ms) / 86_400_000)
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`
}

const Stat = ({
  label,
  value,
  foot,
  tone
}: {
  label: string
  value: string
  foot: string
  tone?: string
}) => (
  <div className="card p-5">
    <div className="eyebrow">{label}</div>
    <div
      className={cn(
        'num mt-2 font-display text-[30px] font-extrabold leading-none tracking-tight',
        tone
      )}
    >
      {value}
    </div>
    <div className="mt-2 text-[13px] text-ink-3">{foot}</div>
  </div>
)

export const Inventory = () => {
  const { inventory } = usePos()
  const [filter, setFilter] = useState<'all' | 'attention' | InventoryItem['category']>('attention')
  const [query, setQuery] = useState('')

  const categories = [...new Set(inventory.map((i) => i.category))]
  const attention = inventory.filter((i) => level(i) !== 'ok')
  const critical = inventory.filter((i) => level(i) === 'critical')
  const value = inventory.reduce((s, i) => s + i.onHand * i.costPerUnit, 0)
  const reorderCost = attention.reduce((s, i) => s + (i.par - i.onHand) * i.costPerUnit, 0)

  const rows = inventory
    .filter((i) =>
      filter === 'all' ? true : filter === 'attention' ? level(i) !== 'ok' : i.category === filter
    )
    .filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.onHand / a.par - b.onHand / b.par)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid grid-cols-4 gap-5">
        <Stat
          label="Items tracked"
          value={String(inventory.length)}
          foot={`${categories.length} categories · counted at 7 AM`}
        />
        <Stat
          label="Below reorder level"
          value={String(attention.length)}
          foot="Raise POs before 11 PM cut-off"
          tone="text-saffron-700"
        />
        <Stat
          label="Critical"
          value={String(critical.length)}
          foot={critical.map((c) => c.name.split(' (')[0]).join(', ')}
          tone="text-chili-600"
        />
        <Stat
          label="Stock on hand"
          value={rupees(value)}
          foot={`Top-up to par ≈ ${rupees(reorderCost)}`}
        />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Chip
            active={filter === 'attention'}
            onClick={() => setFilter('attention')}
            count={attention.length}
          >
            Needs attention
          </Chip>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')} count={inventory.length}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {c}
            </Chip>
          ))}
          <label className="ml-auto flex h-11 w-[220px] items-center gap-2 rounded-xl border border-line bg-cream px-3 text-ink-3">
            <LuSearch />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find ingredient"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        </div>
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="eyebrow border-b border-line bg-cream/60 [&>th]:px-5 [&>th]:py-3 [&>th]:font-semibold">
              <th>Ingredient</th>
              <th className="w-[300px]">Stock vs par</th>
              <th className="text-right">On hand</th>
              <th>Status</th>
              <th>Supplier</th>
              <th>Last restock</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((i) => {
              const lv = level(i)
              const pct = Math.min(100, (i.onHand / i.par) * 100)
              return (
                <tr
                  key={i.id}
                  className={cn('[&>td]:px-5 [&>td]:py-3.5', lv === 'critical' && 'bg-chili-50/60')}
                >
                  <td>
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-xs text-ink-3">{i.category}</div>
                  </td>
                  <td>
                    <div className="relative h-2.5 rounded-full bg-sand">
                      <div
                        className={cn('h-full rounded-full', levelMeta[lv].bar)}
                        style={{ width: `${Math.max(3, pct)}%` }}
                      />
                      <span
                        className="absolute -top-1 h-[18px] w-0.5 rounded-full bg-ink/50"
                        style={{ left: `${(i.reorderAt / i.par) * 100}%` }}
                        title={`Reorder at ${i.reorderAt} ${i.unit}`}
                      />
                    </div>
                    <div className="num mt-1.5 flex justify-between text-[11.5px] text-ink-3">
                      <span>{Math.round(pct)}% of par</span>
                      <span>
                        par {num(i.par)} {i.unit}
                      </span>
                    </div>
                  </td>
                  <td className="num text-right">
                    <span className="font-display text-[17px] font-bold">{i.onHand}</span>{' '}
                    <span className="text-ink-3">{i.unit}</span>
                  </td>
                  <td>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                        levelMeta[lv].chip
                      )}
                    >
                      {lv === 'ok' ? <LuCheckCircle2 /> : <LuAlertTriangle />}
                      {levelMeta[lv].label}
                    </span>
                  </td>
                  <td className="text-ink-2">{i.supplier}</td>
                  <td className="text-ink-3">{daysLabel(i.lastRestocked)}</td>
                  <td className="text-right">
                    {lv !== 'ok' ? (
                      <Button
                        className="h-10"
                        variant={lv === 'critical' ? 'primary' : 'secondary'}
                        icon={<LuTruck />}
                      >
                        Order {num(Math.ceil(i.par - i.onHand))} {i.unit}
                      </Button>
                    ) : (
                      <Button className="h-10" variant="ghost" icon={<LuPackagePlus />}>
                        Receive
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
