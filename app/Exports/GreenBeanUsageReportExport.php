<?php

namespace App\Exports;

use App\Models\RoastBatch;
use Maatwebsite\Excel\Concerns\FromCollection; // <-- Ubah dari FromQuery
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents; // <-- Tambahkan
use Maatwebsite\Excel\Events\AfterSheet;   // <-- Tambahkan
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class GreenBeanUsageReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithEvents, WithColumnFormatting
{
    protected $data;

    public function __construct(string $dateFrom, string $dateTo)
    {
        // Ambil data di konstruktor agar bisa diakses oleh event
        $this->data = RoastBatch::query()
            ->with('greenBean')
            ->whereBetween('tanggal_roasting', [$dateFrom, $dateTo])
            ->whereHas('greenBean')
            ->orderBy('tanggal_roasting', 'asc')
            ->get();
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'Tanggal Roasting', 'Nomor Batch', 'Nama Green Bean',
            'Lot Identifier', 'Origin', 'Jumlah Digunakan (g)',
            'Biaya Green Bean (Rp)',
        ];
    }

    public function map($batch): array
    {
        return [
            (new \DateTime($batch->tanggal_roasting))->format('Y-m-d'),
            $batch->nomor_batch_roasting,
            $batch->greenBean->nama_kopi,
            $batch->greenBean->lot_identifier,
            $batch->greenBean->origin,
            $batch->berat_green_bean_digunakan_g,
            $batch->green_bean_cost,
        ];
    }

    public function columnFormats(): array
    {
        return [
            'F' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'G' => '"Rp"#,##0',
        ];
    }

    /**
     * @return array
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                if ($this->data->isEmpty()) {
                    return;
                }

                // Hitung total dari data yang ada
                $totalGramUsed = $this->data->sum('berat_green_bean_digunakan_g');
                $totalCost = $this->data->sum('green_bean_cost');

                $summaryRow = [
                    null, null, null, null, // Kolom kosong
                    'TOTAL KESELURUHAN:', // Label
                    $totalGramUsed,
                    $totalCost,
                ];
                
                $lastRow = $event->sheet->getDelegate()->getHighestRow();
                $summaryRowNumber = $lastRow + 2;

                $event->sheet->getDelegate()->fromArray($summaryRow, null, 'A'.$summaryRowNumber);

                // Styling untuk baris total
                $cellRange = 'A'.$summaryRowNumber.':'.$event->sheet->getDelegate()->getHighestColumn().$summaryRowNumber;
                $event->sheet->getDelegate()->getStyle($cellRange)->getFont()->setBold(true);

                // Terapkan format pada sel total
                $event->sheet->getDelegate()->getStyle('F' . $summaryRowNumber)->getNumberFormat()->setFormatCode('#,##0');
                $event->sheet->getDelegate()->getStyle('G' . $summaryRowNumber)->getNumberFormat()->setFormatCode('"Rp"#,##0');
            },
        ];
    }
}