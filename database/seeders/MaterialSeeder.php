<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Material;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Coffee Beans', 'unit' => 'gr', 'stock' => 1000, 'min_stock' => 100, 'buy_price' => 50000],
            ['name' => 'Fresh Milk', 'unit' => 'ml', 'stock' => 5000, 'min_stock' => 500, 'buy_price' => 15000],
            ['name' => 'Gula Aren', 'unit' => 'ml', 'stock' => 2000, 'min_stock' => 200, 'buy_price' => 25000],
            ['name' => 'Cup 16oz', 'unit' => 'pcs', 'stock' => 100, 'min_stock' => 10, 'buy_price' => 5000],
            ['name' => 'Coklat Powder', 'unit' => 'gr', 'stock' => 500, 'min_stock' => 50, 'buy_price' => 30000],
        ];

        foreach ($items as $item) {
            Material::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}