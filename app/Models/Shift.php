<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'store_id',
        'open_cash',
        'close_cash',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'open_cash' => 'decimal:2',
        'close_cash' => 'decimal:2',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function getIsOpenAttribute()
    {
        return is_null($this->closed_at);
    }
}