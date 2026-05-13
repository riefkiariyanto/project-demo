---
type: lesson
title: Bluetooth auto-connect needs isConnected() safety guard
summary: Calling bluetoothSerial.connect() unconditionally on mount can conflict with an existing connection; always check isConnected() first.
tags:
  - bluetooth
  - android
  - capacitor
owned_paths:
  - resources/js/Pages/Pengaturan.jsx
related_docs:
  - docs/superpowers/memory/contract-werp-bt-printer.md
last_verified_commit: e3b1ad9
status: active
---

## Situation

During code review of `Pengaturan.jsx`, a `useEffect` that called `bluetoothSerial.connect(saved.address, ...)` unconditionally on mount was flagged. On Android, calling `connect()` when the serial port is already open can drop an existing connection or throw an error.

## Why it mattered

The initial implementation was removed entirely after code review. This caused AC-013 to fail (page open with saved printer should show green "connected" badge). The fix required restoring auto-connect with a guard — not just removing it.

## Rule

Always call `bluetoothSerial.isConnected(onConnected, onNotConnected)` before attempting `connect()` on mount:

```js
useEffect(() => {
    if (!isNative()) return;
    const s = JSON.parse(localStorage.getItem('werp_bt_printer') ?? 'null');
    if (!s?.address) return;
    bt()?.isConnected(
        () => { setConnected(true); },              // already open — just update state
        () => {                                      // not open — safe to connect
            setConnecting(s.address);
            bt()?.connect(s.address,
                () => { setConnected(true); setConnecting(null); },
                () => { setConnecting(null); }       // fail silently, show grey badge
            );
        }
    );
}, []);
```

## When to apply

Any `useEffect` that calls `bluetoothSerial.connect()` on component mount.

## When not to apply

Explicit user-triggered connect actions (scan → select device) — the user knowingly initiates the connection, no guard needed.
