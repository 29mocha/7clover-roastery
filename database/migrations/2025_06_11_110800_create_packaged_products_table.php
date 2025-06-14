<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packaged_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('roasted_bean_id')->constrained('roasted_beans')->comment('Asal stok roasted bean curah');
            $table->string('nama_produk'); // Contoh: "Aceh Gayo - Medium - 250g"
            $table->integer('berat_bersih_g')->comment('Berat kopi di dalam satu kemasan');
            $table->integer('kuantitas_awal')->comment('Jumlah kemasan yang dibuat');
            $table->integer('kuantitas_tersisa')->comment('Stok kemasan saat ini');
            $table->decimal('biaya_kopi_per_kemasan', 15, 2);
            $table->decimal('biaya_kemasan_per_kemasan', 15, 2);
            $table->decimal('total_hpp_per_kemasan', 15, 2);
            $table->text('catatan')->nullable();
            $table->timestamp('tanggal_kemas')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packaged_products');
    }
};