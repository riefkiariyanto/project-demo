# Pencatatan Pengeluaran — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah fitur pencatatan pengeluaran dengan integrasi dua-arah ke stok bahan dan ringkasan di halaman Laporan.

**Architecture:** Laravel 11 Inertia.js + React 18. Controller baru `ExpenseController`, migration baru `expenses`, update `MaterialController::updateStock` untuk auto-create expense saat stock-in, update `LaporanController` untuk menyertakan data pengeluaran, halaman baru `Pengeluaran.jsx`.

**Tech Stack:** PHP 8.2, Laravel 11, Inertia.js, React 18, Tailwind CSS, Heroicons, `spatie/laravel-permission` untuk role check.

---

## File Map

| Status | File | Aksi |
|--------|------|------|
| Create | `database/migrations/2026_05_13_000000_create_expenses_table.php` | Migration tabel expenses |
| Modify | `app/Models/Expense.php` | Tambah fillable material_id + relasi material() |
| Create | `app/Http/Controllers/ExpenseController.php` | index + store |
| Modify | `routes/web.php` | Tambah GET+POST /pengeluaran |
| Modify | `app/Http/Controllers/MaterialController.php` | updateStock auto-create expense |
| Modify | `app/Http/Controllers/LaporanController.php` | Tambah pengeluaran ke summary index + harian |
| Create | `resources/js/Pages/Pengeluaran.jsx` | Halaman utama pengeluaran |
| Modify | `resources/js/Pages/Admin/LaporanAdmin.jsx` | Tambah 2 KPI card, rename "Pendapatan Bersih" → "Laba Kotor" |
| Modify | `resources/js/Components/Sidebar.jsx` | Tambah menu Pengeluaran |
| Modify | `resources/js/Layouts/AuthenticatedLayout.jsx` | Tambah mobile bottom nav Pengeluaran |

---

## Task 1: Migration dan update Expense Model

**Files:**
- Create: `database/migrations/2026_05_13_000000_create_expenses_table.php`
- Modify: `app/Models/Expense.php`

**AC:** AC-001

- [ ] **Step 1: Buat migration file**

```php
// database/migrations/2026_05_13_000000_create_expenses_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('category', 50);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('material_id')->nullable();
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->date('expense_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
```

- [ ] **Step 2: Jalankan migration**

```bash
php artisan migrate
```

Expected: `2026_05_13_000000_create_expenses_table ......... DONE`

- [ ] **Step 3: Update Expense model — tambah material_id ke fillable dan tambah relasi**

Ganti isi `app/Models/Expense.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'user_id',
        'category',
        'description',
        'material_id',
        'amount',
        'expense_date',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount'       => 'decimal:2',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_05_13_000000_create_expenses_table.php app/Models/Expense.php
git commit -m "feat: create expenses table and update Expense model"
```

---

## Task 2: ExpenseController dan Routes

**Files:**
- Create: `app/Http/Controllers/ExpenseController.php`
- Modify: `routes/web.php`

**AC:** AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012

- [ ] **Step 1: Buat ExpenseController**

