# Acceptance Criteria: Pencatatan Pengeluaran

**Spec:** `docs/superpowers/specs/2026-05-13-pengeluaran-design.md`
**Date:** 2026-05-13
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | Tabel `expenses` tersedia di database dengan kolom yang benar | Logic | Migration dijalankan | `php artisan migrate:status` menampilkan migration expenses sebagai "Ran"; tabel memiliki kolom: id, store_id, user_id, category, description, material_id (nullable), amount, expense_date, timestamps |
| AC-002 | GET /pengeluaran dapat diakses oleh role user (kasir) | API | User dengan role `user` login, ada store_id | Response HTTP 200, halaman Pengeluaran dirender |
| AC-003 | GET /pengeluaran dapat diakses oleh role admin | API | User dengan role `admin` login | Response HTTP 200, halaman Pengeluaran dirender |
| AC-004 | GET /pengeluaran dapat diakses oleh role superadmin | API | User dengan role `superadmin` login | Response HTTP 200, halaman Pengeluaran dirender |
| AC-005 | Admin dan kasir hanya melihat pengeluaran toko sendiri | API | Ada expenses dari dua store berbeda; user admin login di store A | Response `expenses` hanya berisi data dengan `store_id` milik store A |
| AC-006 | Superadmin melihat pengeluaran semua toko | API | Ada expenses dari dua store berbeda; user superadmin login | Response `expenses` berisi data dari kedua store |
| AC-007 | POST /pengeluaran menyimpan expense kategori non-bahan dengan benar | API | User auth login, body: `{category: "Gaji", description: "Gaji Mei", amount: 500000, expense_date: "2026-05-13"}` | HTTP 302 redirect back; record expense terbuat di DB dengan nilai yang sesuai dan `user_id` = user login |
| AC-008 | POST /pengeluaran dengan category=Lain-lain wajib mengisi description | API | User auth login, body: `{category: "Lain-lain", description: "", amount: 50000, expense_date: "2026-05-13"}` | HTTP 422 dengan error validasi pada field `description` |
| AC-009 | POST /pengeluaran kategori Belanja Bahan membutuhkan material_id dan qty | API | User auth login, body: `{category: "Belanja Bahan", amount: 100000, expense_date: "2026-05-13"}` tanpa material_id dan qty | HTTP 422 dengan error validasi pada field `material_id` dan `qty` |
| AC-010 | POST /pengeluaran Belanja Bahan menambah stok material | API | Material id=1 dengan stock=10 ada di DB; body: `{category: "Belanja Bahan", material_id: 1, qty: 5, amount: 50000, expense_date: "2026-05-13"}` | Setelah request sukses, `materials` id=1 memiliki `stock = 15` di DB |
| AC-011 | POST /pengeluaran Belanja Bahan menyimpan material_id di expense | API | Material id=1 ada di DB milik store user | Setelah request sukses, record expense terbaru memiliki `material_id = 1` |
| AC-012 | POST /pengeluaran Belanja Bahan tidak bisa akses material milik toko lain | API | User store A mencoba kirim `material_id` milik store B | HTTP 422 dengan error validasi pada `material_id` |
| AC-013 | MaterialController updateStock type=in otomatis membuat expense | API | Material id=1, buy_price=10000 ada di DB; POST /bahan/1/stock dengan body `{type: "in", qty: 3}` | Record expense terbaru di DB memiliki: category="Belanja Bahan", material_id=1, amount=30000, store_id=material.store_id, user_id=user login |
| AC-014 | MaterialController updateStock type=out tidak membuat expense | API | Material id=1 ada di DB; POST /bahan/1/stock dengan body `{type: "out", qty: 2}` | Jumlah baris di tabel expenses tidak bertambah |
| AC-015 | Create material baru (stok awal) tidak membuat expense | API | POST /bahan dengan body material baru termasuk stock awal | Jumlah baris di tabel expenses tidak bertambah setelah material dibuat |
| AC-016 | LaporanController index menyertakan data pengeluaran bulan ini | API | Ada expenses di bulan berjalan untuk store yang login | Response JSON dari GET /laporan mengandung key `pengeluaran` (float), `labaSetelahPengeluaran` (float), `growthPengeluaran` (float) |
| AC-017 | LaporanController harian menyertakan data pengeluaran hari yang dipilih | API | Ada expenses pada tanggal 2026-05-13; GET /laporan/harian?tanggal=2026-05-13 | Response JSON mengandung key `pengeluaran`, `labaSetelahPengeluaran`, `growthPengeluaran` dengan nilai yang sesuai total expenses tanggal tersebut |
| AC-018 | labaSetelahPengeluaran = bersih − pengeluaran | Logic | `bersih` = 1000000, total expenses periode = 200000 | `labaSetelahPengeluaran` = 800000 dalam response LaporanController |
| AC-019 | Halaman /pengeluaran menampilkan summary card dengan total dan breakdown per kategori | UI interaction | User login, ada expenses bulan ini dari beberapa kategori | Halaman menampilkan total pengeluaran periode aktif dan breakdown per kategori (Belanja Bahan, Gaji, dll.) sebagai teks |
| AC-020 | Filter mode Bulan menampilkan data bulan yang dipilih | UI interaction | User login, ada expenses di Mei dan April 2026 | Setelah pilih mode Bulan dan pilih April 2026, tabel hanya menampilkan expenses dengan expense_date di bulan April |
| AC-021 | Filter mode Hari menampilkan data hari yang dipilih | UI interaction | User login, ada expenses di tanggal berbeda | Setelah pilih mode Hari dan pilih tanggal 2026-05-10, tabel hanya menampilkan expenses dengan expense_date = 2026-05-10 |
| AC-022 | Tabel riwayat menampilkan kolom Tanggal, Kategori, Keterangan, Jumlah, Kasir | UI interaction | User login, ada minimal 1 expense | Tabel menampilkan 5 kolom dengan data yang sesuai dari expense record |
| AC-023 | Modal tambah untuk kategori Belanja Bahan menampilkan dropdown bahan | UI interaction | User login, ada minimal 1 material di toko | Setelah klik "+ Tambah Pengeluaran" dan pilih kategori "Belanja Bahan", muncul dropdown berisi nama-nama bahan toko |
| AC-024 | Pilih bahan di modal otomatis mengisi satuan (read-only) | UI interaction | User login, material "Tepung" dengan unit "gram" ada di toko | Setelah pilih "Tepung" dari dropdown bahan, field satuan terisi "gram" dan tidak bisa diedit |
| AC-025 | Total di modal Belanja Bahan terhitung otomatis dari qty × harga | UI interaction | Modal Belanja Bahan terbuka, bahan dipilih dengan harga 5000 | Setelah input qty=10, field total menampilkan nilai Rp 50.000 secara otomatis |
| AC-026 | Harga per unit di modal Belanja Bahan bisa diedit | UI interaction | Modal Belanja Bahan terbuka, bahan dipilih | Setelah mengubah harga/unit dari default menjadi nilai lain, total otomatis ikut berubah |
| AC-027 | Modal tambah kategori non-bahan mewajibkan keterangan jika Lain-lain | UI interaction | Modal tambah terbuka | Setelah pilih kategori "Lain-lain" dan klik Simpan tanpa mengisi keterangan, form tidak terkirim dan muncul pesan error pada field keterangan |
| AC-028 | Setelah simpan expense berhasil, data muncul di tabel riwayat | UI interaction | User login di halaman /pengeluaran | Setelah isi dan submit form expense baru, tabel riwayat menampilkan baris baru dengan data yang baru disimpan (tanpa reload penuh) |
| AC-029 | Halaman Laporan menampilkan card "Pengeluaran" dan "Laba Setelah Pengeluaran" | UI interaction | User admin/superadmin login, ada expenses dan sales bulan ini | Halaman /laporan menampilkan card dengan label "Pengeluaran" dan card dengan label "Laba Setelah Pengeluaran" |
| AC-030 | Card yang sebelumnya berlabel "Laba Bersih" kini berlabel "Laba Kotor" | UI interaction | User admin/superadmin membuka halaman /laporan | Halaman /laporan menampilkan card berlabel "Laba Kotor" (bukan "Laba Bersih") yang nilainya = pendapatan − HPP |
| AC-031 | Menu "Pengeluaran" muncul di sidebar untuk semua role | UI interaction | User dengan role user/admin/superadmin login | Sidebar menampilkan item "Pengeluaran" dengan link ke /pengeluaran |
| AC-032 | Menu "Pengeluaran" muncul di mobile bottom nav untuk semua role | UI interaction | User login di tampilan mobile (viewport < 640px) | Bottom navigation menampilkan item "Pengeluaran" yang dapat diklik menuju /pengeluaran |
