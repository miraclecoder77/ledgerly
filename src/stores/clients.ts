import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Client } from '@/types'
import { load, save } from '@/utils/storage'
import { seedClients } from '@/utils/seed'
import { todayISO, uid } from '@/utils/money'

const KEY = 'ledgerly:clients'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>(load(KEY, seedClients))

  watch(clients, (v) => save(KEY, v), { deep: true })

  const byId = computed(() => new Map(clients.value.map((c) => [c.id, c])))
  const sorted = computed(() => [...clients.value].sort((a, b) => a.name.localeCompare(b.name)))

  function add(input: Omit<Client, 'id' | 'createdAt'>): Client {
    const client: Client = { ...input, id: uid(), createdAt: todayISO() }
    clients.value.push(client)
    return client
  }

  function remove(id: string) {
    clients.value = clients.value.filter((c) => c.id !== id)
  }

  return { clients, byId, sorted, add, remove }
})
