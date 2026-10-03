import { now } from '@renderer/api'
import { Button, Chip, DietMark, StatusChip, statusMeta } from '@renderer/components/ui'
import { cn, elapsed, rupees } from '@renderer/lib/format'
import { go, usePos } from '@renderer/state/pos'
import { computeTotals } from '@shared/billing'
import type { DiningTable, TableStatus } from '@shared/models'
import { useState } from 'react'
import { LuCalendarClock, LuClock, LuShoppingBag, LuUsers, LuUtensilsCrossed } from 'react-icons/lu'

const areas: DiningTable['area'][] = ['Indoor', 'Terrace', 'Counter']

const Chairs = ({ n, active }: { n: number; active: boolean }) => (
  <div className="pointer-events-none flex justify-center gap-3">
    {Array.from({ length: n }, (_, i) => (
      <span key={i} className={cn('h-1 w-6 rounded-full', active ? 'bg-ink/20' : 'bg-sand-2')} />
    ))}
  </div>
)

const TableTile = ({
  table,
  selected,
  onClick
}: {
  table: DiningTable
  selected: boolean
  onClick: () => void
}) => {
  const t = now()
  const total = computeTotals(table.order).total
  const busy = table.status === 'occupied' || table.status === 'billing'
  const counter = table.area === 'Counter'
  const late = busy && table.seatedAt && t - table.seatedAt > 45 * 60_000
  return (
    <div className={cn('flex flex-col gap-1', table.seats >= 6 && 'col-span-2')}>
      {!counter && <Chairs n={Math.ceil(table.seats / 2)} active={busy} />}
      <button
        onClick={onClick}
        className={cn(
          'relative flex h-[112px] flex-col rounded-[20px] border-2 px-3.5 py-3 text-left transition active:scale-[0.99]',
          statusMeta[table.status].tile,
          selected && 'border-espresso ring-4 ring-espresso/10'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="whitespace-nowrap font-display text-[24px] font-extrabold leading-none tracking-tight">
            {table.label}
          </span>
          <StatusChip status={table.status} className="px-2 py-0.5 text-[11px]" />
        </div>
        {busy && (
          <>
            <span className="num mt-auto font-display text-[20px] font-bold leading-none">
              {rupees(total)}
            </span>
            <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-2">
              <span className="inline-flex items-center gap-1">
                {counter ? <LuShoppingBag /> : <LuUsers />}
                {counter ? 'Takeaway' : `${table.guests}/${table.seats}`}
              </span>
              <span
                className={cn('inline-flex items-center gap-1', late && 'font-bold text-chili-700')}
              >
                <LuClock /> {elapsed(table.seatedAt ?? t, t)}
              </span>
            </div>
          </>
        )}
        {table.status === 'reserved' && table.reservation && (
          <div className="mt-auto text-[12px] leading-snug text-slateblue-700">
            <div className="font-semibold">
              {table.reservation.name} · {table.reservation.guests} pax
            </div>
            <div className="flex items-center gap-1">
              <LuCalendarClock /> {table.reservation.time}
            </div>
          </div>
        )}
        {table.status === 'free' && (
          <div className="mt-auto text-[12px] text-ink-3">
            {counter ? 'Ready for next' : `Seats ${table.seats} · set`}
          </div>
        )}
      </button>
      {!counter && <Chairs n={Math.floor(table.seats / 2)} active={busy} />}
    </div>
  )
}

export const Floor = () => {
  const { tables } = usePos()
  const [area, setArea] = useState<'All' | DiningTable['area']>('All')
  const [selectedId, setSelectedId] = useState('t5')
  const selected = tables.find((t) => t.id === selectedId)
  const t = now()
  const count = (s: TableStatus) => tables.filter((tb) => tb.status === s).length
  const totals = selected ? computeTotals(selected.order) : undefined
  const servers = Object.values(
    tables
      .filter((tb) => tb.server && tb.area !== 'Counter' && tb.order.length)
      .reduce<Record<string, { name: string; tables: string[]; running: number }>>((acc, tb) => {
        const sv = (acc[tb.server!] ??= { name: tb.server!, tables: [], running: 0 })
        sv.tables.push(tb.label)
        sv.running += computeTotals(tb.order).total
        return acc
      }, {})
  )

  return (
    <div className="flex h-full min-h-0">
      <div className="min-w-0 flex-1 overflow-y-auto px-6 pb-8 pt-5">
        <div className="mb-4 flex items-center gap-2">
          {(['All', ...areas] as const).map((a) => (
            <Chip
              key={a}
              active={area === a}
              onClick={() => setArea(a)}
              count={a === 'All' ? tables.length : tables.filter((tb) => tb.area === a).length}
            >
              {a === 'Counter' ? 'Takeaway' : a}
            </Chip>
          ))}
          <div className="ml-auto flex items-center gap-4 text-[13px] text-ink-2">
            {(['free', 'occupied', 'billing', 'reserved'] as TableStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={cn('h-2.5 w-2.5 rounded-full', statusMeta[s].dot)} />
                {statusMeta[s].label} <b className="num">{count(s)}</b>
              </span>
            ))}
          </div>
        </div>
        {areas
          .filter((a) => area === 'All' || area === a)
          .map((a) => (
            <section key={a} className="mb-4">
              <div className="mb-2 flex items-baseline gap-2">
                <h2 className="font-display text-[17px] font-bold">
                  {a === 'Counter' ? 'Takeaway counter' : a}
                </h2>
                <span className="text-[13px] text-ink-3">
                  {tables.filter((tb) => tb.area === a && tb.status !== 'free').length} of{' '}
                  {tables.filter((tb) => tb.area === a).length} in use
                </span>
              </div>
              <div className="grid grid-cols-5 gap-x-4 gap-y-2">
                {tables
                  .filter((tb) => tb.area === a)
                  .map((tb) => (
                    <TableTile
                      key={tb.id}
                      table={tb}
                      selected={tb.id === selectedId}
                      onClick={() => setSelectedId(tb.id)}
                    />
                  ))}
              </div>
            </section>
          ))}
      </div>

      <aside className="flex w-[340px] shrink-0 flex-col border-l border-line bg-paper">
        {selected && (
          <>
            <div className="border-b border-line p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-[34px] font-extrabold leading-none">
                  {selected.label}
                </span>
                <StatusChip status={selected.status} />
              </div>
              <div className="mt-2 text-[13px] text-ink-3">
                {selected.area} · seats {selected.seats}
                {selected.seatedAt && ` · seated ${elapsed(selected.seatedAt, t)}`}
                {selected.server && ` · ${selected.server}`}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {selected.order.length ? (
                <ul className="space-y-2.5">
                  {selected.order.map((l, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[14px]">
                      <DietMark diet={l.diet} />
                      <span className="num w-6 text-ink-3">{l.qty}×</span>
                      <span className="flex-1 truncate font-medium">{l.name}</span>
                      <span className="num text-ink-2">{rupees(l.qty * l.price)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="pt-10 text-center text-sm text-ink-3">
                  {selected.reservation
                    ? `Held for ${selected.reservation.name} at ${selected.reservation.time}`
                    : 'No open order on this table.'}
                </div>
              )}
            </div>
            <div className="border-t border-line px-6 py-4">
              <div className="eyebrow mb-2.5">Stewards on the floor</div>
              <div className="space-y-2">
                {servers.map((sv) => (
                  <div key={sv.name} className="flex items-center gap-3 text-[13.5px]">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-sand font-display text-xs font-bold text-ink-2">
                      {sv.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="flex-1 font-semibold">{sv.name}</span>
                    <span className="text-ink-3">{sv.tables.join(', ')}</span>
                    <span className="num w-16 text-right font-semibold">{rupees(sv.running)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2 border-t border-line bg-cream/60 p-6">
              {totals && !!totals.items && (
                <div className="num mb-3 flex items-baseline justify-between">
                  <span className="text-[13px] text-ink-3">
                    {totals.items} items · incl. 5% GST
                  </span>
                  <span className="font-display text-[26px] font-extrabold">
                    {rupees(totals.total)}
                  </span>
                </div>
              )}
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                icon={<LuUtensilsCrossed />}
                onClick={() => go(`register/${selected.id}`)}
              >
                {selected.order.length ? 'Open order' : 'Seat guests & order'}
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
