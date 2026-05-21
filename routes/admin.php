<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
<<<<<<< HEAD

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admindashboard', fn () => Inertia::render('Admin/AdminDashboard'));
=======
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\DashboardController;

Route::middleware(['auth', 'role:admin|superadmin'])->group(function () {
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan');
    Route::get('/laporan/harian', [LaporanController::class, 'harian'])->name('laporan.harian');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
<<<<<<< HEAD
    Route::get('/admin', fn () => Inertia::render('Admin/AdminDashboard'));
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
    Route::get('/admin', [DashboardController::class, 'admin'])->name('admin.dashboard');
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
});

