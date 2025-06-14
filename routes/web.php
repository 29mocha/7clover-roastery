<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Import semua controller yang kita gunakan
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GreenBeanController;
use App\Http\Controllers\RoastBatchController;
use App\Http\Controllers\RoastedBeanController;
use App\Http\Controllers\PackagedProductController;
use App\Http\Controllers\PackagingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\OperationalCostController;
use App\Http\Controllers\PackagingItemController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Halaman Selamat Datang (Publik)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Rute yang membutuhkan Autentikasi
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified']) // <-- TAMBAHKAN 'verified' DI SINI
    ->name('dashboard');

    // Profile (Bawaan Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- MODUL INVENTARIS ---

    // Green Beans
    Route::get('/green-beans/export', [GreenBeanController::class, 'export'])->name('green-beans.export');
    Route::post('/green-beans/{green_bean}/adjust-stock', [GreenBeanController::class, 'adjustStock'])->name('green-beans.adjust-stock');
    Route::resource('green-beans', GreenBeanController::class);

    // Roast Batches
    Route::get('/roast-batches/export', [RoastBatchController::class, 'export'])->name('roast-batches.export');
    Route::get('/roast-batches/{roastBatch}/label-pdf', [RoastBatchController::class, 'generateLabelPdf'])->name('roast-batches.label-pdf');
    Route::post('/roast-batches/{roastBatch}/restore', [RoastBatchController::class, 'restore'])->name('roast-batches.restore')->withTrashed();
    Route::delete('/roast-batches/{roastBatch}/force-delete', [RoastBatchController::class, 'forceDelete'])->name('roast-batches.force-delete')->withTrashed();
    Route::resource('roast-batches', RoastBatchController::class);

    // Roasted Beans
    Route::get('/roasted-beans/export', [RoastedBeanController::class, 'export'])->name('roasted-beans.export');
    Route::post('/roasted-beans/{roasted_bean}/adjust-stock', [RoastedBeanController::class, 'adjustStock'])->name('roasted-beans.adjust-stock');
    Route::resource('roasted-beans', RoastedBeanController::class)->only(['index', 'show', 'edit', 'update']);
    
    // --- MODUL PRODUKSI & PRODUK JADI ---

    // Proses Pengemasan
    Route::get('/packaging/create', [PackagingController::class, 'create'])->name('packaging.create');
    Route::post('/packaging', [PackagingController::class, 'store'])->name('packaging.store');
    
    // Inventaris Produk Jadi
    Route::get('/packaged-products/export', [PackagedProductController::class, 'export'])->name('packaged-products.export'); // <-- RUTE BARU YANG HILANG
    Route::resource('packaged-products', PackagedProductController::class);


    // --- LAPORAN & PENGATURAN ---

    // Laporan
    Route::get('/reports/green-bean-usage', [ReportController::class, 'greenBeanUsage'])->name('reports.green-bean-usage');
    Route::get('/reports/green-bean-usage/export', [ReportController::class, 'exportGreenBeanUsage'])->name('reports.green-bean-usage.export'); // <-- TAMBAHKAN RUTE INI
    // Pengaturan
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::patch('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::resource('operational-costs', OperationalCostController::class);
    Route::resource('packaging-items', PackagingItemController::class);
    // ==== RUTE UNTUK MANAJEMEN USER ====
    Route::resource('users', UserController::class);
});

require __DIR__.'/auth.php';