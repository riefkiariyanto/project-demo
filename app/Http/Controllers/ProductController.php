<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Store;
use Inertia\Inertia;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
   public function index()
{
    $user = auth()->user();

    $products = Product::with(['category', 'store'])
        ->when(!$user->hasRole('superadmin'), fn($q) => $q->where('store_id', $user->store_id))
        ->latest()
        ->paginate(10);

    return Inertia::render('Products/Index', [
        'products' => $products,
    ]);
}

    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::all(),
            'stores' => Store::all(),
        ]);
    }

   public function store(StoreProductRequest $request)
        {
            $data = $request->validated();
            $data['store_id'] = auth()->user()->store_id;

            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('products', 'public');
            }

            Product::create($data);

            return redirect()
                ->route('kelolatoko')
                ->with('success', 'Produk berhasil ditambahkan');
        }
    public function edit(Product $product)
    {
        if (
            auth()->user()->hasRole('admin') &&
            $product->store_id !== auth()->user()->store_id
        ) {
            abort(403);
        }

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => Category::all(),
            'stores' => Store::all(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        if (
            auth()->user()->hasRole('admin') &&
            $product->store_id !== auth()->user()->store_id
        ) {
            abort(403);
        }

        $data = $request->validated();
        unset($data['store_id']);

        $product->update($data);

        return redirect()
            ->route('kelolatoko')
            ->with('success', 'Produk berhasil diupdate');
    }

    public function destroy(Product $product)
    {
        if (
            auth()->user()->hasRole('admin') &&
            $product->store_id !== auth()->user()->store_id
        ) {
            abort(403);
        }

        $product->delete();

        return redirect()
            ->route('kelolatoko')
            ->with('success', 'Produk berhasil dihapus');
    }
}