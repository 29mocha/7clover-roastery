<?php

namespace App\Exports;

use App\Models\RoastedBean;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class RoastedBeansExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
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
        return [
            'id' => 'ID Roasted Bean',
            'nama_produk_sangrai' => 'Nama Produk Sangrai',
            'tanggal_roasting' => 'Tanggal Roasting',
            'roast_level' => 'Roast Level',
            'stok_awal_g' => 'Stok Awal (g)',
            'stok_tersisa_g' => 'Stok Tersisa (g)',
            'catatan_item' => 'Catatan Item',
            'nomor_batch_roasting' => 'Asal Nomor Batch Roasting',
            'green_bean_name' => 'Asal Green Bean',
            'created_at' => 'Dibuat Pada',
            'updated_at' => 'Diupdate Pada',
        ];
    }

    /**
     * Method public ini dibuat agar controller bisa mengambil daftar kolom untuk validasi.
     * @return array
     */
    public function getAvailableColumnsForValidation(): array
    {
        return $this->getAvailableColumns();
    }

    public function query()
    {
        return RoastedBean::query()
            ->with(['roastBatch.greenBean'])
            ->filter($this->filters)
            ->latest('tanggal_roasting');
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

    public function map($roastedBean): array
    {
        $row = [];
        foreach ($this->selectedColumns as $columnKey) {
            $value = '';
            switch ($columnKey) {
                case 'nomor_batch_roasting':
                    $value = $roastedBean->roastBatch ? $roastedBean->roastBatch->nomor_batch_roasting : 'N/A';
                    break;
                case 'green_bean_name':
                    $value = $roastedBean->roastBatch && $roastedBean->roastBatch->greenBean ? $roastedBean->roastBatch->greenBean->nama_kopi : 'N/A';
                    break;
                case 'created_at':
                case 'updated_at':
                    $value = $roastedBean->$columnKey->format('Y-m-d H:i:s');
                    break;
                case 'tanggal_roasting':
                    $value = $roastedBean->$columnKey ? (new \DateTime($roastedBean->$columnKey))->format('Y-m-d') : 'N/A';
                    break;
                default:
                    $value = $roastedBean->$columnKey;
                    break;
            }
            $row[] = $value;
        }
        return $row;
    }
}