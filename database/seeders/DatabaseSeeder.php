<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
        ]);

        $adminRole = Role::updateOrCreate(['name' => 'Admin']);
        $roasterRole = Role::updateOrCreate(['name' => 'Roaster']);

        // Buat atau update user RANI
        $userRani = User::updateOrCreate(
            ['email' => 'rani.ariana@gmail.com'],
            [
                'name' => 'RANI',
                'password' => Hash::make('RANI123456'),
                // 'email_verified_at' => now(), // <-- HAPUS BARIS INI
            ]
        );
        $userRani->assignRole($adminRole);

        // Buat atau update user Tony
        $userTony = User::updateOrCreate(
            ['email' => 'tony@gmail.com'],
            [
                'name' => 'Tony',
                'password' => Hash::make('tony123'),
                // 'email_verified_at' => now(), // <-- HAPUS BARIS INI JUGA
            ]
        );
        $userTony->assignRole($adminRole);
    }
}
