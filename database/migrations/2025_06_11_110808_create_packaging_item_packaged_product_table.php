<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packaging_item_packaged_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('packaged_product_id')->constrained('packaged_products')->onDelete('cascade');
            $table->foreignId('packaging_item_id')->constrained('packaging_items')->onDelete('restrict');
            $table->integer('kuantitas_digunakan'); // Jumlah item kemasan yg dipakai per produk jadi
            // timestamps tidak wajib untuk tabel pivot sederhana
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packaging_item_packaged_product');
    }
};