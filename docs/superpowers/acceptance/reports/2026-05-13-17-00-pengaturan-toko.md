# Acceptance Test Report

**Branch:** `b31e85ebbd3dc6dc1d5a69e6e74098ab54ddf92d`
**AC Document:** `docs/superpowers/acceptance/2026-05-13-pengaturan-toko.md`
**Date:** 2026-05-13
**Report:** `docs/superpowers/acceptance/reports/2026-05-13-17-00-pengaturan-toko.md`
**Method:** Static code analysis (playwright-cli unavailable in this environment)

---

## Results

| ID | Description | Test Type | Result | Evidence |
|----|-------------|-----------|--------|----------|
| AC-001 | Menu "Pengaturan" muncul di sidebar untuk role user/kasir | UI interaction | PASS | `Sidebar.jsx:57-61` — menu entry `{ name: 'Pengaturan', roles: ['user', 'admin', 'superadmin'] }` includes `user` |
| AC-002 | Menu "Pengaturan" muncul di sidebar untuk role admin | UI interaction | PASS | Same entry — `roles` array includes `admin` |
| AC-003 | Menu "Pengaturan" muncul di sidebar untuk role superadmin | UI interaction | PASS | Same entry — `roles` array includes `superadmin` |
| AC-004 | Navigasi ke `/pengaturan` berhasil untuk semua role | UI interaction | PASS | `routes/web.php:61` — `Route::middleware('auth')` group (no role restriction), `PengaturanController@index` renders `Pengaturan` Inertia page |
| AC-005 | Tab "Printer Bluetooth" tampil sebagai tab aktif saat pertama buka | UI interaction | PASS | `Pengaturan.jsx:331` — `useState('printer')` sets default tab; printer button highlighted with `bg-orange-500` when active |
| AC-006 | Tab "Profil Toko" tidak tampil untuk role user/kasir | UI interaction | PASS | `Pengaturan.jsx:330, 353` — `isAdmin = roles.includes('admin') \|\| roles.includes('superadmin')`; Profil Toko tab only renders inside `{isAdmin && (...)}` |
| AC-007 | Tab "Profil Toko" tampil untuk role admin | UI interaction | PASS | `isAdmin = true` for `admin` role → tab renders |
| AC-008 | Tab "Profil Toko" tampil untuk role superadmin | UI interaction | PASS | `isAdmin = true` for `superadmin` role → tab renders |
| AC-009 | Halaman Printer Bluetooth menampilkan panduan ketika bukan native Android | UI interaction | PASS | `Pengaturan.jsx:88-103` — `if (!isNative())` returns info card: "Fitur ini hanya tersedia di aplikasi Android." |
| AC-010 | Tombol "Scan & Ganti Printer" memunculkan daftar paired Bluetooth devices | UI interaction | PASS | `Pengaturan.jsx:54-61` — `scan()` calls `bt()?.list(...)`, sets `devices` state, renders device list |
| AC-011 | Pilih device dari daftar → terhubung dan tersimpan | UI interaction | PASS | `Pengaturan.jsx:63-79` — `connectTo(device)` calls `bt()?.connect(device.address, ...)`, on success: `setConnected(true)`, `setSaved(device)`, `localStorage.setItem(STORAGE_KEY, JSON.stringify(device))` |
| AC-012 | Printer yang dipilih tersimpan di localStorage | Logic | PASS | `Pengaturan.jsx:72` — `localStorage.setItem('werp_bt_printer', JSON.stringify(device))` where `device = { name, address }` (fields come from `bluetoothSerial.list()` output) |
| AC-013 | Status "Tersambung" tampil saat membuka ulang halaman dengan printer tersimpan | UI interaction | FAIL | `Pengaturan.jsx:43-46, 112` — `connected` initializes to `false`; green "Printer Terhubung" badge only renders when `saved && connected` both true. On page reload, `connected = false` → grey "Belum Terhubung" badge shown instead |
| AC-014 | Tombol "Putuskan" memutus koneksi dan menghapus printer dari localStorage | UI interaction | PASS | `Pengaturan.jsx:81-86` — `disconnect()`: `bt()?.disconnect()`, `setConnected(false)`, `setSaved(null)`, `localStorage.removeItem(STORAGE_KEY)` |
| AC-015 | Cetak nota di Kasir auto-connect ke printer tersimpan tanpa modal Bluetooth | UI interaction | PASS | `Cart.jsx:13-38` — `autoPrint()` reads `localStorage.getItem('werp_bt_printer')`, calls `bt.connect(saved.address, ...)`, on success calls `bt.write(buildEscPos(data), ...)` → closes modal without showing BluetoothPrinterModal |
| AC-016 | Cetak nota fallback ke BluetoothPrinterModal jika tidak ada printer tersimpan | UI interaction | PASS | `Cart.jsx:18-21` — if `!saved?.address`, calls `setShowBT(true)` → renders `<BluetoothPrinterModal>` |
| AC-017 | Cetak nota fallback ke BluetoothPrinterModal jika auto-connect gagal | UI interaction | PASS | `Cart.jsx:36` — connect `onError`: `setAutoPrinting(false); setShowBT(true)` → renders `<BluetoothPrinterModal>` |
| AC-018 | Tab "Profil Toko" menampilkan form dengan nama, alamat, telepon, logo, QRIS, dan kode undangan | UI interaction | PASS | `Pengaturan.jsx:196-325` — ProfilTokoTab has all 6 required fields: Nama Toko, Alamat, No. Telepon, logo upload (camera at bottom-right), QRIS upload, invite_code (read-only div) |
| AC-019 | Upload logo dengan kamera button di pojok kanan bawah berfungsi | UI interaction | PASS | `Pengaturan.jsx:236-239` — camera button `onClick={() => document.getElementById('pg-logo-input').click()}`, positioned `absolute -bottom-2 -right-2` |
| AC-020 | Simpan perubahan profil toko berhasil | UI interaction | PASS | `Pengaturan.jsx:208-215` — `saveStore()` posts to `/store/update`, `onSuccess: () => showNotif('success', 'Profil toko berhasil diupdate!')` |
| AC-021 | Simpan profil toko menolak logo lebih dari 2MB | UI interaction | PASS | `Pengaturan.jsx:246` — `if (file.size > 2 * 1024 * 1024) { showNotif('error', 'Ukuran logo maksimal 2MB!'); return; }` |
| AC-022 | Tab "Toko" tidak ada lagi di halaman Kelola Toko | UI interaction | PASS | `KelolaToko.jsx:430-443` — only `TabBtn` entries are `tab === "menu"` and `tab === "bahan"`, no `tab === "toko"` |
| AC-023 | Halaman Kelola Toko masih berfungsi normal setelah tab Toko dihapus | UI interaction | PASS | `KelolaToko.jsx` — "menu" and "bahan" tab state, handlers, and JSX blocks are intact; only store-related code removed |

