import { now } from '@renderer/api'
import { DietMark, SectionTitle, statusMeta } from '@renderer/components/ui'
import { cn, elapsed, hourLabel, num, rupees } from '@renderer/lib/format'
import { go, usePos } from '@renderer/state/pos'
import { computeTotals } from '@shared/billing'
import type { PaymentMode, TableStatus } from '@shared/models'
import { useState } from 'react'
import {
  LuAlertTriangle,
  LuArrowUpRight,
  LuCalendarClock,
  LuChevronRight,
  LuClock,
  LuReceipt
} from 'react-icons/lu'

const OPEN_HOUR = 8
const CLOSE_HOUR = 23

const shortStatus: Record<TableStatus, string> = {
  occupied: 'dining',
  billing: 'billing',
  reserved: 'held',
  free: 'free'
}

const payLabel: Record<PaymentMode, string> = { upi: 'UPI', card: 'Card', cash: 'Cash' }
const payColor: Record<PaymentMode, string> = {
  upi: 'bg-pay-upi',
  card: 'bg-pay-card',
  cash: 'bg-pay-cash'
}

const Kpi = ({
  label,
  value,
  foot,
  accent
}: {
  label: string
  value: string
  foot: React.ReactNode
  accent?: boolean
}) => (
  <div
    className={cn(
      'card relative h-full overflow-hidden p-5',
      accent && 'border-espresso bg-espresso text-white'
    )}
  >
    <div className={cn('eyebrow', accent && 'text-white/60')}>{label}</div>
    <div className="num mt-2 font-display text-[34px] font-extrabold leading-none tracking-tight">
      {value}
    </div>
    <div className={cn('mt-3 text-[13px]', accent ? 'text-white/70' : 'text-ink-3')}>{foot}</div>
    {accent && (
      <svg
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-chili-500/25"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="10" />
      </svg>
    )}
  </div>
)

