<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Controllers\Api\MaterialApiController;
use App\Http\Controllers\Api\SaleApiController;
use App\Http\Controllers\Api\LaporanApiController;
use App\Http\Controllers\Api\CategoryApiController;

// ── Public routes ────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Protected routes ─────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Products
    Route::get('/products', [ProductApiController::class, 'index']);
    Route::post('/products', [ProductApiController::class, 'store']);
    Route::put('/products/{product}', [ProductApiController::class, 'update']);
    Route::delete('/products/{product}', [ProductApiController::class, 'destroy']);
    // Route::post('/products/{product}/recipe', [RecipeApiController::class, 'store']);

    // Materials
    Route::get('/materials', [MaterialApiController::class, 'index']);
    Route::post('/materials', [MaterialApiController::class, 'store']);
    Route::put('/materials/{bahan}', [MaterialApiController::class, 'update']);
    Route::delete('/materials/{bahan}', [MaterialApiController::class, 'destroy']);
    Route::post('/materials/{bahan}/stock', [MaterialApiController::class, 'updateStock']);

    // Sales
    Route::post('/sales', [SaleApiController::class, 'store']);

    // Laporan
    Route::get('/laporan', [LaporanApiController::class, 'index']);

    // Categories
    Route::get('/categories', [CategoryApiController::class, 'index']);

    // Users (superadmin only)
    Route::get('/users', [UserApiController::class, 'index']);
    Route::post('/users', [UserApiController::class, 'store']);
    Route::put('/users/{user}', [UserApiController::class, 'update']);
});