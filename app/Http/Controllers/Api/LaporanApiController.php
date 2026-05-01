<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/LaporanApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
 
class LaporanApiController extends Controller
{
    public function index(Request $request)
    {
        $user         = $request->user();
        $isSuperadmin = $user->hasRole('superadmin');
        $storeId      = $user->store_id;
 
        $now              = Carbon::now();
        $startOfMonth     = $now->copy()->startOfMonth();
        $endOfMonth       = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth   = $now->copy()->subMonth()->endOfMonth();
 
        $base = fn() => Sale::query()
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId))
            ->where('status', 'completed');
 
        $pendapatanIni  = (clone $base())->whereBetween('sale_date', [$startOfMonth, $endOfMonth])->sum('grand_total');
        $pendapatanLalu = (clone $base())->whereBetween('sale_date', [$startOfLastMonth, $endOfLastMonth])->sum('grand_total');
        $pesananIni     = (clone $base())->whereBetween('sale_date', [$startOfMonth, $endOfMonth])->count();
        $pesananLalu    = (clone $base())->whereBetween('sale_date', [$startOfLastMonth, $endOfLastMonth])->count();
 
        $itemIni = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$startOfMonth, $endOfMonth])
            ->sum('sale_items.qty');
 
        $mostOrder = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$startOfMonth, $endOfMonth])
            ->select('products.name', DB::raw('SUM(sale_items.qty) as total_qty'), DB::raw('SUM(sale_items.subtotal) as total_revenue'))
            ->groupBy('products.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();
 
        $riwayat = (clone $base())
            ->with('items.product:id,name')
            ->orderByDesc('sale_date')
            ->limit(20)
            ->get()
            ->map(fn($s) => [
                'id'             => $s->id,
                'invoice_no'     => $s->invoice_no,
                'sale_date'      => $s->sale_date?->format('d/m/Y H:i'),
                'grand_total'    => (float) $s->grand_total,
                'payment_method' => $s->payment_method,
                'items_count'    => $s->items->sum('qty'),
                'items'          => $s->items->map(fn($i) => [
                    'name'     => $i->product->name ?? '-',
                    'qty'      => $i->qty,
                    'price'    => (float) $i->price,
                    'subtotal' => (float) $i->subtotal,
                ]),
            ]);
 
        return response()->json([
            'summary' => [
                'pendapatan'       => (float) $pendapatanIni,
                'growthPendapatan' => $pendapatanLalu > 0 ? round((($pendapatanIni - $pendapatanLalu) / $pendapatanLalu) * 100, 1) : 0,
                'pesanan'          => $pesananIni,
                'growthPesanan'    => $pesananLalu > 0 ? round((($pesananIni - $pesananLalu) / $pesananLalu) * 100, 1) : 0,
                'itemTerjual'      => (int) $itemIni,
            ],
            'mostOrder' => $mostOrder,
            'riwayat'   => $riwayat,
            'bulan'     => $now->locale('id')->isoFormat('MMMM YYYY'),
        ]);
    }
}