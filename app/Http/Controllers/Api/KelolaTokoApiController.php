<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Material;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class KelolaTokoApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperadmin = $user->hasRole('superadmin');

        $products = Product::with(['category', 'recipe.items.material'])
            ->when(!$isSuperadmin, fn($query) => $query->where('store_id', $user->store_id))
            ->latest()
            ->get();

        $materials = Material::when(
            !$isSuperadmin,
            fn($query) => $query->where('store_id', $user->store_id)
        )->latest()->get();

        $users = User::with('roles')
            ->when(!$isSuperadmin, fn($query) => $query->where('store_id', $user->store_id))
            ->get();

        $categories = Category::withCount('products')
            ->where('store_id', $user->store_id)
            ->latest()
            ->get();

        return $this->successResponse([
            'products' => $products,
            'categories' => $categories,
            'materials' => $materials,
            'users' => $users,
            'store' => $user->store,
        ], 'Data kelola toko berhasil diambil.');
    }
}
