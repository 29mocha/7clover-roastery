<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // <-- TAMBAHKAN IMPORT

class PackagingItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_item',
        'tipe_item',
        'stok',
        'biaya_per_item',
        'catatan',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'stok' => 'integer',
        'biaya_per_item' => 'decimal:2',
    ];
 /**
     * Mendapatkan semua produk jadi yang menggunakan item kemasan ini.
     */
    public function packagedProducts(): BelongsToMany
    {
        return $this->belongsToMany(PackagedProduct::class, 'packaging_item_packaged_product')
                    ->withPivot('kuantitas_digunakan');
    }
}