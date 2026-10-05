import { computed, reactive } from 'vue'
import type { Currency, Invoice, StoredStatus } from '@/types'
import { addDays, invoiceTotals, toMajor, toMinor, todayISO, uid } from '@/utils/money'
import type { InvoiceDraft } from '@/stores/invoices'

export interface FormItem {
  id: string
  description: string
  quantity: number
  /** Entered in major units (naira / dollars) for a natural UX. */
  price: number
}

export interface InvoiceFormState {
  clientId: string
  currency: Currency
  issueDate: string
  dueDate: string
  taxRate: number
  notes: string
  items: FormItem[]
}

const blankItem = (): FormItem => ({ id: uid(), description: '', quantity: 1, price: 0 })

export function useInvoiceForm(existing?: Invoice) {
  const today = todayISO()
  const form = reactive<InvoiceFormState>(
    existing
      ? {
          clientId: existing.clientId,
          currency: existing.currency,
          issueDate: existing.issueDate,
          dueDate: existing.dueDate,
          taxRate: existing.taxRate,
          notes: existing.notes ?? '',
          items: existing.items.map((i) => ({ id: i.id, description: i.description, quantity: i.quantity, price: toMajor(i.unitPrice) })),
        }
      : { clientId: '', currency: 'NGN', issueDate: today, dueDate: addDays(today, 14), taxRate: 7.5, notes: '', items: [blankItem()] },
  )

  const minorItems = computed(() =>
    form.items.map((i) => ({ id: i.id, description: i.description.trim(), quantity: Number(i.quantity) || 0, unitPrice: toMinor(Number(i.price) || 0) })),
  )

  const totals = computed(() => invoiceTotals({ items: minorItems.value, taxRate: Number(form.taxRate) || 0 }))

  const errors = computed(() => {
    const e: Partial<Record<'clientId' | 'dueDate' | 'items' | 'taxRate', string>> = {}
    if (!form.clientId) e.clientId = 'Choose a client'
    if (form.dueDate < form.issueDate) e.dueDate = 'Due date can’t be before the issue date'
    if (form.taxRate < 0 || form.taxRate > 100) e.taxRate = 'Tax must be between 0 and 100%'
    const valid = form.items.filter((i) => i.description.trim() && i.quantity > 0 && i.price >= 0)
    if (valid.length === 0) e.items = 'Add at least one line item with a description and quantity'
    else if (form.items.some((i) => i.price < 0 || i.quantity < 0)) e.items = 'Quantities and prices can’t be negative'
    return e
  })

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  const addItem = () => form.items.push(blankItem())
  const removeItem = (id: string) => {
    if (form.items.length > 1) form.items = form.items.filter((i) => i.id !== id)
  }

  function toDraft(status: StoredStatus): InvoiceDraft {
    return {
      clientId: form.clientId,
      currency: form.currency,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      taxRate: Number(form.taxRate) || 0,
      notes: form.notes.trim() || undefined,
      items: minorItems.value.filter((i) => i.description && i.quantity > 0),
      status,
      paidAt: status === 'paid' ? (existing?.paidAt ?? todayISO()) : undefined,
    }
  }

  return { form, totals, errors, isValid, addItem, removeItem, toDraft }
}
