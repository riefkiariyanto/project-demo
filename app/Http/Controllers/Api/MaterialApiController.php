<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;

class MaterialApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $materials = Material::when(
            !$user->hasRole('superadmin'),
            fn($q) => $q->where('store_id', $user->store_id)
        )->latest()->get();

        return response()->json($materials);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'unit'        => 'required|string|max:50',
            'stock'       => 'required|numeric|min:0',
            'min_stock'   => 'nullable|numeric|min:0',
            'buy_price'   => 'nullable|numeric|min:0',
            'initial_qty' => 'nullable|numeric|min:0',
        ]);

        $validated['store_id'] = $request->user()->store_id;
        $material = Material::create($validated);

        return response()->json($material, 201);
    }

    public function update(Request $request, Material $bahan)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $bahan->store_id !== $user->store_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'unit'      => 'required|string|max:50',
            'min_stock' => 'nullable|numeric|min:0',
            'buy_price' => 'nullable|numeric|min:0',
        ]);

        $bahan->update($validated);
        return response()->json($bahan);
    }

    public function destroy(Request $request, Material $bahan)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $bahan->store_id !== $user->store_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $bahan->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function updateStock(Request $request, Material $bahan)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $bahan->store_id !== $user->store_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'qty'  => 'required|numeric',
            'type' => 'required|in:add,subtract,set',
        ]);

        match ($validated['type']) {
            'add'      => $bahan->increment('stock', $validated['qty']),
            'subtract' => $bahan->decrement('stock', $validated['qty']),
            'set'      => $bahan->update(['stock' => $validated['qty']]),
        };

        return response()->json($bahan->fresh());
    }
}
