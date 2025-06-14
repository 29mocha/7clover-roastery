<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packaged_products', function (Blueprint $table) {
            // Perintah ini akan menambahkan kolom 'deleted_at' yang nullable
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packaged_products', function (Blueprint $table) {
            // Perintah ini akan menghapus kolom 'deleted_at' jika di-rollback
            $table->dropSoftDeletes();
        });
    }
};