<?php
// ════════════════════════════════════════════════════════════
// File: app/Http/Controllers/Api/CategoryApiController.php
// ════════════════════════════════════════════════════════════
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
 
class CategoryApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $categories = Category::withCount('products')
            ->when(
                !$user->hasRole('superadmin'),
                fn($query) => $query->where('store_id', $user->store_id)
            )
            ->latest()
            ->get();

        return $this->successResponse($categories, 'Daftar kategori berhasil diambil.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'store_id' => $request->user()->store_id,
        ]);

        return $this->successResponse($category, 'Kategori berhasil ditambahkan', 201);
    }

    public function update(Request $request, Category $category)
    {
        $this->authorizeCategory($request, $category);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $category->update([
            'name' => $validated['name'],
        ]);

        return $this->successResponse($category->fresh(), 'Kategori berhasil diperbarui');
    }

    public function destroy(Request $request, Category $category)
    {
        $this->authorizeCategory($request, $category);

        if ($category->products()->exists()) {
            return $this->errorResponse('Kategori tidak bisa dihapus karena masih digunakan oleh produk.', 422);
        }

        $category->delete();

        return $this->successResponse(null, 'Kategori berhasil dihapus');
    }

    private function authorizeCategory(Request $request, Category $category): void
    {
        $user = $request->user();

        abort_if(
            !$user->hasRole('superadmin') && $category->store_id !== $user->store_id,
            403
        );
    }
}
