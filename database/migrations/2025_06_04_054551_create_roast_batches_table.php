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
        Schema::create('roast_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('green_bean_id')->constrained('green_beans')->onDelete('restrict'); // Foreign key ke tabel green_beans, restrict delete jika masih ada batch
            $table->string('nomor_batch_roasting')->unique();
            $table->dateTime('tanggal_roasting'); // Bisa juga $table->date('tanggal_roasting');
            $table->string('nama_operator');
            $table->string('mesin_roasting')->nullable();
            $table->integer('berat_green_bean_digunakan_g'); // Dalam gram
            $table->integer('berat_total_roasted_bean_dihasilkan_g'); // Dalam gram
            $table->float('weight_loss_percentage')->nullable(); // Persentase, misal 15.5
            $table->string('roast_level'); // Contoh: "Medium", "Light", "Dark"
            $table->integer('waktu_roasting_total_menit')->nullable();
            $table->integer('suhu_akhir_celsius')->nullable();
            $table->text('catatan_roasting')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roast_batches');
    }
};