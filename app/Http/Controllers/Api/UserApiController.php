<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/UserApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
 
class UserApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $users = User::with('roles')
            ->when(!$user->hasRole('superadmin'), fn($q) => $q->where('store_id', $user->store_id))
            ->get();
        return response()->json($users);
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role'     => 'required|in:superadmin,admin,user',
        ]);
 
        $authUser = $request->user();
        $newUser  = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'store_id' => $authUser->hasRole('superadmin') ? ($request->store_id ?? null) : $authUser->store_id,
        ]);
        $newUser->assignRole($validated['role']);
 
        return response()->json($newUser->load('roles'), 201);
    }
 
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:superadmin,admin,user',
        ]);
        $user->syncRoles([$validated['role']]);
        return response()->json($user->load('roles'));
    }
}