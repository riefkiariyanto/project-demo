<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'device_name' => 'nullable|string|max:255',
        ]);

        $throttleKey = Str::lower($validated['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'email' => ["Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik."],
            ]);
        }

        $user = User::with(['roles', 'store'])->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            return $this->errorResponse('Email atau password salah.', 401);
        }

        if ($user->getAttribute('is_active') === false) {
            return $this->errorResponse('Akun Anda tidak aktif.', 403);
        }

        RateLimiter::clear($throttleKey);

        $tokenName = $validated['device_name'] ?? 'flutter-app';
        $token = $user->createToken($tokenName)->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'token_type' => 'Bearer',
            'user'  => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'store_id' => $user->store_id,
                'store'    => $user->store,
                'roles'    => $user->roles->pluck('name')->values(),
            ],
        ], 'Login berhasil.');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->successResponse(null, 'Logout berhasil.');
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['roles', 'store']);

        return $this->successResponse([
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            'store_id' => $user->store_id,
            'store'    => $user->store,
            'roles'    => $user->roles->pluck('name')->values(),
        ], 'Profil pengguna berhasil diambil.');
    }
}
