<?php

namespace App\Exports;

use App\Models\RoastBatch;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class RoastBatchesExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected array $filters;
    protected array $selectedColumns;
    protected array $allColumns;

    public function __construct(array $filters, array $selectedColumns)
    {
        $this->filters = $filters;
        $this->allColumns = $this->getAvailableColumns();

        if (empty($selectedColumns)) {
            $this->selectedColumns = array_keys($this->allColumns);
        } else {
            $this->selectedColumns = array_intersect($selectedColumns, array_keys($this->allColumns));
        }
    }

    protected function getAvailableColumns(): array
    {
        // ==== PERBARUI DAFTAR KOLOM DI SINI ====
        return [
            'id' => 'ID Batch',
            'nomor_batch_roasting' => 'Nomor Batch Roasting',
            'tanggal_roasting' => 'Tanggal Roasting',
            'green_bean_name' => 'Green Bean Digunakan',
            'green_bean_lot' => 'Lot Identifier Green Bean',
            'berat_green_bean_digunakan_g' => 'Berat Green Bean (g)',
            'berat_total_roasted_bean_dihasilkan_g' => 'Berat Hasil Roasted (g)',
            'weight_loss_percentage' => 'Weight Loss (%)',
            'roast_level' => 'Roast Level',
            'nama_operator' => 'Operator',
            'mesin_roasting' => 'Mesin Roasting',
            'waktu_roasting_total_menit' => 'Waktu Roasting (menit)',
            'suhu_akhir_celsius' => 'Suhu Akhir (°C)',
            'green_bean_cost' => 'Biaya Green Bean (Rp)',      // <-- BARU
            'operational_cost' => 'Biaya Operasional (Rp)',    // <-- BARU
            'total_cost' => 'Total HPP Batch (Rp)',         // <-- BARU
            'catatan_roasting' => 'Catatan Roasting',
            'created_at' => 'Dibuat Pada',
            'updated_at' => 'Diupdate Pada',
        ];
    }
    
    public function getAvailableColumnsForValidation(): array
    {
        return $this->getAvailableColumns();
    }
    
    public function query()
    {
        return RoastBatch::query()->with('greenBean')->filter($this->filters)->orderBy('tanggal_roasting', 'desc');
    }

    public function headings(): array
    {
        $headings = [];
        foreach ($this->selectedColumns as $columnKey) {
            if (isset($this->allColumns[$columnKey])) {
                $headings[] = $this->allColumns[$columnKey];
            }
        }
        return $headings;
    }

    public function map($roastBatch): array
    {
        $row = [];
        foreach ($this->selectedColumns as $columnKey) {
            $value = '';
            switch ($columnKey) {
                case 'green_bean_name':
                    $value = $roastBatch->greenBean ? $roastBatch->greenBean->nama_kopi : 'N/A';
                    break;
                case 'green_bean_lot':
                    $value = $roastBatch->greenBean ? $roastBatch->greenBean->lot_identifier : 'N/A';
                    break;
                case 'created_at':
                case 'updated_at':
                    $value = $roastBatch->$columnKey->format('Y-m-d H:i:s');
                    break;
                case 'tanggal_roasting':
                    $value = $roastBatch->$columnKey ? (new \DateTime($roastBatch->$columnKey))->format('Y-m-d H:i') : 'N/A';
                    break;
                default:
                    $value = $roastBatch->$columnKey;
                    break;
            }
            $row[] = $value;
        }
        return $row;
    }
}