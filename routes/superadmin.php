<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/superadmin', [DashboardController::class, 'superadmin'])->name('superadmin.dashboard');
});
