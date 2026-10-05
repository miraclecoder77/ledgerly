import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useInvoicesStore } from '@/stores/invoices'
import { addDays, todayISO } from '@/utils/money'

describe('invoices store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('assigns sequential invoice numbers', () => {
    const store = useInvoicesStore()
    const before = store.nextNumber
    const inv = store.create({
      clientId: 'c1', currency: 'NGN', issueDate: todayISO(), dueDate: addDays(todayISO(), 7),
      taxRate: 0, status: 'draft', items: [{ id: 'x', description: 'Test', quantity: 1, unitPrice: 100 }],
    })
    expect(inv.number).toBe(before)
    expect(store.nextNumber).not.toBe(before)
  })

  it('marks an invoice paid and records the date', () => {
    const store = useInvoicesStore()
    const sent = store.invoices.find((i) => i.status === 'sent')!
    store.markPaid(sent.id)
    expect(store.get(sent.id)?.status).toBe('paid')
    expect(store.get(sent.id)?.paidAt).toBe(todayISO())
  })

  it('keeps summaries separate per currency', () => {
    const store = useInvoicesStore()
    expect(store.summary.has('NGN')).toBe(true)
    expect(store.summary.has('USD')).toBe(true)
    expect(store.summary.get('USD')!.overdue).toBeGreaterThan(0)
  })
})
