<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="empty card" role="status">
    <h2>{{ title }}</h2>
    <p v-if="description" class="muted">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty { padding: 3rem 1.5rem; text-align: center; display: grid; justify-items: center; gap: .5rem; }
p { margin: 0 0 .75rem; }
</style>
