<?php

namespace App\Exports;

use App\Models\GreenBean;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class GreenBeansExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithEvents, WithColumnFormatting
{
    protected $data;
    protected array $filters;
    protected array $selectedColumns;
    protected array $allColumns;

    public function __construct(array $filters, array $selectedColumns)
    {
        $this->filters = $filters;
        $this->allColumns = $this->getAvailableColumns();
        $this->selectedColumns = empty($selectedColumns) ? array_keys($this->allColumns) : array_intersect($selectedColumns, array_keys($this->allColumns));
        $this->data = GreenBean::query()->filter($this->filters)->orderBy('tanggal_terima', 'desc')->get();
    }

    protected function getAvailableColumns(): array
    {
        return [
            'id' => 'ID', 'nama_kopi' => 'Nama Kopi', 'lot_identifier' => 'Lot Identifier',
            'tanggal_terima' => 'Tanggal Terima', 'origin' => 'Origin', 'stok_saat_ini_g' => 'Stok Saat Ini (g)',
            'harga_beli_per_kg' => 'Harga Beli (per kg)', 'stock_value' => 'Nilai Stok (Rp)',
            'varietas' => 'Varietas', 'processing_method' => 'Metode Proses', 'processor' => 'Processor',
            'altitude' => 'Altitude', 'supplier' => 'Supplier', 'jumlah_awal_g' => 'Jumlah Awal (g)',
            'tasting_notes' => 'Tasting Notes', 'catatan' => 'Catatan', 'created_at' => 'Dibuat Pada',
            'updated_at' => 'Diupdate Pada',
        ];
    }

    public function getAvailableColumnsForValidation(): array
    {
        return array_keys($this->getAvailableColumns());
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        $finalHeadings = [];
        foreach ($this->allColumns as $key => $label) {
            if (in_array($key, $this->selectedColumns)) {
                $finalHeadings[] = $label;
            }
        }
        return $finalHeadings;
    }

    public function map($greenBean): array
    {
        $fullRowData = [
            'id' => $greenBean->id, 'nama_kopi' => $greenBean->nama_kopi, 'lot_identifier' => $greenBean->lot_identifier,
            'tanggal_terima' => $greenBean->tanggal_terima ? $greenBean->tanggal_terima->format('Y-m-d') : null,
            'origin' => $greenBean->origin, 'stok_saat_ini_g' => $greenBean->stok_saat_ini_g,
            'harga_beli_per_kg' => $greenBean->harga_beli_per_kg,
            'stock_value' => ($greenBean->stok_saat_ini_g / 1000) * $greenBean->harga_beli_per_kg,
            'varietas' => $greenBean->varietas, 'processing_method' => $greenBean->processing_method,
            'processor' => $greenBean->processor, 'altitude' => $greenBean->altitude,
            'supplier' => $greenBean->supplier, 'jumlah_awal_g' => $greenBean->jumlah_awal_g,
            'tasting_notes' => $greenBean->tasting_notes, 'catatan' => $greenBean->catatan,
            'created_at' => $greenBean->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $greenBean->updated_at->format('Y-m-d H:i:s'),
        ];
        return array_values(array_intersect_key($fullRowData, array_flip($this->selectedColumns)));
    }

    /**
     * ==== METHOD YANG DIPERBAIKI SECARA TOTAL ====
     */
    public function columnFormats(): array
    {
        $formats = [];
        $currentColLetter = 'A';

        // Iterasi pada SEMUA kemungkinan kolom untuk menjaga urutan
        foreach ($this->allColumns as $key => $label) {
            // Tapi HANYA proses kolom yang dipilih oleh pengguna
            if (in_array($key, $this->selectedColumns)) {
                
                // Terapkan format spesifik berdasarkan 'key' kolom
                if (in_array($key, ['harga_beli_per_kg', 'stock_value'])) {
                    // Format Rupiah tanpa desimal
                    $formats[$currentColLetter] = '"Rp"#,##0';
                } elseif (in_array($key, ['stok_saat_ini_g', 'jumlah_awal_g'])) {
                    // Format Angka dengan pemisah ribuan
                    $formats[$currentColLetter] = NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1;
                }
                // Kolom lain (seperti 'altitude') tidak diberi format, sehingga akan menjadi 'General' di Excel
                
                // Lanjutkan ke huruf kolom berikutnya
                $currentColLetter++;
            }
        }
        return $formats;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                if ($this->data->isEmpty()) return;

                $totalStockG = $this->data->sum('stok_saat_ini_g');
                $totalValue = $this->data->sum(fn ($bean) => ($bean->stok_saat_ini_g / 1000) * ($bean->harga_beli_per_kg ?? 0));

                $headerArray = $this->headings();
                $summaryRow = array_fill(0, count($headerArray), '');

                $labelIndex = array_search('Nilai Stok (Rp)', $headerArray);
                if ($labelIndex === false) { $labelIndex = array_search('Stok Saat Ini (g)', $headerArray); }
                if ($labelIndex === false && count($headerArray) > 1) { $labelIndex = count($headerArray) - 2; }
                elseif ($labelIndex === false) { $labelIndex = 0; }
                
                $summaryRow[$labelIndex] = 'TOTAL:';

                $stockIndex = array_search('Stok Saat Ini (g)', $headerArray);
                $valueIndex = array_search('Nilai Stok (Rp)', $headerArray);

                if ($stockIndex !== false) { $summaryRow[$stockIndex] = $totalStockG; }
                if ($valueIndex !== false) { $summaryRow[$valueIndex] = $totalValue; }
                
                $summaryRowNumber = $event->sheet->getDelegate()->getHighestRow() + 2;
                $event->sheet->getDelegate()->fromArray($summaryRow, null, 'A'.$summaryRowNumber);
                $highestColumn = $event->sheet->getDelegate()->getHighestColumn();
                $event->sheet->getDelegate()->getStyle('A'.$summaryRowNumber.':'.$highestColumn.$summaryRowNumber)->getFont()->setBold(true);

                if ($valueIndex !== false) {
                    $columnLetter = Coordinate::stringFromColumnIndex($valueIndex + 1);
                    $event->sheet->getDelegate()->getStyle($columnLetter . $summaryRowNumber)->getNumberFormat()->setFormatCode('"Rp"#,##0');
                }
                if ($stockIndex !== false) {
                    $columnLetter = Coordinate::stringFromColumnIndex($stockIndex + 1);
                    $event->sheet->getDelegate()->getStyle($columnLetter . $summaryRowNumber)->getNumberFormat()->setFormatCode('#,##0');
                }
            },
        ];
    }
}