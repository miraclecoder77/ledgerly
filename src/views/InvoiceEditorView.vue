<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useInvoicesStore } from '@/stores/invoices'
import { useClientsStore } from '@/stores/clients'
import { useInvoiceForm } from '@/composables/useInvoiceForm'
import { formatMoney, resolveStatus } from '@/utils/money'
import type { Currency, StoredStatus } from '@/types'

const props = defineProps<{ id?: string }>()
const router = useRouter()
const invoices = useInvoicesStore()
const clients = useClientsStore()

const existing = props.id ? invoices.get(props.id) : undefined
const notFound = !!props.id && !existing
const { form, totals, errors, isValid, addItem, removeItem, toDraft } = useInvoiceForm(existing)

const currencies: Currency[] = ['NGN', 'USD', 'GBP', 'EUR']
const submitted = ref(false)
const showError = (k: keyof typeof errors.value) => submitted.value && errors.value[k]
const title = computed(() => (existing ? existing.number : `New invoice · ${invoices.nextNumber}`))

function save(status: StoredStatus) {
  submitted.value = true
  if (!isValid.value) {
    // Move focus to the first invalid field for keyboard and screen-reader users.
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    return
  }
  const draft = toDraft(status)
  if (existing) invoices.update(existing.id, draft)
  else invoices.create(draft)
  router.push('/invoices')
}

function remove() {
  if (existing && confirm(`Delete ${existing.number}? This can’t be undone.`)) {
    invoices.remove(existing.id)
    router.push('/invoices')
  }
}
</script>

<template>
  <EmptyState v-if="notFound" title="Invoice not found" description="It may have been deleted.">
    <RouterLink to="/invoices" class="btn">Back to invoices</RouterLink>
  </EmptyState>

  <form v-else novalidate @submit.prevent="save(existing?.status ?? 'draft')">
    <div class="page-head">
      <div>
        <RouterLink to="/invoices" class="muted back">← Invoices</RouterLink>
        <h1 class="num-title">
          {{ title }}
          <StatusBadge v-if="existing" :status="resolveStatus(existing)" />
        </h1>
      </div>
      <div class="actions">
        <button v-if="existing" type="button" class="btn btn-ghost btn-danger" @click="remove">Delete</button>
        <button type="button" class="btn" @click="save('draft')">Save draft</button>
        <button v-if="existing?.status !== 'paid'" type="button" class="btn btn-primary" @click="save('sent')">Save &amp; mark sent</button>
        <button v-else type="button" class="btn btn-primary" @click="save('paid')">Save</button>
      </div>
    </div>

    <p v-if="submitted && !isValid" class="banner" role="alert">Please fix the highlighted fields.</p>

    <div class="layout">
      <section class="card panel">
        <h2>Details</h2>
        <div class="fields">
          <label class="span-2">
            Client
            <select v-model="form.clientId" :aria-invalid="!!showError('clientId')" aria-describedby="err-client">
              <option value="" disabled>Select a client…</option>
              <option v-for="c in clients.sorted" :key="c.id" :value="c.id">{{ c.company ? `${c.company} — ${c.name}` : c.name }}</option>
            </select>
            <span v-if="showError('clientId')" id="err-client" class="field-error">{{ errors.clientId }}</span>
            <RouterLink v-if="!clients.clients.length" to="/clients" class="small">Add a client first →</RouterLink>
          </label>
          <label>
            Issue date
            <input v-model="form.issueDate" type="date" required />
          </label>
          <label>
            Due date
            <input v-model="form.dueDate" type="date" required :aria-invalid="!!showError('dueDate')" aria-describedby="err-due" />
            <span v-if="showError('dueDate')" id="err-due" class="field-error">{{ errors.dueDate }}</span>
          </label>
          <label>
            Currency
            <select v-model="form.currency">
              <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label>
            Tax / VAT (%)
            <input v-model.number="form.taxRate" type="number" min="0" max="100" step="0.5" :aria-invalid="!!showError('taxRate')" />
            <span v-if="showError('taxRate')" class="field-error">{{ errors.taxRate }}</span>
          </label>
        </div>

        <h2 class="items-head">Line items</h2>
        <ul class="items">
          <li v-for="(item, idx) in form.items" :key="item.id" class="item">
            <label class="desc">
              <span :class="{ 'sr-only': idx > 0 }">Description</span>
              <input v-model="item.description" placeholder="e.g. Vue dashboard build" :aria-invalid="!!showError('items') && !item.description.trim()" />
            </label>
            <label class="qty">
              <span :class="{ 'sr-only': idx > 0 }">Qty</span>
              <input v-model.number="item.quantity" type="number" min="0" step="1" />
            </label>
            <label class="price">
              <span :class="{ 'sr-only': idx > 0 }">Unit price</span>
              <input v-model.number="item.price" type="number" min="0" step="0.01" />
            </label>
            <button
              type="button"
              class="btn btn-ghost btn-sm remove"
              :disabled="form.items.length === 1"
              :aria-label="`Remove line ${idx + 1}`"
              @click="removeItem(item.id)"
            >✕</button>
          </li>
        </ul>
        <p v-if="showError('items')" class="field-error">{{ errors.items }}</p>
        <button type="button" class="btn btn-sm" @click="addItem">+ Add line</button>

        <label class="notes">
          Notes
          <textarea v-model="form.notes" rows="3" placeholder="Payment details, thank-you note…" />
        </label>
      </section>

      <aside class="card panel summary" aria-live="polite">
        <h2>Summary</h2>
        <dl>
          <div><dt>Subtotal</dt><dd class="num">{{ formatMoney(totals.subtotal, form.currency) }}</dd></div>
          <div><dt>Tax ({{ form.taxRate || 0 }}%)</dt><dd class="num">{{ formatMoney(totals.tax, form.currency) }}</dd></div>
          <div class="total"><dt>Total</dt><dd class="num">{{ formatMoney(totals.total, form.currency) }}</dd></div>
        </dl>
        <button v-if="existing && existing.status !== 'paid'" type="button" class="btn full" @click="save('paid')">Save &amp; mark paid</button>
        <button v-if="existing?.status === 'paid'" type="button" class="btn full" @click="save('sent')">Mark as unpaid</button>
      </aside>
    </div>
  </form>
