<?php


namespace App\Http\Controllers;

use App\Models\RoastBatch;
use App\Models\GreenBean;
use App\Models\RoastedBean;
use App\Models\PackagedProduct;
use App\Models\OperationalCost;
use App\Exports\RoastBatchesExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class RoastBatchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'trashed']); // Tambahkan filter 'trashed'

        $roastBatches = RoastBatch::with('greenBean')
            ->filter($filters)
            // Cek jika kita ingin menampilkan data dari arsip (trashed)
            ->when($filters['trashed'] ?? null, function ($query, $trashed) {
                if ($trashed === 'only') {
                    $query->onlyTrashed(); // Hanya tampilkan yang diarsip
                }
            })
            ->latest('tanggal_roasting')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('RoastBatches/Index', [
            'roastBatches' => $roastBatches,
            'filters' => $filters,
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $greenBeans = GreenBean::where('stok_saat_ini_g', '>', 0)->orderBy('nama_kopi', 'asc')->get(['id', 'nama_kopi', 'lot_identifier', 'stok_saat_ini_g']);
        return Inertia::render('RoastBatches/Create', [
            'greenBeans' => $greenBeans,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'green_bean_id' => 'required|exists:green_beans,id',
            'nomor_batch_roasting' => 'required|string|max:255|unique:roast_batches,nomor_batch_roasting',
            'tanggal_roasting' => 'required|date_format:Y-m-d',
            'nama_operator' => 'required|string|max:255',
            'mesin_roasting' => 'nullable|string|max:255',
            'berat_green_bean_digunakan_g' => 'required|numeric|min:1',
            'berat_total_roasted_bean_dihasilkan_g' => 'required|numeric|min:1',
            'roast_level' => 'required|string|max:50',
            'waktu_roasting_total_menit' => 'nullable|integer|min:0',
            'suhu_akhir_celsius' => 'nullable|integer',
            'catatan_roasting' => 'nullable|string',
        ]);

        $greenBean = GreenBean::findOrFail($validatedData['green_bean_id']);

        if ($greenBean->stok_saat_ini_g < $validatedData['berat_green_bean_digunakan_g']) {
            throw ValidationException::withMessages(['berat_green_bean_digunakan_g' => 'Stok green bean tidak mencukupi. Stok tersedia: ' . $greenBean->stok_saat_ini_g . ' gram.']);
        }
        if ($validatedData['berat_total_roasted_bean_dihasilkan_g'] > $validatedData['berat_green_bean_digunakan_g']) {
            throw ValidationException::withMessages(['berat_total_roasted_bean_dihasilkan_g' => 'Berat hasil roasting tidak boleh lebih besar dari berat green bean.']);
        }

        // --- MULAI LOGIKA PERHITUNGAN HPP ---
        $beratDigunakanKg = $validatedData['berat_green_bean_digunakan_g'] / 1000;
        $greenBeanCost = $beratDigunakanKg * ($greenBean->harga_beli_per_kg ?? 0);

        $operationalCost = 0;
        $roastingMinutes = $validatedData['waktu_roasting_total_menit'] ?? 0;
        $hourlyCosts = OperationalCost::where('tipe_biaya', 'per_jam')->sum('nilai_biaya');
        if ($roastingMinutes > 0 && $hourlyCosts > 0) {
            $operationalCost += ($hourlyCosts / 60) * $roastingMinutes;
        }
        $batchCosts = OperationalCost::where('tipe_biaya', 'per_batch')->sum('nilai_biaya');
        $operationalCost += $batchCosts;

        $validatedData['green_bean_cost'] = $greenBeanCost;
        $validatedData['operational_cost'] = $operationalCost;
        $validatedData['total_cost'] = $greenBeanCost + $operationalCost;
        // --- AKHIR LOGIKA PERHITUNGAN HPP ---

        $weightLoss = ($validatedData['berat_green_bean_digunakan_g'] > 0) ? ((($validatedData['berat_green_bean_digunakan_g'] - $validatedData['berat_total_roasted_bean_dihasilkan_g']) / $validatedData['berat_green_bean_digunakan_g']) * 100) : 0;
        $validatedData['weight_loss_percentage'] = round($weightLoss, 2);

        DB::beginTransaction();
        try {
            $greenBean->stok_saat_ini_g -= $validatedData['berat_green_bean_digunakan_g'];
            $greenBean->save();

            $roastBatch = RoastBatch::create($validatedData);

            RoastedBean::create([
                'roast_batch_id' => $roastBatch->id,
                'nama_produk_sangrai' => $greenBean->nama_kopi . ' - ' . $roastBatch->roast_level . ' - Batch ' . $roastBatch->nomor_batch_roasting,
                'tanggal_roasting' => $roastBatch->tanggal_roasting,
                'roast_level' => $roastBatch->roast_level,
                'stok_awal_g' => $roastBatch->berat_total_roasted_bean_dihasilkan_g,
                'stok_tersisa_g' => $roastBatch->berat_total_roasted_bean_dihasilkan_g,
                'catatan_item' => 'Dihasilkan dari batch roasting ' . $roastBatch->nomor_batch_roasting,
            ]);

            DB::commit();
            return Redirect::route('roast-batches.index')->with('success', 'Roast batch berhasil dibuat dan HPP dihitung.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating roast batch: ' . $e->getMessage(), ['request' => $request->all()]);
            return Redirect::back()->withInput()->with('error', 'Gagal menyimpan roast batch: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(RoastBatch $roastBatch)
    {
        $roastBatch->load(['greenBean', 'roastedBean']);
        return Inertia::render('RoastBatches/Show', [
            'roastBatch' => $roastBatch,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RoastBatch $roastBatch)
    {
        $currentGreenBeanId = $roastBatch->green_bean_id;
        $greenBeans = GreenBean::where('stok_saat_ini_g', '>', 0)->orWhere('id', $currentGreenBeanId)->orderBy('nama_kopi', 'asc')->get(['id', 'nama_kopi', 'lot_identifier', 'stok_saat_ini_g']);
        $roastBatch->load('greenBean');
        return Inertia::render('RoastBatches/Edit', [
            'roastBatch' => $roastBatch,
            'greenBeans' => $greenBeans,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RoastBatch $roastBatch)
    {
        $validatedData = $request->validate([
            'nomor_batch_roasting' => 'required|string|max:255|unique:roast_batches,nomor_batch_roasting,'.$roastBatch->id,
            'tanggal_roasting' => 'required|date_format:Y-m-d',
            'nama_operator' => 'required|string|max:255',
            'mesin_roasting' => 'nullable|string|max:255',
            'roast_level' => 'required|string|max:50',
            'waktu_roasting_total_menit' => 'nullable|integer|min:0',
            'suhu_akhir_celsius' => 'nullable|integer',
            'catatan_roasting' => 'nullable|string',
            'berat_green_bean_digunakan_g' => 'required|numeric|min:1',
            'berat_total_roasted_bean_dihasilkan_g' => 'required|numeric|min:1',
        ]);
         // ... (Logika update HPP bisa ditambahkan di sini dengan pola yang sama seperti di store)


        if ($validatedData['berat_total_roasted_bean_dihasilkan_g'] > $validatedData['berat_green_bean_digunakan_g']) {
            throw ValidationException::withMessages([ 'berat_total_roasted_bean_dihasilkan_g' => 'Berat hasil roasting tidak boleh lebih besar dari berat green bean.' ]);
        }

        DB::beginTransaction();
        try {
            $greenBean = $roastBatch->greenBean;
            $originalBeratGreenBeanDigunakanG = $roastBatch->berat_green_bean_digunakan_g;
            $newBeratGreenBeanDigunakanG = $validatedData['berat_green_bean_digunakan_g'];

            if ($newBeratGreenBeanDigunakanG != $originalBeratGreenBeanDigunakanG) {
                $greenBean->stok_saat_ini_g += $originalBeratGreenBeanDigunakanG;
                if ($greenBean->stok_saat_ini_g < $newBeratGreenBeanDigunakanG) {
                    DB::rollBack();
                    throw ValidationException::withMessages(['berat_green_bean_digunakan_g' => 'Stok green bean tidak mencukupi.']);
                }
                $greenBean->stok_saat_ini_g -= $newBeratGreenBeanDigunakanG;
                $greenBean->save();
            }

            $beratAwal = $newBeratGreenBeanDigunakanG;
            $beratAkhir = $validatedData['berat_total_roasted_bean_dihasilkan_g'];
            $validatedData['weight_loss_percentage'] = ($beratAwal > 0) ? round((($beratAwal - $beratAkhir) / $beratAwal) * 100, 2) : 0;

            $roastBatch->update($validatedData);

            if ($roastBatch->roastedBean) {
                $selisihHasilRoastedG = $validatedData['berat_total_roasted_bean_dihasilkan_g'] - $roastBatch->roastedBean->stok_awal_g;
                $newStokTersisa = $roastBatch->roastedBean->stok_tersisa_g + $selisihHasilRoastedG;
                $roastBatch->roastedBean->update([
                    'nama_produk_sangrai' => $greenBean->nama_kopi . ' - ' . $roastBatch->roast_level . ' - Batch ' . $roastBatch->nomor_batch_roasting,
                    'tanggal_roasting' => $roastBatch->tanggal_roasting,
                    'roast_level' => $roastBatch->roast_level,
                    'stok_awal_g' => $validatedData['berat_total_roasted_bean_dihasilkan_g'],
                    'stok_tersisa_g' => ($newStokTersisa < 0) ? 0 : $newStokTersisa,
                ]);
            }
            DB::commit();
            return Redirect::route('roast-batches.show', $roastBatch->id)->with('success', 'Roast batch berhasil diupdate.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating roast batch: ' . $e->getMessage(), ['roast_batch_id' => $roastBatch->id, 'request' => $request->all()]);
            return Redirect::back()->withInput()->with('error', 'Gagal mengupdate roast batch: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
   /**
     * "Mengarsipkan" Roast Batch beserta semua data turunannya.
     */
    public function destroy(RoastBatch $roastBatch)
    {
        DB::beginTransaction();
        try {
            // Kembalikan stok green bean
            if ($roastBatch->greenBean) {
                $roastBatch->greenBean->increment('stok_saat_ini_g', $roastBatch->berat_green_bean_digunakan_g);
            }

            $roastedBean = $roastBatch->roastedBean;
            if ($roastedBean) {
                // Soft delete semua produk jadi yang berasal dari roasted bean ini
                // Looping diperlukan agar event (jika ada) ter-trigger per model
                foreach ($roastedBean->packagedProducts as $product) {
                    $product->delete(); // Ini akan menjadi soft delete
                }
                // Soft delete roasted bean itu sendiri
                $roastedBean->delete(); // Ini akan menjadi soft delete
            }

            // Soft delete roast batch
            $roastBatch->delete();

            DB::commit();
            return Redirect::route('roast-batches.index')->with('success', 'Roast batch dan semua data terkait berhasil diarsipkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error archiving roast batch: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Gagal mengarsipkan roast batch.');
        }
    }
    /**
     * Mengembalikan Roast Batch dan semua data turunannya dari arsip.
     */
    public function restore(RoastBatch $roastBatch)
    {
        DB::beginTransaction();
        try {
            // Kurangi kembali stok green bean
            $greenBean = $roastBatch->greenBean;
            if ($greenBean) {
                if ($greenBean->stok_saat_ini_g < $roastBatch->berat_green_bean_digunakan_g) {
                    throw new \Exception('Stok green bean tidak mencukupi untuk me-restore batch ini.');
                }
                $greenBean->decrement('stok_saat_ini_g', $roastBatch->berat_green_bean_digunakan_g);
            }

            // Restore RoastedBean terkait
            $roastedBean = $roastBatch->roastedBean()->withTrashed()->first();
            if ($roastedBean) {
                // Restore semua produk jadi yang terkait
                $roastedBean->packagedProducts()->withTrashed()->restore();
                // Restore roasted bean itu sendiri
                $roastedBean->restore();
            }

            // Restore roast batch
            $roastBatch->restore();

            DB::commit();
            return Redirect::back()->with('success', 'Roast batch berhasil dikembalikan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error restoring roast batch: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Gagal mengembalikan roast batch: ' . $e->getMessage());
        }
    }
     /**
     * Permanently delete the specified resource.
     * Method BARU untuk menghapus data secara permanen dari arsip.
     */
    /**
 * Menghapus permanen Roast Batch dan SEMUA data terkaitnya.
 * PERHATIAN: Gunakan dengan hati-hati, hanya untuk data tes.
 */
public function forceDelete(RoastBatch $roastBatch)
    {
        DB::beginTransaction();
        try {
            // Stok green bean TIDAK perlu disesuaikan lagi karena sudah dikembalikan saat diarsipkan.
            
            $roastedBean = $roastBatch->roastedBean()->withTrashed()->first();

            if ($roastedBean) {
                // Ambil produk jadi terkait, termasuk yang sudah diarsip
                $packagedProducts = $roastedBean->packagedProducts()->withTrashed()->get();
                foreach ($packagedProducts as $product) {
                    $product->packagingItems()->detach(); // Hapus relasi di tabel pivot
                    $product->stockAdjustments()->delete(); // Hapus log penyesuaian stok produk jadi
                    $product->forceDelete(); // Hapus permanen produk jadi
                }

                // Hapus log penyesuaian stok roasted bean
                $roastedBean->stockAdjustments()->delete();
                // Hapus permanen roasted bean
                $roastedBean->forceDelete();
            }

            // Hapus permanen roast batch
            $roastBatch->forceDelete();

            DB::commit();
            return Redirect::route('roast-batches.index', ['trashed' => 'only'])->with('success', 'Roast batch dan semua data terkait berhasil dihapus permanen.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error force deleting roast batch: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Gagal menghapus data secara permanen: ' . $e->getMessage());
        }
    }


    /**
     * Handle the export request for roast batches.
     */
    public function export(Request $request)
{
    // Panggil method dari Export Class untuk mendapatkan daftar kolom yang valid
    $exportClass = new RoastBatchesExport([], []);
    $availableColumns = array_keys($exportClass->getAvailableColumnsForValidation());

    $validated = $request->validate([
        'search' => 'nullable|string|max:255',
        'columns' => 'nullable|array',
        'columns.*' => ['string', Rule::in($availableColumns)] // <-- Validasi dinamis
    ]);
    
    $filters = $request->only(['search']);
    $selectedColumns = $request->input('columns', []);

    $fileName = 'roast-batches-export-' . date('Y-m-d-His') . '.xlsx';
    return Excel::download(new RoastBatchesExport($filters, $selectedColumns), $fileName);
}
/**
     * Generate a printable PDF label for the specified roast batch.
     */
    public function generateLabelPdf(RoastBatch $roastBatch)
    {
        // 1. Pastikan semua relasi yang dibutuhkan oleh view sudah di-load dengan efisien
        $roastBatch->load(['greenBean', 'roastedBean']);

        // 2. Siapkan data untuk view
        $data = [
            'roastBatch' => $roastBatch,
        ];

        // 3. Definisikan ukuran kertas (dalam points, satuan asli PDF)
        // 1 cm = 28.346 points
        $widthInPoints = 7 * 28.346;
        $heightInPoints = 4 * 28.346;
        $customPaper = [0, 0, $widthInPoints, $heightInPoints];

        // 4. Buat PDF dari view dan terapkan opsi-opsi penting
        $pdf = Pdf::loadView('pdf.roast_batch_label', $data)
                    ->setPaper($customPaper)
                    ->setOption([
                        'dpi' => 150, // Resolusi gambar
                        'defaultFont' => 'sans-serif',
                        'isHtml5ParserEnabled' => true, // Mengaktifkan parser HTML5 untuk render yang lebih baik
                        'isRemoteEnabled' => true // Diperlukan jika ada gambar/CSS dari URL luar (tidak untuk kasus ini, tapi praktik baik)
                    ]);

        // 5. Tampilkan PDF di browser untuk preview/cetak
        $fileName = 'label-batch-' . Str::slug($roastBatch->roastedBean->nama_produk_sangrai ?? $roastBatch->nomor_batch_roasting) . '.pdf';
        return $pdf->stream($fileName);
    }
}
