# Halaman Pengaturan Toko — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat halaman Pengaturan (`/pengaturan`) yang berisi setting printer Bluetooth (connect sekali, cetak langsung) dan profil toko (dipindahkan dari KelolaToko), serta menghapus tab Toko dari KelolaToko.

**Architecture:** Single Inertia page `Pengaturan.jsx` dengan dua tab (Printer / Profil Toko). Printer Bluetooth pakai `window.bluetoothSerial` + `localStorage["werp_bt_printer"]` yang sudah ada. ESC/POS builder diekstrak ke shared helper agar bisa dipakai Cart.jsx untuk auto-connect tanpa modal. Semua role bisa akses `/pengaturan`; tab Profil Toko hanya render untuk admin/superadmin.

**Tech Stack:** Laravel 11, Inertia.js, React 18, Tailwind CSS, Capacitor Android, cordova-plugin-bluetooth-serial

---

## File Map

| Action | File | Keterangan |
|--------|------|------------|
| Create | `app/Http/Controllers/PengaturanController.php` | Index action, render Pengaturan page |
| Modify | `routes/web.php` | Tambah route GET /pengaturan (auth semua role) |
| Modify | `app/Http/Controllers/StoreController.php` | Ubah redirect ke `pengaturan` |
| Create | `resources/js/helpers/escpos.js` | Shared ESC/POS byte builder |
| Modify | `resources/js/Components/BluetoothPrinterModal.jsx` | Import escpos dari helper, hapus local duplicate |
| Create | `resources/js/Pages/Pengaturan.jsx` | Halaman pengaturan dengan tab Printer + Profil Toko |
| Modify | `resources/js/Components/Sidebar.jsx` | Tambah menu Pengaturan |
| Modify | `resources/js/Layouts/AuthenticatedLayout.jsx` | Tambah Pengaturan ke mobile bottom nav |
| Modify | `resources/js/Pages/KelolaToko.jsx` | Hapus tab Toko dan state terkait |
| Modify | `resources/js/Components/Cart.jsx` | Auto-connect printer dari localStorage saat cetak |

---

## Task 1: Backend — PengaturanController + Route

**Satisfies:** AC-001–AC-009 (route + page load)

**Files:**
- Create: `app/Http/Controllers/PengaturanController.php`
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/StoreController.php`

- [ ] **Step 1: Buat PengaturanController**

Buat file `app/Http/Controllers/PengaturanController.php`:

```php
<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Pengaturan', [
            'store' => $user->store,
        ]);
    }
}
```

- [ ] **Step 2: Tambah route GET /pengaturan di routes/web.php**

Tambahkan setelah baris `require __DIR__.'/auth.php';` yang ada, sebelum akhir file. Tepatnya tambahkan di dalam group `Route::middleware('auth')` yang sudah ada (baris 56-60), atau tambahkan group baru:

Buka `routes/web.php`, tambahkan di **baris 62** (sebelum group kasir yang ada):

```php
Route::middleware('auth')->group(function () {
    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan');
});
```

Dan tambahkan import di bagian atas file (setelah `use App\Http\Controllers\DashboardController;`):

```php
use App\Http\Controllers\PengaturanController;
```

- [ ] **Step 3: Update redirect di StoreController**

Buka `app/Http/Controllers/StoreController.php` baris 39. Ganti:

```php
return redirect()->route('kelolatoko')->with('success', 'Profil toko berhasil diupdate!');
```

Menjadi:

```php
return redirect()->route('pengaturan')->with('success', 'Profil toko berhasil diupdate!');
```

- [ ] **Step 4: Verifikasi route terdaftar**

```bash
php artisan route:list --name=pengaturan
```

Expected output:
```
GET|HEAD  pengaturan  pengaturan  App\Http\Controllers\PengaturanController@index
```

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/PengaturanController.php routes/web.php app/Http/Controllers/StoreController.php
git commit -m "feat: add PengaturanController and /pengaturan route"
```

---

