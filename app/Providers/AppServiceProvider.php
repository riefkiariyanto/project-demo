<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\PermissionRegistrar; // 🔥 namespace yang benar

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

       // 🔥 Hanya jalankan saat runtime, bukan saat build
    if (!$this->app->runningInConsole()) {
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
}