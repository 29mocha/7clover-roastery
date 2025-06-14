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
        Schema::create('green_beans', function (Blueprint $table) {
            $table->id(); // Primary Key (auto-incrementing BigInt)
            $table->string('nama_kopi');
            $table->string('lot_identifier')->unique(); // Pengenal unik untuk lot
            $table->date('tanggal_terima');
            $table->string('origin')->nullable();
            $table->string('varietas')->nullable();
            $table->string('processing_method')->nullable();
            $table->string('supplier')->nullable();
            $table->decimal('jumlah_awal_kg', 8, 3); // Contoh: 99999.999 kg
            $table->decimal('stok_saat_ini_kg', 8, 3);
            $table->text('catatan')->nullable();
            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('green_beans');
    }
};