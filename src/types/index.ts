export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR'

export interface Client {
  id: string
  name: string
  email: string
  company?: string
  createdAt: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  /** Unit price in minor units (kobo / cents) to avoid float drift. */
  unitPrice: number
}

/** Stored status. "overdue" is derived from dueDate, never stored. */
export type StoredStatus = 'draft' | 'sent' | 'paid'
export type InvoiceStatus = StoredStatus | 'overdue'

export interface Invoice {
  id: string
  number: string
  clientId: string
  currency: Currency
  issueDate: string // ISO yyyy-mm-dd
  dueDate: string
  items: LineItem[]
  /** Tax rate as a percentage, e.g. 7.5 for Nigerian VAT. */
  taxRate: number
  notes?: string
  status: StoredStatus
  paidAt?: string
}