```php
<?php
// app/Http/Controllers/ExpenseController.php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $user         = auth()->user();
        $isSuperadmin = $user->hasRole('superadmin');
        $storeId      = $user->store_id;

        $mode = $request->get('mode', 'bulan');

        if ($mode === 'bulan') {
            $tanggal = $request->get('tanggal', now()->format('Y-m'));
            $start   = Carbon::createFromFormat('Y-m', $tanggal)->startOfMonth()->toDateString();
            $end     = Carbon::createFromFormat('Y-m', $tanggal)->endOfMonth()->toDateString();
        } else {
            $tanggal = $request->get('tanggal', now()->toDateString());
            $start   = Carbon::parse($tanggal)->toDateString();
            $end     = $start;
        }

        $base = fn() => Expense::query()
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId));

        $expenses = (clone $base())
            ->with('user:id,name', 'material:id,name')
            ->whereBetween('expense_date', [$start, $end])
            ->orderByDesc('expense_date')
            ->limit(100)
            ->get()
            ->map(fn($e) => [
                'id'            => $e->id,
                'category'      => $e->category,
                'description'   => $e->description,
                'material_name' => $e->material?->name,
                'amount'        => (float) $e->amount,
                'expense_date'  => Carbon::parse($e->expense_date)->format('d/m/Y'),
                'kasir_name'    => $e->user->name ?? '-',
            ]);

        $allExpenses = (clone $base())
            ->whereBetween('expense_date', [$start, $end])
            ->get();

        $byCategory = $allExpenses
            ->groupBy('category')
            ->map(fn($g) => (float) $g->sum('amount'));

        $materials = Material::where('store_id', $storeId)
            ->select('id', 'name', 'unit', 'buy_price')
            ->orderBy('name')
            ->get();

        return Inertia::render('Pengeluaran', [
            'expenses' => $expenses,
            'summary'  => [
                'total'      => (float) $allExpenses->sum('amount'),
                'byCategory' => $byCategory,
            ],
            'materials' => $materials,
            'filter'    => ['mode' => $mode, 'tanggal' => $tanggal],
        ]);
    }

    public function store(Request $request)
    {
        $user    = auth()->user();
        $storeId = $user->store_id;

        $validated = $request->validate([
            'category'     => 'required|in:Belanja Bahan,Gaji,Listrik,Air,Sewa,Lain-lain',
            'description'  => 'nullable|string|max:255|required_if:category,Lain-lain',
            'amount'       => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'material_id'  => [
                'nullable',
                'required_if:category,Belanja Bahan',
                Rule::exists('materials', 'id')->where('store_id', $storeId),
            ],
            'qty' => 'nullable|required_if:category,Belanja Bahan|numeric|min:0.01',
        ]);

        if ($validated['category'] === 'Belanja Bahan') {
            $material = Material::where('id', $validated['material_id'])
                ->where('store_id', $storeId)
                ->firstOrFail();
            $material->stock += $validated['qty'];
            $material->save();
        }

        Expense::create([
            'store_id'     => $storeId,
            'user_id'      => $user->id,
            'category'     => $validated['category'],
            'description'  => $validated['description'] ?? null,
            'material_id'  => $validated['material_id'] ?? null,
            'amount'       => $validated['amount'],
            'expense_date' => $validated['expense_date'],
        ]);

        return redirect()->back()->with('success', 'Pengeluaran berhasil dicatat.');
    }
}
```

- [ ] **Step 2: Tambah routes ke routes/web.php**

Di dalam blok `Route::middleware('auth')->group(...)` yang ada (setelah baris route pengaturan), tambahkan:

```php
use App\Http\Controllers\ExpenseController;

// dalam blok Route::middleware('auth')->group(function () {
Route::get('/pengeluaran', [ExpenseController::class, 'index'])->name('pengeluaran');
Route::post('/pengeluaran', [ExpenseController::class, 'store'])->name('pengeluaran.store');
```

Juga tambahkan `use App\Http\Controllers\ExpenseController;` di bagian atas use statements.

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/ExpenseController.php routes/web.php
git commit -m "feat: add ExpenseController and routes"
```

---

## Task 3: MaterialController — auto-create expense saat stock-in

**Files:**
- Modify: `app/Http/Controllers/MaterialController.php`

**AC:** AC-013, AC-014, AC-015

- [ ] **Step 1: Tambah use statement dan logika auto-expense di updateStock**

Di `app/Http/Controllers/MaterialController.php`, tambahkan `use App\Models\Expense;` setelah `use App\Models\Material;`.

Kemudian di method `updateStock`, setelah `$bahan->save();` dan hanya di dalam blok `if ($request->type === 'in')`, tambahkan:

```php
if ($request->type === 'in') {
    $bahan->stock += $request->qty;
    $bahan->save();

    Expense::create([
        'store_id'     => $bahan->store_id,
        'user_id'      => auth()->id(),
        'category'     => 'Belanja Bahan',
        'description'  => $bahan->name,
        'material_id'  => $bahan->id,
        'amount'       => $bahan->buy_price * $request->qty,
        'expense_date' => now()->toDateString(),
    ]);
} else {
    $bahan->stock -= $request->qty;
    if ($bahan->stock < 0) {
        $bahan->stock = 0;
    }
    $bahan->save();
}
```

Pastikan blok `if/else` sudah benar — method aslinya memiliki dua blok terpisah, gabungkan menjadi satu `if/else` seperti di atas.

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/MaterialController.php
git commit -m "feat: auto-create expense when adding material stock"
```

---

## Task 4: LaporanController — tambah pengeluaran ke summary

**Files:**
- Modify: `app/Http/Controllers/LaporanController.php`

**AC:** AC-016, AC-017, AC-018

- [ ] **Step 1: Tambah use statement Expense**

