<?php

namespace App\Http\Controllers;

use App\Models\GreenBean;
use App\Models\StockAdjustment;
use App\Exports\GreenBeansExport; // <-- Pastikan ini di-import
use App\Models\PackagingItem;   // <-- TAMBAHKAN IMPORT
use App\Models\OperationalCost;  // <-- TAMBAHKAN IMPORT
use App\Models\Setting;          // <-- TAMBAHKAN IMPORT
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel; // <-- Pastikan ini di-import

class GreenBeanController extends Controller
{
    /**
     * Display a listing of the resource.
     * Versi ini sudah menggunakan filter.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        $greenBeans = GreenBean::query()
            ->filter($filters) // Menggunakan scopeFilter dari Model
            ->latest('tanggal_terima')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('GreenBeans/Index', [
            'greenBeans' => $greenBeans,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('GreenBeans/Create');
    }

    /**
     * Store a newly created resource in storage.
     * Versi ini sudah disesuaikan dengan field baru dan satuan gram.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_kopi' => 'required|string|max:255',
            'lot_identifier' => 'required|string|max:255|unique:green_beans,lot_identifier',
            'tanggal_terima' => 'required|date_format:Y-m-d',
            'origin' => 'nullable|string|max:255',
            'varietas' => 'nullable|string|max:255',
            'processing_method' => 'nullable|string|max:255',
            'processor' => 'nullable|string|max:255',
            'altitude' => 'nullable|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'harga_beli_per_kg' => 'nullable|numeric|min:0',
            'jumlah_awal_g' => 'required|integer|min:0',
            'tasting_notes' => 'nullable|string',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $validatedData['stok_saat_ini_g'] = $validatedData['jumlah_awal_g'];

        try {
            GreenBean::create($validatedData);
            return Redirect::route('green-beans.index')->with('success', 'Lot green bean berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Error creating green bean: ' . $e->getMessage(), ['request' => $request->all()]);
            return Redirect::back()->withInput()->with('error', 'Gagal menambahkan lot green bean: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     * Versi ini sudah me-load relasi untuk riwayat.
     */
    public function show(GreenBean $greenBean)
{
    // Load relasi yang sudah ada
    $greenBean->load(['roastBatches', 'stockAdjustments.user']);

    // Ambil data lain yang dibutuhkan untuk kalkulator
    $packagingItems = PackagingItem::where('stok', '>', 0)->get();
    $operationalCosts = OperationalCost::all();
    $settings = Setting::all()->keyBy('key');

    return Inertia::render('GreenBeans/Show', [
        'greenBean' => $greenBean,
        'packagingItems' => $packagingItems,
        'operationalCosts' => $operationalCosts,
        'settings' => $settings,
    ]);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GreenBean $greenBean)
    {
        return Inertia::render('GreenBeans/Edit', [
            'greenBean' => $greenBean,
        ]);
    }

