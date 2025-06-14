<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Kunci pengaturan, misal: 'default_profit_margin'
            $table->string('value')->nullable(); // Nilai pengaturan
            $table->string('label'); // Nama yang mudah dibaca, misal: "Margin Keuntungan Default (%)"
            $table->string('type')->default('text'); // Tipe input di form (text, number, dll)
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('settings');
    }
};