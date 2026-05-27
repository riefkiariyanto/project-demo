<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Material;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ExpenseApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperadmin = $user->hasRole('superadmin');
        $storeId = $user->store_id;
        $mode = $request->get('mode', 'bulan');

        if ($mode === 'bulan') {
            $tanggal = $request->get('tanggal', now()->format('Y-m'));
            $start = Carbon::createFromFormat('Y-m', $tanggal)->startOfMonth()->toDateString();
            $end = Carbon::createFromFormat('Y-m', $tanggal)->endOfMonth()->toDateString();
        } else {
            $tanggal = $request->get('tanggal', now()->toDateString());
            $start = Carbon::parse($tanggal)->toDateString();
            $end = $start;
        }

        $base = fn() => Expense::query()
            ->when(!$isSuperadmin, fn($query) => $query->where('store_id', $storeId));

        $expenses = (clone $base())
            ->with('user:id,name', 'material:id,name')
            ->whereBetween('expense_date', [$start, $end])
            ->orderByDesc('expense_date')
            ->limit(100)
            ->get()
            ->map(fn($expense) => [
                'id' => $expense->id,
                'category' => $expense->category,
                'description' => $expense->description,
                'material_name' => $expense->material?->name,
                'amount' => (float) $expense->amount,
                'expense_date' => Carbon::parse($expense->expense_date)->format('d/m/Y'),
                'kasir_name' => $expense->user->name ?? '-',
            ]);

        $allExpenses = (clone $base())
            ->whereBetween('expense_date', [$start, $end])
            ->get();

        $materials = Material::where('store_id', $storeId)
            ->select('id', 'name', 'unit', 'buy_price', 'initial_qty')
            ->orderBy('name')
            ->get();

        return $this->successResponse([
            'expenses' => $expenses,
            'summary' => [
                'total' => (float) $allExpenses->sum('amount'),
                'byCategory' => $allExpenses
                    ->groupBy('category')
                    ->map(fn($group) => (float) $group->sum('amount')),
            ],
            'materials' => $materials,
            'filter' => [
                'mode' => $mode,
                'tanggal' => $tanggal,
            ],
        ], 'Data pengeluaran berhasil diambil.');
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $storeId = $user->store_id;

        $validated = $request->validate([
            'category' => 'required|in:Belanja Bahan,Gaji,Listrik,Air,Sewa,Lain-lain',
            'description' => 'nullable|string|max:255|required_if:category,Lain-lain',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'material_id' => [
                'nullable',
                'required_if:category,Belanja Bahan',
                Rule::exists('materials', 'id')->where('store_id', $storeId),
            ],
            'qty' => 'nullable|required_if:category,Belanja Bahan|numeric|min:0.01',
        ]);

        $expense = DB::transaction(function () use ($validated, $storeId, $user) {
            if ($validated['category'] === 'Belanja Bahan') {
                $material = Material::where('id', $validated['material_id'])
                    ->where('store_id', $storeId)
                    ->lockForUpdate()
                    ->firstOrFail();

                $material->increment('stock', $validated['qty']);
            }

            return Expense::create([
                'store_id' => $storeId,
                'user_id' => $user->id,
                'category' => $validated['category'],
                'description' => $validated['description'] ?? null,
                'material_id' => $validated['material_id'] ?? null,
                'amount' => $validated['amount'],
                'expense_date' => $validated['expense_date'],
            ]);
        });

        return $this->successResponse(
            $expense->load('user:id,name', 'material:id,name'),
            'Pengeluaran berhasil dicatat.',
            201
        );
    }
}
