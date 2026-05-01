<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
<<<<<<< HEAD

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admindashboard', fn () => Inertia::render('Admin/AdminDashboard'));
=======
use App\Http\Controllers\LaporanController;

Route::middleware(['auth', 'role:admin|superadmin'])->group(function () {
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin', fn () => Inertia::render('Admin/AdminDashboard'));
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
});

