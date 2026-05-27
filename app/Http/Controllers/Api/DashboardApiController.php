<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    public function user(Request $request)
    {
        $user = $request->user();
        $storeId = $user->store_id;
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $base = fn($date) => Sale::where('store_id', $storeId)
            ->where('status', 'completed')
            ->whereDate('sale_date', $date);

        $pendapatanHariIni = (clone $base($today))->sum('grand_total');
        $pendapatanKemarin = (clone $base($yesterday))->sum('grand_total');
        $pesananHariIni = (clone $base($today))->count();

        $growth = $pendapatanKemarin > 0
            ? round((($pendapatanHariIni - $pendapatanKemarin) / $pendapatanKemarin) * 100, 1)
            : ($pendapatanHariIni > 0 ? 100 : 0);

        $lowStock = Material::where('store_id', $storeId)
            ->whereColumn('stock', '<=', 'min_stock')
            ->select('id', 'name', 'stock', 'unit', 'min_stock')
            ->limit(5)
            ->get();

        $recentSales = Sale::where('store_id', $storeId)
            ->where('status', 'completed')
            ->whereDate('sale_date', $today)
            ->withSum('items as items_count', 'qty')
            ->orderByDesc('sale_date')
            ->limit(5)
            ->get()
            ->map(fn($sale) => [
                'invoice_no' => $sale->invoice_no,
                'grand_total' => (float) $sale->grand_total,
                'payment_method' => $sale->payment_method,
                'sale_date' => Carbon::parse($sale->sale_date)->format('H:i'),
                'items_count' => (int) $sale->items_count,
            ]);

        return $this->successResponse([
            'stats' => [
                'pendapatan' => (float) $pendapatanHariIni,
                'growth' => $growth,
                'pesanan' => $pesananHariIni,
            ],
            'lowStock' => $lowStock,
            'recentSales' => $recentSales,
            'greeting' => $this->greeting(),
        ], 'Dashboard user berhasil diambil.');
    }

    public function admin(Request $request)
    {
        $user = $request->user();
        $storeId = $user->store_id;
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $base = fn($date) => Sale::where('store_id', $storeId)
            ->where('status', 'completed')
            ->whereDate('sale_date', $date);

        $pendapatanHariIni = (clone $base($today))->sum('grand_total');
        $pendapatanKemarin = (clone $base($yesterday))->sum('grand_total');
        $pesananHariIni = (clone $base($today))->count();
        $pesananKemarin = (clone $base($yesterday))->count();

        $itemHariIni = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.store_id', $storeId)
            ->where('sales.status', 'completed')
            ->whereDate('sales.sale_date', $today)
            ->sum('sale_items.qty');

        $itemKemarin = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.store_id', $storeId)
            ->where('sales.status', 'completed')
            ->whereDate('sales.sale_date', $yesterday)
            ->sum('sale_items.qty');

        $growthPendapatan = $pendapatanKemarin > 0
            ? round((($pendapatanHariIni - $pendapatanKemarin) / $pendapatanKemarin) * 100, 1)
            : ($pendapatanHariIni > 0 ? 100 : 0);

        $growthPesanan = $pesananKemarin > 0
            ? round((($pesananHariIni - $pesananKemarin) / $pesananKemarin) * 100, 1)
            : ($pesananHariIni > 0 ? 100 : 0);

        $growthItem = $itemKemarin > 0
            ? round((($itemHariIni - $itemKemarin) / $itemKemarin) * 100, 1)
            : ($itemHariIni > 0 ? 100 : 0);

        $recentSales = Sale::where('store_id', $storeId)
            ->where('status', 'completed')
            ->withSum('items as items_count', 'qty')
            ->orderByDesc('sale_date')
            ->limit(8)
            ->get()
            ->map(fn($sale) => [
                'invoice_no' => $sale->invoice_no,
                'grand_total' => (float) $sale->grand_total,
                'payment_method' => $sale->payment_method,
                'sale_date' => Carbon::parse($sale->sale_date)->format('d/m H:i'),
                'items_count' => (int) $sale->items_count,
            ]);

        $topProducts = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.store_id', $storeId)
            ->where('sales.status', 'completed')
            ->whereMonth('sales.sale_date', Carbon::now()->month)
            ->select(
                'products.name',
                'products.image',
                DB::raw('SUM(sale_items.qty) as total_qty'),
                DB::raw('SUM(sale_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.image')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn($row) => [
                'name' => $row->name,
                'image' => $row->image,
                'qty' => (int) $row->total_qty,
                'revenue' => (float) $row->total_revenue,
            ]);

        $lowStock = Material::where('store_id', $storeId)
            ->whereColumn('stock', '<=', 'min_stock')
            ->select('id', 'name', 'stock', 'unit', 'min_stock')
            ->limit(5)
            ->get();

        return $this->successResponse([
            'stats' => [
                'pendapatan' => (float) $pendapatanHariIni,
                'growthPendapatan' => $growthPendapatan,
                'pesanan' => $pesananHariIni,
                'growthPesanan' => $growthPesanan,
                'itemTerjual' => (int) $itemHariIni,
                'growthItem' => $growthItem,
            ],
            'recentSales' => $recentSales,
            'topProducts' => $topProducts,
            'lowStock' => $lowStock,
            'tanggal' => Carbon::now()->locale('id')->isoFormat('dddd, D MMMM YYYY'),
            'greeting' => $this->greeting(),
            'storeName' => $user->store?->name ?? 'Toko',
        ], 'Dashboard admin berhasil diambil.');
    }

    public function superadmin()
    {
        $today = Carbon::today();
        $now = Carbon::now();

        $todayStats = Sale::where('status', 'completed')
            ->whereDate('sale_date', $today)
            ->selectRaw('store_id, SUM(grand_total) as pendapatan, COUNT(*) as pesanan')
            ->groupBy('store_id')
            ->get()
            ->keyBy('store_id');

        $monthStats = Sale::where('status', 'completed')
            ->whereYear('sale_date', $now->year)
            ->whereMonth('sale_date', $now->month)
            ->selectRaw('store_id, SUM(grand_total) as bulan_ini')
            ->groupBy('store_id')
            ->pluck('bulan_ini', 'store_id');

        $stores = Store::withCount('users')->get()->map(function ($store) use ($todayStats, $monthStats) {
            $todayStoreStats = $todayStats->get($store->id);

            return [
                'id' => $store->id,
                'name' => $store->name,
                'logo' => $store->logo,
                'user_count' => (int) $store->users_count,
                'pendapatan' => (float) ($todayStoreStats->pendapatan ?? 0),
                'pesanan' => (int) ($todayStoreStats->pesanan ?? 0),
                'bulan_ini' => (float) ($monthStats[$store->id] ?? 0),
            ];
        });

        return $this->successResponse([
            'stores' => $stores,
            'totalHariIni' => (float) $stores->sum('pendapatan'),
            'totalBulanIni' => (float) $stores->sum('bulan_ini'),
            'totalPesanan' => (int) $stores->sum('pesanan'),
            'tanggal' => Carbon::now()->locale('id')->isoFormat('dddd, D MMMM YYYY'),
            'greeting' => $this->greeting(),
        ], 'Dashboard superadmin berhasil diambil.');
    }

    private function greeting(): string
    {
        $hour = Carbon::now()->hour;

        if ($hour < 11) {
            return 'Selamat Pagi';
        }

        if ($hour < 15) {
            return 'Selamat Siang';
        }

        if ($hour < 18) {
            return 'Selamat Sore';
        }

        return 'Selamat Malam';
    }
}
