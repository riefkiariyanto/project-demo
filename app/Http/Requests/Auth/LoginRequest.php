<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
        {
            $this->ensureIsNotRateLimited();

            $user = User::where('email', $this->email)->first();

            Log::warning('Login attempt', [
                'email' => $this->email,
                'ip' => $this->ip(),
                    ]);

            if (!$user) {
                RateLimiter::hit($this->throttleKey(), 30);

                throw ValidationException::withMessages([
                    'email' => 'Email tidak terdaftar, silakan cek kembali.',
                ]);
            }

            if (!Hash::check($this->password, $user->password)) {
                RateLimiter::hit($this->throttleKey(), 30);

                throw ValidationException::withMessages([
                    'password' => 'Password salah.',
                ]);
            }

            Auth::login($user, $this->boolean('remember'));

            RateLimiter::clear($this->throttleKey());
        }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 2)) {
            return;
        }
        event(new Lockout($this));
        $seconds = RateLimiter::availableIn($this->throttleKey());
        throw ValidationException::withMessages([

        'password' => "Terlalu banyak percobaan login. Coba lagi dalam $seconds detik.",
        'seconds' => $seconds,

        ]);
    }

    protected function hitBruteForce()
    {
        // tambah 1 attempt (delay 30 detik)
        RateLimiter::hit($this->throttleKey(), 30);

        $attempts = RateLimiter::attempts($this->throttleKey());

        // 🚨 jika >= 12 → dianggap brute force
        if ($attempts >= 12) {

            Log::critical('🚨 BRUTE FORCE DETECTED', [
                'email' => $this->email,
                'ip' => $this->ip(),
                'attempts' => $attempts,
            ]);

            RateLimiter::hit($this->throttleKey(), 300);
        }}
    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
