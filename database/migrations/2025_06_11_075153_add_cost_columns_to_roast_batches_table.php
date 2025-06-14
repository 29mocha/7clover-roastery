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
        Schema::table('roast_batches', function (Blueprint $table) {
            // Kolom untuk menyimpan biaya-biaya yang dihitung per batch
            $table->decimal('green_bean_cost', 15, 2)->default(0)->after('weight_loss_percentage');
            $table->decimal('operational_cost', 15, 2)->default(0)->after('green_bean_cost');
            $table->decimal('total_cost', 15, 2)->default(0)->after('operational_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roast_batches', function (Blueprint $table) {
            $table->dropColumn(['green_bean_cost', 'operational_cost', 'total_cost']);
        });
    }
};