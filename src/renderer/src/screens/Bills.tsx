import { Button, Chip } from '@renderer/components/ui'
import { cn, dateShort, rupees, time } from '@renderer/lib/format'
import { go, usePos } from '@renderer/state/pos'
import { computeTotals } from '@shared/billing'
import type { Bill, Outlet, PaymentMode } from '@shared/models'
import { useState } from 'react'
import { LuMessageSquare, LuPrinter, LuUndo2 } from 'react-icons/lu'

const payLabel: Record<PaymentMode, string> = { upi: 'UPI', card: 'Card', cash: 'Cash' }
const payChip: Record<PaymentMode, string> = {
  upi: 'bg-chili-50 text-chili-700',
  card: 'bg-slateblue-50 text-slateblue-700',
  cash: 'bg-saffron-50 text-saffron-700'
}

const Row = ({
  l,
  r,
  strong,
  muted
}: {
  l: string
  r: string
  strong?: boolean
  muted?: boolean
}) => (
  <div
    className={cn('flex justify-between', strong && 'font-bold text-ink', muted && 'text-ink-3')}
  >
    <span>{l}</span>
    <span className="num">{r}</span>
  </div>
)

export const Receipt = ({ bill, outlet }: { bill: Bill; outlet?: Outlet }) => {
  const t = computeTotals(bill.lines, bill.discountPct)
  return (
    <div className="relative w-[380px] bg-white px-7 pb-8 pt-7 font-mono text-[12.5px] leading-relaxed text-ink-2 shadow-lift">
      {/* zig-zag tear */}
      <div
        className="absolute inset-x-0 -bottom-2 h-2"
        style={{
          background:
            'linear-gradient(-45deg, transparent 6px, #fff 0) 0 0/12px 12px repeat-x, linear-gradient(45deg, transparent 6px, #fff 0) 0 0/12px 12px repeat-x'
        }}
      />
      <div className="text-center">
        <div className="font-display text-[19px] font-extrabold tracking-tight text-ink">
          {outlet?.name}
        </div>
        <div className="mt-1 text-[11.5px]">{outlet?.address}</div>
        <div className="text-[11.5px]">Ph {outlet?.phone}</div>
        <div className="mt-1 text-[11px]">
          GSTIN {outlet?.gstin} · FSSAI {outlet?.fssai}
        </div>
        <div className="mt-3 border-y border-dashed border-ink-3/50 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
          Tax invoice
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 text-[11.5px]">
        <span>Bill: {bill.billNo}</span>
        <span className="text-right">{dateShort(bill.createdAt)}</span>
        <span>
          Table {bill.tableLabel} · {bill.guests} pax
        </span>
        <span className="text-right">{time(bill.createdAt)}</span>
        <span>Steward: {bill.server}</span>
        <span className="text-right">Dine-in</span>
      </div>
      <div className="mt-3 border-t border-dashed border-ink-3/50 pt-2">
        <div className="flex text-[11px] font-bold uppercase text-ink">
          <span className="flex-1">Item</span>
          <span className="w-9 text-right">Qty</span>
          <span className="w-14 text-right">Rate</span>
          <span className="w-16 text-right">Amt</span>
        </div>
        {bill.lines.map((l, i) => (
          <div key={i} className="num flex">
            <span className="flex-1 truncate pr-2 text-ink">{l.name}</span>
            <span className="w-9 text-right">{l.qty}</span>
            <span className="w-14 text-right">{l.price}</span>
            <span className="w-16 text-right text-ink">{(l.price * l.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 space-y-0.5 border-t border-dashed border-ink-3/50 pt-2">
        <Row l={`Subtotal (${t.items} items)`} r={t.subtotal.toFixed(2)} />
        {!!t.discount && (
          <Row l={`Discount ${bill.discountPct}%`} r={`-${t.discount.toFixed(2)}`} />
        )}
        <Row l="CGST @ 2.5%" r={t.cgst.toFixed(2)} />
        <Row l="SGST @ 2.5%" r={t.sgst.toFixed(2)} />
        <Row l="Round off" r={t.roundOff.toFixed(2)} muted />
      </div>
      <div className="mt-2 flex items-baseline justify-between border-y border-dashed border-ink-3/50 py-2 text-ink">
        <span className="text-[13px] font-bold uppercase tracking-wider">Grand total</span>
        <span className="num font-display text-[22px] font-extrabold">{rupees(t.total)}</span>
      </div>
      <div className="mt-2 text-[11.5px]">
        Paid via {payLabel[bill.paymentMode]}
        {bill.paymentMode === 'upi' && ' · Ref 4271 8830 1196'}
      </div>
      <div className="mt-4 text-center text-[11.5px]">
        GST on restaurant service @5% (SAC 996331)
        <br />
        Thank you — see you again soon!
      </div>
    </div>
  )
}

export const Bills = ({ billNo }: { billNo?: string }) => {
  const { bills, outlet } = usePos()
  const [filter, setFilter] = useState<'all' | PaymentMode>('all')
  const list = bills.filter((b) => filter === 'all' || b.paymentMode === filter)
  const selected = bills.find((b) => b.billNo === billNo) ?? list[0]
  const total = list.reduce((s, b) => s + computeTotals(b.lines, b.discountPct).total, 0)

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-[520px] shrink-0 flex-col border-r border-line">
        <div className="flex items-center gap-2 px-6 pb-3 pt-5">
          {(['all', 'upi', 'card', 'cash'] as const).map((f) => (
            <Chip
              key={f}
              active={filter === f}
              onClick={() => setFilter(f)}
              count={f === 'all' ? bills.length : bills.filter((b) => b.paymentMode === f).length}
            >
              {f === 'all' ? 'All bills' : payLabel[f]}
            </Chip>
          ))}
        </div>
        <div className="flex items-center justify-between px-6 pb-2 text-[13px] text-ink-3">
          <span>Dinner service · newest first</span>
          <span className="num">
            Total <b className="font-semibold text-ink">{rupees(total)}</b>
          </span>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-6 pb-6">
          {list.map((b) => {
            const t = computeTotals(b.lines, b.discountPct)
            const active = selected?.billNo === b.billNo
            return (
              <button
                key={b.billNo}
                onClick={() => go(`bills/${encodeURIComponent(b.billNo)}`)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-espresso bg-espresso text-white'
                    : 'border-line bg-paper shadow-card hover:border-ink-3/40'
                )}
              >
                <span
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-[13px] font-bold',
                    active ? 'bg-white/10' : 'bg-sand'
                  )}
                >
                  {b.tableLabel}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="num text-[14px] font-semibold">{b.billNo}</div>
                  <div className={cn('truncate text-xs', active ? 'text-white/60' : 'text-ink-3')}>
                    {time(b.createdAt)} · {b.server} ·{' '}
                    {b.lines
                      .map((l) => l.name)
                      .slice(0, 2)
                      .join(', ')}
                    {b.lines.length > 2 ? ` +${b.lines.length - 2}` : ''}
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-bold',
                    active ? 'bg-white/15 text-white' : payChip[b.paymentMode]
                  )}
                >
                  {payLabel[b.paymentMode]}
                </span>
                <span className="num w-[72px] text-right text-[15px] font-bold">
                  {rupees(t.total)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,#E2D6C6_1px,transparent_0)] [background-size:18px_18px]">
          <div className="flex justify-center py-8">
            {selected && <Receipt bill={selected} outlet={outlet} />}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 border-t border-line bg-paper px-6 py-4">
          <Button size="lg" icon={<LuPrinter />} variant="dark">
            Reprint
          </Button>
          <Button size="lg" icon={<LuMessageSquare />}>
            Send on WhatsApp
          </Button>
          <Button size="lg" icon={<LuUndo2 />} variant="ghost">
            Refund
          </Button>
        </div>
      </div>
    </div>
  )
}
