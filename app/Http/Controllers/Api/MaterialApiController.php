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

        return $this->successResponse($materials, 'Daftar bahan berhasil diambil.');
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

        return $this->successResponse($material, 'Bahan berhasil ditambahkan.', 201);
    }

    public function update(Request $request, Material $bahan)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $bahan->store_id !== $user->store_id) {
            return $this->errorResponse('Anda tidak memiliki akses ke bahan ini.', 403);
        }

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'unit'      => 'required|string|max:50',
            'min_stock' => 'nullable|numeric|min:0',
            'buy_price' => 'nullable|numeric|min:0',
        ]);

        $bahan->update($validated);
        return $this->successResponse($bahan->fresh(), 'Bahan berhasil diperbarui.');
    }

    public function destroy(Request $request, Material $bahan)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $bahan->store_id !== $user->store_id) {
            return $this->errorResponse('Anda tidak memiliki akses ke bahan ini.', 403);
        }

        $bahan->delete();

        return $this->successResponse(null, 'Bahan berhasil dihapus.');
    }

    public function updateStock(Request $request, Material $bahan)
    {
        $user = $request->user();
        if (!$user->hasRole('superadmin') && $bahan->store_id !== $user->store_id) {
            return $this->errorResponse('Anda tidak memiliki akses ke bahan ini.', 403);
        }

        $validated = $request->validate([
            'qty'  => 'required|numeric',
            'type' => 'required|in:add,subtract,set',
        ]);

        $newStock = match ($validated['type']) {
            'add' => $bahan->stock + $validated['qty'],
            'subtract' => $bahan->stock - $validated['qty'],
            'set' => $validated['qty'],
        };

        if ($newStock < 0) {
            return $this->errorResponse('Stok tidak boleh minus.', 422);
        }

        match ($validated['type']) {
            'add'      => $bahan->increment('stock', $validated['qty']),
            'subtract' => $bahan->decrement('stock', $validated['qty']),
            'set'      => $bahan->update(['stock' => $validated['qty']]),
        };

        return $this->successResponse($bahan->fresh(), 'Stok bahan berhasil diperbarui.');
    }
}
