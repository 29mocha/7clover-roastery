<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder; // <-- TAMBAHKAN
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Pastikan ini ada
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany; // <-- TAMBAHKAN IMPORT INI

class PackagedProduct extends Model
{
    use HasFactory, SoftDeletes; // Pastikan SoftDeletes ada

    protected $fillable = [
        'roasted_bean_id',
        'nama_produk',
        'berat_bersih_g',
        'kuantitas_awal',
        'kuantitas_tersisa',
        'biaya_kopi_per_kemasan',
        'biaya_kemasan_per_kemasan',
        'total_hpp_per_kemasan',
        'catatan',
        'tanggal_kemas',
    ];

    protected $casts = [
        'berat_bersih_g' => 'integer',
        'kuantitas_awal' => 'integer',
        'kuantitas_tersisa' => 'integer',
        'biaya_kopi_per_kemasan' => 'decimal:2',
        'biaya_kemasan_per_kemasan' => 'decimal:2',
        'total_hpp_per_kemasan' => 'decimal:2',
        'tanggal_kemas' => 'datetime',
    ];

    /**
     * Mendapatkan roasted bean (curah) asal dari produk ini.
     */
    public function roastedBean(): BelongsTo
    {
        return $this->belongsTo(RoastedBean::class)->withTrashed(); // Gunakan withTrashed() di sini
    }

    /**
     * Mendapatkan semua item kemasan yang digunakan untuk produk ini.
     */
    public function packagingItems(): BelongsToMany
    {
        return $this->belongsToMany(PackagingItem::class, 'packaging_item_packaged_product')
                       ->withPivot('kuantitas_digunakan');
    }

    /**
     * Mendapatkan semua riwayat penyesuaian stok untuk produk jadi ini.
     */
    public function stockAdjustments(): MorphMany // <-- TAMBAHKAN METHOD INI
    {
        return $this->morphMany(StockAdjustment::class, 'adjustable');
    }
    /**
     * Scope a query untuk memfilter produk jadi.
     */
    public function scopeFilter(Builder $query, array $filters): void // <-- TAMBAHKAN METHOD INI
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where('nama_produk', 'like', '%' . $search . '%')
                ->orWhereHas('roastedBean.roastBatch.greenBean', function ($q) use ($search) {
                    $q->where('nama_kopi', 'like', '%' . $search . '%');
                })
                ->orWhereHas('roastedBean.roastBatch', function ($q) use ($search) {
                    $q->where('nomor_batch_roasting', 'like', '%' . $search . '%');
                });
        });
    }
}