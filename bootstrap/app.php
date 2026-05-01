<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // 🔥 tambahkan ini
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
<<<<<<< HEAD
=======
        // Ensure CSRF protection is enabled for web routes
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
<<<<<<< HEAD
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
                //
=======
        
        // Add CSRF middleware explicitly to web group if not already included
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
