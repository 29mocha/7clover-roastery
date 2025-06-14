<?php

namespace App\Http\Controllers;

use App\Models\RoastedBean;
use App\Models\StockAdjustment;
use App\Exports\RoastedBeansExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class RoastedBeanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        $roastedBeans = RoastedBean::with(['roastBatch.greenBean'])
            ->filter($filters) // Menggunakan scopeFilter dari Model
            ->latest('tanggal_roasting')
            ->paginate(15);

        return Inertia::render('RoastedBeans/Index', [
            'roastedBeans' => $roastedBeans->withQueryString(),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect()->route('roast-batches.create')
                         ->with('info', 'Item Roasted Bean baru dibuat secara otomatis setelah membuat Roast Batch.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return redirect()->route('roasted-beans.index')
                         ->with('error', 'Operasi ini tidak didukung secara langsung.');
    }

    /**
     * Display the specified resource.
     */
    public function show(RoastedBean $roastedBean)
    {
        // Load relasi utama
        $roastedBean->load(['roastBatch.greenBean']);

        // Load riwayat penyesuaian stok dengan sorting terpisah
        $roastedBean->load(['stockAdjustments' => function ($query) {
            $query->orderBy('adjustment_date', 'desc')->orderBy('created_at', 'desc');
        }]);

        // Load relasi user pada riwayat yang sudah di-load
        // Ini memastikan `orderBy` tidak bocor ke query user
        $roastedBean->stockAdjustments->load('user:id,name');
        
        // Load riwayat pengemasan
        $roastedBean->load(['packagedProducts' => function ($query) {
            $query->orderBy('tanggal_kemas', 'desc');
        }]);

        return Inertia::render('RoastedBeans/Show', [
            'roastedBean' => $roastedBean,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RoastedBean $roastedBean)
    {
        $roastedBean->load(['roastBatch.greenBean']);
        return Inertia::render('RoastedBeans/Edit', [
            'roastedBean' => $roastedBean,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RoastedBean $roastedBean)
    {
        $validatedData = $request->validate([
            'stok_tersisa_g' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) use ($roastedBean) {
                    if (floatval($value) > floatval($roastedBean->stok_awal_g)) {
                        $fail('Stok tersisa tidak boleh melebihi stok awal (' . $roastedBean->stok_awal_g . 'g).');
                    }
                },
            ],
            'catatan_item' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $stockBeforeG = (float) $roastedBean->stok_tersisa_g;
            $newStockG = (float) $validatedData['stok_tersisa_g'];

            if ($newStockG != $stockBeforeG) {
                StockAdjustment::create([
                    'adjustable_id' => $roastedBean->id,
                    'adjustable_type' => RoastedBean::class,
                    'user_id' => Auth::id(),
                    'adjustment_type' => 'manual_edit',
                    'quantity_adjusted_g' => $newStockG - $stockBeforeG,
                    'stock_before_adjustment_g' => $stockBeforeG,
                    'stock_after_adjustment_g' => $newStockG,
                    'reason' => 'Perubahan stok manual melalui form edit item. ' . ($validatedData['catatan_item'] ?? ''),
                    'adjustment_date' => now(),
                ]);
            }

            $roastedBean->stok_tersisa_g = $validatedData['stok_tersisa_g'];
            $roastedBean->catatan_item = $validatedData['catatan_item'] ?? $roastedBean->catatan_item;
            $roastedBean->save();

            DB::commit();
            return Redirect::route('roasted-beans.show', $roastedBean->id)->with('success', 'Inventaris roasted bean berhasil diupdate.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating roasted bean via edit form: ' . $e->getMessage(), ['roasted_bean_id' => $roastedBean->id]);
            return Redirect::back()->withInput()->with('error', 'Gagal mengupdate inventaris: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RoastedBean $roastedBean)
    {
        Log::warning('Attempted to delete RoastedBean directly.', ['roasted_bean_id' => $roastedBean->id]);
        return redirect()->route('roasted-beans.index')
                         ->with('error', 'Roasted bean tidak bisa dihapus secara langsung. Hapus Roast Batch terkait jika perlu.');
    }

    /**
     * Process the stock adjustment for a specific roasted bean.
     */
    public function adjustStock(Request $request, RoastedBean $roastedBean)
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
            $stockBeforeG = (float) $roastedBean->stok_tersisa_g;
            $newStockG = $stockBeforeG;
            $quantityAdjustedForLogG = 0;

            if ($adjustmentType === 'increase') {
                if ($adjustmentQuantityG < 0) { throw new \Exception('Jumlah untuk penambahan stok harus positif.'); }
                $newStockG += $adjustmentQuantityG;
                $quantityAdjustedForLogG = $adjustmentQuantityG;
            } elseif (in_array($adjustmentType, ['decrease', 'spoilage', 'sample_use'])) {
                if ($adjustmentQuantityG <= 0) { throw new \Exception('Jumlah untuk pengurangan stok harus positif.'); }
                $newStockG -= $adjustmentQuantityG;
                $quantityAdjustedForLogG = -$adjustmentQuantityG;
            } elseif ($adjustmentType === 'correction') {
                if ($adjustmentQuantityG < 0) { throw new \Exception('Nilai koreksi stok tidak boleh negatif.'); }
                if ($adjustmentQuantityG > $roastedBean->stok_awal_g) { throw new \Exception('Koreksi stok tidak boleh melebihi stok awal batch (' . $roastedBean->stok_awal_g . 'g).'); }
                $newStockG = $adjustmentQuantityG;
                $quantityAdjustedForLogG = $newStockG - $stockBeforeG;
            }

            if ($newStockG < 0) {
                DB::rollBack();
                return Redirect::back()->withInput()->with('error', 'Stok akhir tidak boleh menjadi negatif.');
            }

            $roastedBean->stok_tersisa_g = $newStockG;
            $roastedBean->save();

            StockAdjustment::create([
                'adjustable_id' => $roastedBean->id,
                'adjustable_type' => RoastedBean::class,
                'user_id' => Auth::id(),
                'adjustment_type' => $adjustmentType,
                'quantity_adjusted_g' => $quantityAdjustedForLogG,
                'stock_before_adjustment_g' => $stockBeforeG,
                'stock_after_adjustment_g' => $newStockG,
                'reason' => $validatedData['reason'] ?? null,
                'adjustment_date' => isset($validatedData['adjustment_date']) && !empty($validatedData['adjustment_date']) ? new \DateTime($validatedData['adjustment_date']) : now(),
            ]);

            DB::commit();
            return Redirect::route('roasted-beans.show', $roastedBean->id)->with('success', 'Stok roasted bean berhasil disesuaikan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adjusting roasted bean stock: ' . $e->getMessage(), ['roasted_bean_id' => $roastedBean->id]);
            return Redirect::back()->withInput()->with('error', 'Gagal menyesuaikan stok: ' . $e->getMessage());
        }
    }

    /**
     * Handle the export request for roasted beans.
     */
    public function export(Request $request)
    {
        // Panggil method dari Export Class untuk mendapatkan daftar kolom yang valid
        $exportClass = new RoastedBeansExport([], []);
        $availableColumns = array_keys($exportClass->getAvailableColumnsForValidation());

        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'columns' => 'nullable|array',
            'columns.*' => ['string', Rule::in($availableColumns)] // Gunakan daftar kolom dinamis untuk validasi
        ]);

        $filters = $request->only(['search']);
        $selectedColumns = $request->input('columns', []);

        $fileName = 'roasted-beans-inventory-export-' . date('Y-m-d-His') . '.xlsx';
        return Excel::download(new RoastedBeansExport($filters, $selectedColumns), $fileName);
    }
}