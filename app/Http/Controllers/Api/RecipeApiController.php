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
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
 
class RecipeApiController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $user = $request->user();

        if (!$user->hasRole('superadmin') && $product->store_id !== $user->store_id) {
            return $this->errorResponse('Anda tidak memiliki akses ke produk ini.', 403);
        }

        $validated = $request->validate([
            'items'               => 'required|array',
            'items.*.material_id' => [
                'required',
                Rule::exists('materials', 'id')->where(function ($query) use ($user, $product) {
                    if (!$user->hasRole('superadmin')) {
                        $query->where('store_id', $user->store_id);
                        return;
                    }

                    if ($product->store_id) {
                        $query->where('store_id', $product->store_id);
                    }
                }),
            ],
            'items.*.qty'         => 'required|numeric|min:0.01',
        ]);

        $recipe = DB::transaction(function () use ($product, $validated) {
            $recipe = Recipe::firstOrCreate(['product_id' => $product->id]);
            $recipe->items()->delete();

            foreach ($validated['items'] as $item) {
                RecipeItem::create([
                    'recipe_id'   => $recipe->id,
                    'material_id' => $item['material_id'],
                    'qty'         => $item['qty'],
                ]);
            }

            return $recipe;
        });

        return $this->successResponse(
            $recipe->load('items.material:id,name,stock,unit,min_stock,buy_price,initial_qty'),
            'Resep produk berhasil disimpan.'
        );
    }
}
