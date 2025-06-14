<?php

namespace App\Http\Controllers;

use App\Models\PackagedProduct;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PackagedProductsExport;
use Illuminate\Validation\Rule;

class PackagedProductController extends Controller
{
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
            'filters' => $filters,
        ]);
    }

    public function show(PackagedProduct $packagedProduct)
    {
        $packagedProduct->load(['roastedBean.roastBatch.greenBean', 'packagingItems', 'stockAdjustments.user']);
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
     * Handle the export request for packaged products.
     */
    public function export(Request $request)
    {
        // Panggil method dari Export Class untuk mendapatkan daftar kolom yang valid
        $exportClass = new PackagedProductsExport([], []);
        $availableColumns = array_keys($exportClass->getAvailableColumnsForValidation());

        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'columns' => 'nullable|array',
            'columns.*' => ['string', Rule::in($availableColumns)] // <-- Validasi dinamis yang benar
        ]);

        $filters = $request->only(['search']);
        $selectedColumns = $request->input('columns', []);

        $fileName = 'packaged-products-export-' . date('Y-m-d-His') . '.xlsx';
        return Excel::download(new PackagedProductsExport($filters, $selectedColumns), $fileName);
    }
}