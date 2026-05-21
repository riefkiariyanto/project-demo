<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Recipe;

class RecipeController extends Controller
{
   public function store(Request $request, Product $product)
{
    \Log::info('Recipe request:', $request->all()); // 🔥 tambahkan ini

    if (
        auth()->user()->hasRole('admin') &&
        $product->store_id !== auth()->user()->store_id
    ) {
        abort(403);
    }

    \Log::info('Items:', $request->items ?? []); // 🔥 tambahkan ini

    $recipe = Recipe::updateOrCreate(
        ['product_id' => $product->id],
        []
    );

    $recipe->items()->delete();

    foreach ($request->items as $item) {
        $materialId = $item['material_id'] ?? null;
        $qty = $item['qty'] ?? null;

        \Log::info('Processing item:', ['material_id' => $materialId, 'qty' => $qty]); // 🔥

        if (!$materialId || !$qty || (int)$materialId === 0 || (float)$qty <= 0) {
            continue;
        }

        $recipe->items()->create([
            'material_id' => (int) $materialId,
            'qty'         => (float) $qty,
        ]);
    }
    return redirect()
        ->route('kelolatoko')
        ->with('success', 'Resep berhasil disimpan');
}
}