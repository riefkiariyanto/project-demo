<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin', fn () => Inertia::render('Admin/AdminDashboard'));
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/laporan', fn () => Inertia::render('Admin/LaporanAdmin'));
});