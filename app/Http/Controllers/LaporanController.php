<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isSuperadmin = $user->hasRole('superadmin');
        $storeId = $user->store_id;

        $now = Carbon::now(); // pakai UTC, sama dengan data di database
        $startOfMonth     = $now->copy()->startOfMonth();
        $endOfMonth       = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth   = $now->copy()->subMonth()->endOfMonth();

        $base = fn() => Sale::query()
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId))
            ->where('status', 'completed');

        // Pendapatan
        $pendapatanIni  = (clone $base())->whereBetween('sale_date', [$startOfMonth, $endOfMonth])->sum('grand_total');
        $pendapatanLalu = (clone $base())->whereBetween('sale_date', [$startOfLastMonth, $endOfLastMonth])->sum('grand_total');
        $growthPendapatan = $pendapatanLalu > 0
            ? round((($pendapatanIni - $pendapatanLalu) / $pendapatanLalu) * 100, 1)
            : ($pendapatanIni > 0 ? 100 : 0);

        // Pesanan
        $pesananIni  = (clone $base())->whereBetween('sale_date', [$startOfMonth, $endOfMonth])->count();
        $pesananLalu = (clone $base())->whereBetween('sale_date', [$startOfLastMonth, $endOfLastMonth])->count();
        $growthPesanan = $pesananLalu > 0
            ? round((($pesananIni - $pesananLalu) / $pesananLalu) * 100, 1)
            : ($pesananIni > 0 ? 100 : 0);

        // Item Terjual
        $itemIni = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$startOfMonth, $endOfMonth])
            ->sum('sale_items.qty');

        $itemLalu = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('sale_items.qty');

        $growthItem = $itemLalu > 0
            ? round((($itemIni - $itemLalu) / $itemLalu) * 100, 1)
            : ($itemIni > 0 ? 100 : 0);

        // Chart
        $chartData = (clone $base())
            ->whereBetween('sale_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('DATE(sale_date) as date, SUM(grand_total) as total')
            ->groupByRaw('DATE(sale_date)')
            ->orderBy('date')
            ->get()
            ->map(fn($r) => ['date' => $r->date, 'total' => (float) $r->total]);

        // Kalender
        $kalenderData = (clone $base())
            ->whereBetween('sale_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('DAY(sale_date) as day, COUNT(*) as total')
            ->groupByRaw('DAY(sale_date)')
            ->get()
            ->map(fn($r) => ['day' => (int) $r->day, 'total' => (int) $r->total]);

        // Most Order
        $mostOrder = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$startOfMonth, $endOfMonth])
            ->select(
                'products.id', 'products.name', 'products.selling_price',
                DB::raw('SUM(sale_items.qty) as total_qty'),
                DB::raw('SUM(sale_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.selling_price')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'name'    => $r->name,
                'price'   => (float) $r->selling_price,
                'total'   => (int) $r->total_qty,
                'revenue' => (float) $r->total_revenue,
            ]);

        // Riwayat
        $riwayat = (clone $base())
            ->with('items.product:id,name')
            ->orderByDesc('sale_date')
            ->limit(50)
            ->get()
            ->map(fn($sale) => [
                'id'             => $sale->id,
                'invoice_no'     => $sale->invoice_no,
                'sale_date'      => $sale->sale_date
                    ? Carbon::parse($sale->sale_date)->timezone('Asia/Jakarta')->format('d/m/Y H:i')
                    : '-',
                'grand_total'    => (float) $sale->grand_total,
                'payment_method' => $sale->payment_method,
                'items_count'    => $sale->items->sum('qty'),
                'items'          => $sale->items->map(fn($item) => [
                    'name'     => $item->product->name ?? '-',
                    'qty'      => $item->qty,
                    'price'    => (float) $item->price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ]);

        return Inertia::render('Admin/LaporanAdmin', [
            'summary' => [
                'pendapatan'       => (float) $pendapatanIni,
                'growthPendapatan' => $growthPendapatan,
                'pesanan'          => $pesananIni,
                'growthPesanan'    => $growthPesanan,
                'itemTerjual'      => (int) $itemIni,
                'growthItem'       => $growthItem,
            ],
            'chartData'    => $chartData,
            'kalenderData' => $kalenderData,
            'mostOrder'    => $mostOrder,
            'riwayat'      => $riwayat,
            'bulan'        => $now->locale('id')->isoFormat('MMMM YYYY'),
        ]);
    }
}