Tambahkan di bagian atas `use` statements:
```php
use App\Models\Expense;
```

- [ ] **Step 2: Tambah kalkulasi pengeluaran di method index()**

Tambahkan blok berikut setelah kalkulasi `$growthItem` dan sebelum `// Chart`:

```php
// Pengeluaran
$pengeluaranBase = fn() => Expense::query()
    ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId));

$pengeluaranIni  = (clone $pengeluaranBase())
    ->whereBetween('expense_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
    ->sum('amount');
$pengeluaranLalu = (clone $pengeluaranBase())
    ->whereBetween('expense_date', [$startOfLastMonth->toDateString(), $endOfLastMonth->toDateString()])
    ->sum('amount');
$growthPengeluaran = $pengeluaranLalu > 0
    ? round((($pengeluaranIni - $pengeluaranLalu) / $pengeluaranLalu) * 100, 1)
    : ($pengeluaranIni > 0 ? 100 : 0);

$labaSetelahIni  = $bersihIni - $pengeluaranIni;
$labaSetelahLalu = $bersihLalu - $pengeluaranLalu;
$growthLabaSetelah = $labaSetelahLalu > 0
    ? round((($labaSetelahIni - $labaSetelahLalu) / $labaSetelahLalu) * 100, 1)
    : ($labaSetelahIni > 0 ? 100 : 0);
```

- [ ] **Step 3: Tambah key baru ke array summary di return index()**

Di dalam `return Inertia::render(...)`, dalam array `'summary'`, tambahkan setelah `'growthItem'`:

```php
'pengeluaran'           => (float) $pengeluaranIni,
'growthPengeluaran'     => $growthPengeluaran,
'labaSetelahPengeluaran' => (float) $labaSetelahIni,
'growthLabaSetelah'     => $growthLabaSetelah,
```

- [ ] **Step 4: Tambah kalkulasi pengeluaran di method harian()**

Tambahkan setelah kalkulasi `$growthBersihHari` dan sebelum `return response()->json(...)`:

```php
// Pengeluaran harian
$pengeluaranHariBase = fn() => Expense::query()
    ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId));

$pengeluaranHariIni  = (clone $pengeluaranHariBase())
    ->whereBetween('expense_date', [$hari->toDateString(), $hariAkhir->toDateString()])
    ->sum('amount');
$pengeluaranHariLalu = (clone $pengeluaranHariBase())
    ->whereBetween('expense_date', [$hariLalu->toDateString(), $hariLaluAkhir->toDateString()])
    ->sum('amount');
$growthPengeluaranHari = $pengeluaranHariLalu > 0
    ? round((($pengeluaranHariIni - $pengeluaranHariLalu) / $pengeluaranHariLalu) * 100, 1)
    : ($pengeluaranHariIni > 0 ? 100 : 0);

$labaSetelahHariIni  = $bersihHariIni - $pengeluaranHariIni;
$labaSetelahHariLalu = $bersihHariLalu - $pengeluaranHariLalu;
$growthLabaSetelahHari = $labaSetelahHariLalu > 0
    ? round((($labaSetelahHariIni - $labaSetelahHariLalu) / $labaSetelahHariLalu) * 100, 1)
    : ($labaSetelahHariIni > 0 ? 100 : 0);
```

- [ ] **Step 5: Tambah key baru ke return harian()**

Di `return response()->json([...])` dalam harian(), tambahkan setelah `'labelBanding'`:

```php
'pengeluaran'            => (float) $pengeluaranHariIni,
'growthPengeluaran'      => $growthPengeluaranHari,
'labaSetelahPengeluaran' => (float) $labaSetelahHariIni,
'growthLabaSetelah'      => $growthLabaSetelahHari,
```

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/LaporanController.php
git commit -m "feat: add pengeluaran and laba setelah pengeluaran to laporan summary"
```

---

## Task 5: Halaman Pengeluaran.jsx

**Files:**
- Create: `resources/js/Pages/Pengeluaran.jsx`

**AC:** AC-019, AC-020, AC-021, AC-022, AC-023, AC-024, AC-025, AC-026, AC-027, AC-028

- [ ] **Step 1: Buat file Pengeluaran.jsx**

```jsx
// resources/js/Pages/Pengeluaran.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { BanknotesIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

const CATEGORIES = ['Belanja Bahan', 'Gaji', 'Listrik', 'Air', 'Sewa', 'Lain-lain'];

