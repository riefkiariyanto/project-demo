<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/SaleApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
 
class SaleApiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|integer|exists:products,id',
            'items.*.qty'            => 'required|integer|min:1',
            'items.*.price'          => 'required|numeric|min:0',
            'payment_method'         => 'required|in:Cash,QRIS,Debit',
            'paid_amount'            => 'required|numeric|min:0',
            'subtotal'               => 'required|numeric|min:0',
        ]);
 
        DB::beginTransaction();
        try {
            $user        = $request->user();
            $subtotal    = (float) $validated['subtotal'];
            $paidAmount  = (float) $validated['paid_amount'];
            $change      = $paidAmount - $subtotal;
 
            if ($paidAmount < $subtotal) {
                return response()->json(['success' => false, 'message' => 'Nominal pembayaran kurang!'], 422);
            }
 
            $sale = Sale::create([
                'invoice_no'     => $this->generateInvoiceNo(),
                'store_id'       => $user->store_id,
                'user_id'        => $user->id,
                'subtotal'       => $subtotal,
                'discount'       => 0,
                'tax'            => 0,
                'grand_total'    => $subtotal,
                'payment_method' => $validated['payment_method'],
                'paid_amount'    => $paidAmount,
                'change_amount'  => $change,
                'status'         => 'completed',
                'sale_date'      => now(),
            ]);
 
            foreach ($validated['items'] as $item) {
                $product = Product::with('recipe.items.material')->findOrFail($item['product_id']);
 
                SaleItem::create([
                    'sale_id'    => $sale->id,
                    'product_id' => $item['product_id'],
                    'qty'        => $item['qty'],
                    'price'      => $item['price'],
                    'cost_price' => 0,
                    'subtotal'   => $item['price'] * $item['qty'],
                ]);
 
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
                'sale'    => $sale,
                'change'  => round($change, 2),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
 
    private function generateInvoiceNo()
    {
        $date   = now();
        $prefix = "INV-{$date->format('y')}{$date->format('m')}{$date->format('d')}-";
        $last   = Sale::where('invoice_no', 'like', $prefix . '%')->orderByDesc('invoice_no')->lockForUpdate()->first();
        $next   = $last ? ((int) substr($last->invoice_no, -4)) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }
}