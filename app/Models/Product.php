<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Recipe; // 🔥 fix huruf kapital

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'store_id', 'sku', 'name', 'description',
        'cost_price', 'selling_price', 'stock', 'unit', 'image', 'is_active',
    ];

    protected $appends = ['available_stock'];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    // 🔥 ganti jadi singular & hasOne yang benar
    public function recipe()
    {
        return $this->hasOne(Recipe::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // 🔥 fix available_stock — pakai recipe (singular) → items
    public function getAvailableStockAttribute()
    {
        if (!$this->relationLoaded('recipe') || !$this->recipe) {
            return $this->stock ?? 0;
        }

        if (!$this->recipe->relationLoaded('items') || $this->recipe->items->isEmpty()) {
            return $this->stock ?? 0;
        }

        $stocks = [];

        foreach ($this->recipe->items as $recipeItem) {
            if (!$recipeItem->relationLoaded('material') || !$recipeItem->material) {
                continue;
            }
            if ($recipeItem->qty <= 0) continue;

            $stocks[] = floor($recipeItem->material->stock / $recipeItem->qty);
        }

        return count($stocks) ? min($stocks) : ($this->stock ?? 0);
    }
}