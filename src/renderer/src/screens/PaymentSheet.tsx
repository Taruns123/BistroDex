import { Button } from '@renderer/components/ui'
import { cn, rupees } from '@renderer/lib/format'
import { go, usePos } from '@renderer/state/pos'
import { computeTotals } from '@shared/billing'
import type { DiningTable, PaymentMode } from '@shared/models'
import { ReactNode, useState } from 'react'
import { LuBanknote, LuCheck, LuCreditCard, LuSmartphone, LuX } from 'react-icons/lu'

const modes: { id: PaymentMode; label: string; hint: string; icon: ReactNode }[] = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: <LuSmartphone /> },
  { id: 'card', label: 'Card', hint: 'Tap or insert on EDC', icon: <LuCreditCard /> },
  { id: 'cash', label: 'Cash', hint: 'Count change below', icon: <LuBanknote /> }
]

/** Deterministic faux QR so the UPI screen looks right without a real VPA. */
const FauxQr = ({ seed }: { seed: number }) => {
  const n = 25
  const cells: ReactNode[] = []
  let x = seed
  const finder = (r: number, c: number) =>
    [
      [0, 0],
      [0, n - 7],
      [n - 7, 0]
    ].some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7)
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      x = (x * 1103515245 + 12345) & 0x7fffffff
      if (!finder(r, c) && x % 100 < 47)
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />)
    }
  const eye = (cx: number, cy: number) => (
    <g key={`${cx}${cy}`}>
      <rect
        x={cx + 0.5}
        y={cy + 0.5}
        width="6"
        height="6"
        rx="1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect x={cx + 2} y={cy + 2} width="3" height="3" rx="0.6" />
    </g>
  )
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      className="h-full w-full text-espresso"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      {cells}
      {eye(0, 0)}
      {eye(n - 7, 0)}
      {eye(0, n - 7)}
    </svg>
  )
}

export const PaymentSheet = ({
  table,
  discountPct,
  onClose
}: {
  table: DiningTable
  discountPct: number
  onClose: () => void
}) => {
  const { settle, outlet } = usePos()
  const [mode, setMode] = useState<PaymentMode>('upi')
  const [busy, setBusy] = useState(false)
  const totals = computeTotals(table.order, discountPct)
  const tendered = Math.ceil(totals.total / 500) * 500

  const confirm = async () => {
    setBusy(true)
    const bill = await settle(table.id, mode, discountPct)
    go(`bills/${encodeURIComponent(bill.billNo)}`)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/45 backdrop-blur-[2px]">
      <div className="w-[760px] overflow-hidden rounded-[28px] bg-paper shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-7 py-5">
          <div>
            <div className="eyebrow">
              Settle {table.label} · {table.guests} guests
            </div>
            <div className="num mt-1 font-display text-[40px] font-extrabold leading-none tracking-tight">
              {rupees(totals.total)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-sand text-xl text-ink-2 hover:bg-sand-2"
          >
            <LuX />
          </button>
        </div>
        <div className="grid grid-cols-[1fr_280px] gap-6 p-7">
          <div className="space-y-3">
            {modes.map((m) => (
              <button
                key={m.id}
                data-mode={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'flex h-[76px] w-full items-center gap-4 rounded-2xl border-2 px-5 text-left transition',
                  mode === m.id
                    ? 'border-chili-500 bg-chili-50'
                    : 'border-line bg-paper hover:border-ink-3/40'
                )}
              >
                <span
                  className={cn(
                    'grid h-11 w-11 place-items-center rounded-xl text-xl',
                    mode === m.id ? 'bg-chili-600 text-white' : 'bg-sand text-ink-2'
                  )}
                >
                  {m.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-[16px] font-bold">{m.label}</span>
                  <span className="block text-[13px] text-ink-3">{m.hint}</span>
                </span>
                {mode === m.id && (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-chili-600 text-white">
                    <LuCheck />
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-sand/70 p-5 text-center">
            {mode === 'upi' && (
              <>
                <div className="h-[168px] w-[168px] rounded-xl bg-white p-2.5 shadow-card">
                  <FauxQr seed={totals.total} />
                </div>
                <div className="mt-3 text-sm font-semibold">Scan to pay {outlet?.name}</div>
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-saffron-500" /> Waiting for
                  confirmation…
                </div>
              </>
            )}
            {mode === 'card' && (
              <>
                <LuCreditCard className="text-5xl text-ink-3" />
                <div className="mt-3 text-sm font-semibold">Amount pushed to terminal</div>
                <div className="mt-0.5 text-xs text-ink-3">Pine Labs EDC · counter 1</div>
              </>
            )}
            {mode === 'cash' && (
              <div className="num w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-3">Tendered</span>
                  <b>{rupees(tendered)}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-3">Return change</span>
                  <b className="text-herb-700">{rupees(tendered - totals.total)}</b>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-line bg-cream/60 px-7 py-5">
          <div className="num flex-1 text-[13px] text-ink-3">
            Incl. CGST {rupees(totals.cgst, true)} + SGST {rupees(totals.sgst, true)}
            {discountPct ? ` · ${discountPct}% off` : ''}
          </div>
          <Button size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            variant="primary"
            className="min-w-[220px]"
            disabled={busy}
            onClick={confirm}
            icon={<LuCheck />}
          >
            Mark paid & close table
          </Button>
        </div>
      </div>
    </div>
  )
}
