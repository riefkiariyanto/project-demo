<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/SaleApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
 
class SaleApiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|integer|exists:products,id',
            'items.*.qty'            => 'required|integer|min:1',
            'payment_method'         => 'required|in:Cash,QRIS,Debit',
            'paid_amount'            => 'required|numeric|min:0',
        ]);

        try {
            $payload = DB::transaction(function () use ($request, $validated) {
                $user = $request->user();
                $paidAmount = (float) $validated['paid_amount'];

                $items = collect($validated['items'])
                    ->groupBy('product_id')
                    ->map(fn($rows, $productId) => [
                        'product_id' => (int) $productId,
                        'qty' => (int) $rows->sum('qty'),
                    ])
                    ->values();

                $productIds = $items->pluck('product_id')->all();

                $products = Product::with('recipe.items.material')
                    ->whereIn('id', $productIds)
                    ->where('store_id', $user->store_id)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($items as $item) {
                    if (!$products->has($item['product_id'])) {
                        throw ValidationException::withMessages([
                            'items' => ['Produk tidak ditemukan di toko ini.'],
                        ]);
                    }
                }

                $subtotal = 0;
                foreach ($items as $item) {
                    $subtotal += (float) $products[$item['product_id']]->selling_price * $item['qty'];
                }

                $change = $paidAmount - $subtotal;

                if ($paidAmount < $subtotal) {
                    throw ValidationException::withMessages([
                        'paid_amount' => ['Nominal pembayaran kurang!'],
                    ]);
                }

                $materialUsage = [];
                $productUsage = [];

                foreach ($items as $item) {
                    $product = $products[$item['product_id']];

                    if ($product->recipe && $product->recipe->items->isNotEmpty()) {
                        foreach ($product->recipe->items as $recipeItem) {
                            if (!$recipeItem->material_id) {
                                continue;
                            }

                            $materialUsage[$recipeItem->material_id] = ($materialUsage[$recipeItem->material_id] ?? 0)
                                + ($recipeItem->qty * $item['qty']);
                        }

                        continue;
                    }

                    $productUsage[$product->id] = ($productUsage[$product->id] ?? 0) + $item['qty'];
                }

                $materials = Material::whereIn('id', array_keys($materialUsage))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($materialUsage as $materialId => $usedQty) {
                    $material = $materials->get($materialId);

                    if (!$material || $material->stock < $usedQty) {
                        throw ValidationException::withMessages([
                            'items' => ['Stok bahan tidak cukup.'],
                        ]);
                    }
                }

                foreach ($productUsage as $productId => $usedQty) {
                    $product = $products[$productId];

                    if ($product->stock < $usedQty) {
                        throw ValidationException::withMessages([
                            'items' => ["Stok produk {$product->name} tidak cukup."],
                        ]);
                    }
                }

                $sale = Sale::create([
                    'invoice_no' => $this->generateInvoiceNo(),
                    'store_id' => $user->store_id,
                    'user_id' => $user->id,
                    'subtotal' => $subtotal,
                    'discount' => 0,
                    'tax' => 0,
                    'grand_total' => $subtotal,
                    'payment_method' => $validated['payment_method'],
                    'paid_amount' => $paidAmount,
                    'change_amount' => $change,
                    'status' => 'completed',
                    'sale_date' => now(),
                ]);

                foreach ($items as $item) {
                    $product = $products[$item['product_id']];

                    if ($product->recipe && $product->recipe->items->isNotEmpty()) {
                        $costPrice = $product->recipe->items->sum(function ($recipeItem) use ($materials) {
                            $material = $materials->get($recipeItem->material_id);

                            if (!$material || $material->initial_qty <= 0) {
                                return 0;
                            }

                            return ($material->buy_price / $material->initial_qty) * $recipeItem->qty;
                        });
                    } else {
                        $costPrice = (float) $product->cost_price;
                    }

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $item['product_id'],
                        'qty' => $item['qty'],
                        'price' => $product->selling_price,
                        'cost_price' => $costPrice,
                        'subtotal' => (float) $product->selling_price * $item['qty'],
                    ]);
                }

                foreach ($materialUsage as $materialId => $usedQty) {
                    $materials[$materialId]->decrement('stock', $usedQty);
                }

                foreach ($productUsage as $productId => $usedQty) {
                    $products[$productId]->decrement('stock', $usedQty);
                }

                return $this->successResponse([
                    'sale' => $sale->fresh()->load('items.product:id,name'),
                    'invoice_no' => $sale->invoice_no,
                    'change' => round($change, 2),
                ], 'Pembayaran berhasil!', 201);
            });

            return $payload;
        } catch (ValidationException $e) {
            return $this->errorResponse('Validasi gagal.', 422, $e->errors());
        } catch (\Exception $e) {
            report($e);

            return $this->errorResponse(
                config('app.debug') ? $e->getMessage() : 'Pembayaran gagal diproses.',
                500
            );
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
