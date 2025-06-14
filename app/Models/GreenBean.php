<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute; // <-- IMPORT UNTUK ACCESSOR BARU
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * 
 *
 * @property int $id
 * @property string $nama_kopi
 * @property string $lot_identifier
 * @property \Illuminate\Support\Carbon $tanggal_terima
 * @property string|null $origin
 * @property string|null $varietas
 * @property string|null $processing_method
 * @property string|null $supplier
 * @property int $jumlah_awal_g
 * @property int $stok_saat_ini_g
 * @property string|null $catatan
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property numeric|null $harga_beli_per_kg
 * @property string|null $processor
 * @property string|null $altitude
 * @property string|null $tasting_notes
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\RoastBatch> $roastBatches
 * @property-read int|null $roast_batches_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockAdjustment> $stockAdjustments
 * @property-read int|null $stock_adjustments_count
 * @property-read mixed $stok_kg
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereAltitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereCatatan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereHargaBeliPerKg($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereJumlahAwalG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereLotIdentifier($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereNamaKopi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereOrigin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereProcessingMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereProcessor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereStokSaatIniG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereSupplier($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereTanggalTerima($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereTastingNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GreenBean whereVarietas($value)
 * @mixin \Eloquent
 */
class GreenBean extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_kopi',
        'lot_identifier',
        'tanggal_terima',
        'origin',
        'varietas',
        'processing_method', // Nama tetap, tidak jadi diubah
        'supplier',
        'harga_beli_per_kg', // <-- Field baru
        'processor',         // <-- Field baru
        'altitude',          // <-- Field baru
        'tasting_notes',     // <-- Field baru
        'jumlah_awal_g',     // <-- Nama diubah ke gram
        'stok_saat_ini_g',   // <-- Nama diubah ke gram
        'catatan',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tanggal_terima' => 'date',
        'harga_beli_per_kg' => 'decimal:2', // Cast sebagai desimal dengan 2 angka di belakang koma
        'jumlah_awal_g' => 'integer',     // Cast sebagai integer karena sudah dalam gram
        'stok_saat_ini_g' => 'integer',     // Cast sebagai integer karena sudah dalam gram
        // 'tasting_notes' bisa di-cast ke 'array' jika Anda berencana menyimpannya sebagai JSON
    ];

    /**
     * Get all of the roast batches for the GreenBean.
     */
    public function roastBatches(): HasMany
    {
        return $this->hasMany(RoastBatch::class);
    }

    /**
     * Get all of the green bean's stock adjustments.
     */
    public function stockAdjustments(): MorphMany
    {
        return $this->morphMany(StockAdjustment::class, 'adjustable');
    }
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_kopi', 'like', '%' . $search . '%')
                  ->orWhere('lot_identifier', 'like', '%' . $search . '%')
                  ->orWhere('origin', 'like', '%' . $search . '%');
            });
        });
    }
    /**
     * Accessor untuk menampilkan stok dalam KG di frontend jika diperlukan,
     * tanpa mengubah cara penyimpanan di database (tetap dalam gram).
     *
     * Cara penggunaan: $greenBean->stok_kg
     */
    protected function stokKg(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->stok_saat_ini_g / 1000,
        );
    }
}