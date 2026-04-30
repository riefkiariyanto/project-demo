<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StoreRegistrationController extends Controller
{
    // ── Halaman register toko baru ─────────────────────────
    public function showRegisterStore()
    {
        return Inertia::render('Auth/RegisterStore');
    }

    public function registerStore(Request $request)
    {
        $request->validate([
            'store_name' => 'required|string|max:255',
            'store_address' => 'nullable|string',
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        // Buat toko baru (invite_code auto generate)
        $store = Store::create([
            'name'    => $request->store_name,
            'address' => $request->store_address,
            "code'    => strtoupper(substr(md5($request->store_name), 0, 6)),
        ]);

        // Buat user sebagai admin toko
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'store_id' => $store->id,
        ]);

        $user->assignRole('admin');

        Auth::login($user);

        return redirect('/admin');
    }

    // ── Halaman register user pakai kode toko ──────────────
    public function showRegisterUser()
    {
        return Inertia::render('Auth/RegisterUser');
    }

    public function registerUser(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users',
            'password'    => 'required|min:8|confirmed',
            'invite_code' => 'required|string|exists:stores,invite_code',
        ]);

        // Cari toko berdasarkan kode
        $store = Store::where('invite_code', $request->invite_code)->firstOrFail();

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'store_id' => $store->id,
        ]);

        $user->assignRole('user');

        Auth::login($user);

        return redirect('/dashboard');
    }
}