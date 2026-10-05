<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const links = [
  { to: '/', label: 'Overview' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/clients', label: 'Clients' },
]
</script>

<template>
  <a class="skip sr-only" href="#main">Skip to content</a>
  <header class="topbar">
    <div class="wrap bar">
      <RouterLink to="/" class="brand" aria-label="Ledgerly home">
        <span class="mark" aria-hidden="true">L</span> Ledgerly
      </RouterLink>
      <nav aria-label="Main">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="nav-link" active-class="" exact-active-class="active">
          {{ l.label }}
        </RouterLink>
      </nav>
      <RouterLink to="/invoices/new" class="btn btn-primary btn-sm">+ New invoice</RouterLink>
    </div>
  </header>
  <main id="main" class="wrap">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped>
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.topbar { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.bar { display: flex; align-items: center; gap: 1rem; height: 60px; }
.brand { display: flex; align-items: center; gap: .5rem; font-weight: 700; text-decoration: none; letter-spacing: -0.02em; }
.mark { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font-size: .9rem; }
nav { display: flex; gap: .25rem; margin-right: auto; }
.nav-link { padding: .4rem .7rem; border-radius: 8px; text-decoration: none; color: var(--muted); font-weight: 500; }
.nav-link:hover { color: var(--ink); background: var(--surface-2); }
.nav-link.active { color: var(--ink); background: var(--surface-2); }
main { padding-top: 2rem; padding-bottom: 4rem; }
.skip:focus { position: fixed; top: 8px; left: 8px; width: auto; height: auto; clip: auto; z-index: 100; background: var(--accent); color: var(--accent-ink); padding: .5rem 1rem; border-radius: 8px; }
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 600px) {
  .bar { flex-wrap: wrap; height: auto; padding-top: .6rem; padding-bottom: .6rem; }
  nav { order: 3; width: 100%; }
  .brand { margin-right: auto; }
}
@media (prefers-reduced-motion: reduce) { .fade-enter-active, .fade-leave-active { transition: none; } }
</style>
