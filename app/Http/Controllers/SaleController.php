<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|integer|exists:products,id',
                'items.*.qty' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'payment_method' => 'required|in:Cash,QRIS,Debit',
                'paid_amount' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
            ]);

            DB::beginTransaction();

            $user = Auth::user();
            $subtotal = (float) $validated['subtotal'];
            $paidAmount = (float) $validated['paid_amount'];
            $changeAmount = $paidAmount - $subtotal;

            if ($paidAmount < $subtotal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominal pembayaran kurang!',
                ], 422);
            }

            // Create sale
            $sale = Sale::create([
                'invoice_no' => $this->generateInvoiceNo(),
                'store_id' => $user->store_id ?? 1,
                'user_id' => $user->id,
                'customer_id' => null,
                'subtotal' => $subtotal,
                'discount' => 0,
                'tax' => 0,
                'grand_total' => $subtotal,
                'payment_method' => $validated['payment_method'],
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'status' => 'completed',
                'sale_date' => now(),
            ]);

            // Create sale items and update product stock
 foreach ($validated['items'] as $item) {

    $product = Product::with('recipe.items.material')
        ->findOrFail($item['product_id']);

    // Simpan sale item
    SaleItem::create([
        'sale_id'    => $sale->id,
        'product_id' => (int) $item['product_id'],
        'qty'        => (int) $item['qty'],
        'price'      => (float) $item['price'],
        'cost_price' => 0,
        'subtotal'   => (float) $item['price'] * (int) $item['qty'],
    ]);

    // Punya resep → kurangi stok bahan
    if ($product->recipe && $product->recipe->items->isNotEmpty()) {
        foreach ($product->recipe->items as $recipeItem) {
            $material = $recipeItem->material;

            if (!$material) continue;

            $usedQty = $recipeItem->qty * $item['qty'];

            if ($material->stock < $usedQty) {
                throw new \Exception("Stok bahan {$material->name} tidak cukup");
            }

            $material->decrement('stock', $usedQty);
        }
    } else {
        // Tidak ada resep → kurangi stok produk langsung
        if ($product->stock < $item['qty']) {
            throw new \Exception("Stok produk {$product->name} tidak cukup");
        }
        $product->decrement('stock', $item['qty']);
    }
}
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil!',
                'sale' => $sale,
                'change' => round($changeAmount, 2),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . implode(', ', collect($e->errors())->flatten()->toArray()),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran gagal: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function generateInvoiceNo()
{
    $date = now();
    $yy = $date->format('y');
    $mm = $date->format('m');
    $dd = $date->format('d');

    $prefix = "INV-{$yy}{$mm}{$dd}-";

    $last = \App\Models\Sale::where('invoice_no', 'like', $prefix . '%')
        ->orderByDesc('invoice_no')
        ->lockForUpdate()
        ->first();

    if ($last) {
        $lastNumber = (int) substr($last->invoice_no, -4);
        $nextNumber = $lastNumber + 1;
    } else {
        $nextNumber = 1;
    }

    $number = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

    return $prefix . $number;
}
}
