import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView, meta: { title: 'Overview' } },
    // Lazy-loaded routes: each view is split into its own chunk.
    { path: '/invoices', name: 'invoices', component: () => import('@/views/InvoicesView.vue'), meta: { title: 'Invoices' } },
    { path: '/invoices/new', name: 'invoice-new', component: () => import('@/views/InvoiceEditorView.vue'), meta: { title: 'New invoice' } },
    { path: '/invoices/:id', name: 'invoice-edit', component: () => import('@/views/InvoiceEditorView.vue'), props: true, meta: { title: 'Edit invoice' } },
    { path: '/clients', name: 'clients', component: () => import('@/views/ClientsView.vue'), meta: { title: 'Clients' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '')} · Ledgerly`
})
