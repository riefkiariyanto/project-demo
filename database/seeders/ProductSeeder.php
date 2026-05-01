<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::first(); // Ambil kategori pertama

        $items = [
            ['name' => 'Espresso', 'selling_price' => 15000, 'category_id' => $category?->id, 'sku' => 'ESP001'],
            ['name' => 'Cappuccino', 'selling_price' => 20000, 'category_id' => $category?->id, 'sku' => 'CAP001'],
            ['name' => 'Latte', 'selling_price' => 25000, 'category_id' => $category?->id, 'sku' => 'LAT001'],
        ];

        foreach ($items as $item) {
            Product::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}