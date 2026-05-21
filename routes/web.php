<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\KelolaTokoController;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\RecipeController;
<<<<<<< HEAD
=======
use App\Http\Controllers\Auth\StoreRegistrationController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\ExpenseController;

>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

<<<<<<< HEAD
/*
|--------------------------------------------------------------------------
| Dashboard (User)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
=======
Route::get('/privacy', fn() => Inertia::render('PrivacyPolicy'))->name('privacy');
Route::get('/tos', fn() => Inertia::render('TermsOfService'))->name('tos');

Route::middleware(['auth', 'role:superadmin|admin'])->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'user'])->name('dashboard');
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
});

/*
|--------------------------------------------------------------------------
| Product (Admin & Superadmin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:superadmin|admin'])->group(function () {
    Route::resource('products', ProductController::class);

    Route::resource('bahan', MaterialController::class);
    Route::post('/bahan/{bahan}/stock', [MaterialController::class, 'updateStock']);

    Route::post('/products/{product}/recipe', [RecipeController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Kasir
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:superadmin|admin|user'])->group(function () {
    Route::get('/kasir', [KasirController::class, 'index'])->name('kasir');
    Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
});

/*
|--------------------------------------------------------------------------
| Kelola Toko (Admin & Superadmin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:superadmin|admin'])->group(function () {
    Route::get('/kelolatoko', [KelolaTokoController::class, 'index'])->name('kelolatoko');
});

/*
|--------------------------------------------------------------------------
| Superadmin Only
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::post('/users', [KelolaTokoController::class, 'storeUser']);
    Route::match(['put', 'patch'], '/users/{user}', [KelolaTokoController::class, 'updateUser']);
});

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan');
    Route::get('/pengeluaran', [ExpenseController::class, 'index'])->name('pengeluaran');
    Route::post('/pengeluaran', [ExpenseController::class, 'store'])->name('pengeluaran.store');
});

<<<<<<< HEAD
/*
|--------------------------------------------------------------------------
| Other Routes
|--------------------------------------------------------------------------
*/
=======
Route::middleware(['auth', 'role:superadmin|user|admin'])->group(function () {
    Route::get('/kasir', [KasirController::class, 'index'])->name('kasir');
    Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
});
Route::middleware(['auth', 'role:superadmin|admin'])->group(function () {
    Route::get('/kelolatoko', [KelolaTokoController::class, 'index'])
        ->name('kelolatoko');
    Route::post('/categories', [KelolaTokoController::class, 'storeCategory'])->name('categories.store');
    Route::put('/categories/{category}', [KelolaTokoController::class, 'updateCategory'])->name('categories.update');
    Route::delete('/categories/{category}', [KelolaTokoController::class, 'destroyCategory'])->name('categories.destroy');
});

Route::middleware(['auth', 'role:admin|superadmin'])->group(function () {
    Route::post('/store/update', [StoreController::class, 'update'])->name('store.update');
});

>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
require __DIR__.'/admin.php';
require __DIR__.'/superadmin.php';
require __DIR__.'/auth.php';