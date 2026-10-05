import type { Client, Invoice } from '@/types'
import { addDays, todayISO } from './money'

const t = todayISO()

export const seedClients: Client[] = [
  { id: 'c1', name: 'Adaeze Okafor', email: 'adaeze@brightpath.ng', company: 'BrightPath Studio', createdAt: addDays(t, -120) },
  { id: 'c2', name: 'Tunde Bakare', email: 'tunde@kolafarms.com', company: 'Kola Farms', createdAt: addDays(t, -90) },
  { id: 'c3', name: 'Sarah Mensah', email: 'sarah@accrahub.gh', company: 'Accra Hub', createdAt: addDays(t, -40) },
]

export const seedInvoices: Invoice[] = [
  {
    id: 'i1', number: 'INV-0001', clientId: 'c1', currency: 'NGN', taxRate: 7.5, status: 'paid',
    issueDate: addDays(t, -75), dueDate: addDays(t, -61), paidAt: addDays(t, -63),
    items: [{ id: 'l1', description: 'Landing page build (Vue 3)', quantity: 1, unitPrice: 45000000 }],
  },
  {
    id: 'i2', number: 'INV-0002', clientId: 'c2', currency: 'NGN', taxRate: 7.5, status: 'paid',
    issueDate: addDays(t, -45), dueDate: addDays(t, -31), paidAt: addDays(t, -30),
    items: [
      { id: 'l2', description: 'Inventory dashboard', quantity: 1, unitPrice: 60000000 },
      { id: 'l3', description: 'Support hours', quantity: 10, unitPrice: 1500000 },
    ],
  },
  {
    id: 'i3', number: 'INV-0003', clientId: 'c3', currency: 'USD', taxRate: 0, status: 'sent',
    issueDate: addDays(t, -25), dueDate: addDays(t, -5),
    items: [{ id: 'l4', description: 'Design system audit', quantity: 1, unitPrice: 120000 }],
  },
  {
    id: 'i4', number: 'INV-0004', clientId: 'c1', currency: 'NGN', taxRate: 7.5, status: 'sent',
    issueDate: addDays(t, -6), dueDate: addDays(t, 8),
    items: [{ id: 'l5', description: 'Performance optimisation sprint', quantity: 1, unitPrice: 35000000 }],
  },
  {
    id: 'i5', number: 'INV-0005', clientId: 'c2', currency: 'NGN', taxRate: 7.5, status: 'draft',
    issueDate: t, dueDate: addDays(t, 14),
    items: [{ id: 'l6', description: 'Mobile checkout redesign', quantity: 1, unitPrice: 28000000 }],
  },
]
