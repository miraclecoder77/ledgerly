# Ledgerly

A fast, accessible invoice and income tracker for freelancers, built with **Vue 3, TypeScript and Pinia**.

**Live demo:** _add your Vercel/Netlify URL here_

## Features

- **Overview dashboard:** paid, outstanding and overdue totals, kept separate per currency (NGN, USD, GBP, EUR), plus a 6-month income chart.
- **Invoices:** create, edit and delete invoices with line items, VAT and live totals. Filter by status (synced to the URL) and search by number or client.
- **Derived status:** a sent invoice past its due date becomes *overdue* automatically. It's computed, never stored, so it can't go stale.
- **Clients:** add and remove clients, with per-client billing totals.
- **Offline-friendly:** data persists to `localStorage` and the app still works if storage is blocked.

## Technical highlights

| Area | Approach |
| --- | --- |
| State | Pinia setup stores (`ref`, `computed`, `watch`) with deep-watch persistence |
| Logic reuse | `useInvoiceForm` composable holds form state, validation and money conversion, unit-tested separately from the UI |
| Money | All amounts stored in minor units (kobo/cents) as integers to avoid floating-point errors |
| Routing | Vue Router with lazy-loaded views (code splitting per route) |
| Accessibility | Skip link, labelled fields, `aria-invalid` with focus moved to the first error, `aria-live` totals, `aria-pressed` filter buttons, visible focus rings, reduced-motion support |
| UI | Responsive down to 360px, light and dark mode via CSS custom properties |
| Quality | Strict TypeScript (`noUncheckedIndexedAccess`), `vue-tsc` type-checking, Vitest + Vue Test Utils |

## Project structure

```
src/
  components/    StatusBadge, StatCard, InvoiceTable, EmptyState
  composables/   useInvoiceForm
  stores/        invoices, clients (Pinia)
  views/         Dashboard, Invoices, InvoiceEditor, Clients
  utils/         money, storage, seed data
  __tests__/     unit and component tests
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + component tests
npm run build      # type-check + production build
```

## Built with AI-assisted development

I used AI tools to speed up scaffolding and boilerplate. I reviewed every change, and the business logic (money handling, status rules, validation) is covered by tests.
