# Pencatatan Pengeluaran — Design Spec

## Goal

Tambah fitur pencatatan pengeluaran operasional toko. Pengeluaran kategori "Belanja Bahan" terintegrasi dua arah dengan stok bahan di KelolaToko: input dari halaman Pengeluaran otomatis menambah stok, input "Masuk" di tab Bahan otomatis mencatat pengeluaran. Semua role bisa mencatat; admin/superadmin bisa melihat seluruh data toko.

---

## Architecture

**Stack:** Laravel 11 + Inertia.js + React 18, pola sama dengan halaman Laporan dan Pengaturan yang sudah ada.

**Komponen baru:**
- `database/migrations/` — migration tabel `expenses`
- `app/Http/Controllers/ExpenseController.php` — index + store
- `resources/js/Pages/Pengeluaran.jsx` — halaman utama

**Komponen dimodifikasi:**
- `app/Http/Controllers/MaterialController.php` — `updateStock` (type: in) auto-create expense
- `app/Http/Controllers/LaporanController.php` — tambah data pengeluaran ke summary
- `routes/web.php` — tambah route pengeluaran
- `resources/js/Components/Sidebar.jsx` — tambah menu Pengeluaran
- `resources/js/Layouts/AuthenticatedLayout.jsx` — tambah mobile nav Pengeluaran
- `resources/js/Pages/Admin/LaporanAdmin.jsx` — tambah card KPI pengeluaran + laba setelah pengeluaran

---

## Database

Tabel `expenses` (model `Expense` sudah ada di `app/Models/Expense.php`):

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | |
| store_id | bigint FK | toko pemilik |
| user_id | bigint FK | user yang mencatat |
| category | varchar(50) | enum: Belanja Bahan, Gaji, Listrik, Air, Sewa, Lain-lain |
| description | text nullable | keterangan bebas; wajib jika category = Lain-lain |
| material_id | bigint FK nullable | diisi jika category = Belanja Bahan |
| amount | decimal(15,2) | total nominal pengeluaran |
| expense_date | date | tanggal pengeluaran |
| timestamps | | created_at, updated_at |

`material_id` nullable agar expense dari "Masuk" bahan bisa menyimpan referensi ke material, dan expense non-bahan tidak perlu relasi.

---

## Backend

### ExpenseController

**`index(Request $request)`**
- Auth: semua role
- Superadmin: lihat semua toko. Admin/kasir: hanya toko sendiri (`store_id`)
- Query parameter: `mode` (`bulan`|`hari`, default `bulan`), `tanggal` (date string, default today/bulan ini)
- Return Inertia `Pengeluaran` dengan props:
  - `expenses` — riwayat (limit 100, order by expense_date desc)
  - `summary` — total keseluruhan + total per kategori untuk periode aktif
  - `materials` — list bahan toko (untuk dropdown Belanja Bahan)
  - `filter` — `{ mode, tanggal }`

**`store(Request $request)`**
- Validasi:
  - `category`: required, in enum
  - `description`: required_if category=Lain-lain
  - `amount`: required, numeric, min:1
  - `expense_date`: required, date
  - `material_id`: required_if category=Belanja Bahan, exists:materials,id
  - `qty`: required_if category=Belanja Bahan, numeric, min:0.01
- Jika category = Belanja Bahan:
  - Ambil material, pastikan `store_id` cocok
  - Update `material->stock += qty`
  - Set `amount = qty * harga_per_unit` (harga dikirim dari form, bisa berbeda dari `buy_price`)
- Buat `Expense` record
- Return `redirect()->back()->with('success', ...)`

### MaterialController — updateStock

Tambahkan setelah `$bahan->save()` ketika `$request->type === 'in'`:

```php
Expense::create([
    'store_id'     => $bahan->store_id,
    'user_id'      => auth()->id(),
    'category'     => 'Belanja Bahan',
    'description'  => $bahan->name,
    'material_id'  => $bahan->id,
    'amount'       => $bahan->buy_price * $request->qty,
    'expense_date' => now()->toDateString(),
]);
```

