import type { Currency, Invoice, InvoiceStatus, LineItem } from '@/types'

export const toMinor = (major: number): number => Math.round(major * 100)
export const toMajor = (minor: number): number => minor / 100

const formatters = new Map<Currency, Intl.NumberFormat>()

export function formatMoney(minor: number, currency: Currency = 'NGN'): string {
  let f = formatters.get(currency)
  if (!f) {
    f = new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2 })
    formatters.set(currency, f)
  }
  return f.format(toMajor(minor))
}

export const lineTotal = (item: LineItem): number => Math.round(item.quantity * item.unitPrice)

export function invoiceTotals(inv: Pick<Invoice, 'items' | 'taxRate'>) {
  const subtotal = inv.items.reduce((sum, i) => sum + lineTotal(i), 0)
  const tax = Math.round((subtotal * inv.taxRate) / 100)
  return { subtotal, tax, total: subtotal + tax }
}

export const todayISO = (): string => new Date().toISOString().slice(0, 10)

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Derive display status: a sent invoice past its due date is overdue. */
export function resolveStatus(inv: Pick<Invoice, 'status' | 'dueDate'>, today = todayISO()): InvoiceStatus {
  if (inv.status === 'sent' && inv.dueDate < today) return 'overdue'
  return inv.status
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
}

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
