<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileApiController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load('store');

        return $this->successResponse([
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'user' => $user,
        ], 'Profil berhasil diambil.');
    }

    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $this->successResponse([
            'user' => $user->fresh()->load('store'),
        ], 'Profil berhasil diperbarui');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $user->tokens()->delete();
        Auth::logout();
        $user->delete();

        return $this->successResponse(null, 'Akun berhasil dihapus');
    }
}
