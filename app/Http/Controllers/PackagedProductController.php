<?php

namespace App\Http\Controllers;

use App\Models\PackagedProduct;
use App\Models\Setting;
use App\Models\StockAdjustment;
use App\Exports\PackagedProductsExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class PackagedProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        $packagedProducts = PackagedProduct::with(['roastedBean.roastBatch.greenBean'])
            ->filter($filters)
            ->latest('tanggal_kemas')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('PackagedProducts/Index', [
            'packagedProducts' => $packagedProducts,
            'filters' => $filters
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(PackagedProduct $packagedProduct)
    {
        $packagedProduct->load([
            'roastedBean' => fn($query) => $query->withTrashed(),
            'roastedBean.roastBatch' => fn($query) => $query->withTrashed(),
            'roastedBean.roastBatch.greenBean',
            'packagingItems',
            'stockAdjustments' => function ($query) {
                $query->orderBy('adjustment_date', 'desc')->orderBy('created_at', 'desc');
            }
        ]);
        $packagedProduct->stockAdjustments->load('user:id,name');

        $profitMargin = (float) Setting::where('key', 'default_profit_margin')->value('value');
        $hpp = (float) $packagedProduct->total_hpp_per_kemasan;
        $suggestedSellingPrice = $hpp * (1 + ($profitMargin / 100));

        return Inertia::render('PackagedProducts/Show', [
            'packagedProduct' => $packagedProduct,
            'profitMargin' => $profitMargin,
            'suggestedSellingPrice' => round($suggestedSellingPrice, -2),
        ]);
    }

    /**
     * Handle stock adjustments for the packaged product.
     */
    public function adjustStock(Request $request, PackagedProduct $packagedProduct)
    {
        // Otorisasi bisa ditambahkan di sini jika perlu, misal:
        // $this->authorize('manage-app');

        $validatedData = $request->validate([
            'adjustment_quantity' => 'required|integer',
            'adjustment_type' => ['required', Rule::in(['increase', 'decrease', 'correction'])],
            'reason' => 'nullable|string|max:1000',
            'adjustment_date' => 'nullable|date_format:Y-m-d\TH:i',
        ]);

        $adjustmentQtyPcs = (int) $validatedData['adjustment_quantity'];
        $adjustmentType = $validatedData['adjustment_type'];

        DB::beginTransaction();
        try {
            $stockBeforePcs = $packagedProduct->kuantitas_tersisa;
            $newStockPcs = $stockBeforePcs;
            $quantityAdjustedForLog = 0;

            if ($adjustmentType === 'increase') {
                if ($adjustmentQtyPcs < 0) throw new \Exception('Jumlah untuk penambahan harus positif.');
                $newStockPcs += $adjustmentQtyPcs;
                $quantityAdjustedForLog = $adjustmentQtyPcs;
            } elseif ($adjustmentType === 'decrease') {
                if ($adjustmentQtyPcs <= 0) throw new \Exception('Jumlah untuk pengurangan harus positif.');
                $newStockPcs -= $adjustmentQtyPcs;
                $quantityAdjustedForLog = -$adjustmentQtyPcs;
            } elseif ($adjustmentType === 'correction') {
                if ($adjustmentQtyPcs < 0) throw new \Exception('Nilai koreksi tidak boleh negatif.');
                if ($adjustmentQtyPcs > $packagedProduct->kuantitas_awal) {
                    throw new \Exception('Koreksi stok tidak boleh melebihi kuantitas awal (' . $packagedProduct->kuantitas_awal . ' pcs).');
                }
                $newStockPcs = $adjustmentQtyPcs;
                $quantityAdjustedForLog = $newStockPcs - $stockBeforePcs;
            }

            if ($newStockPcs < 0) {
                DB::rollBack();
                return Redirect::back()->withInput()->with('error', 'Stok akhir tidak boleh menjadi negatif.');
            }
            if ($newStockPcs > $packagedProduct->kuantitas_awal && $adjustmentType !== 'correction') {
                DB::rollBack();
                return Redirect::back()->withInput()->with('error', 'Stok akhir tidak boleh melebihi kuantitas awal (' . $packagedProduct->kuantitas_awal . ' pcs).');
            }
            
            $packagedProduct->kuantitas_tersisa = $newStockPcs;
            $packagedProduct->save();

            StockAdjustment::create([
                'adjustable_id' => $packagedProduct->id,
                'adjustable_type' => PackagedProduct::class,
                'user_id' => Auth::id(),
                'adjustment_type' => $adjustmentType,
                'quantity_adjusted_g' => $quantityAdjustedForLog,
                'stock_before_adjustment_g' => $stockBeforePcs,
                'stock_after_adjustment_g' => $newStockPcs,
                'reason' => $validatedData['reason'] ?? 'Penyesuaian stok produk jadi',
                'adjustment_date' => isset($validatedData['adjustment_date']) && !empty($validatedData['adjustment_date']) ? new \DateTime($validatedData['adjustment_date']) : now(),
            ]);

            DB::commit();
            return Redirect::route('packaged-products.show', $packagedProduct->id)->with('success', 'Stok produk jadi berhasil disesuaikan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()->withInput()->with('error', 'Gagal menyesuaikan stok: ' . $e->getMessage());
        }
    }
    
    /**
     * Handle the export request for packaged products.
     */
    public function export(Request $request)
    {
        $exportClass = new PackagedProductsExport([], []);
        $availableColumns = $exportClass->getAvailableColumnsForValidation();

        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'columns' => 'nullable|array',
            'columns.*' => ['string', Rule::in($availableColumns)]
        ]);

        $filters = $request->only(['search']);
        $selectedColumns = $request->input('columns', []);

        $fileName = 'packaged-products-export-' . date('Y-m-d-His') . '.xlsx';
        return Excel::download(new PackagedProductsExport($filters, $selectedColumns), $fileName);
    }
}