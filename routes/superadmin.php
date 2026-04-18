<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/superadmin', fn () => Inertia::render('SuperAdmin/SuperAdminDashboard'));
});
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/laporan', fn () => Inertia::render('Laporan'));
});
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/kasir', fn () => Inertia::render('Kasir'));
});
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/kelolatoko', fn () => Inertia::render('KelolaToko'));
});