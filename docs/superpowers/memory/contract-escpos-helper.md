---
type: contract
title: ESC/POS shared helper contract
summary: buildEscPos() is the single source of truth for thermal printer byte generation; do not duplicate it.
tags:
  - printing
  - escpos
  - bluetooth
owned_paths:
  - resources/js/helpers/escpos.js
related_docs:
  - docs/superpowers/memory/contract-werp-bt-printer.md
entrypoints:
  - resources/js/helpers/escpos.js
last_verified_commit: e3b1ad9
status: active
---

## Scope

`resources/js/helpers/escpos.js` is the single implementation of ESC/POS byte building for the thermal Bluetooth printer. All print consumers must import from here.

## Producers

- `resources/js/helpers/escpos.js` — exports `buildEscPos(data)`.

## Consumers

- `resources/js/Components/BluetoothPrinterModal.jsx`
- `resources/js/hooks/useBluetooth.js`
- `resources/js/Components/Cart.jsx`

## Interface

```js
import { buildEscPos } from '@/helpers/escpos';

const bytes = buildEscPos({
    store,       // { name, address, phone, qris_image }
    kasirName,   // string
    invoiceNo,   // string
    saleDate,    // string (formatted date)
    items,       // [{ name, qty, price }]
    total,       // number
    payment,     // 'Tunai' | 'QRIS' | ...
    paid,        // number
    change,      // number
});
// bytes: Uint8Array — pass to bluetoothSerial.write(bytes, ...)
```

## Invariants

- Returns `Uint8Array` — do not convert to string before passing to `bluetoothSerial.write()`
- ESC/POS constants (`ESC`, `GS`, `LF`, `ALIGN_*`, `BOLD_*`, `CUT`) are internal to the module; do not re-export or duplicate them elsewhere
- `textToBytes()` helper is also internal; do not duplicate it

## Compatibility notes

- If the receipt layout changes, update **only** `escpos.js`; consumers need no changes
- If a new consumer needs printing, import from `@/helpers/escpos` — do not copy the function
