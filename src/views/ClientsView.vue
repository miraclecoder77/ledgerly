<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import { useClientsStore } from '@/stores/clients'
import { useInvoicesStore } from '@/stores/invoices'
import { formatMoney } from '@/utils/money'

const clients = useClientsStore()
const invoices = useInvoicesStore()

const form = reactive({ name: '', email: '', company: '' })
const submitted = ref(false)
const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
const errors = computed(() => ({
  name: form.name.trim() ? '' : 'Name is required',
  email: emailOk.value ? '' : 'Enter a valid email',
}))

function addClient() {
  submitted.value = true
  if (errors.value.name || errors.value.email) return
  clients.add({ name: form.name.trim(), email: form.email.trim(), company: form.company.trim() || undefined })
  Object.assign(form, { name: '', email: '', company: '' })
  submitted.value = false
}

/** Per-client stats; NGN only to keep the comparison honest. */
const stats = computed(() => {
  const map = new Map<string, { count: number; billedNGN: number }>()
  for (const inv of invoices.withStatus) {
    const s = map.get(inv.clientId) ?? { count: 0, billedNGN: 0 }
    s.count++
    if (inv.currency === 'NGN') s.billedNGN += inv.total
    map.set(inv.clientId, s)
  }
  return map
})

function removeClient(id: string, name: string) {
  if ((stats.value.get(id)?.count ?? 0) > 0) {
    alert(`${name} has invoices. Delete those first.`)
    return
  }
  if (confirm(`Remove ${name}?`)) clients.remove(id)
}
</script>

<template>
  <div>
    <div class="page-head"><h1>Clients</h1></div>

    <div class="layout">
      <section>
        <EmptyState v-if="!clients.clients.length" title="No clients yet" description="Add your first client using the form." />
        <ul v-else class="list">
          <li v-for="c in clients.sorted" :key="c.id" class="card client">
            <div class="avatar" aria-hidden="true">{{ c.name.charAt(0) }}</div>
            <div class="info">
              <strong>{{ c.company ?? c.name }}</strong>
              <span class="muted">{{ c.company ? `${c.name} · ` : '' }}{{ c.email }}</span>
            </div>
            <div class="meta">
              <span class="num">{{ formatMoney(stats.get(c.id)?.billedNGN ?? 0) }}</span>
              <span class="muted small">{{ stats.get(c.id)?.count ?? 0 }} invoices</span>
            </div>
            <button class="btn btn-ghost btn-sm btn-danger" type="button" :aria-label="`Remove ${c.name}`" @click="removeClient(c.id, c.name)">✕</button>
          </li>
        </ul>
      </section>

      <form class="card panel" novalidate @submit.prevent="addClient">
        <h2>Add client</h2>
        <label>
          Name
          <input v-model="form.name" autocomplete="name" :aria-invalid="submitted && !!errors.name" />
          <span v-if="submitted && errors.name" class="field-error">{{ errors.name }}</span>
        </label>
        <label>
          Email
          <input v-model="form.email" type="email" autocomplete="email" :aria-invalid="submitted && !!errors.email" />
          <span v-if="submitted && errors.email" class="field-error">{{ errors.email }}</span>
        </label>
        <label>
          Company <span class="optional">(optional)</span>
          <input v-model="form.company" autocomplete="organization" />
        </label>
        <button class="btn btn-primary" type="submit">Add client</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: .6rem; }
.client { display: grid; grid-template-columns: 40px 1fr auto auto; gap: 1rem; align-items: center; padding: .9rem 1rem; }
.avatar { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent); font-weight: 700; }
.info, .meta { display: grid; min-width: 0; }
.info span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .9rem; }
.meta { text-align: right; }
.small { font-size: .8rem; }
.panel { padding: 1.3rem; display: grid; gap: 1rem; position: sticky; top: 80px; }
.optional { font-weight: 400; }
@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .panel { position: static; order: -1; }
}
@media (max-width: 480px) { .client { grid-template-columns: 40px 1fr auto; } .meta { display: none; } }
</style>
