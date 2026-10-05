import { describe, expect, it } from 'vitest'
import { useInvoiceForm } from '@/composables/useInvoiceForm'

describe('useInvoiceForm', () => {
  it('is invalid until a client and a line item are set', () => {
    const { form, isValid, errors } = useInvoiceForm()
    expect(isValid.value).toBe(false)
    expect(errors.value.clientId).toBeDefined()

    form.clientId = 'c1'
    form.items[0]!.description = 'Vue build'
    form.items[0]!.price = 1000
    expect(isValid.value).toBe(true)
  })

  it('rejects a due date before the issue date', () => {
    const { form, errors } = useInvoiceForm()
    form.dueDate = '2000-01-01'
    expect(errors.value.dueDate).toBeDefined()
  })

  it('converts major-unit prices to minor units in the draft', () => {
    const { form, toDraft, totals } = useInvoiceForm()
    form.clientId = 'c1'
    form.taxRate = 0
    form.items[0]!.description = 'Audit'
    form.items[0]!.quantity = 2
    form.items[0]!.price = 150.25
    expect(toDraft('sent').items[0]!.unitPrice).toBe(15025)
    expect(totals.value.total).toBe(30050)
  })
})
