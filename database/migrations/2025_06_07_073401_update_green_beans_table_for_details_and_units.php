<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Langkah 1: Konversi data KG ke Gram yang sudah ada (jika ada)
        // Pastikan Anda belum menjalankan migrasi sebelumnya yang mungkin sudah mengkonversi ini.
        // Jika Anda menjalankan rollback, data mungkin sudah kembali ke KG.
        // Looping ini aman untuk dijalankan lagi jika datanya masih dalam format desimal KG.
        if (Schema::hasColumn('green_beans', 'stok_saat_ini_kg')) { // Cek jika kolom lama masih ada
            $greenBeans = DB::table('green_beans')->get();
            foreach ($greenBeans as $bean) {
                DB::table('green_beans')
                    ->where('id', $bean->id)
                    ->update([
                        'jumlah_awal_kg' => $bean->jumlah_awal_kg * 1000,
                        'stok_saat_ini_kg' => $bean->stok_saat_ini_kg * 1000,
                    ]);
            }
        }

        // Langkah 2: Ubah skema tabel
        Schema::table('green_beans', function (Blueprint $table) {
            // 1. Tambah kolom-kolom baru
            $table->decimal('harga_beli_per_kg', 15, 2)->nullable()->after('supplier');
            $table->string('processor')->nullable()->after('supplier'); // Posisikan setelah supplier
            $table->string('altitude')->nullable()->after('processor'); // contoh: "1200-1500 MASL"
            $table->text('tasting_notes')->nullable()->after('altitude');

            // KOLOM 'processing_method' TIDAK DIUBAH NAMANYA

            // 2. Ganti nama kolom satuan dari KG ke Gram
            $table->renameColumn('jumlah_awal_kg', 'jumlah_awal_g');
            $table->renameColumn('stok_saat_ini_kg', 'stok_saat_ini_g');
        });

        // Langkah 3: Ubah tipe data kolom yang sudah di-rename ke integer
        Schema::table('green_beans', function (Blueprint $table) {
            $table->bigInteger('jumlah_awal_g')->change();
            $table->bigInteger('stok_saat_ini_g')->change();
        });
    }

    /**
     * Reverse the migrations.
     * Method 'down' ini untuk membatalkan perubahan jika Anda melakukan rollback.
     */
    public function down(): void
    {
        // Lakukan dalam urutan terbalik dari method up()

        // Kembalikan tipe data ke decimal dulu
        Schema::table('green_beans', function (Blueprint $table) {
            // Periksa jika kolom ada sebelum mengubah
            if (Schema::hasColumn('green_beans', 'jumlah_awal_g')) {
                $table->decimal('jumlah_awal_g', 8, 3)->change();
            }
            if (Schema::hasColumn('green_beans', 'stok_saat_ini_g')) {
                $table->decimal('stok_saat_ini_g', 8, 3)->change();
            }
        });

        // Konversi data gram kembali ke kg sebelum mengubah nama kolom
        if (Schema::hasColumn('green_beans', 'stok_saat_ini_g')) {
            $greenBeans = DB::table('green_beans')->get();
            foreach ($greenBeans as $bean) {
                DB::table('green_beans')
                    ->where('id', $bean->id)
                    ->update([
                        'jumlah_awal_g' => $bean->jumlah_awal_g / 1000,
                        'stok_saat_ini_g' => $bean->stok_saat_ini_g / 1000,
                    ]);
            }
        }

        Schema::table('green_beans', function (Blueprint $table) {
            // Hapus kolom-kolom baru
            $table->dropColumn(['harga_beli_per_kg', 'processor', 'altitude', 'tasting_notes']);

            // Kembalikan nama kolom
            $table->renameColumn('jumlah_awal_g', 'jumlah_awal_kg');
            $table->renameColumn('stok_saat_ini_g', 'stok_saat_ini_kg');

            // TIDAK ADA PERUBAHAN PADA 'processing_method'
        });
    }
};