<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperadmin = $user->hasRole('superadmin');

        $products = Product::with(['category', 'recipe.items.material'])
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $user->store_id))
            ->where('is_active', 1)
            ->latest()
            ->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'category_id'   => 'required|exists:categories,id',
            'selling_price' => 'required|numeric|min:0',
            'image'         => 'nullable|image|max:5120',
        ]);

        $data = $validated;
        $data['store_id'] = $request->user()->store_id;
        $data['sku'] = 'SKU-' . time();
        $data['cost_price'] = 0;
        $data['stock'] = 0;
        $data['unit'] = 'pcs';

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'category_id'   => 'required|exists:categories,id',
            'selling_price' => 'required|numeric|min:0',
            'image'         => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                \Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }
}