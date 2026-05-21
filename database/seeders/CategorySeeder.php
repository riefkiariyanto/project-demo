<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Kopi Susu'],
            ['name' => 'Non Coffee'],
            ['name' => 'Refreshment'],
            ['name' => 'Espresso Based'],
            ['name' => 'Manual Brew'],
            ['name' => 'Snack'],
            ['name' => 'Dessert'],
            ['name' => 'Food'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate($category);
        }
    }
}