## Task 2: Extract ESC/POS Builder ke Shared Helper

**Satisfies:** Fondasi untuk AC-015 (auto-print tanpa duplikasi kode)

**Files:**
- Create: `resources/js/helpers/escpos.js`
- Modify: `resources/js/Components/BluetoothPrinterModal.jsx`

- [ ] **Step 1: Buat `resources/js/helpers/escpos.js`**

```js
const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;
const W   = 32; // lebar kertas 58mm = 32 karakter

const enc     = (s) => Array.from(new TextEncoder().encode(String(s).slice(0, W)));
const line    = (t = '') => [...enc(String(t).padEnd(W)), LF];
const center  = (t = '') => { const p = Math.max(0, Math.floor((W - t.length) / 2)); return line(' '.repeat(p) + t); };
const divider = () => line('-'.repeat(W));
const row     = (l, r) => { const sp = Math.max(1, W - l.length - r.length); return line(l + ' '.repeat(sp) + r); };

const fmt = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

export function buildEscPos({ store, kasirName, invoiceNo, saleDate, items, total, payment, paid, change }) {
    const bytes = [
        ESC, 0x40,
        ESC, 0x45, 0x01, ...center(store?.name ?? 'TOKO'), ESC, 0x45, 0x00,
        ...center(store?.address ?? ''),
        ...(store?.phone ? center(store.phone) : []),
        ...divider(),
        ...line(`No : ${invoiceNo}`),
        ...line(`Tgl: ${saleDate}`),
        ...line(`Kas: ${kasirName}`),
        ...line(`Byr: ${payment}`),
        ...divider(),
    ];

    for (const item of items) {
        bytes.push(...line(item.name));
        bytes.push(...row(`  ${item.qty}x ${fmt(item.price)}`, fmt((item.price ?? 0) * (item.qty ?? 1))));
    }

    bytes.push(
        ...divider(),
        ESC, 0x45, 0x01, ...row('TOTAL', fmt(total)), ESC, 0x45, 0x00,
    );

    if (payment !== 'QRIS' && paid) {
        bytes.push(...row('Tunai', fmt(paid)), ...row('Kembali', fmt(change)));
    }

    bytes.push(
        ...divider(),
        ...center('Terima kasih!'),
        ...center('WERP'),
        LF, LF, LF,
        GS, 0x56, 0x00,
    );

    return new Uint8Array(bytes);
}
```

- [ ] **Step 2: Update BluetoothPrinterModal.jsx — hapus local buildEscPos, import dari helper**

Buka `resources/js/Components/BluetoothPrinterModal.jsx`.

Tambahkan import di baris 1:
```js
import { buildEscPos } from '@/helpers/escpos';
```

Hapus seluruh fungsi lokal `buildEscPos` di baris 159–205 (dari `// ESC/POS builder` sampai akhir file).

Verifikasi file masih memanggil `buildEscPos(receiptData)` di `handlePrint` (baris 62) — tidak perlu diubah, nama fungsinya sama.

- [ ] **Step 3: Build dan cek tidak ada error**

```bash
npm run build 2>&1 | tail -20
```

Expected: build selesai tanpa error. Jika ada "Cannot find module '@/helpers/escpos'" pastikan file sudah tersimpan di path yang benar.

- [ ] **Step 4: Commit**

```bash
git add resources/js/helpers/escpos.js resources/js/Components/BluetoothPrinterModal.jsx
git commit -m "refactor: extract ESC/POS builder to shared helper"
```

---

## Task 3: Buat Halaman Pengaturan.jsx

**Satisfies:** AC-004–AC-021

**Files:**
- Create: `resources/js/Pages/Pengaturan.jsx`

- [ ] **Step 1: Buat `resources/js/Pages/Pengaturan.jsx`**

