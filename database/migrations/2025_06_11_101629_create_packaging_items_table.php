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
        Schema::create('packaging_items', function (Blueprint $table) {
            $table->id();
            $table->string('nama_item')->unique(); // Contoh: "Standing Pouch 250g", "Stiker Logo Bulat"
            $table->string('tipe_item')->nullable(); // Contoh: "Kantong", "Stiker", "Katup", "Box"
            $table->unsignedBigInteger('stok'); // Stok dalam satuan pcs
            $table->decimal('biaya_per_item', 15, 2); // Harga modal untuk satu item
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packaging_items');
    }
};