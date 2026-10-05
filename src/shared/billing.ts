import type { OrderLine } from './models'

/** Restaurant service in India: 5% GST, split equally into CGST and SGST. */
export const CGST_RATE = 0.025
export const SGST_RATE = 0.025

export type BillTotals = {
  items: number
  subtotal: number
  discount: number
  taxable: number
  cgst: number
  sgst: number
  roundOff: number
  total: number
}

const r2 = (n: number) => Math.round(n * 100) / 100

export const computeTotals = (lines: OrderLine[], discountPct = 0): BillTotals => {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  const items = lines.reduce((sum, l) => sum + l.qty, 0)
  const discount = r2((subtotal * discountPct) / 100)
  const taxable = r2(subtotal - discount)
  const cgst = r2(taxable * CGST_RATE)
  const sgst = r2(taxable * SGST_RATE)
  const gross = taxable + cgst + sgst
  const total = Math.round(gross)
  return { items, subtotal, discount, taxable, cgst, sgst, roundOff: r2(total - gross), total }
}
