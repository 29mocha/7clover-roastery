<?php

namespace App\Exports;

use App\Models\PackagedProduct;
use App\Models\Setting;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PackagedProductsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
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
            'id' => 'ID Produk Jadi',
            'nama_produk' => 'Nama Produk',
            'tanggal_kemas' => 'Tanggal Kemas',
            'berat_bersih_g' => 'Berat Bersih (g)',
            'kuantitas_tersisa' => 'Stok Tersisa (pcs)',
            'total_hpp_per_kemasan' => 'HPP per Kemasan (Rp)',
            'saran_harga_jual' => 'Saran Harga Jual (Rp)',
            'asal_batch' => 'Asal Batch Roasting',
            'asal_kopi' => 'Asal Green Bean',
            'catatan' => 'Catatan',
        ];
    }
    
    // Method ini penting untuk validasi di controller
    public function getAvailableColumnsForValidation(): array
    {
        return $this->getAvailableColumns();
    }

    public function query()
    {
        return PackagedProduct::query()
            ->with(['roastedBean.roastBatch.greenBean'])
            ->filter($this->filters)
            ->latest('tanggal_kemas');
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

    public function map($packagedProduct): array
    {
        static $profitMargin = null;
        if ($profitMargin === null) {
            $profitMargin = (float) Setting::where('key', 'default_profit_margin')->value('value');
        }
        $saran_harga_jual = $packagedProduct->total_hpp_per_kemasan * (1 + ($profitMargin / 100));

        $row = [];
        foreach ($this->selectedColumns as $columnKey) {
            $value = '';
            switch ($columnKey) {
                case 'saran_harga_jual':
                    $value = round($saran_harga_jual, -2);
                    break;
                case 'asal_batch':
                    $value = $packagedProduct->roastedBean?->roastBatch?->nomor_batch_roasting;
                    break;
                case 'asal_kopi':
                    $value = $packagedProduct->roastedBean?->roastBatch?->greenBean?->nama_kopi;
                    break;
                case 'tanggal_kemas':
                    $value = (new \DateTime($packagedProduct->tanggal_kemas))->format('Y-m-d');
                    break;
                default:
                    $value = $packagedProduct->$columnKey;
                    break;
            }
            $row[] = $value;
        }
        return $row;
    }
}