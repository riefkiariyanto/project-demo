<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Add routes that should not require CSRF token
    ];

    /**
     * Handle a request to verify the CSRF token, with better error logging.
     */
    public function handle($request, \Closure $next)
    {
        try {
            return parent::handle($request, $next);
        } catch (TokenMismatchException $e) {
            // Log CSRF mismatch for debugging
            Log::warning('CSRF Token Mismatch', [
                'path' => $request->path(),
                'method' => $request->method(),
                'session_id' => $request->session()->getId(),
                'has_csrf_header' => $request->hasHeader('X-CSRF-TOKEN') || $request->hasHeader('X-XSRF-TOKEN'),
                'has_csrf_input' => (bool) $request->input('_token'),
                'ip' => $request->ip(),
            ]);
            throw $e;
        }
    }
}
