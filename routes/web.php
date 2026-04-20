<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/dashboard', function () {
        return inertia('Dashboard');
    })->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/laporan', fn () => Inertia::render('Laporan'));
});
Route::middleware(['auth', 'role:superadmin|user'])->group(function () {
    Route::get('/kasir', fn () => Inertia::render('Kasir'));
});
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/kelolatoko', fn () => Inertia::render('KelolaToko'));
});

require __DIR__.'/admin.php';
require __DIR__.'/superadmin.php';
require __DIR__.'/auth.php';
