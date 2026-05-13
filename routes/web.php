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
use App\Http\Controllers\Auth\StoreRegistrationController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\DashboardController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

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
});

// Tambahkan ini jika belum ada
Route::post('/products/{product}', [ProductController::class, 'update'])
    ->middleware(['auth', 'role:superadmin|admin']);

Route::middleware(['auth', 'role:superadmin|admin'])->group(function () {
    Route::resource('bahan', MaterialController::class);
    Route::post('/bahan/{bahan}/stock', [MaterialController::class, 'updateStock']);
    Route::post('/products/{product}/recipe', [RecipeController::class, 'store']);
});

Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::post('/users', [KelolaTokoController::class, 'storeUser']);
    Route::match(['put', 'patch'], '/users/{user}', [KelolaTokoController::class, 'updateUser']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

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

require __DIR__.'/admin.php';
require __DIR__.'/superadmin.php';
require __DIR__.'/auth.php';
