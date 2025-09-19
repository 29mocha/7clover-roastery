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
        Schema::table('green_beans', function (Blueprint $table) {
            // Ubah tipe kolom 'harga_beli_per_kg' menjadi DECIMAL
            // Angka 15 berarti total digit maksimum, 2 berarti 2 digit di belakang koma.
            // Ini adalah standar yang sangat baik untuk mata uang.
            $table->decimal('harga_beli_per_kg', 15, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('green_beans', function (Blueprint $table) {
            // Jika di-rollback, kembalikan ke tipe float
            // Anda mungkin perlu mengubah 'float' menjadi 'double' jika itu yang Anda gunakan sebelumnya
            $table->float('harga_beli_per_kg')->nullable()->change();
        });
    }
};