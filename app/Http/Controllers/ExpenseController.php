<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $user         = auth()->user();
        $isSuperadmin = $user->hasRole('superadmin');
        $storeId      = $user->store_id;

        $mode = $request->get('mode', 'bulan');

        if ($mode === 'bulan') {
            $tanggal = $request->get('tanggal', now()->format('Y-m'));
            $start   = Carbon::createFromFormat('Y-m', $tanggal)->startOfMonth()->toDateString();
            $end     = Carbon::createFromFormat('Y-m', $tanggal)->endOfMonth()->toDateString();
        } else {
            $tanggal = $request->get('tanggal', now()->toDateString());
            $start   = Carbon::parse($tanggal)->toDateString();
            $end     = $start;
        }

        $base = fn() => Expense::query()
            ->when(!$isSuperadmin, fn($q) => $q->where('store_id', $storeId));

        $expenses = (clone $base())
            ->with('user:id,name', 'material:id,name')
            ->whereBetween('expense_date', [$start, $end])
            ->orderByDesc('expense_date')
            ->limit(100)
            ->get()
            ->map(fn($e) => [
                'id'            => $e->id,
                'category'      => $e->category,
                'description'   => $e->description,
                'material_name' => $e->material?->name,
                'amount'        => (float) $e->amount,
                'expense_date'  => Carbon::parse($e->expense_date)->format('d/m/Y'),
                'kasir_name'    => $e->user->name ?? '-',
            ]);

        $allExpenses = (clone $base())
            ->whereBetween('expense_date', [$start, $end])
            ->get();

        $byCategory = $allExpenses
            ->groupBy('category')
            ->map(fn($g) => (float) $g->sum('amount'));

        $materials = Material::where('store_id', $storeId)
            ->select('id', 'name', 'unit', 'buy_price', 'initial_qty')
            ->orderBy('name')
            ->get();

        return Inertia::render('Pengeluaran', [
            'expenses' => $expenses,
            'summary'  => [
                'total'      => (float) $allExpenses->sum('amount'),
                'byCategory' => $byCategory,
            ],
            'materials' => $materials,
            'filter'    => ['mode' => $mode, 'tanggal' => $tanggal],
        ]);
    }

    public function store(Request $request)
    {
        $user    = auth()->user();
        $storeId = $user->store_id;

        $validated = $request->validate([
            'category'     => 'required|in:Belanja Bahan,Gaji,Listrik,Air,Sewa,Lain-lain',
            'description'  => 'nullable|string|max:255|required_if:category,Lain-lain',
            'amount'       => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'material_id'  => [
                'nullable',
                'required_if:category,Belanja Bahan',
                Rule::exists('materials', 'id')->where('store_id', $storeId),
            ],
            'qty' => 'nullable|required_if:category,Belanja Bahan|numeric|min:0.01',
        ]);

        if ($validated['category'] === 'Belanja Bahan') {
            $material = Material::where('id', $validated['material_id'])
                ->where('store_id', $storeId)
                ->firstOrFail();
            $material->stock += $validated['qty'];
            $material->save();
        }

        Expense::create([
            'store_id'     => $storeId,
            'user_id'      => $user->id,
            'category'     => $validated['category'],
            'description'  => $validated['description'] ?? null,
            'material_id'  => $validated['material_id'] ?? null,
            'amount'       => $validated['amount'],
            'expense_date' => $validated['expense_date'],
        ]);

        return redirect()->back()->with('success', 'Pengeluaran berhasil dicatat.');
    }
}