const HourlyChart = ({ hourly }: { hourly: { hour: number; amount: number }[] }) => {
  const [hover, setHover] = useState<number | null>(null)
  const current = new Date(now()).getHours()
  const byHour = new Map(hourly.map((h) => [h.hour, h.amount]))
  const max = 15_000
  const ticks = [0, 5_000, 10_000, 15_000]
  const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => OPEN_HOUR + i)

  return (
    <div className="relative h-[164px] pl-10">
      {ticks.map((t) => (
        <div
          key={t}
          className="absolute left-10 right-0 flex items-center"
          style={{ bottom: 24 + (t / max) * 136 }}
        >
          <span className="num absolute -left-10 w-8 text-right text-[11px] text-ink-3">
            {t === 0 ? '0' : `${t / 1000}k`}
          </span>
          <div className={cn('h-px w-full', t === 0 ? 'bg-line' : 'bg-line/60')} />
        </div>
      ))}
      <div className="absolute bottom-0 left-10 right-0 top-0 flex items-stretch gap-[2px]">
        {hours.map((h) => {
          const amount = byHour.get(h)
          const future = h > current
          const live = h === current
          return (
            <div
              key={h}
              className="relative flex flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHover(h)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex h-[136px] w-full items-end justify-center px-[3px]">
                {amount !== undefined ? (
                  <div
                    className={cn(
                      'w-full max-w-[34px] rounded-t-[4px] transition-colors',
                      live
                        ? 'bg-[repeating-linear-gradient(135deg,#E5592A_0_6px,#F07A4A_6px_9px)]'
                        : hover === h
                          ? 'bg-chili-600'
                          : 'bg-chili-500'
                    )}
                    style={{ height: `${(amount / max) * 100}%` }}
                  />
                ) : (
                  future && <div className="h-1 w-full max-w-[34px] rounded-full bg-sand-2" />
                )}
              </div>
              <div
                className={cn(
                  'num mt-2 h-4 text-[11px]',
                  live ? 'font-bold text-chili-600' : 'text-ink-3'
                )}
              >
                {hourLabel(h)}
              </div>
              {hover === h && amount !== undefined && (
                <div
                  className="pointer-events-none absolute z-10 -translate-y-2 whitespace-nowrap rounded-lg bg-espresso px-2.5 py-1.5 text-xs text-white shadow-lift"
                  style={{ bottom: 24 + (amount / max) * 136 }}
                >
                  <div className="font-semibold">
                    {hourLabel(h)}–{hourLabel(h + 1)}
                    {live && ' · so far'}
                  </div>
                  <div className="num text-white/80">{rupees(amount)}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const Dashboard = () => {
  const { summary, tables, inventory, bills } = usePos()
  if (!summary) return null

  const net = summary.hourly.reduce((s, h) => s + h.amount, 0)
  const delta = ((net - summary.yesterdayNetSales) / summary.yesterdayNetSales) * 100
  const peak = summary.hourly.reduce((a, b) => (b.amount > a.amount ? b : a))
  const lunchPeak = Math.max(
    ...summary.hourly.filter((h) => h.hour >= 11 && h.hour < 16).map((h) => h.amount)
  )
  const cash = summary.paymentMix.find((p) => p.mode === 'cash')?.amount ?? 0
  const counts = tables.reduce(
    (acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }),
    {} as Record<TableStatus, number>
  )
  const live = (counts.occupied ?? 0) + (counts.billing ?? 0)
  const mixTotal = summary.paymentMix.reduce((s, p) => s + p.amount, 0)
  const topMax = Math.max(...summary.topItems.map((t) => t.revenue))
  const low = inventory
    .filter((i) => i.onHand <= i.reorderAt)
    .sort((a, b) => a.onHand / a.par - b.onHand / b.par)
  const t = now()
  const attention = tables
    .filter(
      (tb) =>
        tb.status === 'billing' ||
        (tb.status === 'occupied' && tb.seatedAt && t - tb.seatedAt > 45 * 60_000)
    )
    .sort((a, b) => (a.seatedAt ?? 0) - (b.seatedAt ?? 0))
  const reservations = tables.filter((tb) => tb.status === 'reserved')

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-5">
      {/* KPIs */}
      <div className="col-span-3">
        <Kpi
          accent
          label="Net sales today"
          value={rupees(net)}
          foot={
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-herb-500/25 px-2 py-0.5 font-semibold text-[#9EE0B1]">
                <LuArrowUpRight /> {delta.toFixed(1)}%
              </span>
              vs {rupees(summary.yesterdayNetSales)} yesterday
            </span>
          }
        />
      </div>
      <div className="col-span-3">
        <Kpi
          label="Orders"
          value={num(summary.orders)}
          foot={
            <>
              <b className="num font-semibold text-ink">{summary.covers}</b> covers · {bills.length}{' '}
              bills since 6 PM
            </>
          }
        />
      </div>
      <div className="col-span-3">
        <Kpi
          label="Average ticket"
          value={rupees(net / summary.orders)}
          foot={
            <>
              <b className="num font-semibold text-ink">{rupees(net / summary.covers)}</b> per cover
              · peak {hourLabel(peak.hour)}
            </>
          }
        />
      </div>
      <div className="col-span-3">
        <div className="card h-full p-5">
          <div className="eyebrow">Tables in service</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="num font-display text-[34px] font-extrabold leading-none tracking-tight">
              {live}
            </span>
            <span className="text-sm text-ink-3">of {tables.length} open</span>
          </div>
          <div className="mt-3.5 flex h-2.5 gap-[2px] overflow-hidden rounded-full">
            {(['occupied', 'billing', 'reserved', 'free'] as TableStatus[]).map((s) => (
              <div key={s} className={statusMeta[s].dot} style={{ flex: counts[s] ?? 0 }} />
            ))}
          </div>
          <div className="mt-2.5 flex gap-3 whitespace-nowrap text-[12px] text-ink-3">
            {(['occupied', 'billing', 'reserved', 'free'] as TableStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1">
                <span className={cn('h-2 w-2 rounded-full', statusMeta[s].dot)} />
                <b className="num font-semibold text-ink">{counts[s] ?? 0}</b> {shortStatus[s]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sales by hour */}
      <section className="card col-span-8 p-5">
        <SectionTitle
          title="Sales by hour"
          hint={
            <>
              Lunch peaked at <b className="font-semibold text-ink-2">{rupees(lunchPeak)}</b>;
              dinner is running ahead
            </>
          }
          action={
            <div className="flex items-center gap-4 text-[12px] text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-chili-500" /> Settled
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[repeating-linear-gradient(135deg,#E5592A_0_3px,#F07A4A_3px_5px)]" />{' '}
                This hour
              </span>
            </div>
          }
        />
        <HourlyChart hourly={summary.hourly} />
      </section>

      {/* Payment mix */}
      <section className="card col-span-4 flex flex-col p-5">
        <SectionTitle
          title="Payment mix"
          hint={
            <>
              Expect <b className="num font-semibold text-ink-2">{rupees(cash + 2_000)}</b> in the
              drawer (incl. float)
            </>
          }
        />
        <div className="flex h-4 gap-[2px] overflow-hidden rounded-[4px]">
          {summary.paymentMix.map((p) => (
            <div
              key={p.mode}
              className={payColor[p.mode]}
              style={{ flex: p.amount }}
              title={`${payLabel[p.mode]} ${rupees(p.amount)}`}
            />
          ))}
        </div>
        <div className="mt-4 flex-1 divide-y divide-line">
          {summary.paymentMix.map((p) => (
            <div key={p.mode} className="flex items-center gap-3 py-2.5">
              <span className={cn('h-3 w-3 rounded-[3px]', payColor[p.mode])} />
              <span className="flex-1 text-sm font-semibold">{payLabel[p.mode]}</span>
              <span className="num text-sm text-ink-3">
                {Math.round((p.amount / mixTotal) * 100)}%
              </span>
              <span className="num w-20 text-right text-sm font-semibold">{rupees(p.amount)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top sellers */}
      <section className="card col-span-5 p-5">
        <SectionTitle inline title="Top sellers" hint="by revenue" />
        <ol className="space-y-[9px]">
          {summary.topItems.slice(0, 5).map((it, i) => (
            <li key={it.name} className="flex items-center gap-3">
              <span className="num w-4 text-right text-xs font-bold text-ink-3">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <DietMark diet={it.diet} />
                  <span className="truncate font-semibold">{it.name}</span>
                  <span className="num ml-auto shrink-0 text-ink-3">{it.qty} sold</span>
                  <span className="num w-[68px] shrink-0 text-right font-semibold">
                    {rupees(it.revenue)}
                  </span>
                </div>
                <div className="ml-[22px] mt-1.5 h-1.5 rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-chili-500"
                    style={{ width: `${(it.revenue / topMax) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Needs attention */}
      <section className="card col-span-4 p-5">
        <SectionTitle
          inline
          title="On the floor"
          hint="needs a nudge"
          action={
            <button
              onClick={() => go('floor')}
              className="inline-flex items-center text-[13px] font-semibold text-chili-600"
            >
              Floor <LuChevronRight />
            </button>
          }
        />
        <div className="space-y-2">
          {attention.slice(0, 3).map((tb) => {
            const { total } = computeTotals(tb.order)
            return (
              <button
                key={tb.id}
                onClick={() => go(`register/${tb.id}`)}
                className="flex w-full items-center gap-3 rounded-xl bg-sand/60 px-3 py-2 text-left hover:bg-sand"
              >
                <span
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl font-display text-sm font-bold',
                    tb.status === 'billing'
                      ? 'bg-saffron-100 text-saffron-700'
                      : 'bg-chili-100 text-chili-700'
                  )}
                >
                  {tb.label}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">
                    {tb.status === 'billing' ? 'Asked for the bill' : 'Seated a while'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-3">
                    {tb.status === 'billing' ? <LuReceipt /> : <LuClock />}
                    {elapsed(tb.seatedAt ?? t, t)} · {tb.guests} guests · {tb.server}
                  </div>
                </div>
                <span className="num text-sm font-semibold">{rupees(total)}</span>
              </button>
            )
          })}
          {reservations.slice(0, 1).map((tb) => (
            <div
              key={tb.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2 ring-1 ring-inset ring-line"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slateblue-50 text-lg text-slateblue-700">
                <LuCalendarClock />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {tb.reservation?.name} · {tb.reservation?.guests} pax
                </div>
                <div className="text-xs text-ink-3">
                  Arriving {tb.reservation?.time} · {tb.label} held
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Low stock */}
      <section className="card col-span-3 p-5">
        <SectionTitle
          inline
          title="Running low"
          hint={`${low.length} items`}
          action={
            <button
              onClick={() => go('inventory')}
              className="inline-flex items-center text-[13px] font-semibold text-chili-600"
            >
              Stock <LuChevronRight />
            </button>
          }
        />
        <ul className="space-y-3">
          {low.slice(0, 5).map((i) => {
            const critical = i.onHand / i.par < 0.15
            return (
              <li key={i.id}>
                <div className="flex items-center gap-1.5 text-[13px]">
                  {critical && <LuAlertTriangle className="shrink-0 text-chili-600" />}
                  <span className="truncate font-semibold">{i.name}</span>
                  <span className="num ml-auto shrink-0 text-ink-3">
                    {i.onHand} {i.unit}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-sand">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      critical ? 'bg-chili-600' : 'bg-saffron-500'
                    )}
                    style={{ width: `${Math.max(4, (i.onHand / i.par) * 100)}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
