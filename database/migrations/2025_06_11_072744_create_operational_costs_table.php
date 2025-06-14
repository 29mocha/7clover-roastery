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
        Schema::create('operational_costs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_biaya')->unique(); // Contoh: "Biaya Gas Roaster", "Gaji Roaster"
            $table->string('tipe_biaya'); // Contoh: "per_jam" atau "per_batch"
            $table->decimal('nilai_biaya', 15, 2); // Contoh: 15000 (untuk Rp 15.000)
            $table->string('satuan')->nullable(); // Contoh: "Rupiah/Jam", "Rupiah/Batch"
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operational_costs');
    }
};