import { now } from '@renderer/api'
import { Button, Chip, DietMark, StatusChip, Stepper } from '@renderer/components/ui'
import { cn, elapsed, rupees } from '@renderer/lib/format'
import { go, usePos } from '@renderer/state/pos'
import { computeTotals } from '@shared/billing'
import type { MenuItem, OrderLine } from '@shared/models'
import { useMemo, useState } from 'react'
import {
  LuArrowLeftRight,
  LuChefHat,
  LuFlame,
  LuPlus,
  LuPrinter,
  LuSearch,
  LuStickyNote,
  LuUsers
} from 'react-icons/lu'
import { PaymentSheet } from './PaymentSheet'

const DISCOUNTS = [0, 5, 10]

const MenuCard = ({ item, qty, onAdd }: { item: MenuItem; qty: number; onAdd: () => void }) => (
  <button
    disabled={!item.available}
    onClick={onAdd}
    className={cn(
      'group relative flex h-[134px] flex-col rounded-2xl border bg-paper p-3.5 text-left shadow-card transition active:scale-[0.98]',
      qty ? 'border-chili-400 ring-2 ring-chili-100' : 'border-line hover:border-ink-3/40',
      !item.available && 'cursor-not-allowed bg-sand/50 shadow-none'
    )}
  >
    <div className="flex items-center gap-2">
      <DietMark diet={item.diet} />
      {item.popular && item.available && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-saffron-50 px-1.5 py-0.5 text-[10.5px] font-bold text-saffron-700">
          <LuFlame /> Bestseller
        </span>
      )}
      {!item.available && (
        <span className="rounded-full bg-ink/80 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white">
          Sold out
        </span>
      )}
    </div>
    <div
      className={cn(
        'mt-2 line-clamp-2 text-[14.5px] font-semibold leading-snug',
        !item.available && 'text-ink-3 line-through decoration-ink-3/50'
      )}
    >
      {item.name}
    </div>
    <div className="mt-auto flex items-end justify-between">
      <span
        className={cn('num font-display text-[17px] font-bold', !item.available && 'text-ink-3')}
      >
        {rupees(item.price)}
      </span>
      {item.available &&
        (qty ? (
          <span className="num grid h-9 min-w-9 place-items-center rounded-xl bg-chili-600 px-2 text-sm font-bold text-white">
            ×{qty}
          </span>
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-ink-2 transition group-hover:bg-chili-600 group-hover:text-white">
            <LuPlus />
          </span>
        ))}
    </div>
  </button>
)

const LineRow = ({ line, onQty }: { line: OrderLine; onQty: (q: number) => void }) => (
  <div className="flex items-center gap-3 py-3">
    <DietMark diet={line.diet} className="mt-0.5 self-start" />
    <div className="min-w-0 flex-1">
      <div className="line-clamp-2 text-[14.5px] font-semibold leading-snug">{line.name}</div>
      <div className="num mt-0.5 text-xs text-ink-3">{rupees(line.price)} each</div>
      {line.note && (
        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-saffron-50 px-1.5 py-0.5 text-[11.5px] font-medium text-saffron-700">
          <LuStickyNote /> {line.note}
        </div>
      )}
    </div>
    <Stepper value={line.qty} onChange={onQty} />
    <div className="num w-[62px] text-right text-[14.5px] font-semibold">
      {rupees(line.price * line.qty)}
    </div>
  </div>
)