    /**
     * Update the specified resource in storage.
     * Versi ini sudah disesuaikan dengan field baru.
     */
    public function update(Request $request, GreenBean $greenBean)
    {
        $validatedData = $request->validate([
            'nama_kopi' => 'required|string|max:255',
            'lot_identifier' => 'required|string|max:255|unique:green_beans,lot_identifier,'.$greenBean->id,
            'tanggal_terima' => 'required|date_format:Y-m-d',
            'origin' => 'nullable|string|max:255',
            'varietas' => 'nullable|string|max:255',
            'processing_method' => 'nullable|string|max:255',
            'processor' => 'nullable|string|max:255',
            'altitude' => 'nullable|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'harga_beli_per_kg' => 'nullable|numeric|min:0',
            'tasting_notes' => 'nullable|string',
            'catatan' => 'nullable|string|max:1000',
        ]);

        try {
            $greenBean->update($validatedData);
            return Redirect::route('green-beans.show', $greenBean->id)->with('success', 'Informasi green bean berhasil diupdate.');
        } catch (\Exception $e) {
            Log::error('Error updating green bean: ' . $e->getMessage(), ['green_bean_id' => $greenBean->id, 'request' => $request->all()]);
            return Redirect::back()->withInput()->with('error', 'Gagal mengupdate informasi green bean: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GreenBean $greenBean)
    {
        try {
            if ($greenBean->roastBatches()->exists()) {
                return Redirect::back()->with('error', 'Tidak dapat menghapus lot green bean yang sudah memiliki roast batch terkait.');
            }
            $greenBean->delete();
            return Redirect::route('green-beans.index')->with('success', 'Lot green bean berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting green bean: ' . $e->getMessage(), ['green_bean_id' => $greenBean->id]);
            return Redirect::back()->with('error', 'Gagal menghapus lot green bean: ' . $e->getMessage());
        }
    }

    /**
     * Process the stock adjustment for a specific green bean.
     * Versi ini sudah disesuaikan untuk satuan gram.
     */
    public function adjustStock(Request $request, GreenBean $greenBean)
    {
        $validatedData = $request->validate([
            'adjustment_quantity_g' => 'required|numeric',
            'adjustment_type' => ['required', Rule::in(['increase', 'decrease', 'correction'])],
            'reason' => 'required_if:adjustment_type,correction,spoilage,sample_use|nullable|string|max:1000',
            'adjustment_date' => 'nullable|date_format:Y-m-d\TH:i',
        ]);

        $adjustmentQuantityG = (float) $validatedData['adjustment_quantity_g'];
        $adjustmentType = $validatedData['adjustment_type'];

        DB::beginTransaction();
        try {
            $stockBeforeG = (float) $greenBean->stok_saat_ini_g;
            $newStockG = $stockBeforeG;
            $quantityAdjustedForLogG = 0;

            if ($adjustmentType === 'increase') { /* ... Logika ... */ }
            elseif (in_array($adjustmentType, ['decrease', 'spoilage', 'sample_use'])) { /* ... Logika ... */ }
            elseif ($adjustmentType === 'correction') { /* ... Logika ... */ }
            else { throw new \Exception('Tipe penyesuaian tidak valid.'); }
            
            // Perhitungan stok baru berdasarkan tipe penyesuaian
            // (Untuk keringkasan, logika detailnya tidak saya tulis ulang di sini,
            // tapi sudah ada di kode yang saya berikan sebelumnya dan Anda gunakan)
            
            if ($adjustmentType === 'increase') {
                $newStockG += $adjustmentQuantityG;
                $quantityAdjustedForLogG = $adjustmentQuantityG;
            } else if ($adjustmentType === 'correction') {
                $newStockG = $adjustmentQuantityG;
                $quantityAdjustedForLogG = $newStockG - $stockBeforeG;
            } else { // decrease, spoilage, sample_use
                $newStockG -= $adjustmentQuantityG;
                $quantityAdjustedForLogG = -$adjustmentQuantityG;
            }

            if ($newStockG < 0) {
                DB::rollBack();
                return Redirect::back()->withInput()->with('error', 'Stok akhir tidak boleh menjadi negatif.');
            }

            $greenBean->stok_saat_ini_g = $newStockG;
            $greenBean->save();

            StockAdjustment::create([
                'adjustable_id' => $greenBean->id,
                'adjustable_type' => GreenBean::class,
                'user_id' => Auth::id(),
                'adjustment_type' => $adjustmentType,
                'quantity_adjusted_g' => $quantityAdjustedForLogG,
                'stock_before_adjustment_g' => $stockBeforeG,
                'stock_after_adjustment_g' => $newStockG,
                'reason' => $validatedData['reason'] ?? null,
                'adjustment_date' => isset($validatedData['adjustment_date']) && !empty($validatedData['adjustment_date']) ? new \DateTime($validatedData['adjustment_date']) : now(),
            ]);

            DB::commit();
            return Redirect::route('green-beans.show', $greenBean->id)->with('success', 'Stok green bean berhasil disesuaikan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adjusting green bean stock: ' . $e->getMessage(), ['green_bean_id' => $greenBean->id]);
            return Redirect::back()->withInput()->with('error', 'Gagal menyesuaikan stok: ' . $e->getMessage());
        }
    }

    /**
     * Handle the export request for green beans.
     * Versi ini sudah menggunakan filter.
     */
    
 public function export(Request $request)
    {
        // Validasi sederhana untuk memastikan inputnya benar
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'columns' => 'nullable|array',
        ]);

        $filters = $request->only(['search']);
        $selectedColumns = $request->input('columns', []);

        $fileName = 'green-beans-export-' . date('Y-m-d-His') . '.xlsx';
        
        // Cukup buat instance baru dan kirimkan filter serta kolomnya.
        // Export Class akan menangani query dan pembuatan file.
        return Excel::download(new GreenBeansExport($filters, $selectedColumns), $fileName);
    }
}