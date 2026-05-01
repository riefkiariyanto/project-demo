<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
    'name', 'code', 'address', 'phone', 'is_active', 'invite_code'
];

// Auto generate invite code
protected static function booted()
{
    static::creating(function ($store) {
        $store->invite_code = strtoupper(substr(md5(uniqid()), 0, 8));
    });
}
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }
}   