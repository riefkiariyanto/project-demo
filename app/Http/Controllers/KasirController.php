<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $products = Product::with([
            'category',
            'recipe.items.material'
        ])
            ->where('is_active', 1)
            ->when(!$user->hasRole('superadmin'), fn($q) => $q->where('store_id', $user->store_id)) // 🔥 tambahkan ini
            ->latest()
            ->get();

        $categories = Category::all();

        return Inertia::render('Kasir', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}