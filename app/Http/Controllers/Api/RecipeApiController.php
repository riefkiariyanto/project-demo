<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/RecipeApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\RecipeItem;
use Illuminate\Http\Request;
 
class RecipeApiController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'items'               => 'required|array',
            'items.*.material_id' => 'required|exists:materials,id',
            'items.*.qty'         => 'required|numeric|min:0.01',
        ]);
 
        $recipe = Recipe::firstOrCreate(['product_id' => $product->id]);
        $recipe->items()->delete();
 
        foreach ($request->items as $item) {
            RecipeItem::create([
                'recipe_id'   => $recipe->id,
                'material_id' => $item['material_id'],
                'qty'         => $item['qty'],
            ]);
        }
 
        return response()->json($recipe->load('items.material'));
    }
}