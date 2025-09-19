<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role; // <-- 1. IMPORT MODEL Role

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Panggil seeder lain jika ada
        $this->call([
            SettingSeeder::class,
        ]);

        // 2. BUAT PERAN TERLEBIH DAHULU
        // Gunakan updateOrCreate agar aman jika seeder dijalankan berkali-kali
        $adminRole = Role::updateOrCreate(['name' => 'Admin']);
        $roasterRole = Role::updateOrCreate(['name' => 'Roaster']);

        // 3. BUAT USER DAN BERIKAN PERAN
        // Buat atau update user RANI
        $userRani = User::updateOrCreate(
            ['email' => 'rani.ariana@gmail.com'], // Kondisi pencarian
            [
                'name' => 'RANI',
                'password' => Hash::make('RANI123456'),
                'email_verified_at' => now(),
            ]
        );
        // Berikan peran Admin kepada RANI
        $userRani->assignRole($adminRole);


        // Buat atau update user Tony
        $userTony = User::updateOrCreate(
            ['email' => 'tony@gmail.com'], // Kondisi pencarian
            [
                'name' => 'Tony',
                'password' => Hash::make('tony123'),
                'email_verified_at' => now(),
            ]
        );
        // Berikan peran Admin kepada Tony (sesuai permintaan)
        $userTony->assignRole($adminRole);
    }
}

