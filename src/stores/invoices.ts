import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Invoice, InvoiceStatus } from '@/types'
import { load, save } from '@/utils/storage'
import { seedInvoices } from '@/utils/seed'
import { invoiceTotals, resolveStatus, todayISO, uid } from '@/utils/money'

const KEY = 'ledgerly:invoices'

export type InvoiceDraft = Omit<Invoice, 'id' | 'number'>

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>(load(KEY, seedInvoices))

  watch(invoices, (v) => save(KEY, v), { deep: true })

  const nextNumber = computed(() => {
    const max = invoices.value.reduce((m, i) => Math.max(m, Number(i.number.replace(/\D/g, '')) || 0), 0)
    return `INV-${String(max + 1).padStart(4, '0')}`
  })

  const withStatus = computed(() =>
    invoices.value
      .map((inv) => ({ ...inv, displayStatus: resolveStatus(inv), ...invoiceTotals(inv) }))
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate)),
  )

  /** Totals per currency, so NGN and USD are never added together. */
  const summary = computed(() => {
    const out = new Map<string, Record<'paid' | 'outstanding' | 'overdue', number>>()
    for (const inv of withStatus.value) {
      const row = out.get(inv.currency) ?? { paid: 0, outstanding: 0, overdue: 0 }
      if (inv.displayStatus === 'paid') row.paid += inv.total
      if (inv.displayStatus === 'sent') row.outstanding += inv.total
      if (inv.displayStatus === 'overdue') row.overdue += inv.total
      out.set(inv.currency, row)
    }
    return out
  })

  const countByStatus = computed(() => {
    const counts: Record<InvoiceStatus, number> = { draft: 0, sent: 0, paid: 0, overdue: 0 }
    for (const inv of withStatus.value) counts[inv.displayStatus]++
    return counts
  })

  const get = (id: string) => invoices.value.find((i) => i.id === id)

  function create(draft: InvoiceDraft): Invoice {
    const inv: Invoice = { ...draft, id: uid(), number: nextNumber.value }
    invoices.value.push(inv)
    return inv
  }

  function update(id: string, patch: Partial<InvoiceDraft>) {
    const idx = invoices.value.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error(`Invoice ${id} not found`)
    invoices.value[idx] = { ...invoices.value[idx]!, ...patch }
  }

  function markPaid(id: string) {
    update(id, { status: 'paid', paidAt: todayISO() })
  }

  function markSent(id: string) {
    update(id, { status: 'sent', paidAt: undefined })
  }

  function remove(id: string) {
    invoices.value = invoices.value.filter((i) => i.id !== id)
  }

  return { invoices, withStatus, summary, countByStatus, nextNumber, get, create, update, markPaid, markSent, remove }
})
