<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import InvoiceTable from '@/components/InvoiceTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useClientsStore } from '@/stores/clients'
import type { InvoiceStatus } from '@/types'

const store = useInvoicesStore()
const clients = useClientsStore()
const route = useRoute()
const router = useRouter()

type Filter = 'all' | InvoiceStatus
const filters: Filter[] = ['all', 'draft', 'sent', 'overdue', 'paid']

// Filter lives in the URL so it survives refresh and can be shared.
const active = computed<Filter>({
  get: () => (filters.includes(route.query.status as Filter) ? (route.query.status as Filter) : 'all'),
  set: (v) => router.replace({ query: { ...route.query, status: v === 'all' ? undefined : v } }),
})
const search = ref('')

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.withStatus.filter((inv) => {
    if (active.value !== 'all' && inv.displayStatus !== active.value) return false
    if (!q) return true
    const c = clients.byId.get(inv.clientId)
    return [inv.number, c?.name, c?.company].some((s) => s?.toLowerCase().includes(q))
  })
})

const countFor = (f: Filter) => (f === 'all' ? store.invoices.length : store.countByStatus[f])
</script>

<template>
  <div>
    <div class="page-head">
      <h1>Invoices</h1>
      <RouterLink to="/invoices/new" class="btn btn-primary">+ New invoice</RouterLink>
    </div>

    <div class="toolbar">
      <div class="tabs" role="group" aria-label="Filter by status">
        <button
          v-for="f in filters"
          :key="f"
          type="button"
          class="tab"
          :class="{ on: active === f }"
          :aria-pressed="active === f"
          @click="active = f"
        >
          {{ f }} <span class="count num">{{ countFor(f) }}</span>
        </button>
      </div>
      <label class="search">
        <span class="sr-only">Search invoices</span>
        <input v-model="search" type="search" placeholder="Search number or client…" />
      </label>
    </div>

    <InvoiceTable v-if="rows.length" :rows="rows" @mark-paid="store.markPaid" />
    <EmptyState v-else title="Nothing matches" description="Try another status or search term.">
      <button class="btn" type="button" @click="(search = '', active = 'all')">Clear filters</button>
    </EmptyState>
  </div>
</template>

<style scoped>
.toolbar { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
.tabs { display: flex; gap: .25rem; flex-wrap: wrap; background: var(--surface-2); padding: .25rem; border-radius: 10px; }
.tab { border: 0; background: transparent; font: inherit; font-weight: 500; text-transform: capitalize; color: var(--muted); padding: .35rem .75rem; border-radius: 8px; cursor: pointer; }
.tab.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow); }
.count { font-size: .75rem; margin-left: .25rem; opacity: .7; }
.search { width: min(280px, 100%); }
</style>