Stok awal saat create material TIDAK dicatat sebagai pengeluaran.

### LaporanController — update summary

Tambah ke response `index()` dan `harian()`:

- `pengeluaran` — total amount expenses periode aktif (filter by store jika bukan superadmin)
- `labaSetelahPengeluaran` — `bersih - pengeluaran` (bersih = pendapatan - hpp, tidak rename)
- `growthPengeluaran` — perbandingan vs periode sebelumnya

Label di frontend untuk `bersih` diubah dari "Laba Bersih" → "Laba Kotor" tanpa mengubah key di PHP.

---

## Routes

```php
// routes/web.php — dalam middleware auth
Route::get('/pengeluaran', [ExpenseController::class, 'index'])->name('pengeluaran');
Route::post('/pengeluaran', [ExpenseController::class, 'store'])->name('pengeluaran.store');
```

Tidak ada role restriction khusus — cukup `auth` middleware, semua role bisa akses.

---

## Frontend — Pengeluaran.jsx

### Layout

```
[Header: "Pengeluaran"]

[Card: Summary]
  Total: Rp xxx          [periode label]
  Belanja Bahan: Rp x  Gaji: Rp x  Listrik: Rp x  ...

[Toolbar]
  ○ Bulan  ○ Hari    [Date Input]    [+ Tambah Pengeluaran]

[Tabel]
  Tanggal | Kategori | Keterangan | Jumlah | Kasir
```

### Modal Tambah — Kategori "Belanja Bahan"

```
Kategori: [Belanja Bahan ▼]
Pilih Bahan: [dropdown list bahan]
Satuan: [auto-fill, read-only]
Qty: [number input]
Harga/unit: [auto-fill dari buy_price, editable]
Total: [auto-calculated = qty × harga, read-only]
Tanggal: [date, default hari ini]
[Simpan]
```

### Modal Tambah — Kategori lain

```
Kategori: [Gaji ▼ / Listrik / Air / Sewa / Lain-lain]
Keterangan: [text input — wajib jika Lain-lain]
Jumlah: [number input]
Tanggal: [date, default hari ini]
[Simpan]
```

### Filter behavior

- Toggle Bulan/Hari mengubah query param `mode`
- Date input: jika Bulan → `<input type="month">`, jika Hari → `<input type="date">`
- Saat filter berubah → Inertia `router.get` dengan params baru (preserve scroll)
- Summary dan tabel keduanya ikut filter aktif

---

## Laporan — update KPI cards

Tambah 2 card baru setelah card "Laba Bersih" (yang sekarang):

| Card | Nilai | Label lama → baru |
|---|---|---|
| Laba Kotor | pendapatan − hpp | "Laba Bersih" → "Laba Kotor" (label saja, key PHP tetap `bersih`) |
| Pengeluaran | total expenses | card baru |
| Laba Setelah Pengeluaran | laba kotor − pengeluaran | card baru |

`growthPengeluaran` dan `growthLabaSetelah` dihitung vs bulan/hari sebelumnya, ditampilkan sebagai badge % naik/turun.

---

## Navigasi

**Sidebar.jsx** — tambah item:
```js
{ name: 'Pengeluaran', icon: BanknotesIcon, link: '/pengeluaran', roles: ['user', 'admin', 'superadmin'] }
```

**AuthenticatedLayout.jsx** (mobile bottom nav) — tambah item dengan ikon yang sama.

---

## Categories Enum

```
Belanja Bahan | Gaji | Listrik | Air | Sewa | Lain-lain
```

Disimpan sebagai string di kolom `category`. Tidak pakai tabel terpisah — YAGNI.

---

## Error & Edge Cases

- Belanja Bahan tapi material tidak ditemukan / beda toko → validasi server, return error
- Harga per unit 0 → validasi min:0.01 di amount
- Filter ke bulan/hari tanpa data → tabel kosong, summary Rp 0 (bukan error)
- Superadmin: expenses dari semua toko tampil di Laporan (sama dengan pola sales)
