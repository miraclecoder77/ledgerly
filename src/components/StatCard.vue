<script setup lang="ts">
withDefaults(defineProps<{ label: string; tone?: 'default' | 'paid' | 'sent' | 'overdue' }>(), { tone: 'default' })
</script>

<template>
  <section class="card stat" :class="tone">
    <h3 class="label">{{ label }}</h3>
    <div class="value"><slot /></div>
    <p v-if="$slots.hint" class="hint muted"><slot name="hint" /></p>
  </section>
</template>

<style scoped>
.stat { padding: 1.1rem 1.2rem; border-top: 3px solid var(--line); }
.paid { border-top-color: var(--paid); }
.sent { border-top-color: var(--sent); }
.overdue { border-top-color: var(--overdue); }
.label { font-size: .8rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
.value { margin-top: .4rem; font-size: 1.35rem; font-weight: 600; display: grid; gap: .1rem; }
.hint { margin: .4rem 0 0; font-size: .85rem; }
</style>
