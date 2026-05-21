<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Material;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class KelolaTokoController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isSuperadmin = $user->hasRole('superadmin');

        $products = Product::with(['category', 'recipe.items.material'])
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $user->store_id))
            ->latest()
            ->get();

        $materials = Material::
            when(!$isSuperadmin, fn($q) => $q->where('store_id', $user->store_id))
            ->latest()
            ->get();

        $users = User::with('roles')
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $user->store_id))
            ->get();

        $categories = Category::withCount('products')
            ->where('store_id', $user->store_id)
            ->latest()
            ->get();

        return Inertia::render('KelolaToko', [
            'products'   => $products,
            'categories' => $categories,
            'materials'  => $materials,
            'users'      => $users,
            'store'      => $user->store,
        ]);
    }

    public function storeCategory(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        Category::create([
            'name'     => $validated['name'],
            'store_id' => $user->store_id,
        ]);

        return redirect()->route('kelolatoko')->with('success', 'Kategori berhasil ditambahkan');
    }

    public function updateCategory(Request $request, Category $category)
    {
        $this->authorizeCategory($category);
        $validated = $request->validate(['name' => 'required|string|max:100']);
        $category->update(['name' => $validated['name']]);
        return redirect()->route('kelolatoko')->with('success', 'Kategori berhasil diperbarui');
    }

    public function destroyCategory(Category $category)
    {
        $this->authorizeCategory($category);

        if ($category->products()->exists()) {
            return back()->with('error', 'Kategori tidak bisa dihapus karena masih digunakan oleh produk.');
        }

        $category->delete();
        return redirect()->route('kelolatoko')->with('success', 'Kategori berhasil dihapus');
    }

    private function authorizeCategory(Category $category)
    {
        $user = auth()->user();
        abort_if($category->store_id !== $user->store_id, 403);
    }

    public function storeUser(Request $request)
    {
        $authUser = auth()->user();
        $isSuperadmin = $authUser->hasRole('superadmin');

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:superadmin,admin,user',
            'store_id' => $isSuperadmin ? 'nullable|exists:stores,id' : 'nullable',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'store_id' => $isSuperadmin
                ? ($validated['store_id'] ?? null)
                : $authUser->store_id,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('kelolatoko')->with('success', 'Pengguna berhasil ditambahkan');
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:superadmin,admin,user',
        ]);

        $user->syncRoles([$validated['role']]);

        return redirect()->route('kelolatoko')->with('success', 'Role pengguna berhasil diperbarui');
    }
}
