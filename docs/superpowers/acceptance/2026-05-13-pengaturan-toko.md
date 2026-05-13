# Acceptance Criteria: Halaman Pengaturan Toko

**Spec:** `docs/superpowers/specs/2026-05-13-pengaturan-toko-design.md`
**Date:** 2026-05-13
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | Menu "Pengaturan" muncul di sidebar untuk role user/kasir | UI interaction | Login sebagai role `user` | Sidebar menampilkan item "Pengaturan" dengan ikon gear |
| AC-002 | Menu "Pengaturan" muncul di sidebar untuk role admin | UI interaction | Login sebagai role `admin` | Sidebar menampilkan item "Pengaturan" dengan ikon gear |
| AC-003 | Menu "Pengaturan" muncul di sidebar untuk role superadmin | UI interaction | Login sebagai role `superadmin` | Sidebar menampilkan item "Pengaturan" dengan ikon gear |
| AC-004 | Navigasi ke `/pengaturan` berhasil untuk semua role | UI interaction | Login sebagai role `user` | Klik menu "Pengaturan" → URL berubah ke `/pengaturan`, halaman tampil tanpa error |
| AC-005 | Tab "Printer Bluetooth" tampil sebagai tab aktif saat pertama buka | UI interaction | Buka `/pengaturan` dengan role apapun | Tab "Printer Bluetooth" aktif (highlight oranye), konten printer tampil |
| AC-006 | Tab "Profil Toko" tidak tampil untuk role user/kasir | UI interaction | Login sebagai role `user`, buka `/pengaturan` | Hanya ada satu tab "Printer Bluetooth" — tidak ada tab "Profil Toko" |
| AC-007 | Tab "Profil Toko" tampil untuk role admin | UI interaction | Login sebagai role `admin`, buka `/pengaturan` | Dua tab tampil: "Printer Bluetooth" dan "Profil Toko" |
| AC-008 | Tab "Profil Toko" tampil untuk role superadmin | UI interaction | Login sebagai role `superadmin`, buka `/pengaturan` | Dua tab tampil: "Printer Bluetooth" dan "Profil Toko" |
| AC-009 | Halaman Printer Bluetooth menampilkan panduan ketika bukan native Android | UI interaction | Buka `/pengaturan` di browser web (non-Capacitor) | Tampil pesan info bahwa fitur Bluetooth hanya tersedia di aplikasi Android |
| AC-010 | Tombol "Scan & Ganti Printer" memunculkan daftar paired Bluetooth devices | UI interaction | Buka `/pengaturan` di native Android, printer sudah di-pair di Android | Klik tombol → daftar perangkat Bluetooth yang sudah di-pair muncul dalam hitungan 3 detik |
| AC-011 | Pilih device dari daftar → terhubung dan tersimpan | UI interaction | Daftar perangkat sudah tampil, ada minimal 1 device | Klik device → status berubah ke "Printer Terhubung" (badge hijau) + nama & address printer tampil |
| AC-012 | Printer yang dipilih tersimpan di localStorage | Logic | Device berhasil terhubung (AC-011 passed) | `localStorage.getItem("werp_bt_printer")` mengandung JSON `{ name, address }` dari device yang dipilih |
| AC-013 | Status "Tersambung" tampil saat membuka ulang halaman dengan printer tersimpan di localStorage | UI interaction | `localStorage["werp_bt_printer"]` berisi data printer valid, buka `/pengaturan` | Badge hijau "Printer Terhubung" tampil beserta nama printer, tanpa perlu scan ulang |
| AC-014 | Tombol "Putuskan" memutus koneksi dan menghapus printer dari localStorage | UI interaction | Printer sedang terhubung (AC-011 passed) | Klik "Putuskan" → status berubah ke kondisi belum ada printer tersimpan, `localStorage["werp_bt_printer"]` menjadi `null` |
| AC-015 | Cetak nota di Kasir auto-connect ke printer tersimpan tanpa modal Bluetooth | UI interaction | `localStorage["werp_bt_printer"]` berisi data printer valid, printer dalam jangkauan, transaksi selesai di Kasir | Klik "Cetak Nota" → nota tercetak langsung tanpa modal `BluetoothPrinterModal` muncul |
| AC-016 | Cetak nota fallback ke BluetoothPrinterModal jika tidak ada printer tersimpan | UI interaction | `localStorage["werp_bt_printer"]` kosong/null, transaksi selesai di Kasir | Klik "Cetak Nota" → `BluetoothPrinterModal` muncul seperti perilaku lama |
| AC-017 | Cetak nota fallback ke BluetoothPrinterModal jika auto-connect gagal | UI interaction | `localStorage["werp_bt_printer"]` berisi data printer tapi printer tidak dalam jangkauan, transaksi selesai | Klik "Cetak Nota" → auto-connect gagal → `BluetoothPrinterModal` muncul |
| AC-018 | Tab "Profil Toko" menampilkan form dengan nama, alamat, telepon, logo, QRIS, dan kode undangan | UI interaction | Login sebagai admin, buka `/pengaturan`, klik tab "Profil Toko" | Form tampil dengan field: Nama Toko, Alamat, No. Telepon, upload logo (kamera pojok kanan bawah), upload QRIS, kode undangan (read-only) |
| AC-019 | Upload logo dengan kamera button di pojok kanan bawah berfungsi | UI interaction | Tab Profil Toko terbuka | Klik ikon kamera di pojok kanan bawah logo → file picker terbuka → pilih gambar → preview logo berubah |
| AC-020 | Simpan perubahan profil toko berhasil | UI interaction | Tab Profil Toko terbuka, isi field nama toko dengan nilai baru | Klik "Simpan Perubahan" → notifikasi sukses muncul, nama toko tersimpan di database |
| AC-021 | Simpan profil toko menolak logo lebih dari 2MB | UI interaction | Tab Profil Toko terbuka | Upload file gambar > 2MB sebagai logo → notifikasi error "Ukuran logo maksimal 2MB!" muncul, upload dibatalkan |
| AC-022 | Tab "Toko" tidak ada lagi di halaman Kelola Toko | UI interaction | Login sebagai admin, buka `/kelolatoko` | Tidak ada tab berlabel "Toko" — hanya tab "Menu" dan "Bahan" yang tampil |
| AC-023 | Halaman Kelola Toko masih berfungsi normal setelah tab Toko dihapus | UI interaction | Login sebagai admin, buka `/kelolatoko` | Tab Menu dan tab Bahan berfungsi normal: tambah/edit/hapus menu dan bahan tidak ada error |
