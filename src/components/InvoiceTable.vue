<script setup lang="ts">
import { RouterLink } from 'vue-router'
import StatusBadge from './StatusBadge.vue'
import type { Invoice, InvoiceStatus } from '@/types'
import { formatDate, formatMoney } from '@/utils/money'
import { useClientsStore } from '@/stores/clients'

export type InvoiceRow = Invoice & { displayStatus: InvoiceStatus; total: number }

defineProps<{ rows: InvoiceRow[]; compact?: boolean }>()
const emit = defineEmits<{ markPaid: [id: string] }>()

const clients = useClientsStore()
const clientName = (id: string) => clients.byId.get(id)?.company ?? clients.byId.get(id)?.name ?? 'Unknown client'
</script>

<template>
  <div class="table-wrap card">
    <table>
      <caption class="sr-only">Invoices</caption>
      <thead>
        <tr>
          <th scope="col">Invoice</th>
          <th scope="col">Client</th>
          <th scope="col" v-if="!compact">Due</th>
          <th scope="col">Status</th>
          <th scope="col" class="right">Total</th>
          <th scope="col" v-if="!compact"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td><RouterLink :to="`/invoices/${row.id}`" class="num link">{{ row.number }}</RouterLink></td>
          <td>{{ clientName(row.clientId) }}</td>
          <td v-if="!compact" class="muted">{{ formatDate(row.dueDate) }}</td>
          <td><StatusBadge :status="row.displayStatus" /></td>
          <td class="right num">{{ formatMoney(row.total, row.currency) }}</td>
          <td v-if="!compact" class="right">
            <button
              v-if="row.displayStatus === 'sent' || row.displayStatus === 'overdue'"
              class="btn btn-sm"
              type="button"
              @click="emit('markPaid', row.id)"
            >
              Mark paid<span class="sr-only"> {{ row.number }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 520px; }
th, td { padding: .75rem 1rem; text-align: left; border-bottom: 1px solid var(--line); }
th { font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); font-weight: 600; background: var(--surface-2); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: var(--surface-2); }
.right { text-align: right; }
.link { font-weight: 500; text-decoration: none; color: var(--accent); }
.link:hover { text-decoration: underline; }
</style>
