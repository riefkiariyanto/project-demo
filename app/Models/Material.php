<?php

namespace App\Models;

use App\Models\Store;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'store_id',
        'name',
        'unit',
        'stock',
        'min_stock',
        'buy_price',
        'initial_qty',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
    public function recipes()
{
    return $this->hasOne(Recipe::class);
}
}