<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Perintah ini akan dijalankan saat Anda 'php artisan migrate'
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Kita periksa dulu apakah kolomnya ada, agar aman
            if (Schema::hasColumn('users', 'email_verified_at')) {
                // Jika ada, hapus kolom tersebut
                $table->dropColumn('email_verified_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     * Perintah ini akan dijalankan jika Anda melakukan rollback
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Buat kembali kolomnya jika migrasi dibatalkan
            $table->timestamp('email_verified_at')->nullable()->after('remember_token');
        });
    }
};
