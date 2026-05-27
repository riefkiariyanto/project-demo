<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperadmin = $user->hasRole('superadmin');

        $products = Product::query()
            ->select([
                'id',
                'category_id',
                'store_id',
                'sku',
                'name',
                'description',
                'cost_price',
                'selling_price',
                'stock',
                'unit',
                'image',
                'is_active',
                'created_at',
                'updated_at',
            ])
            ->with([
                'category:id,name,store_id',
                'recipe:id,product_id',
                'recipe.items:id,recipe_id,material_id,qty',
                'recipe.items.material:id,name,stock,unit,min_stock,buy_price,initial_qty',
            ])
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $user->store_id))
            ->where('is_active', 1)
            ->latest()
            ->get();

        return $this->successResponse($products, 'Daftar produk berhasil diambil.');
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'category_id'   => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($user) {
                    if (!$user->hasRole('superadmin')) {
                        $query->where('store_id', $user->store_id);
                    }
                }),
            ],
            'selling_price' => 'required|numeric|min:0',
            'description'   => 'nullable|string',
            'image'         => 'nullable|image|max:5120',
        ]);

        $data = $validated;
        $data['store_id'] = $user->store_id;
        $data['sku'] = 'SKU-' . Str::upper(Str::random(10));
        $data['cost_price'] = 0;
        $data['stock'] = 0;
        $data['unit'] = 'pcs';
        $data['is_active'] = true;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data)->load(['category', 'recipe.items.material']);

        return $this->successResponse($product, 'Produk berhasil ditambahkan.', 201);
    }

    public function update(Request $request, Product $product)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $product->store_id !== $user->store_id) {
            return $this->errorResponse('Anda tidak memiliki akses ke produk ini.', 403);
        }

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'category_id'   => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($user) {
                    if (!$user->hasRole('superadmin')) {
                        $query->where('store_id', $user->store_id);
                    }
                }),
            ],
            'selling_price' => 'required|numeric|min:0',
            'description'   => 'nullable|string',
            'image'         => 'nullable|image|max:5120',
            'is_active'     => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);
        return $this->successResponse(
            $product->fresh()->load(['category', 'recipe.items.material']),
            'Produk berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, Product $product)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $product->store_id !== $user->store_id) {
            return $this->errorResponse('Anda tidak memiliki akses ke produk ini.', 403);
        }

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return $this->successResponse(null, 'Produk berhasil dihapus.');
    }
}
