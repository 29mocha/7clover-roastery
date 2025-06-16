<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // Import Hash facade

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Memanggil seeder lain yang dibutuhkan
        $this->call([
            SettingSeeder::class,
        ]);

        // Hapus atau beri comment pada user factory yang lama
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        
        // Buat user admin utama dengan data yang Anda minta
        User::create([
            'name' => 'RANI',
            'email' => 'rani.ariana@gmail.com',
            'email_verified_at' => now(), // Verifikasi email secara otomatis
            'password' => Hash::make('RANI123456'), // Menggunakan Hash::make() untuk enkripsi
            'role' => 'admin', // Menetapkan peran sebagai admin
        ]);
    }
}
