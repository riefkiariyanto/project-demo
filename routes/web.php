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

/*
|--------------------------------------------------------------------------
| Dashboard (User)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
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
});

/*
|--------------------------------------------------------------------------
| Other Routes
|--------------------------------------------------------------------------
*/
require __DIR__.'/admin.php';
require __DIR__.'/superadmin.php';
require __DIR__.'/auth.php';