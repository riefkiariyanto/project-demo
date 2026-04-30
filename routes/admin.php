<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admindashboard', fn () => Inertia::render('Admin/AdminDashboard'));
});

