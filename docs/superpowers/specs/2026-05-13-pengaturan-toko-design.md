# Design: Halaman Pengaturan Toko

**Date:** 2026-05-13
**Status:** Approved

## Ringkasan

Membuat halaman Pengaturan (`/pengaturan`) yang berisi dua fitur utama:
1. **Pengaturan Printer Bluetooth** — connect sekali, cetak kapan saja tanpa perlu reconnect
2. **Profil Toko** — dipindahkan dari tab "Toko" di KelolaToko ke halaman ini

## Perubahan yang Dilakukan

### 1. Halaman Baru: `/pengaturan`

- Route baru `GET /pengaturan` dengan controller + Inertia page `Pengaturan.jsx`
- Dapat diakses oleh **semua role** (user/kasir, admin, superadmin)
- Layout menggunakan `AuthenticatedLayout` yang sudah ada

**Struktur Tab:**
- Tab **Printer Bluetooth** (default, semua role)
- Tab **Profil Toko** (hanya tampil untuk role `admin` dan `superadmin`)

### 2. Tab Printer Bluetooth

**State Tampilan:**

| Kondisi | Tampilan |
|---|---|
| Belum ada printer tersimpan | Tombol "Scan Printer" + info panduan |
| Tersambung | Badge hijau "Printer Terhubung" + nama + tombol "Putuskan" |
| Tersimpan tapi belum connect | Badge abu "Belum Terhubung" + tombol "Hubungkan" |

**Fungsionalitas:**
- Tombol "Scan & Ganti Printer" memanggil `bluetoothSerial.list()` untuk ambil daftar paired devices
- Pilih device → `bluetoothSerial.connect()` → simpan ke `localStorage` key `werp_bt_printer`
- Tombol "Putuskan" → `bluetoothSerial.disconnect()` + hapus dari `localStorage`
- Hanya tersedia di native Android (Capacitor); di browser tampilkan pesan info saja

### 3. Alur Cetak Nota di Kasir (diubah)

**Sebelum:** Klik "Cetak Nota" → selalu tampil `BluetoothPrinterModal` (scan + pilih + connect)

**Sesudah:**
1. Baca `localStorage` key `werp_bt_printer`
2. Jika ada → coba `bluetoothSerial.connect(address)` → jika berhasil → langsung cetak
3. Jika gagal connect atau tidak ada printer tersimpan → fallback ke `BluetoothPrinterModal` (perilaku lama)

Perubahan ada di `Cart.jsx` fungsi `PrintModal`, bukan di `BluetoothPrinterModal`.

### 4. Tab Profil Toko

- Dipindahkan dari `KelolaToko.jsx` (tab "toko") ke `Pengaturan.jsx`
- Konten **identik**: nama toko, alamat, telepon, upload logo (konsep kamera pojok kanan bawah tidak berubah), upload QRIS, kode undangan (read-only)
- Kirim ke `POST /store/update` (route yang sama)
- Tab ini **hanya tampil** jika `auth.roles` mengandung `admin` atau `superadmin`

### 5. Perubahan di Halaman Lain

**Sidebar (`Sidebar.jsx`):**
- Tambah item menu `{ name: "Pengaturan", icon: Cog6ToothIcon, link: "/pengaturan", roles: ["user", "admin", "superadmin"] }`

**KelolaToko (`KelolaToko.jsx`):**
- Hapus tab "Toko" dari `TabBtn` list
- Hapus state dan form terkait toko: `storeForm`, `logoPreview`, `qrisPreview`, `saveStore`
- Hapus seluruh JSX block `{tab === "toko" && (...)}` beserta imports yang tidak terpakai

## Arsitektur Komponen

```
Pengaturan.jsx
├── Tab: "Printer Bluetooth"
│   ├── BluetoothStatusCard (status connected/disconnected)
│   ├── ScanButton (trigger bluetoothSerial.list)
│   └── DeviceList (daftar paired devices, klik untuk connect)
└── Tab: "Profil Toko" (admin/superadmin only)
    ├── LogoUpload (identik dengan KelolaToko — kamera di pojok kanan bawah)
    ├── StoreForm (nama, alamat, telepon)
    ├── QrisUpload
    └── InviteCode (read-only)

Cart.jsx → PrintModal (diubah)
└── Jika native: coba auto-connect dari localStorage → print
    └── Fallback: tampilkan BluetoothPrinterModal
```

## Data & State

- Printer tersimpan: `localStorage["werp_bt_printer"]` → `{ name, address }` (sudah ada, tidak berubah format)
- State koneksi Bluetooth: state lokal di `Pengaturan.jsx` (bukan global, karena Android bisa reconnect kapan saja)
- Props yang dipass ke `Pengaturan.jsx` dari controller: `store`, `auth`

## Backend

- Tambah route `GET /pengaturan` → `PengaturanController@index` (atau bisa re-use `KelolaToko` controller)
- Route `POST /store/update` sudah ada, tidak perlu diubah
- Controller mengirim props: `store`, `auth` (sudah ada di shared props Inertia)

## Batasan & Asumsi

- Bluetooth hanya berfungsi di Capacitor native Android; di browser web tampilkan pesan info
- Pairing awal printer ke Android tetap dilakukan dari Settings Android (bukan dari app)
- Status koneksi Bluetooth tidak persisten antar session app — reconnect otomatis terjadi saat cetak
- Logo dan QRIS upload konsep visual tidak berubah dari implementasi di KelolaToko
