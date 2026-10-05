import { describe, expect, it } from 'vitest'
import { addDays, invoiceTotals, resolveStatus, toMinor } from '@/utils/money'

describe('money utils', () => {
  it('computes subtotal, tax and total in minor units', () => {
    const t = invoiceTotals({
      taxRate: 7.5,
      items: [
        { id: 'a', description: 'Build', quantity: 2, unitPrice: toMinor(1000) },
        { id: 'b', description: 'Support', quantity: 1, unitPrice: toMinor(500.5) },
      ],
    })
    expect(t.subtotal).toBe(250050)
    expect(t.tax).toBe(18754) // 7.5% rounded to nearest kobo
    expect(t.total).toBe(268804)
  })

  it('avoids floating point drift', () => {
    expect(toMinor(0.1 + 0.2)).toBe(30)
  })

  it('derives overdue only for sent invoices past due', () => {
    const today = '2026-10-05'
    expect(resolveStatus({ status: 'sent', dueDate: '2026-10-01' }, today)).toBe('overdue')
    expect(resolveStatus({ status: 'sent', dueDate: '2026-10-05' }, today)).toBe('sent')
    expect(resolveStatus({ status: 'paid', dueDate: '2026-01-01' }, today)).toBe('paid')
    expect(resolveStatus({ status: 'draft', dueDate: '2026-01-01' }, today)).toBe('draft')
  })

  it('adds days across month boundaries', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02')
  })
})
