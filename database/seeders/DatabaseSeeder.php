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
        
        // Menggunakan updateOrCreate untuk membuat seeder yang aman.
        // Perintah ini akan mencari user berdasarkan email.
        // Jika tidak ada, user baru akan dibuat. Jika sudah ada, tidak akan terjadi apa-apa.
        
        // Buat atau update user admin utama
        User::updateOrCreate(
            ['email' => 'rani.ariana@gmail.com'], // Kondisi pencarian
            [
                'name' => 'RANI',
                'password' => Hash::make('RANI123456'),
                'email_verified_at' => now(),
                'role' => 'admin',
            ]
        );

        // Buat atau update user roaster
        User::updateOrCreate(
            ['email' => 'tony@gmail.com'], // Kondisi pencarian
            [
                'name' => 'Tony',
                'password' => Hash::make('tony123'),
                'email_verified_at' => now(),
                'role' => 'roaster',
            ]
        );
    }
}
