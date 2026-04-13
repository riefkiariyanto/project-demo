<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/superadmin', fn () => Inertia::render('SuperAdmin/Dashboard'));
});