<?php
namespace Database\Seeders;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('settings')->updateOrInsert(
            ['key' => 'default_profit_margin'],
            [
                'value' => '20', // Nilai default 20%
                'label' => 'Margin Keuntungan Default (%)',
                'type' => 'number',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // ==== TAMBAHKAN PENGATURAN BARU INI ====
        DB::table('settings')->updateOrInsert(
            ['key' => 'average_weight_loss_percent'],
            [
                'value' => '18', // Asumsi default susut bobot 18%
                'label' => 'Rata-rata Susut Bobot (%)',
                'type' => 'number',
                'created_at' => now(), 'updated_at' => now(),
            ]
        );
    }
}