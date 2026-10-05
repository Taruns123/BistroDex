import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...args: ClassValue[]) => twMerge(clsx(...args))

const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** ₹1,23,456 — Indian digit grouping. */
export const rupees = (n: number, decimals = false) => `₹${(decimals ? inr2 : inr0).format(n)}`
export const num = (n: number) => inr0.format(n)

export const time = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

export const dateLong = (ms: number) =>
  new Date(ms).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

export const dateShort = (ms: number) =>
  new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const elapsed = (from: number, to: number) => {
  const m = Math.max(0, Math.round((to - from) / 60_000))
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

export const hourLabel = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? 'a' : 'p'}`
