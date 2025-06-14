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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->morphs('adjustable'); // Ini akan membuat kolom adjustable_id (BIGINT UNSIGNED) dan adjustable_type (VARCHAR)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Siapa yang melakukan, jika user dihapus, jadi null
            $table->string('adjustment_type'); // e.g., 'increase', 'decrease', 'correction', 'spoilage', 'sample'
            $table->decimal('quantity_adjusted_g', 10, 2); // Jumlah penyesuaian dalam gram, bisa positif atau negatif
            $table->decimal('stock_before_adjustment_g', 10, 2)->nullable(); // Stok sebelum (untuk audit)
            $table->decimal('stock_after_adjustment_g', 10, 2)->nullable();  // Stok sesudah (untuk audit)
            $table->text('reason')->nullable();
            $table->timestamp('adjustment_date')->useCurrent(); // Tanggal penyesuaian
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};