```jsx
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    PrinterIcon, SignalIcon, ArrowPathIcon, XMarkIcon,
    BuildingStorefrontIcon, CameraIcon,
    CheckCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/solid';

const STORAGE_KEY = 'werp_bt_printer';
const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNative;

const inputCls = 'w-full rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-500 transition';
const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1';

function GlassCard({ children, className = '' }) {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function Notification({ notif }) {
    if (!notif) return null;
    const isSuccess = notif.type === 'success';
    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] ${isSuccess ? 'bg-green-500' : 'bg-red-500'} text-white rounded-2xl shadow-2xl p-5 max-w-sm w-full`}>
            <div className="flex items-center gap-3">
                {isSuccess
                    ? <CheckCircleIcon className="w-7 h-7 shrink-0" />
                    : <ExclamationCircleIcon className="w-7 h-7 shrink-0" />}
                <div>
                    <p className="font-bold">{notif.title}</p>
                    {notif.message && <p className="text-sm opacity-90">{notif.message}</p>}
                </div>
            </div>
        </div>
    );
}

// ─── TAB: PRINTER BLUETOOTH ───────────────────────────────────────────────────
function PrinterTab() {
    const [devices, setDevices]       = useState([]);
    const [saved, setSaved]           = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
    });
    const [connected, setConnected]   = useState(false);
    const [scanning, setScanning]     = useState(false);
    const [connecting, setConnecting] = useState(null); // address yang sedang di-connect
    const [error, setError]           = useState(null);

    const bt = () => window.bluetoothSerial;

    useEffect(() => {
        if (saved && isNative()) {
            connectTo(saved);
        }
    }, []);

    const scan = () => {
        setScanning(true);
        setError(null);
        bt()?.list(
            (list) => { setDevices(list); setScanning(false); },
            (err)  => { setError('Gagal scan: ' + err); setScanning(false); }
        );
    };

    const connectTo = (device) => {
        setConnecting(device.address);
        setError(null);
        bt()?.connect(
            device.address,
            () => {
                setConnected(true);
                setConnecting(null);
                setSaved(device);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
            },
            (err) => {
                setConnecting(null);
                setError('Gagal connect: ' + err);
            }
        );
    };

    const disconnect = () => {
        bt()?.disconnect(() => {}, () => {});
        setConnected(false);
        setSaved(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!isNative()) {
        return (
            <GlassCard className="p-6 max-w-lg mx-auto">
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <PrinterIcon className="w-14 h-14 text-gray-300 dark:text-slate-600" />
                    <div>
                        <h3 className="font-bold text-gray-700 dark:text-white text-lg">Fitur Printer Bluetooth</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Fitur ini hanya tersedia di aplikasi Android.<br />
                            Buka aplikasi dari perangkat Android untuk menghubungkan printer.
                        </p>
                    </div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-6 max-w-lg mx-auto space-y-5">
            <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Printer Bluetooth</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Hubungkan printer satu kali, cetak kapan saja tanpa perlu setting ulang</p>
            </div>

            {/* Status */}
            {saved && connected && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                        <PrinterIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-green-700 dark:text-green-300 text-sm">Printer Terhubung</p>
                        <p className="text-xs text-green-600 dark:text-green-400 truncate">{saved.name}</p>
                        <p className="text-xs text-green-500 dark:text-green-500">{saved.address}</p>
                    </div>
                    <button onClick={disconnect}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                        Putuskan
                    </button>
                </div>
            )}

            {saved && !connected && connecting === null && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gray-300 dark:bg-slate-600 flex items-center justify-center shrink-0">
                        <PrinterIcon className="w-5 h-5 text-gray-500 dark:text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-600 dark:text-slate-300 text-sm">Belum Terhubung</p>
                        <p className="text-xs text-gray-400 dark:text-slate-400 truncate">{saved.name}</p>
                    </div>
                    <button onClick={() => connectTo(saved)}
                        className="px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold hover:bg-orange-200 transition">
                        Hubungkan
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Scan button */}
            <button onClick={scan} disabled={scanning}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-600 text-orange-500 dark:text-orange-400 text-sm font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition disabled:opacity-50">
                <ArrowPathIcon className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Mencari perangkat...' : 'Scan & Ganti Printer'}
            </button>

            {/* Device list */}
            {devices.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Perangkat Tersedia ({devices.length})
                    </p>
                    {devices.map((d) => {
                        const isConn = saved?.address === d.address && connected;
                        const isConnecting = connecting === d.address;
                        return (
                            <button key={d.address} onClick={() => connectTo(d)}
                                disabled={!!connecting}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left
                                    ${isConn
                                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    } disabled:opacity-50`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isConn ? 'bg-green-500' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                    <SignalIcon className={`w-5 h-5 ${isConn ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{d.name ?? 'Unknown'}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">{d.address}</p>
                                </div>
                                {isConn && <span className="text-xs text-green-600 dark:text-green-400 font-semibold shrink-0">Aktif</span>}
                                {isConnecting && <ArrowPathIcon className="w-4 h-4 text-orange-400 animate-spin shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                💡 Pastikan printer sudah di-pair di Settings Bluetooth Android sebelum muncul di daftar ini.
                Setelah terhubung di sini, cetak nota dari Kasir akan langsung tanpa perlu pilih printer lagi.
            </div>
        </GlassCard>
    );
}

// ─── TAB: PROFIL TOKO ─────────────────────────────────────────────────────────
function ProfilTokoTab({ store, showNotif }) {
    const [logoPreview, setLogoPreview]   = useState(store?.logo ? `/storage/${store.logo}` : null);
    const [qrisPreview, setQrisPreview]   = useState(store?.qris_image ? `/storage/${store.qris_image}` : null);

    const storeForm = useForm({
        name:       store?.name ?? '',
        address:    store?.address ?? '',
        phone:      store?.phone ?? '',
        logo:       null,
        qris_image: null,
    });

    const saveStore = () => {
        storeForm.post('/store/update', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => showNotif('success', 'Profil toko berhasil diupdate!'),
            onError:   () => showNotif('error', 'Gagal mengupdate profil toko.'),
        });
    };

    return (
        <GlassCard className="p-6 max-w-lg mx-auto space-y-6">
            <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Profil Toko</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Update nama, logo, dan info toko</p>
            </div>

            {/* LOGO UPLOAD */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 dark:text-slate-500">
                                <BuildingStorefrontIcon className="w-10 h-10 mb-1" />
                                <p className="text-xs">No Logo</p>
                            </div>
                        )}
                    </div>
                    <button type="button"
                        onClick={() => document.getElementById('pg-logo-input').click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-orange-500 flex items-center justify-center shadow-lg hover:bg-orange-50 transition">
                        <CameraIcon className="w-4 h-4" />
                    </button>
                </div>
                <input id="pg-logo-input" type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { showNotif('error', 'Ukuran logo maksimal 2MB!'); return; }
                        storeForm.setData('logo', file);
                        setLogoPreview(URL.createObjectURL(file));
                    }} />
                <p className="text-xs text-gray-400 dark:text-slate-500">Klik ikon kamera untuk ganti logo (maks 2MB)</p>
            </div>

            {/* FORM */}
            <div className="space-y-4">
                <div>
                    <label className={labelCls}>Nama Toko</label>
                    <input value={storeForm.data.name}
                        onChange={(e) => storeForm.setData('name', e.target.value)}
                        placeholder="Nama toko" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Alamat</label>
                    <input value={storeForm.data.address}
                        onChange={(e) => storeForm.setData('address', e.target.value)}
                        placeholder="Alamat toko" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>No. Telepon</label>
                    <input value={storeForm.data.phone}
                        onChange={(e) => storeForm.setData('phone', e.target.value)}
                        placeholder="08xxxxxxxxxx" className={inputCls} />
                </div>

                {/* QRIS */}
                <div>
                    <label className={labelCls}>Gambar QRIS Toko</label>
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/30 bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition"
                        onClick={() => document.getElementById('pg-qris-input').click()}>
                        {qrisPreview ? (
                            <>
                                <img src={qrisPreview} alt="QRIS" className="w-full h-full object-contain p-2" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                    <p className="text-gray-900 dark:text-white text-sm font-semibold">Ganti Gambar QRIS</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-400 dark:text-slate-500">
                                <CameraIcon className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs">Klik untuk upload gambar QRIS</p>
                            </div>
                        )}
                    </div>
                    <input id="pg-qris-input" type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) { showNotif('error', 'Ukuran gambar QRIS maksimal 2MB!'); return; }
                            storeForm.setData('qris_image', file);
                            setQrisPreview(URL.createObjectURL(file));
                        }} />
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Screenshot QRIS dari bank/e-wallet toko (maks 2MB)</p>
                </div>

                {/* Invite Code */}
                {store?.invite_code && (
                    <div>
                        <label className={labelCls}>Kode Undangan Toko</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-gray-900 dark:text-white font-mono font-bold tracking-widest text-center">
                                {store.invite_code}
                            </div>
                            <button type="button"
                                onClick={() => { navigator.clipboard.writeText(store.invite_code); showNotif('success', 'Kode berhasil disalin!'); }}
                                className="px-4 py-2.5 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition">
                                Salin
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Bagikan kode ini kepada karyawan untuk bergabung</p>
                    </div>
                )}
            </div>

            <button type="button" onClick={saveStore} disabled={storeForm.processing}
                className="w-full py-3 rounded-xl bg-white text-orange-500 font-bold hover:bg-orange-50 transition shadow disabled:opacity-50">
                {storeForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </GlassCard>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Pengaturan({ auth, store = null }) {
    const roles   = auth?.roles || [];
    const isAdmin = roles.includes('admin') || roles.includes('superadmin');
    const [tab, setTab]   = useState('printer');
    const [notif, setNotif] = useState(null);

    const showNotif = (type, title, message) => {
        setNotif({ type, title, message });
        setTimeout(() => setNotif(null), 3500);
    };

    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Pengaturan" />
            <Notification notif={notif} />

            <div className="flex flex-col gap-4 h-full">
                {/* TOP BAR */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setTab('printer')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                                ${tab === 'printer' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                            <PrinterIcon className="w-4 h-4" /> Printer
                        </button>
                        {isAdmin && (
                            <button type="button" onClick={() => setTab('toko')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                                    ${tab === 'toko' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                                <BuildingStorefrontIcon className="w-4 h-4" /> Profil Toko
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto no-scrollbar">
                    {tab === 'printer' && <PrinterTab />}
                    {tab === 'toko' && isAdmin && <ProfilTokoTab store={store} showNotif={showNotif} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

- [ ] **Step 2: Build dan cek tidak ada error**

```bash
npm run build 2>&1 | tail -20
```

Expected: build selesai tanpa error.

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Pengaturan.jsx
git commit -m "feat: add Pengaturan page with Bluetooth printer and store profile tabs"
```

---

## Task 4: Update Sidebar + Mobile Bottom Nav

**Satisfies:** AC-001–AC-003

**Files:**
- Modify: `resources/js/Components/Sidebar.jsx`
- Modify: `resources/js/Layouts/AuthenticatedLayout.jsx`

- [ ] **Step 1: Tambah menu Pengaturan ke Sidebar.jsx**

Buka `resources/js/Components/Sidebar.jsx`. Di array `menus` (baris 31–56), tambahkan item baru setelah item "Kelola Toko":

```js
{
    name: 'Pengaturan',
    icon: Cog6ToothIcon,
    link: '/pengaturan',
    roles: ['user', 'admin', 'superadmin'],
},
```

`Cog6ToothIcon` sudah diimport di baris 8 — tidak perlu import baru.

- [ ] **Step 2: Tambah Pengaturan ke mobile bottom nav di AuthenticatedLayout.jsx**

Buka `resources/js/Layouts/AuthenticatedLayout.jsx`. Di array `bottomNavItems` (baris 57–62), tambahkan item sebelum penutup `]`:

```js
{ name: 'Setting', icon: Cog6ToothIcon, link: '/pengaturan', roles: ['user', 'admin', 'superadmin'] },
```

`Cog6ToothIcon` sudah diimport di baris 7 — tidak perlu import baru.

- [ ] **Step 3: Build dan cek tidak ada error**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/Sidebar.jsx resources/js/Layouts/AuthenticatedLayout.jsx
git commit -m "feat: add Pengaturan menu item to sidebar and mobile nav"
```

---

## Task 5: Hapus Tab Toko dari KelolaToko.jsx

**Satisfies:** AC-022, AC-023

**Files:**
- Modify: `resources/js/Pages/KelolaToko.jsx`

- [ ] **Step 1: Hapus imports yang tidak lagi dipakai**

Buka `resources/js/Pages/KelolaToko.jsx` baris 8. Hapus `CameraIcon` dan `BuildingStorefrontIcon` dari destructure import `@heroicons/react/24/solid` karena keduanya hanya dipakai di tab Toko.

Baris sebelum:
```js
    ChevronDownIcon, BuildingStorefrontIcon, CameraIcon,
```
Menjadi:
```js
    ChevronDownIcon,
```

- [ ] **Step 2: Hapus state logoPreview, qrisPreview**

Hapus baris 206–207:
```js
    const [logoPreview, setLogoPreview] = useState(store?.logo ? `/storage/${store.logo}` : null);
    const [qrisPreview, setQrisPreview] = useState(store?.qris_image ? `/storage/${store.qris_image}` : null);
```

- [ ] **Step 3: Hapus storeForm**

Hapus baris 229–235:
```js
    // Store form
    const storeForm = useForm({
        name: store?.name ?? "",
        address: store?.address ?? "",
        phone: store?.phone ?? "",
        logo: null,
        qris_image: null,
    });
```

- [ ] **Step 4: Hapus fungsi saveStore**

Hapus baris 427–434:
```js
    // ── Store Profile ─────────────────────────────────────────────────────────
    const saveStore = () => {
        storeForm.post('/store/update', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => showNotif("success", "Profil toko berhasil diupdate!"),
            onError: () => showNotif("error", "Gagal mengupdate profil toko."),
        });
    };
```

- [ ] **Step 5: Hapus TabBtn "toko"**

Di JSX sekitar baris 465–472, hapus TabBtn berikut:
```jsx
    <TabBtn
        active={tab === "toko"}
        onClick={() => setTab("toko")}
        icon={BuildingStorefrontIcon}
        label="Toko"
    />
```

- [ ] **Step 6: Hapus seluruh JSX block tab Toko**

Hapus seluruh block JSX (baris 671–794):
```jsx
                    {/* ── PROFIL TOKO TAB ────────────────────────────────── */}
                    {tab === "toko" && (
                        <GlassCard className="p-6 max-w-lg mx-auto space-y-6">
                            ...
                        </GlassCard>
                    )}
```

- [ ] **Step 7: Hapus prop `store` dari signature komponen jika tidak dipakai lagi**

Baris 185, cek apakah `store` masih dipakai di KelolaToko setelah penghapusan. Jika tidak ada lagi penggunaan, hapus dari destructure props:

```js
// Sebelum:
export default function KelolaToko({ auth, products = [], categories = [], materials = [], users = [], store = null }) {
// Sesudah:
export default function KelolaToko({ auth, products = [], categories = [], materials = [], users = [] }) {
```

- [ ] **Step 8: Build dan cek tidak ada error**

```bash
npm run build 2>&1 | tail -20
```

Expected: build tanpa error. Jika ada "is not defined" error pastikan semua referensi ke `storeForm`, `logoPreview`, `qrisPreview`, `saveStore`, `CameraIcon`, `BuildingStorefrontIcon` sudah dihapus.

- [ ] **Step 9: Commit**

```bash
git add resources/js/Pages/KelolaToko.jsx
git commit -m "feat: remove Toko tab from KelolaToko (moved to Pengaturan)"
```

---

## Task 6: Auto-Connect Printer saat Cetak Nota di Cart.jsx

**Satisfies:** AC-015, AC-016, AC-017

**Files:**
- Modify: `resources/js/Components/Cart.jsx`

- [ ] **Step 1: Tambah import buildEscPos di Cart.jsx**

Buka `resources/js/Components/Cart.jsx` baris 1. Tambahkan import:

```js
import { buildEscPos } from '@/helpers/escpos';
```

- [ ] **Step 2: Tambah state dan fungsi autoPrint di PrintModal**

Buka `PrintModal` function (baris 7). Tambahkan state `autoPrinting` dan fungsi `autoPrint` setelah `const [showBT, setShowBT] = useState(false);`:

```js
    const [autoPrinting, setAutoPrinting] = useState(false);

    const autoPrint = () => {
        const saved = (() => {
            try { return JSON.parse(localStorage.getItem('werp_bt_printer')); } catch { return null; }
        })();

        if (!saved?.address) {
            setShowBT(true);
            return;
        }

        setAutoPrinting(true);
        const bt = window.bluetoothSerial;

        bt.connect(
            saved.address,
            () => {
                const bytes = buildEscPos(data);
                bt.write(
                    bytes,
                    () => { setAutoPrinting(false); onClose(); },
                    () => { setAutoPrinting(false); setShowBT(true); }
                );
            },
            () => { setAutoPrinting(false); setShowBT(true); }
        );
    };
```

- [ ] **Step 3: Ganti onClick tombol Cetak Nota (native branch) untuk memanggil autoPrint**

Temukan block berikut (sekitar baris 54–65):

```jsx
                    {isNative() ? (
                        <button onClick={() => setShowBT(true)}
                            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition text-sm flex items-center justify-center gap-2">
                            🖨️ Cetak Nota
                        </button>
                    ) : (
```

Ganti seluruh button native dengan:

```jsx
                    {isNative() ? (
                        <button onClick={autoPrint} disabled={autoPrinting}
                            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                            {autoPrinting ? '⏳ Menghubungkan...' : '🖨️ Cetak Nota'}
                        </button>
                    ) : (
```

- [ ] **Step 4: Build dan cek tidak ada error**

```bash
npm run build 2>&1 | tail -20
```

Expected: build tanpa error.

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/Cart.jsx
git commit -m "feat: auto-connect Bluetooth printer from saved settings when printing"
```

---

## Self-Review

**Spec coverage check:**

| Spec Section | Task |
|---|---|
| Halaman baru `/pengaturan` | Task 1, 3 |
| Tab Printer Bluetooth (semua role) | Task 3 |
| Tab Profil Toko (admin/superadmin) | Task 3 |
| Scan, connect, simpan, putuskan printer | Task 3 |
| Alur cetak auto-connect | Task 6 |
| Fallback ke BluetoothPrinterModal | Task 6 |
| Sidebar menu Pengaturan | Task 4 |
| Mobile bottom nav Pengaturan | Task 4 |
| Hapus tab Toko dari KelolaToko | Task 5 |
| StoreController redirect ke pengaturan | Task 1 |
| Shared ESC/POS builder | Task 2 |

**Type consistency check:**
- `STORAGE_KEY = 'werp_bt_printer'` — sama di `BluetoothPrinterModal.jsx` (baris 4) dan `Pengaturan.jsx` (Task 3) dan `Cart.jsx` (Task 6) ✓
- `buildEscPos(data)` — dipanggil dengan objek `receiptData` di `BluetoothPrinterModal.jsx` dan `data` di `Cart.jsx` (PrintModal receives `data` prop) ✓
- Route name `'pengaturan'` — didefinisikan Task 1, digunakan redirect StoreController Task 1 ✓

**Placeholder scan:** Tidak ada TBD atau TODO. Semua step mengandung kode aktual. ✓
