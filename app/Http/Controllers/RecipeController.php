<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Recipe;

class RecipeController extends Controller
{
   public function store(Request $request, Product $product)
{
    if (
        auth()->user()->hasRole('admin') &&
        $product->store_id !== auth()->user()->store_id
    ) {
        abort(403);
    }

    $recipe = Recipe::updateOrCreate(
        ['product_id' => $product->id],
        []
    );

    $recipe->items()->delete();

    foreach ($request->items as $item) {
        if (
            !empty($item['material_id']) &&
            !empty($item['qty'])
        ) {
            $recipe->items()->create([
                'material_id' => $item['material_id'],
                'qty' => $item['qty'],
            ]);
        }
    }

    return redirect()
        ->route('kelolatoko')
        ->with('success', 'Resep berhasil disimpan');
}
}