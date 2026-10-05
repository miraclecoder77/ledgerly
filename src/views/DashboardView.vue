<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import InvoiceTable from '@/components/InvoiceTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useInvoicesStore } from '@/stores/invoices'
import { formatMoney } from '@/utils/money'
import type { Currency } from '@/types'

const store = useInvoicesStore()

const currencies = computed(() => [...store.summary.entries()] as [Currency, { paid: number; outstanding: number; overdue: number }][])
const recent = computed(() => store.withStatus.slice(0, 5))

/** Paid NGN income for the last 6 months, for the bar chart. */
const monthly = computed(() => {
  const months: { key: string; label: string; total: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    months.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
      total: 0,
    })
  }
  for (const inv of store.withStatus) {
    if (inv.displayStatus !== 'paid' || inv.currency !== 'NGN' || !inv.paidAt) continue
    const m = months.find((x) => x.key === inv.paidAt!.slice(0, 7))
    if (m) m.total += inv.total
  }
  const max = Math.max(1, ...months.map((m) => m.total))
  return months.map((m) => ({ ...m, pct: (m.total / max) * 100 }))
})
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Overview</h1>
        <p class="muted">Where your money is, across every currency you bill in.</p>
      </div>
    </div>

    <EmptyState v-if="store.invoices.length === 0" title="No invoices yet" description="Create your first invoice to see income here.">
      <RouterLink to="/invoices/new" class="btn btn-primary">Create invoice</RouterLink>
    </EmptyState>

    <template v-else>
      <div class="stats">
        <StatCard label="Paid" tone="paid">
          <span v-for="[cur, s] in currencies" :key="cur" class="num">{{ formatMoney(s.paid, cur) }}</span>
        </StatCard>
        <StatCard label="Outstanding" tone="sent">
          <span v-for="[cur, s] in currencies" :key="cur" class="num">{{ formatMoney(s.outstanding, cur) }}</span>
          <template #hint>{{ store.countByStatus.sent }} awaiting payment</template>
        </StatCard>
        <StatCard label="Overdue" tone="overdue">
          <span v-for="[cur, s] in currencies" :key="cur" class="num">{{ formatMoney(s.overdue, cur) }}</span>
          <template #hint>{{ store.countByStatus.overdue }} past due date</template>
        </StatCard>
      </div>

      <div class="grid">
        <section class="card chart">
          <h2>Income received (NGN)</h2>
          <p class="muted small">Last 6 months, by payment date</p>
          <ol class="bars" aria-label="Monthly NGN income">
            <li v-for="m in monthly" :key="m.key">
              <span class="bar-track"><span class="bar" :style="{ height: `${m.pct}%` }" /></span>
              <span class="bar-label">{{ m.label }}</span>
              <span class="sr-only">{{ formatMoney(m.total) }}</span>
            </li>
          </ol>
        </section>

        <section>
          <div class="section-head">
            <h2>Recent invoices</h2>
            <RouterLink to="/invoices" class="muted small">View all →</RouterLink>
          </div>
          <InvoiceTable :rows="recent" compact />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-head p { margin: .3rem 0 0; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 1.5rem; align-items: start; }
.chart { padding: 1.2rem; }
.small { font-size: .85rem; margin: .2rem 0 0; }
.bars { list-style: none; margin: 1.2rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(6, 1fr); gap: .6rem; height: 180px; }
.bars li { display: grid; grid-template-rows: 1fr auto; gap: .4rem; }
.bar-track { display: flex; align-items: flex-end; background: var(--surface-2); border-radius: 6px; overflow: hidden; }
.bar { display: block; width: 100%; background: var(--accent); border-radius: 6px 6px 0 0; min-height: 2px; transition: height .4s ease; }
.bar-label { font-size: .75rem; color: var(--muted); text-align: center; }
.section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: .75rem; }
@media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
</style>
