<?php

namespace App\Providers;

<<<<<<< HEAD
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
=======
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    public function register(): void
    {
        //
    }

<<<<<<< HEAD
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
=======
    public function boot(): void
    {
       // URL::forceScheme('https');
    }
}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
