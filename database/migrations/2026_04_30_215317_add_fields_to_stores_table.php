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
        $table->string('name')->after('id');
        $table->string('code')->nullable()->after('name');
        $table->string('address')->nullable()->after('code');
        $table->string('phone')->nullable()->after('address');
        $table->boolean('is_active')->default(true)->after('phone');
    });
}

public function down()
{
    Schema::table('stores', function (Blueprint $table) {
        $table->dropColumn(['name', 'code', 'address', 'phone', 'is_active']);
    });
}
};
