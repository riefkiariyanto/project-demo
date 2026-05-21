<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->unsignedBigInteger('store_id')->nullable()->after('id');
        });

        // Assign store_id based on which store's products use each category most
        DB::statement("
            UPDATE categories c
            SET store_id = (
                SELECT p.store_id FROM products p
                WHERE p.category_id = c.id
                GROUP BY p.store_id
                ORDER BY COUNT(*) DESC
                LIMIT 1
            )
            WHERE c.store_id IS NULL
        ");
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('store_id');
        });
    }
};
