---
type: contract
title: werp_bt_printer localStorage contract
summary: Schema and producer/consumer rules for the saved Bluetooth printer record used across Pengaturan and Cart.
tags:
  - bluetooth
  - localStorage
  - printing
owned_paths:
  - resources/js/Pages/Pengaturan.jsx
  - resources/js/Components/Cart.jsx
related_docs:
  - docs/superpowers/memory/module-pengaturan.md
  - docs/superpowers/memory/lesson-bluetooth-autoconnect.md
entrypoints:
  - resources/js/Pages/Pengaturan.jsx
  - resources/js/Components/Cart.jsx
last_verified_commit: e3b1ad9
status: active
---

## Scope

The key `werp_bt_printer` in `localStorage` stores the last Bluetooth thermal printer paired through the Pengaturan settings page. This record is the single source of truth for auto-print in Kasir.

## Producers

- `resources/js/Pages/Pengaturan.jsx` — `connectTo(device)` writes on successful connect; `disconnect()` removes the key.

```js
localStorage.setItem('werp_bt_printer', JSON.stringify({ name, address }));
localStorage.removeItem('werp_bt_printer');
```

## Consumers

- `resources/js/Pages/Pengaturan.jsx` — reads on mount to restore saved state and attempt auto-connect.
- `resources/js/Components/Cart.jsx` — `autoPrint()` reads before attempting to print; falls back to `BluetoothPrinterModal` if absent or if connect fails.

## Schema

```json
{ "name": "string", "address": "string" }
```

`name` is the human-readable device name from `bluetoothSerial.list()`. `address` is the MAC address used for `bluetoothSerial.connect(address, ...)`.

## States and invariants

- Key absent or `null` → no printer saved; Cart falls back to modal
- Key present → printer was connected at some point; auto-connect attempted on print (may fail if out of range)
- `address` must be non-empty — consumers check `saved?.address` before using the value

## Compatibility notes

- Native Android only (`window.Capacitor?.isNative`). Consumers must guard with `isNative()` before calling `window.bluetoothSerial`.
- Pairing must be done in Android Bluetooth Settings first — this key only stores an already-paired device.
- Key format must not change without updating both producer and consumer simultaneously.
