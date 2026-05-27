<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/UserApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
 
class UserApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $users = User::with('roles')
            ->when(!$user->hasRole('superadmin'), fn($q) => $q->where('store_id', $user->store_id))
            ->get();

        return $this->successResponse($users, 'Daftar pengguna berhasil diambil.');
    }
 
    public function store(Request $request)
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role'     => [
                'required',
                Rule::in($authUser->hasRole('superadmin') ? ['superadmin', 'admin', 'user'] : ['admin', 'user']),
            ],
            'store_id' => $authUser->hasRole('superadmin') ? 'nullable|exists:stores,id' : 'nullable',
        ]);
 
        $newUser  = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'store_id' => $authUser->hasRole('superadmin') ? ($validated['store_id'] ?? null) : $authUser->store_id,
        ]);
        $newUser->assignRole($validated['role']);
 
        return $this->successResponse($newUser->load('roles'), 'Pengguna berhasil ditambahkan.', 201);
    }
 
    public function update(Request $request, User $user)
    {
        $authUser = $request->user();

        if (!$authUser->hasRole('superadmin') && $user->store_id !== $authUser->store_id) {
            return $this->errorResponse('Anda tidak memiliki akses ke pengguna ini.', 403);
        }

        $validated = $request->validate([
            'role' => [
                'required',
                Rule::in($authUser->hasRole('superadmin') ? ['superadmin', 'admin', 'user'] : ['admin', 'user']),
            ],
        ]);

        if (!$authUser->hasRole('superadmin') && $user->hasRole('superadmin')) {
            return $this->errorResponse('Role superadmin tidak dapat diubah dari akun ini.', 403);
        }

        $user->syncRoles([$validated['role']]);

        return $this->successResponse($user->fresh()->load('roles'), 'Role pengguna berhasil diperbarui.');
    }
}
