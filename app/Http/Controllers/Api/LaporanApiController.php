<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/LaporanApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Expense;
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
        $growthPendapatan = $pendapatanLalu > 0
            ? round((($pendapatanIni - $pendapatanLalu) / $pendapatanLalu) * 100, 1)
            : ($pendapatanIni > 0 ? 100 : 0);

        $hppBase = fn() => SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed');

        $hppIni = (clone $hppBase())
            ->whereBetween('sales.sale_date', [$startOfMonth, $endOfMonth])
            ->sum(DB::raw('sale_items.cost_price * sale_items.qty'));

        $hppLalu = (clone $hppBase())
            ->whereBetween('sales.sale_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum(DB::raw('sale_items.cost_price * sale_items.qty'));

        $bersihIni = $pendapatanIni - $hppIni;
        $bersihLalu = $pendapatanLalu - $hppLalu;
        $growthBersih = $bersihLalu > 0
            ? round((($bersihIni - $bersihLalu) / $bersihLalu) * 100, 1)
            : ($bersihIni > 0 ? 100 : 0);

        $pesananIni = (clone $base())->whereBetween('sale_date', [$startOfMonth, $endOfMonth])->count();
        $pesananLalu = (clone $base())->whereBetween('sale_date', [$startOfLastMonth, $endOfLastMonth])->count();
        $growthPesanan = $pesananLalu > 0
            ? round((($pesananIni - $pesananLalu) / $pesananLalu) * 100, 1)
            : ($pesananIni > 0 ? 100 : 0);
 
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

        $pengeluaranBase = fn() => Expense::query()
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId));

        $pengeluaranIni = (clone $pengeluaranBase())
            ->whereBetween('expense_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->sum('amount');

        $pengeluaranLalu = (clone $pengeluaranBase())
            ->whereBetween('expense_date', [$startOfLastMonth->toDateString(), $endOfLastMonth->toDateString()])
            ->sum('amount');

        $growthPengeluaran = $pengeluaranLalu > 0
            ? round((($pengeluaranIni - $pengeluaranLalu) / $pengeluaranLalu) * 100, 1)
            : ($pengeluaranIni > 0 ? 100 : 0);

        $labaSetelahPengeluaran = $bersihIni - $pengeluaranIni;
        $labaSetelahLalu = $bersihLalu - $pengeluaranLalu;
        $growthLabaSetelah = $labaSetelahLalu > 0
            ? round((($labaSetelahPengeluaran - $labaSetelahLalu) / $labaSetelahLalu) * 100, 1)
            : ($labaSetelahPengeluaran > 0 ? 100 : 0);

        $byPayment = (clone $base())
            ->whereBetween('sale_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('payment_method, SUM(grand_total) as total')
            ->groupBy('payment_method')
            ->pluck('total', 'payment_method');

        $chartData = (clone $base())
            ->whereBetween('sale_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('DATE(sale_date) as date, SUM(grand_total) as total')
            ->groupByRaw('DATE(sale_date)')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => ['date' => $row->date, 'total' => (float) $row->total]);

        $kalenderData = (clone $base())
            ->whereBetween('sale_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('DAY(sale_date) as day, COUNT(*) as total')
            ->groupByRaw('DAY(sale_date)')
            ->get()
            ->map(fn($row) => ['day' => (int) $row->day, 'total' => (int) $row->total]);
 
        $mostOrder = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$startOfMonth, $endOfMonth])
            ->select(
                'products.id',
                'products.name',
                'products.selling_price',
                DB::raw('SUM(sale_items.qty) as total_qty'),
                DB::raw('SUM(sale_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.selling_price')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn($row) => [
                'name' => $row->name,
                'price' => (float) $row->selling_price,
                'total' => (int) $row->total_qty,
                'revenue' => (float) $row->total_revenue,
            ]);
 
        $riwayat = (clone $base())
            ->with('items.product:id,name', 'user:id,name', 'store:id,name,address,phone')
            ->orderByDesc('sale_date')
            ->limit(50)
            ->get()
            ->map(fn($sale) => [
                'id' => $sale->id,
                'invoice_no' => $sale->invoice_no,
                'sale_date' => $sale->sale_date
                    ? Carbon::parse($sale->sale_date)->timezone('Asia/Jakarta')->format('d/m/Y H:i')
                    : '-',
                'grand_total' => (float) $sale->grand_total,
                'paid_amount' => (float) $sale->paid_amount,
                'change_amount' => (float) $sale->change_amount,
                'payment_method' => $sale->payment_method,
                'kasir_name' => $sale->user->name ?? '-',
                'store_name' => $sale->store->name ?? null,
                'store_address' => $sale->store->address ?? null,
                'store_phone' => $sale->store->phone ?? null,
                'store_logo' => $sale->store->logo ?? null,
                'items_count' => $sale->items->sum('qty'),
                'items' => $sale->items->map(fn($item) => [
                    'name' => $item->product->name ?? '-',
                    'qty' => $item->qty,
                    'price' => (float) $item->price,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ]);
 
        return $this->successResponse([
            'summary' => [
                'pendapatan'       => (float) $pendapatanIni,
                'growthPendapatan' => $growthPendapatan,
                'hpp'              => (float) $hppIni,
                'bersih'           => (float) $bersihIni,
                'growthBersih'     => $growthBersih,
                'pesanan'          => $pesananIni,
                'growthPesanan'    => $growthPesanan,
                'itemTerjual'      => (int) $itemIni,
                'growthItem'       => $growthItem,
                'pengeluaran'      => (float) $pengeluaranIni,
                'growthPengeluaran' => $growthPengeluaran,
                'labaSetelahPengeluaran' => (float) $labaSetelahPengeluaran,
                'growthLabaSetelah' => $growthLabaSetelah,
                'totalCash'        => (float) ($byPayment['Cash'] ?? 0),
                'totalQris'        => (float) ($byPayment['QRIS'] ?? 0),
                'totalDebit'       => (float) ($byPayment['Debit'] ?? 0),
            ],
            'chartData' => $chartData,
            'kalenderData' => $kalenderData,
            'mostOrder' => $mostOrder,
            'riwayat'   => $riwayat,
            'bulan'     => $now->locale('id')->isoFormat('MMMM YYYY'),
        ], 'Laporan berhasil diambil.');
    }

    public function harian(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
        ]);

        $user = $request->user();
        $isSuperadmin = $user->hasRole('superadmin');
        $storeId = $user->store_id;

        $hari = Carbon::parse($request->tanggal)->startOfDay();
        $hariAkhir = $hari->copy()->endOfDay();
        $hariLalu = $hari->copy()->subDay()->startOfDay();
        $hariLaluAkhir = $hariLalu->copy()->endOfDay();

        $base = fn() => Sale::query()
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId))
            ->where('status', 'completed');

        $pendapatanIni = (clone $base())->whereBetween('sale_date', [$hari, $hariAkhir])->sum('grand_total');
        $pendapatanLalu = (clone $base())->whereBetween('sale_date', [$hariLalu, $hariLaluAkhir])->sum('grand_total');
        $growthPendapatan = $pendapatanLalu > 0
            ? round((($pendapatanIni - $pendapatanLalu) / $pendapatanLalu) * 100, 1)
            : ($pendapatanIni > 0 ? 100 : 0);

        $pesananIni = (clone $base())->whereBetween('sale_date', [$hari, $hariAkhir])->count();
        $pesananLalu = (clone $base())->whereBetween('sale_date', [$hariLalu, $hariLaluAkhir])->count();
        $growthPesanan = $pesananLalu > 0
            ? round((($pesananIni - $pesananLalu) / $pesananLalu) * 100, 1)
            : ($pesananIni > 0 ? 100 : 0);

        $itemBase = fn() => SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->when(!$isSuperadmin, fn($q) => $q->where('sales.store_id', $storeId))
            ->where('sales.status', 'completed');

        $itemIni = (clone $itemBase())->whereBetween('sales.sale_date', [$hari, $hariAkhir])->sum('sale_items.qty');
        $itemLalu = (clone $itemBase())->whereBetween('sales.sale_date', [$hariLalu, $hariLaluAkhir])->sum('sale_items.qty');
        $growthItem = $itemLalu > 0
            ? round((($itemIni - $itemLalu) / $itemLalu) * 100, 1)
            : ($itemIni > 0 ? 100 : 0);

        $hppHariIni = (clone $itemBase())
            ->whereBetween('sales.sale_date', [$hari, $hariAkhir])
            ->sum(DB::raw('sale_items.cost_price * sale_items.qty'));

        $hppHariLalu = (clone $itemBase())
            ->whereBetween('sales.sale_date', [$hariLalu, $hariLaluAkhir])
            ->sum(DB::raw('sale_items.cost_price * sale_items.qty'));

        $bersihHariIni = $pendapatanIni - $hppHariIni;
        $bersihHariLalu = $pendapatanLalu - $hppHariLalu;
        $growthBersih = $bersihHariLalu > 0
            ? round((($bersihHariIni - $bersihHariLalu) / $bersihHariLalu) * 100, 1)
            : ($bersihHariIni > 0 ? 100 : 0);

        $pengeluaranHariBase = fn() => Expense::query()
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId));

        $pengeluaranHariIni = (clone $pengeluaranHariBase())
            ->whereBetween('expense_date', [$hari->toDateString(), $hariAkhir->toDateString()])
            ->sum('amount');

        $pengeluaranHariLalu = (clone $pengeluaranHariBase())
            ->whereBetween('expense_date', [$hariLalu->toDateString(), $hariLaluAkhir->toDateString()])
            ->sum('amount');

        $growthPengeluaran = $pengeluaranHariLalu > 0
            ? round((($pengeluaranHariIni - $pengeluaranHariLalu) / $pengeluaranHariLalu) * 100, 1)
            : ($pengeluaranHariIni > 0 ? 100 : 0);

        $labaSetelahPengeluaran = $bersihHariIni - $pengeluaranHariIni;
        $labaSetelahLalu = $bersihHariLalu - $pengeluaranHariLalu;
        $growthLabaSetelah = $labaSetelahLalu > 0
            ? round((($labaSetelahPengeluaran - $labaSetelahLalu) / $labaSetelahLalu) * 100, 1)
            : ($labaSetelahPengeluaran > 0 ? 100 : 0);

        $byPayment = (clone $base())
            ->whereBetween('sale_date', [$hari, $hariAkhir])
            ->selectRaw('payment_method, SUM(grand_total) as total')
            ->groupBy('payment_method')
            ->pluck('total', 'payment_method');

        return $this->successResponse([
            'pendapatan' => (float) $pendapatanIni,
            'growthPendapatan' => $growthPendapatan,
            'hpp' => (float) $hppHariIni,
            'bersih' => (float) $bersihHariIni,
            'growthBersih' => $growthBersih,
            'pesanan' => $pesananIni,
            'growthPesanan' => $growthPesanan,
            'itemTerjual' => (int) $itemIni,
            'growthItem' => $growthItem,
            'pengeluaran' => (float) $pengeluaranHariIni,
            'growthPengeluaran' => $growthPengeluaran,
            'labaSetelahPengeluaran' => (float) $labaSetelahPengeluaran,
            'growthLabaSetelah' => $growthLabaSetelah,
            'totalCash' => (float) ($byPayment['Cash'] ?? 0),
            'totalQris' => (float) ($byPayment['QRIS'] ?? 0),
            'totalDebit' => (float) ($byPayment['Debit'] ?? 0),
            'label' => Carbon::parse($request->tanggal)->locale('id')->isoFormat('dddd, D MMMM YYYY'),
            'labelBanding' => 'vs kemarin',
        ], 'Laporan harian berhasil diambil.');
    }
}
