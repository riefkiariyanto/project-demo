---
type: module_card
title: Pengaturan page module
summary: Responsibilities, tab visibility rules, and key invariants for the /pengaturan settings page.
tags:
  - settings
  - bluetooth
  - store-profile
owned_paths:
  - resources/js/Pages/Pengaturan.jsx
  - app/Http/Controllers/PengaturanController.php
related_docs:
  - docs/superpowers/memory/contract-werp-bt-printer.md
  - docs/superpowers/memory/lesson-bluetooth-autoconnect.md
entrypoints:
  - resources/js/Pages/Pengaturan.jsx
  - app/Http/Controllers/PengaturanController.php
last_verified_commit: e3b1ad9
status: active
---

## Responsibilities

- **Printer Bluetooth tab** (all roles): scan paired devices, connect, save to localStorage, disconnect. Auto-connects on mount using `isConnected()` safety guard.
- **Profil Toko tab** (admin/superadmin only): edit store name, address, phone, logo, QRIS image, view invite code (read-only). Submits to `POST /store/update`.

## Entry points

- Route: `GET /pengaturan` — handled by `PengaturanController@index` inside `Route::middleware('auth')` (no role restriction)
- Sidebar: `Sidebar.jsx` menu entry with `roles: ['user', 'admin', 'superadmin']`
- Mobile bottom nav: `AuthenticatedLayout.jsx` `bottomNavItems` entry with same roles

## Tab visibility

```js
const isAdmin = roles.includes('admin') || roles.includes('superadmin');
// Printer Bluetooth tab: always visible
// Profil Toko tab: only when isAdmin === true
```

## Invariants

- Default tab on load: `'printer'` (useState initial value)
- Logo upload input id: `pg-logo-input` (prefixed to avoid collision)
- QRIS upload input id: `pg-qris-input` (prefixed to avoid collision)
- Logo/QRIS file size limit: 2MB enforced client-side before setting form data
- Store profile form submits via Inertia `useForm.post('/store/update', { forceFormData: true })`

## Extension points

- New tabs: add a tab button inside the header `div`, guard with role check if needed, add `{tab === 'new' && <Component />}` in the content area
- New settings per tab: add state and JSX inside the relevant tab component

## Common pitfalls

- The store redirect after `POST /store/update` was changed from `route('kelolatoko')` to `route('pengaturan')` — see `StoreController.php`
- File inputs use `pg-` prefix IDs; do not reuse `logo-input` or `qris-input` without checking for collisions
- See [[lesson-bluetooth-autoconnect]] before touching auto-connect on mount logic
