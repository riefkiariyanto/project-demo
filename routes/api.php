<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\ExpenseApiController;
use App\Http\Controllers\Api\KelolaTokoApiController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Controllers\Api\MaterialApiController;
use App\Http\Controllers\Api\SaleApiController;
use App\Http\Controllers\Api\LaporanApiController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\PengaturanApiController;
use App\Http\Controllers\Api\ProfileApiController;
use App\Http\Controllers\Api\RecipeApiController;
use App\Http\Controllers\Api\UserApiController;

// ── Public routes ────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Protected routes ─────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::middleware('role:user')->get('/dashboard', [DashboardApiController::class, 'user']);
    Route::middleware('role:admin')->get('/admin/dashboard', [DashboardApiController::class, 'admin']);
    Route::middleware('role:superadmin')->get('/superadmin/dashboard', [DashboardApiController::class, 'superadmin']);

    // Profile & settings
    Route::get('/profile', [ProfileApiController::class, 'show']);
    Route::match(['put', 'patch'], '/profile', [ProfileApiController::class, 'update']);
    Route::delete('/profile', [ProfileApiController::class, 'destroy']);
    Route::get('/pengaturan', [PengaturanApiController::class, 'index']);

    // Products
    Route::middleware('role:superadmin,admin,user')->group(function () {
        Route::get('/products', [ProductApiController::class, 'index']);
    });

    Route::middleware('role:superadmin,admin')->group(function () {
        Route::post('/products', [ProductApiController::class, 'store']);
        Route::put('/products/{product}', [ProductApiController::class, 'update']);
        Route::delete('/products/{product}', [ProductApiController::class, 'destroy']);
        Route::post('/products/{product}/recipe', [RecipeApiController::class, 'store']);
    });

    // Materials
    Route::middleware('role:superadmin,admin')->group(function () {
        Route::get('/materials', [MaterialApiController::class, 'index']);
        Route::post('/materials', [MaterialApiController::class, 'store']);
        Route::put('/materials/{bahan}', [MaterialApiController::class, 'update']);
        Route::delete('/materials/{bahan}', [MaterialApiController::class, 'destroy']);
        Route::post('/materials/{bahan}/stock', [MaterialApiController::class, 'updateStock']);
    });

    // Sales
    Route::middleware('role:superadmin,admin,user')->group(function () {
        Route::post('/sales', [SaleApiController::class, 'store']);
    });

    // Laporan
    Route::middleware('role:superadmin,admin')->group(function () {
        Route::get('/laporan', [LaporanApiController::class, 'index']);
        Route::get('/laporan/harian', [LaporanApiController::class, 'harian']);
    });

    // Expense / Pengeluaran
    Route::middleware('role:superadmin,admin')->group(function () {
        Route::get('/pengeluaran', [ExpenseApiController::class, 'index']);
        Route::post('/pengeluaran', [ExpenseApiController::class, 'store']);
    });

    // Categories
    Route::middleware('role:superadmin,admin,user')->group(function () {
        Route::get('/categories', [CategoryApiController::class, 'index']);
    });

    Route::middleware('role:superadmin,admin')->group(function () {
        Route::get('/kelola-toko', [KelolaTokoApiController::class, 'index']);
        Route::post('/categories', [CategoryApiController::class, 'store']);
        Route::put('/categories/{category}', [CategoryApiController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryApiController::class, 'destroy']);
    });

    // Users (superadmin only)
    Route::middleware('role:superadmin')->group(function () {
        Route::get('/users', [UserApiController::class, 'index']);
        Route::post('/users', [UserApiController::class, 'store']);
        Route::put('/users/{user}', [UserApiController::class, 'update']);
    });
});
