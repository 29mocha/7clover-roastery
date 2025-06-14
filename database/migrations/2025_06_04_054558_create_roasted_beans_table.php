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
        Schema::create('roasted_beans', function (Blueprint $table) {
            $table->id();
            // Foreign key ke roast_batches, unik untuk memastikan 1 batch = 1 item inventaris roasted bean
            $table->foreignId('roast_batch_id')->unique()->constrained('roast_batches')->onDelete('cascade'); // Jika batch dihapus, item roasted ini juga ikut terhapus
            $table->string('nama_produk_sangrai'); // Contoh: "Aceh Gayo Natural - Medium - Batch RB-01"
            $table->date('tanggal_roasting'); // Di-copy dari RoastBatch untuk kemudahan query
            $table->string('roast_level'); // Di-copy dari RoastBatch
            $table->integer('stok_awal_g'); // Sama dengan berat_total_roasted_bean_dihasilkan_g dari RoastBatch
            $table->integer('stok_tersisa_g'); // Stok yang bisa berkurang karena penggunaan internal/lainnya
            $table->text('catatan_item')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roasted_beans');
    }
};