---

## Summary

**Total criteria:** 23
**Passed:** 22
**Failed:** 1
**Blocked:** 0

---

## Failed Criteria (detail)

**AC-013: Status "Tersambung" tampil saat membuka ulang halaman dengan printer tersimpan di localStorage**
- Result: FAIL
- Code inspected: `Pengaturan.jsx:42-46` — `const [connected, setConnected] = useState(false)`
- The green "Printer Terhubung" badge (`Pengaturan.jsx:112`) only renders when both `saved && connected` are true
- On page reload: `saved` is populated from localStorage, but `connected` starts as `false`
- Result: grey "Belum Terhubung" badge appears, not green "Printer Terhubung"
- Root cause: Auto-connect on mount was removed during code review (to avoid conflicting with existing Bluetooth connection)
- Spec note: "Status koneksi Bluetooth tidak persisten antar session app — reconnect otomatis terjadi saat cetak" — this spec constraint actually supports the current behaviour (no persistent connection)
- Contradiction: AC-013 says green badge should appear on page open, but the spec's own three-state table explicitly defines a "Tersimpan tapi belum connect" (grey) state for exactly this scenario
- Suggested fix options:
  1. **Update AC-013** to match actual design: expected result = "Badge abu 'Belum Terhubung' + nama printer tampil, tombol 'Hubungkan' tersedia" (no code change needed)
  2. **Restore auto-connect on mount** with a safe guard (check if `bluetoothSerial.isConnected()` first before connecting) — satisfies original AC but reintroduces code review concern

---

## Overall Verdict

**FAIL** — 1 criterion did not pass.

**AC-013** is a spec/AC inconsistency: the spec's three-state table defines "Tersimpan tapi belum connect" as a valid state (grey badge on page open), but AC-013 expects the green badge. The auto-connect on mount was deliberately removed during code review because it conflicts with the spec constraint "reconnect otomatis terjadi saat cetak" (auto-reconnect at print time, not at page open).

**Recommended resolution:** Update AC-013 to match the spec's three-state table — the grey "Belum Terhubung" badge on page open is the correct and intentional behaviour. No code change required.