</template>

<style scoped>
.back { text-decoration: none; font-size: .9rem; }
.num-title { display: flex; align-items: center; gap: .75rem; margin-top: .3rem; }
.actions { display: flex; gap: .5rem; flex-wrap: wrap; }
.banner { background: var(--overdue-bg); color: var(--overdue); padding: .7rem 1rem; border-radius: 8px; font-weight: 500; margin: 0 0 1rem; }
.layout { display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; align-items: start; }
.panel { padding: 1.3rem; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
.span-2 { grid-column: span 2; }
.small { font-size: .85rem; color: var(--accent); }
.items-head { margin-top: 1.75rem; }
.items { list-style: none; padding: 0; margin: 1rem 0 .75rem; display: grid; gap: .6rem; }
.item { display: grid; grid-template-columns: 1fr 80px 140px 36px; gap: .6rem; align-items: end; }
.remove { height: 38px; justify-content: center; }
.remove:disabled { opacity: .3; cursor: not-allowed; }
.notes { margin-top: 1.5rem; }
.summary { position: sticky; top: 80px; }
dl { margin: 1rem 0; display: grid; gap: .6rem; }
dl div { display: flex; justify-content: space-between; gap: 1rem; }
dt { color: var(--muted); }
dd { margin: 0; }
.total { border-top: 1px solid var(--line); padding-top: .7rem; font-weight: 700; font-size: 1.1rem; }
.total dt { color: var(--ink); }
.full { width: 100%; justify-content: center; }
@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .summary { position: static; }
}
@media (max-width: 520px) {
  .fields { grid-template-columns: 1fr; }
  .span-2 { grid-column: auto; }
  .item { grid-template-columns: 1fr 1fr 36px; }
  .desc { grid-column: 1 / -1; }
  .item label span.sr-only { position: static; width: auto; height: auto; clip: auto; }
}
</style>
