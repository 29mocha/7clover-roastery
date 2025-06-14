<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- TAMBAHKAN IMPORT INI
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- TAMBAHKAN IMPORT INI
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * 
 *
 * @property int $id
 * @property int $roast_batch_id
 * @property string $nama_produk_sangrai
 * @property \Illuminate\Support\Carbon $tanggal_roasting
 * @property string $roast_level
 * @property int $stok_awal_g
 * @property int $stok_tersisa_g
 * @property string|null $catatan_item
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\RoastBatch $roastBatch
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockAdjustment> $stockAdjustments
 * @property-read int|null $stock_adjustments_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereCatatanItem($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereNamaProdukSangrai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereRoastBatchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereRoastLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereStokAwalG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereStokTersisaG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereTanggalRoasting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastedBean whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class RoastedBean extends Model
{
    use HasFactory, SoftDeletes; // <-- TAMBAHKAN SoftDeletes DI SINI

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'roast_batch_id',
        'nama_produk_sangrai',
        'tanggal_roasting', // Di-copy dari RoastBatch
        'roast_level',      // Di-copy dari RoastBatch
        'stok_awal_g',
        'stok_tersisa_g',
        'catatan_item',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tanggal_roasting' => 'date',
        'stok_awal_g' => 'integer',
        'stok_tersisa_g' => 'integer',
    ];

    /**
     * Get the roast batch that produced this roasted bean.
     * Setiap RoastedBean (item inventaris) berasal dari satu RoastBatch.
     */
    public function roastBatch()
    {
        return $this->belongsTo(RoastBatch::class);
    }
        /**
     * Scope a query untuk memfilter roasted beans.
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return void
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk_sangrai', 'like', '%' . $search . '%')
                  ->orWhere('roast_level', 'like', '%' . $search . '%')
                  ->orWhereHas('roastBatch', function ($subQuery) use ($search) {
                      $subQuery->where('nomor_batch_roasting', 'like', '%' . $search . '%');
                  });
            });
        });
    }
    /**
     * Mendapatkan semua produk jadi yang berasal dari lot roasted bean ini.
     */
    public function packagedProducts(): HasMany // <-- TAMBAHKAN METHOD INI
    {
        return $this->hasMany(PackagedProduct::class);
    }
    public function stockAdjustments(): MorphMany
    {
        return $this->morphMany(StockAdjustment::class, 'adjustable');
    }
}