<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\Material;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function user()
    {
        $user    = auth()->user();
        $storeId = $user->store_id;
        $today   = Carbon::today();
        $yesterday = Carbon::yesterday();

        $base = fn($date) => Sale::where('store_id', $storeId)
            ->where('status', 'completed')
            ->whereDate('sale_date', $date);

        $pendapatanHariIni  = (clone $base($today))->sum('grand_total');
        $pendapatanKemarin  = (clone $base($yesterday))->sum('grand_total');
        $pesananHariIni     = (clone $base($today))->count();

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
            ->orderByDesc('sale_date')
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'invoice_no'     => $s->invoice_no,
                'grand_total'    => (float) $s->grand_total,
                'payment_method' => $s->payment_method,
                'sale_date'      => Carbon::parse($s->sale_date)->format('H:i'),
                'items_count'    => $s->items()->sum('qty'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'pendapatan' => (float) $pendapatanHariIni,
                'growth'     => $growth,
                'pesanan'    => $pesananHariIni,
            ],
            'lowStock'    => $lowStock,
            'recentSales' => $recentSales,
            'greeting'    => $this->greeting(),
        ]);
    }

    public function admin()
    {
        $user    = auth()->user();
        $storeId = $user->store_id;
        $today   = Carbon::today();
        $yesterday = Carbon::yesterday();

        $base = fn($date) => Sale::where('store_id', $storeId)
            ->where('status', 'completed')
            ->whereDate('sale_date', $date);

        $pendapatanHariIni  = (clone $base($today))->sum('grand_total');
        $pendapatanKemarin  = (clone $base($yesterday))->sum('grand_total');
        $pesananHariIni     = (clone $base($today))->count();
        $pesananKemarin     = (clone $base($yesterday))->count();

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
            ->orderByDesc('sale_date')
            ->limit(8)
            ->get()
            ->map(fn($s) => [
                'invoice_no'     => $s->invoice_no,
                'grand_total'    => (float) $s->grand_total,
                'payment_method' => $s->payment_method,
                'sale_date'      => Carbon::parse($s->sale_date)->format('d/m H:i'),
                'items_count'    => $s->items()->sum('qty'),
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
            ->map(fn($r) => [
                'name'    => $r->name,
                'image'   => $r->image,
                'qty'     => (int) $r->total_qty,
                'revenue' => (float) $r->total_revenue,
            ]);

        $lowStock = Material::where('store_id', $storeId)
            ->whereColumn('stock', '<=', 'min_stock')
            ->select('id', 'name', 'stock', 'unit', 'min_stock')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/AdminDashboard', [
            'stats' => [
                'pendapatan'       => (float) $pendapatanHariIni,
                'growthPendapatan' => $growthPendapatan,
                'pesanan'          => $pesananHariIni,
                'growthPesanan'    => $growthPesanan,
                'itemTerjual'      => (int) $itemHariIni,
                'growthItem'       => $growthItem,
            ],
            'recentSales' => $recentSales,
            'topProducts' => $topProducts,
            'lowStock'    => $lowStock,
            'tanggal'     => Carbon::now()->locale('id')->isoFormat('dddd, D MMMM YYYY'),
            'greeting'    => $this->greeting(),
            'storeName'   => $user->store?->name ?? 'Toko',
        ]);
    }

    public function superadmin()
    {
        $today = Carbon::today();

        $stores = Store::with('users')->get()->map(function ($store) use ($today) {
            $pendapatan = Sale::where('store_id', $store->id)
                ->where('status', 'completed')
                ->whereDate('sale_date', $today)
                ->sum('grand_total');

            $pesanan = Sale::where('store_id', $store->id)
                ->where('status', 'completed')
                ->whereDate('sale_date', $today)
                ->count();

            $bulanIni = Sale::where('store_id', $store->id)
                ->where('status', 'completed')
                ->whereMonth('sale_date', Carbon::now()->month)
                ->sum('grand_total');

            return [
                'id'          => $store->id,
                'name'        => $store->name,
                'logo'        => $store->logo,
                'user_count'  => $store->users->count(),
                'pendapatan'  => (float) $pendapatan,
                'pesanan'     => (int) $pesanan,
                'bulan_ini'   => (float) $bulanIni,
            ];
        });

        $totalHariIni = $stores->sum('pendapatan');
        $totalBulanIni = $stores->sum('bulan_ini');
        $totalPesanan = $stores->sum('pesanan');

        return Inertia::render('SuperAdmin/SuperAdminDashboard', [
            'stores'        => $stores,
            'totalHariIni'  => $totalHariIni,
            'totalBulanIni' => $totalBulanIni,
            'totalPesanan'  => $totalPesanan,
            'tanggal'       => Carbon::now()->locale('id')->isoFormat('dddd, D MMMM YYYY'),
            'greeting'      => $this->greeting(),
        ]);
    }

    private function greeting(): string
    {
        $hour = Carbon::now()->hour;
        if ($hour < 11) return 'Selamat Pagi';
        if ($hour < 15) return 'Selamat Siang';
        if ($hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    }
}