const fmt = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

const CATEGORY_COLORS = {
    'Belanja Bahan': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'Gaji':          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Listrik':       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Air':           'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'Sewa':          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Lain-lain':     'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function AddModal({ materials, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        category:     'Belanja Bahan',
        description:  '',
        material_id:  '',
        qty:          '',
        harga_unit:   '',
        amount:       '',
        expense_date: new Date().toISOString().slice(0, 10),
    });

    const isBahan    = data.category === 'Belanja Bahan';
    const isLainlain = data.category === 'Lain-lain';
    const selectedMaterial = materials.find((m) => String(m.id) === String(data.material_id));

    const handleCategoryChange = (cat) => {
        setData((prev) => ({
            ...prev,
            category: cat,
            material_id: '',
            qty: '',
            harga_unit: '',
            amount: '',
            description: '',
        }));
    };

    const handleMaterialChange = (id) => {
        const mat = materials.find((m) => String(m.id) === id);
        setData((prev) => ({
            ...prev,
            material_id: id,
            harga_unit: mat ? String(mat.buy_price) : '',
            amount: prev.qty && mat ? String(parseFloat(prev.qty) * parseFloat(mat.buy_price)) : '',
        }));
    };

    const handleQtyChange = (qty) => {
        const harga = parseFloat(data.harga_unit) || 0;
        setData((prev) => ({
            ...prev,
            qty,
            amount: qty && harga ? String(parseFloat(qty) * harga) : '',
        }));
    };

    const handleHargaChange = (harga) => {
        const qty = parseFloat(data.qty) || 0;
        setData((prev) => ({
            ...prev,
            harga_unit: harga,
            amount: harga && qty ? String(parseFloat(harga) * qty) : '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/pengeluaran', { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
                    <h3 className="font-bold text-lg dark:text-white">Tambah Pengeluaran</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kategori</label>
                        <select
                            value={data.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Belanja Bahan fields */}
                    {isBahan && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Pilih Bahan</label>
                                <select
                                    value={data.material_id}
                                    onChange={(e) => handleMaterialChange(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">-- Pilih Bahan --</option>
                                    {materials.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                {errors.material_id && <p className="text-red-500 text-xs mt-1">{errors.material_id}</p>}
                            </div>

                            {selectedMaterial && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Satuan</label>
                                    <input
                                        value={selectedMaterial.unit}
                                        readOnly
                                        className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-600 dark:text-slate-400 px-3 py-2 text-sm cursor-not-allowed"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Qty</label>
                                    <input
                                        type="number"
                                        value={data.qty}
                                        onChange={(e) => handleQtyChange(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0"
                                        className="w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.qty && <p className="text-red-500 text-xs mt-1">{errors.qty}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Harga/unit (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.harga_unit}
                                        onChange={(e) => handleHargaChange(e.target.value)}
                                        min="0"
                                        placeholder="0"
                                        className="w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Total</label>
                                <input
                                    value={fmt(parseFloat(data.amount) || 0)}
                                    readOnly
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-600 dark:text-slate-300 px-3 py-2 text-sm cursor-not-allowed font-bold"
                                />
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>
                        </>
                    )}

                    {/* Non-bahan fields */}
                    {!isBahan && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                    Keterangan {isLainlain && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={isLainlain ? 'Wajib diisi' : 'Opsional'}
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jumlah (Rp)</label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    min="0.01"
                                    placeholder="0"
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>
                        </>
                    )}

                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tanggal</label>
                        <input
                            type="date"
                            value={data.expense_date}
                            onChange={(e) => setData('expense_date', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {errors.expense_date && <p className="text-red-500 text-xs mt-1">{errors.expense_date}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-60 transition"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Pengeluaran({ expenses, summary, materials, filter }) {
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode]       = useState(filter.mode);
    const [tanggal, setTanggal] = useState(filter.tanggal);

    const applyFilter = (newMode, newTanggal) => {
        router.get('/pengeluaran', { mode: newMode, tanggal: newTanggal }, { preserveScroll: true });
    };

    const handleModeChange = (m) => {
        setMode(m);
        const defaultDate = m === 'bulan'
            ? new Date().toISOString().slice(0, 7)
            : new Date().toISOString().slice(0, 10);
        setTanggal(defaultDate);
        applyFilter(m, defaultDate);
    };

    const handleDateChange = (val) => {
        setTanggal(val);
        applyFilter(mode, val);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengeluaran" />
            <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <BanknotesIcon className="w-7 h-7 text-orange-500" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengeluaran</h1>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
                    <div className="flex items-end justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Pengeluaran</span>
                        <span className="text-2xl font-bold text-red-500">{fmt(summary.total)}</span>
                    </div>
                    {Object.keys(summary.byCategory || {}).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(summary.byCategory).map(([cat, amt]) => (
                                <div
                                    key={cat}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Lain-lain']}`}
                                >
                                    {cat}: {fmt(amt)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1 gap-1">
                        {[['bulan', 'Per Bulan'], ['hari', 'Per Hari']].map(([v, l]) => (
                            <button
                                key={v}
                                onClick={() => handleModeChange(v)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                                    mode === v
                                        ? 'bg-orange-500 text-white shadow'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <input
                        type={mode === 'bulan' ? 'month' : 'date'}
                        value={tanggal}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-1.5 text-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <button
                        onClick={() => setShowModal(true)}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow"
                    >
                        <PlusIcon className="w-4 h-4" /> Tambah Pengeluaran
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    {expenses.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 dark:text-slate-500 text-sm">
                            Belum ada pengeluaran pada periode ini
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="px-5 py-3 text-left">Tanggal</th>
                                        <th className="px-5 py-3 text-left">Kategori</th>
                                        <th className="px-5 py-3 text-left">Keterangan</th>
                                        <th className="px-5 py-3 text-right">Jumlah</th>
                                        <th className="px-5 py-3 text-left">Kasir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((e, i) => (
                                        <tr
                                            key={e.id}
                                            className={`border-b border-gray-50 dark:border-slate-700/50 ${
                                                i % 2 !== 0 ? 'bg-gray-50/50 dark:bg-slate-800/50' : ''
                                            }`}
                                        >
                                            <td className="px-5 py-3 text-gray-600 dark:text-slate-300 whitespace-nowrap">{e.expense_date}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS['Lain-lain']}`}>
                                                    {e.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600 dark:text-slate-300">
                                                {e.description || e.material_name || '-'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-red-500 whitespace-nowrap">
                                                {fmt(e.amount)}
                                            </td>
                                            <td className="px-5 py-3 text-gray-500 dark:text-slate-400">{e.kasir_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <AddModal materials={materials} onClose={() => setShowModal(false)} />
            )}
        </AuthenticatedLayout>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Pages/Pengeluaran.jsx
git commit -m "feat: add Pengeluaran page with filter and AddModal"
```

---

## Task 6: LaporanAdmin.jsx — tambah KPI cards dan rename label

**Files:**
- Modify: `resources/js/Pages/Admin/LaporanAdmin.jsx`

**AC:** AC-029, AC-030

- [ ] **Step 1: Update array `cards` di SummarySection**

Cari baris sekitar line 264 di `resources/js/Pages/Admin/LaporanAdmin.jsx`:

```js
const cards = [
    { title: "Pendapatan Kotor", ...
    { title: "HPP", ...
    { title: "Pendapatan Bersih", ...   // <-- ubah title ini
    { title: "Total Pesanan", ...
];
```

Ganti seluruh array `cards` dengan:

```js
const cards = [
    { title: "Pendapatan Kotor",          value: data ? fmt(data.pendapatan) : "-",                growth: data?.growthPendapatan ?? 0,  icon: BanknotesIcon,      color: "from-orange-600 to-orange-700" },
    { title: "HPP",                        value: data ? fmt(data.hpp ?? 0) : "-",                  growth: 0,                            icon: CubeIcon,           color: "from-slate-600 to-slate-700",  noGrowth: true, hint: "Harga Pokok Penjualan" },
    { title: "Laba Kotor",                 value: data ? fmt(data.bersih ?? 0) : "-",               growth: data?.growthBersih ?? 0,      icon: ReceiptPercentIcon, color: "from-green-600 to-green-700" },
    { title: "Total Pesanan",              value: data ? (data.pesanan ?? 0) : "-",                 growth: data?.growthPesanan ?? 0,     icon: ShoppingCartIcon,   color: "from-rose-600 to-rose-700" },
    { title: "Pengeluaran",               value: data ? fmt(data.pengeluaran ?? 0) : "-",           growth: data?.growthPengeluaran ?? 0, icon: BanknotesIcon,      color: "from-red-600 to-red-700" },
    { title: "Laba Setelah Pengeluaran",  value: data ? fmt(data.labaSetelahPengeluaran ?? 0) : "-", growth: data?.growthLabaSetelah ?? 0, icon: ReceiptPercentIcon, color: "from-teal-600 to-teal-700" },
];
```

- [ ] **Step 2: Ubah grid dari 4 kolom ke 3 kolom (untuk 6 card)**

Cari `grid-cols-2 lg:grid-cols-4` di SummarySection dan ganti:

```js
// Lama:
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Baru:
<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Admin/LaporanAdmin.jsx
git commit -m "feat: add pengeluaran and laba setelah pengeluaran KPI cards in laporan"
```

---

## Task 7: Navigasi — Sidebar dan mobile nav

**Files:**
- Modify: `resources/js/Components/Sidebar.jsx`
- Modify: `resources/js/Layouts/AuthenticatedLayout.jsx`

**AC:** AC-031, AC-032

- [ ] **Step 1: Tambah import BanknotesIcon di Sidebar.jsx**

Di bagian import heroicons di `resources/js/Components/Sidebar.jsx`, tambahkan `BanknotesIcon`:

```js
import {
    HomeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BanknotesIcon,         // tambahkan ini
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    SunIcon,
    MoonIcon,
} from "@heroicons/react/24/solid";
```

- [ ] **Step 2: Tambah menu Pengeluaran ke array menus di Sidebar.jsx**

Cari array `menus` dan tambahkan entry setelah 'Laporan':

```js
const menus = [
    { name: "Dashboard",    icon: HomeIcon,        link: getDashboardLink(), roles: ["user", "admin", "superadmin"] },
    { name: "Kasir",        icon: ShoppingCartIcon, link: "/kasir",           roles: ["admin", "superadmin", "user"] },
    { name: "Laporan",      icon: ChartBarIcon,     link: "/laporan",         roles: ["admin", "superadmin"] },
    { name: "Pengeluaran",  icon: BanknotesIcon,    link: "/pengeluaran",     roles: ["user", "admin", "superadmin"] },
    { name: "Kelola Toko",  icon: Cog6ToothIcon,    link: "/kelolatoko",      roles: ["superadmin", "admin"] },
    { name: 'Pengaturan',   icon: Cog6ToothIcon,    link: '/pengaturan',      roles: ['user', 'admin', 'superadmin'] },
];
```

- [ ] **Step 3: Tambah import BanknotesIcon di AuthenticatedLayout.jsx**

Di bagian import heroicons di `resources/js/Layouts/AuthenticatedLayout.jsx`, tambahkan `BanknotesIcon`:

```js
import {
    HomeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BanknotesIcon,          // tambahkan ini
    XMarkIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
```

- [ ] **Step 4: Tambah Pengeluaran ke bottomNavItems di AuthenticatedLayout.jsx**

Cari array `bottomNavItems` dan tambahkan entry setelah 'Laporan':

```js
const bottomNavItems = [
    { name: "Home",         icon: HomeIcon,         link: getDashboardLink(), roles: ["user", "admin", "superadmin"] },
    { name: "Kasir",        icon: ShoppingCartIcon,  link: "/kasir",           roles: ["admin", "superadmin", "user"] },
    { name: "Laporan",      icon: ChartBarIcon,      link: "/laporan",         roles: ["admin", "superadmin"] },
    { name: "Pengeluaran",  icon: BanknotesIcon,     link: "/pengeluaran",     roles: ["user", "admin", "superadmin"] },
    { name: "Toko",         icon: Cog6ToothIcon,     link: "/kelolatoko",      roles: ["admin", "superadmin"] },
    { name: 'Setting',      icon: Cog6ToothIcon,     link: '/pengaturan',      roles: ['user', 'admin', 'superadmin'] },
].filter(item => item.roles.some(role => roles.includes(role)));
```

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/Sidebar.jsx resources/js/Layouts/AuthenticatedLayout.jsx
git commit -m "feat: add Pengeluaran to sidebar and mobile nav"
```

---

## Task 8: Build dan verifikasi

**Files:** (tidak ada file baru)

- [ ] **Step 1: Jalankan vite build**

```bash
node node_modules/vite/bin/vite.js build
```

Expected: `✓ built in X.XXs` tanpa error. Kalau ada error, baca pesan error dan perbaiki file yang bersangkutan.

- [ ] **Step 2: Push ke remote**

```bash
git push origin main
```

Expected: output `main -> main` tanpa error.
