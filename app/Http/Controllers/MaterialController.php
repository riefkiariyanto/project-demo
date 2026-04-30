<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index()
    {
        return Inertia::render('Bahan', [
            'materials' => Material::latest()->get(),
        ]);
    }

 public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'unit' => 'required|string|max:50',
        'stock' => 'required|numeric|min:0',
        'min_stock' => 'required|numeric|min:0',
        'buy_price' => 'required|numeric|min:0',
        'use_initial_qty' => 'nullable',
    ]);

    $useInitial = $request->input('use_initial_qty');
    $initialQty = in_array($useInitial, [true, "true", 1, "1", "on"], true)
        ? $validated['stock']
        : 0;

    Material::create([
        'name'        => $validated['name'],
        'unit'        => $validated['unit'],
        'stock'       => $validated['stock'],
        'min_stock'   => $validated['min_stock'],
        'buy_price'   => $validated['buy_price'],
        'initial_qty' => $initialQty,
        'store_id'    => auth()->user()->store_id, // 🔥 tambahkan ini
    ]);

    return redirect()->route('kelolatoko');
}
    public function update(Request $request, Material $bahan)
    {
        if (
            auth()->user()->hasRole('admin') &&
            $bahan->store_id !== auth()->user()->store_id
        ) {
            abort(403);
        }

        $bahan->update($request->only([
            'name',
            'unit',
            'stock',
            'min_stock',
            'buy_price',
            'initial_qty',
        ]));

       return redirect()
    ->route('kelolatoko')
    ->with('success', 'Bahan berhasil diupdate');
    }

    public function updateStock(Request $request, Material $bahan)
{
    if (
        auth()->user()->hasRole('admin') &&
        $bahan->store_id !== auth()->user()->store_id
    ) {
        abort(403);
    }

    $request->validate([
        'type' => 'required|in:in,out',
        'qty' => 'required|numeric|min:1',
    ]);

    if ($request->type === 'in') {
        $bahan->stock += $request->qty;
    } else {
        $bahan->stock -= $request->qty;
        if ($bahan->stock < 0) {
            $bahan->stock = 0;
        }
    }

    $bahan->save();

    return back()->with('success', 'Stock berhasil diperbarui');
}

    public function destroy(Material $bahan)
    {
        if (
            auth()->user()->hasRole('admin') &&
            $bahan->store_id !== auth()->user()->store_id
        ) {
            abort(403);
        }

        $bahan->delete();

        return redirect()
    ->route('kelolatoko')
    ->with('success', 'Bahan berhasil dihapus');
    }
}