<script setup lang="ts">
import type { InvoiceStatus } from '@/types'

defineProps<{ status: InvoiceStatus }>()
</script>

<template>
  <span class="badge" :class="status">{{ status }}</span>
</template>

<style scoped>
.badge { display: inline-block; padding: .15rem .55rem; border-radius: 999px; font-size: .75rem; font-weight: 600; text-transform: capitalize; }
.paid { color: var(--paid); background: var(--paid-bg); }
.sent { color: var(--sent); background: var(--sent-bg); }
.overdue { color: var(--overdue); background: var(--overdue-bg); }
.draft { color: var(--draft); background: var(--draft-bg); }
</style>
