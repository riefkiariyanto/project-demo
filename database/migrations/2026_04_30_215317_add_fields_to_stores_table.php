<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('stores', function (Blueprint $table) {
        if (!Schema::hasColumn('stores', 'name')) {
            $table->string('name')->after('id');
        }
        if (!Schema::hasColumn('stores', 'code')) {
            $table->string('code')->nullable()->after('name');
        }
        if (!Schema::hasColumn('stores', 'address')) {
            $table->string('address')->nullable()->after('code');
        }
        if (!Schema::hasColumn('stores', 'phone')) {
            $table->string('phone')->nullable()->after('address');
        }
        if (!Schema::hasColumn('stores', 'is_active')) {
            $table->boolean('is_active')->default(true)->after('phone');
        }
    });
}

public function down()
{
    Schema::table('stores', function (Blueprint $table) {
        $table->dropColumn(['name', 'code', 'address', 'phone', 'is_active']);
    });
}
};
