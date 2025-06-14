<?php

namespace App\Http\Controllers;

use App\Models\GreenBean;
use App\Models\RoastBatch;
use App\Models\RoastedBean;
use App\Models\PackagedProduct; // <-- TAMBAHKAN IMPORT
use App\Models\Setting; // <-- TAMBAHKAN IMPORT
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Ringkasan Stok Green Bean
        $totalGreenBeanStockG = GreenBean::sum('stok_saat_ini_g');
        $lowStockGreenBeans = GreenBean::orderBy('stok_saat_ini_g', 'asc')
            ->where('stok_saat_ini_g', '>', 0)
            ->where('stok_saat_ini_g', '<=', 5000)
            ->limit(5)
            ->get(['id', 'nama_kopi', 'lot_identifier', 'stok_saat_ini_g']);

        // ==== PERUBAHAN DI SINI: Menghitung Total Nilai Green Bean ====
        // Rumus: SUM(harga_beli_per_kg * (stok_saat_ini_g / 1000))
        // Kita gunakan DB::raw untuk kalkulasi di dalam query SQL agar efisien.
        $totalGreenBeanValue = GreenBean::select(DB::raw('SUM(harga_beli_per_kg * (stok_saat_ini_g / 1000.0)) as total_value'))
            ->whereNotNull('harga_beli_per_kg') // Hanya hitung yang punya harga beli
            ->where('stok_saat_ini_g', '>', 0)     // Hanya hitung yang masih ada stok
            ->value('total_value'); // Ambil langsung nilainya


        // 2. Ringkasan Stok Roasted Bean
        $totalRoastedBeanStockGram = RoastedBean::sum('stok_tersisa_g');
        $recentRoastedBeansWithStock = RoastedBean::with('roastBatch.greenBean')
            ->where('stok_tersisa_g', '>', 0)
            ->orderBy('tanggal_roasting', 'desc')
            ->limit(5)
            ->get();

        // 3. Aktivitas Roasting Terkini
        $recentRoastBatches = RoastBatch::with('greenBean')
            ->latest('tanggal_roasting')
            ->limit(5)
            ->get();

        // 4. Ringkasan Stok Green Bean per Origin
        // Ambil semua green bean yang punya stok dan origin, lalu kelompokkan dengan Collection
        $groupedStockByOrigin = GreenBean::where('stok_saat_ini_g', '>', 0)
            ->whereNotNull('origin')
            ->where('origin', '!=', '')
            ->orderBy('origin', 'asc')
            ->get() // Ambil semua datanya dulu
            ->groupBy('origin'); // Kelompokkan berdasarkan 'origin'

             // ==== DATA BARU UNTUK PRODUK JADI ====
        // 1. Hitung total kuantitas produk jadi yang tersisa
        $totalPackagedProductQty = PackagedProduct::sum('kuantitas_tersisa');
        
        // 2. Hitung total nilai aset dari produk jadi (stok tersisa * HPP per kemasan)
        $totalPackagedProductValue = PackagedProduct::select(DB::raw('SUM(kuantitas_tersisa * total_hpp_per_kemasan) as total_value'))
            ->where('kuantitas_tersisa', '>', 0)
            ->value('total_value');

        // 3. Ambil beberapa produk jadi terbaru yang masih ada stok
        $recentPackagedProducts = PackagedProduct::where('kuantitas_tersisa', '>', 0)
            ->latest('tanggal_kemas')
            ->limit(5)
            ->get();
        // ===================================
        // ==== PERUBAHAN DI SINI: Menghitung Total Potensi Pendapatan ====
        // 1. Ambil margin keuntungan dari settings
        $profitMargin = (float) Setting::where('key', 'default_profit_margin')->value('value');
        
        // 2. Hitung total potensi pendapatan
        // Rumus: SUM(stok_tersisa * HPP * (1 + margin))
        $totalPackagedProductRevenuePotential = PackagedProduct::where('kuantitas_tersisa', '>', 0)
            ->get()
            ->sum(function ($product) use ($profitMargin) {
                return $product->kuantitas_tersisa * ($product->total_hpp_per_kemasan * (1 + ($profitMargin / 100)));
            });
        // =============================================================

        return Inertia::render('Dashboard', [
            'totalGreenBeanStockG' => (int) $totalGreenBeanStockG,
            'totalGreenBeanValue' => (float) $totalGreenBeanValue,
            'lowStockGreenBeans' => $lowStockGreenBeans,
            'totalRoastedBeanStockGram' => (int) $totalRoastedBeanStockGram,
            'recentRoastedBeansWithStock' => $recentRoastedBeansWithStock,
            'recentRoastBatches' => $recentRoastBatches,
            'groupedStockByOrigin' => $groupedStockByOrigin, // <-- KIRIM DATA BARU YANG SUDAH DIKELOMPOKKAN
            'totalPackagedProductQty' => (int) $totalPackagedProductQty,
            'totalPackagedProductValue' => (float) $totalPackagedProductValue,
            'recentPackagedProducts' => $recentPackagedProducts,
            'profitMargin' => $profitMargin, // <-- Kirim data margin
            'totalPackagedProductRevenuePotential' => (float) $totalPackagedProductRevenuePotential, // <-- Kirim data baru
        ]);
    }
}