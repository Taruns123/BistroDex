import { isDemo, now } from '@renderer/api'
import { cn, dateLong, time } from '@renderer/lib/format'
import { go, Route, usePos } from '@renderer/state/pos'
import { ReactNode, useEffect, useState } from 'react'
import {
  LuBell,
  LuLayoutDashboard,
  LuLayoutGrid,
  LuPackage,
  LuReceipt,
  LuSearch,
  LuSettings,
  LuUtensilsCrossed,
  LuWifi
} from 'react-icons/lu'

const nav: { screen: Route['screen']; label: string; icon: ReactNode; path: string }[] = [
  { screen: 'dashboard', label: 'Today', icon: <LuLayoutDashboard />, path: 'dashboard' },
  { screen: 'register', label: 'Order', icon: <LuUtensilsCrossed />, path: 'register' },
  { screen: 'floor', label: 'Floor', icon: <LuLayoutGrid />, path: 'floor' },
  { screen: 'bills', label: 'Bills', icon: <LuReceipt />, path: 'bills' },
  { screen: 'inventory', label: 'Stock', icon: <LuPackage />, path: 'inventory' }
]

export const Logo = () => (
  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-chili-500 shadow-pay">
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
      {/* cloche */}
      <path d="M5 22h22" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M7.5 22a8.5 8.5 0 0 1 17 0" stroke="#fff" strokeWidth="2.6" />
      <circle cx="16" cy="10.5" r="1.9" fill="#fff" />
      <path
        d="M12 18.2a4.5 4.5 0 0 1 3-2.6"
        stroke="#FFE1D2"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </div>
)

export const NavRail = ({
  route,
  badges
}: {
  route: Route
  badges: Partial<Record<Route['screen'], number>>
}) => (
  <nav className="flex w-[92px] shrink-0 flex-col items-center bg-espresso py-5 text-white">
    <Logo />
    <div className="mt-8 flex w-full flex-1 flex-col items-center gap-1.5 px-2.5">
      {nav.map((n) => {
        const active = route.screen === n.screen
        return (
          <button
            key={n.screen}
            onClick={() => go(n.path)}
            className={cn(
              'relative flex h-[68px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl text-[12px] font-semibold transition',
              active
                ? 'bg-espresso-3 text-white'
                : 'text-white/55 hover:bg-espresso-2 hover:text-white/90'
            )}
          >
            {active && (
              <span className="absolute left-[-10px] top-4 h-9 w-1 rounded-r-full bg-chili-500" />
            )}
            <span className={cn('text-[22px]', active && 'text-chili-400')}>{n.icon}</span>
            {n.label}
            {!!badges[n.screen] && (
              <span className="num absolute right-3 top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-chili-500 px-1 text-[10px] font-bold text-white">
                {badges[n.screen]}
              </span>
            )}
          </button>
        )
      })}
    </div>
    {isDemo && (
      <span
        title="Running on built-in sample data (no database)"
        className="mb-3 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60"
      >
        Demo
      </span>
    )}
    <button className="flex h-[60px] w-[68px] flex-col items-center justify-center gap-1 rounded-2xl text-[12px] font-semibold text-white/55 hover:bg-espresso-2">
      <LuSettings className="text-[20px]" />
      Settings
    </button>
  </nav>
)

const useClock = () => {
  const [t, setT] = useState(now())
  useEffect(() => {
    const id = setInterval(() => setT(now()), 15_000)
    return () => clearInterval(id)
  }, [])
  return t
}

export const TopBar = ({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle?: ReactNode
  children?: ReactNode
}) => {
  const { outlet } = usePos()
  const t = useClock()
  return (
    <header className="drag flex h-[76px] shrink-0 items-center gap-6 border-b border-line bg-cream/80 px-7 backdrop-blur">
      <div className="min-w-0">
        <h1 className="font-display text-[26px] font-extrabold leading-none tracking-tight">
          {title}
        </h1>
        <p className="mt-1.5 truncate text-[13px] text-ink-3">
          {subtitle ?? (
            <>
              {outlet?.name} · {dateLong(t)}
            </>
          )}
        </p>
      </div>
      <div className="flex-1">{children}</div>
      <div className="flex items-center gap-3">
        <label className="hidden h-11 w-[260px] items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm text-ink-3 xl:flex">
          <LuSearch className="text-base" />
          <input
            placeholder="Search items, bills, tables"
            className="w-full bg-transparent text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="rounded-md bg-sand px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">
            ⌘K
          </kbd>
        </label>
        <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-semibold">
          <LuWifi className="text-herb-500" />
          <span className="num">{time(t)}</span>
        </div>
        <button className="relative grid h-11 w-11 place-items-center rounded-xl border border-line bg-paper text-lg text-ink-2">
          <LuBell />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-chili-500 ring-2 ring-paper" />
        </button>
        <div className="flex items-center gap-2.5 pl-1">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-saffron-100 font-display text-sm font-bold text-saffron-700">
            AK
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Anita K.</div>
            <div className="text-xs text-ink-3">Manager · Dinner shift</div>
          </div>
        </div>
      </div>
    </header>
  )
}
