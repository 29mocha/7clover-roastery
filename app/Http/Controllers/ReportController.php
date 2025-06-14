<?php

namespace App\Http\Controllers;

use App\Models\RoastBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon; // Untuk manipulasi tanggal
use Maatwebsite\Excel\Facades\Excel; // <-- IMPORT
use App\Exports\GreenBeanUsageReportExport; // <-- IMPORT

class ReportController extends Controller
{
    /**
     * Menampilkan laporan penggunaan green bean.
     */
    public function greenBeanUsage(Request $request)
    {
        // Validasi input filter tanggal
        $validated = $request->validate([
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d|after_or_equal:date_from',
        ]);

        // Tentukan rentang tanggal, default ke bulan ini jika tidak ada input
        $dateFrom = $validated['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $validated['date_to'] ?? Carbon::now()->endOfMonth()->format('Y-m-d');

        // Ambil semua roast batch dalam rentang tanggal, beserta green bean terkait
        $roastBatches = RoastBatch::with('greenBean')
            ->whereBetween('tanggal_roasting', [$dateFrom, $dateTo])
            ->whereHas('greenBean', function($query){ // Hanya ambil batch yg green beannya masih ada
                $query->whereNotNull('id');
            })
            ->get();

        // Kalkulasi biaya per batch dan kelompokkan berdasarkan green_bean_id
        $reportData = $roastBatches
            // Pertama, hitung biaya untuk setiap batch
            ->map(function ($batch) {
                // Pastikan green bean dan harga belinya ada untuk menghindari error
                if ($batch->greenBean && !is_null($batch->greenBean->harga_beli_per_kg)) {
                    $batch->cost = ($batch->berat_green_bean_digunakan_g / 1000) * $batch->greenBean->harga_beli_per_kg;
                } else {
                    $batch->cost = 0; // Atau null jika Anda lebih suka
                }
                return $batch;
            })
            // Kedua, kelompokkan batch berdasarkan ID green beannya
            ->groupBy('green_bean_id')
            // Ketiga, proses setiap grup untuk membuat ringkasan
            ->map(function ($batchesInGroup) {
                $firstBatch = $batchesInGroup->first();
                return [
                    'green_bean_id' => $firstBatch->green_bean_id,
                    'nama_kopi' => $firstBatch->greenBean->nama_kopi ?? 'N/A',
                    'lot_identifier' => $firstBatch->greenBean->lot_identifier ?? 'N/A',
                    'total_g_used' => $batchesInGroup->sum('berat_green_bean_digunakan_g'),
                    'total_cost' => $batchesInGroup->sum('cost'),
                    'batches' => $batchesInGroup->map(fn($b) => [ // Kirim rincian batch
                        'id' => $b->id,
                        'nomor_batch_roasting' => $b->nomor_batch_roasting,
                        'tanggal_roasting' => $b->tanggal_roasting->format('d M Y'),
                        'berat_green_bean_digunakan_g' => $b->berat_green_bean_digunakan_g,
                        'cost' => $b->cost,
                    ])->sortByDesc('tanggal_roasting')->values(),
                ];
            })->sortBy('nama_kopi')->values(); // Urutkan hasil akhir berdasarkan nama kopi

        // Hitung total keseluruhan untuk ringkasan di atas
        $grandTotalGramUsed = $reportData->sum('total_g_used');
        $grandTotalCost = $reportData->sum('total_cost');

        return Inertia::render('Reports/GreenBeanUsage', [
            'reportData' => $reportData,
            'summary' => [
                'gram_used' => $grandTotalGramUsed,
                'total_cost' => $grandTotalCost,
            ],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
    /**
     * Handle export request for Green Bean Usage Report.
     */
    public function exportGreenBeanUsage(Request $request)
    {
        // Validasi input tanggal
        $validated = $request->validate([
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d|after_or_equal:date_from',
        ]);

        // Tentukan rentang tanggal, default ke bulan ini jika tidak ada input
        $dateFrom = $validated['date_from'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $dateTo = $validated['date_to'] ?? Carbon::now()->endOfMonth()->format('Y-m-d');

        $fileName = 'laporan-penggunaan-green-bean-' . $dateFrom . '-sd-' . $dateTo . '.xlsx';

        // Panggil download dengan menyertakan parameter tanggal
        return Excel::download(new GreenBeanUsageReportExport($dateFrom, $dateTo), $fileName);
    }
}