export const Register = ({ tableId = 't4' }: { tableId?: string }) => {
  const { menu, tables, setOrder, sendToKitchen } = usePos()
  const [category, setCategory] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [discount, setDiscount] = useState(0)
  const [paying, setPaying] = useState(false)

  const table = tables.find((t) => t.id === tableId) ?? tables[0]
  const lines = table?.order ?? []
  const totals = computeTotals(lines, discount)
  const qtyById = useMemo(() => {
    const m = new Map<string, number>()
    lines.forEach((l) => m.set(l.itemId, (m.get(l.itemId) ?? 0) + l.qty))
    return m
  }, [lines])

  const items = menu.items.filter(
    (i) =>
      (category === 'all' || i.categoryId === category) &&
      i.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const sections = menu.categories
    .map((c) => ({ ...c, items: items.filter((i) => i.categoryId === c.id) }))
    .filter((c) => c.items.length)

  if (!table) return null

  const add = (item: MenuItem) => {
    const existing = lines.find((l) => l.itemId === item.id && !l.sentToKitchen)
    setOrder(
      table.id,
      existing
        ? lines.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l))
        : [
            ...lines,
            { itemId: item.id, name: item.name, price: item.price, diet: item.diet, qty: 1 }
          ]
    )
  }
  const changeQty = (line: OrderLine, qty: number) =>
    setOrder(
      table.id,
      qty <= 0
        ? lines.filter((l) => l !== line)
        : lines.map((l) => (l === line ? { ...l, qty } : l))
    )

  const sent = lines.filter((l) => l.sentToKitchen)
  const fresh = lines.filter((l) => !l.sentToKitchen)
  const t = now()

  return (
    <div className="flex h-full min-h-0">
      {/* Menu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 px-6 pb-3 pt-5">
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5">
            <Chip className="px-3.5" active={category === 'all'} onClick={() => setCategory('all')}>
              All
            </Chip>
            {menu.categories.map((c) => (
              <Chip
                key={c.id}
                data-cat={c.id}
                className="px-3.5"
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              >
                {c.name}
              </Chip>
            ))}
          </div>
          <label className="flex h-11 w-11 shrink-0 items-center gap-2 overflow-hidden rounded-full border border-line bg-paper px-3.5 text-ink-3 transition-[width] focus-within:w-[220px] focus-within:border-chili-400">
            <LuSearch className="shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dish"
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        </div>
        <div data-menu-scroll className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-1">
          {sections.map((sec) => (
            <section key={sec.id} id={`sec-${sec.id}`} className="mb-5">
              {sections.length > 1 && (
                <h3 className="eyebrow mb-2.5 mt-1 flex items-center gap-2">
                  {sec.name}
                  <span className="h-px flex-1 bg-line" />
                </h3>
              )}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                {sec.items.map((i) => (
                  <MenuCard key={i.id} item={i} qty={qtyById.get(i.id) ?? 0} onAdd={() => add(i)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Current order */}
      <aside className="flex w-[420px] shrink-0 flex-col border-l border-line bg-paper">
        <div className="border-b border-line px-6 pb-4 pt-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-espresso font-display text-xl font-extrabold text-white">
                {table.label}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold">{table.area} table</span>
                  <StatusChip status={table.status} />
                </div>
                <div className="mt-1 flex items-center gap-3 text-[13px] text-ink-3">
                  <span className="inline-flex items-center gap-1">
                    <LuUsers /> {table.guests ?? 0} of {table.seats}
                  </span>
                  {table.seatedAt && <span>Seated {elapsed(table.seatedAt, t)}</span>}
                  {table.server && <span>· {table.server}</span>}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="h-10 px-3"
              icon={<LuArrowLeftRight />}
              onClick={() => go('floor')}
            >
              Switch
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {!lines.length && (
            <div className="grid h-full place-items-center text-center text-sm text-ink-3">
              <div>
                <LuChefHat className="mx-auto mb-2 text-3xl" />
                Tap dishes on the left to start this table’s order.
              </div>
            </div>
          )}
          {!!fresh.length && (
            <>
              <div className="sticky top-0 z-10 flex items-center justify-between bg-paper pb-1 pt-4">
                <span className="eyebrow text-chili-600">New · not yet sent</span>
                <span className="num text-xs font-semibold text-chili-600">
                  {fresh.reduce((s, l) => s + l.qty, 0)} items
                </span>
              </div>
              <div className="divide-y divide-line">
                {fresh.map((l, i) => (
                  <LineRow key={`f${l.itemId}${i}`} line={l} onQty={(q) => changeQty(l, q)} />
                ))}
              </div>
            </>
          )}
          {!!sent.length && (
            <>
              <div className="sticky top-0 z-10 flex items-center justify-between bg-paper pb-1 pt-4">
                <span className="eyebrow inline-flex items-center gap-1 text-herb-700">
                  <LuChefHat /> In the kitchen
                </span>
                <span className="text-xs text-ink-3">KOT #214</span>
              </div>
              <div className="divide-y divide-line opacity-[0.92]">
                {sent.map((l, i) => (
                  <LineRow key={`s${l.itemId}${i}`} line={l} onQty={(q) => changeQty(l, q)} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-line bg-cream/60 px-6 pb-5 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-ink-2">Discount</span>
            <div className="ml-auto flex gap-1 rounded-xl bg-sand p-1">
              {DISCOUNTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscount(d)}
                  className={cn(
                    'num h-8 rounded-lg px-3 text-[13px] font-semibold',
                    discount === d ? 'bg-paper text-ink shadow-card' : 'text-ink-3'
                  )}
                >
                  {d ? `${d}%` : 'None'}
                </button>
              ))}
            </div>
          </div>
          <dl className="num space-y-1.5 text-[13.5px]">
            <div className="flex justify-between text-ink-2">
              <dt>Subtotal · {totals.items} items</dt>
              <dd>{rupees(totals.subtotal, true)}</dd>
            </div>
            {!!totals.discount && (
              <div className="flex justify-between text-herb-700">
                <dt>Discount {discount}%</dt>
                <dd>−{rupees(totals.discount, true)}</dd>
              </div>
            )}
            <div className="flex justify-between text-ink-2">
              <dt>CGST 2.5%</dt>
              <dd>{rupees(totals.cgst, true)}</dd>
            </div>
            <div className="flex justify-between text-ink-2">
              <dt>SGST 2.5%</dt>
              <dd>{rupees(totals.sgst, true)}</dd>
            </div>
            <div className="flex justify-between text-ink-3">
              <dt>Round off</dt>
              <dd>
                {totals.roundOff >= 0 ? '+' : '−'}
                {rupees(Math.abs(totals.roundOff), true)}
              </dd>
            </div>
          </dl>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              icon={<LuChefHat />}
              disabled={!fresh.length}
              onClick={() => sendToKitchen(table.id)}
            >
              Send KOT{fresh.length ? ` · ${fresh.reduce((s, l) => s + l.qty, 0)}` : ''}
            </Button>
            <Button icon={<LuPrinter />} disabled={!lines.length}>
              Print bill
            </Button>
          </div>
          <button
            data-pay
            disabled={!lines.length}
            onClick={() => setPaying(true)}
            className="mt-2 flex h-16 w-full items-center justify-between rounded-2xl bg-chili-600 px-6 text-white shadow-pay transition hover:bg-chili-700 active:scale-[0.99] disabled:opacity-40"
          >
            <span className="text-[17px] font-bold">Charge</span>
            <span className="num font-display text-[26px] font-extrabold tracking-tight">
              {rupees(totals.total)}
            </span>
          </button>
        </div>
      </aside>

      {paying && (
        <PaymentSheet table={table} discountPct={discount} onClose={() => setPaying(false)} />
      )}
    </div>
  )
}
