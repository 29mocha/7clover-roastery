<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- TAMBAHKAN IMPORT INI
use Illuminate\Database\Eloquent\Builder;

/**
 * 
 *
 * @property int $id
 * @property int $green_bean_id
 * @property string $nomor_batch_roasting
 * @property \Illuminate\Support\Carbon $tanggal_roasting
 * @property string $nama_operator
 * @property string|null $mesin_roasting
 * @property int $berat_green_bean_digunakan_g
 * @property int $berat_total_roasted_bean_dihasilkan_g
 * @property float|null $weight_loss_percentage
 * @property string $roast_level
 * @property int|null $waktu_roasting_total_menit
 * @property int|null $suhu_akhir_celsius
 * @property string|null $catatan_roasting
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\GreenBean $greenBean
 * @property-read \App\Models\RoastedBean|null $roastedBean
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereBeratGreenBeanDigunakanG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereBeratTotalRoastedBeanDihasilkanG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereCatatanRoasting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereGreenBeanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereMesinRoasting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereNamaOperator($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereNomorBatchRoasting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereRoastLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereSuhuAkhirCelsius($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereTanggalRoasting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereWaktuRoastingTotalMenit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RoastBatch whereWeightLossPercentage($value)
 * @mixin \Eloquent
 */
class RoastBatch extends Model
{
    use HasFactory, SoftDeletes; // <-- TAMBAHKAN SoftDeletes DI SINI

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'green_bean_id',
        'nomor_batch_roasting',
        'tanggal_roasting',
        'nama_operator',
        'mesin_roasting',
        'berat_green_bean_digunakan_g',
        'berat_total_roasted_bean_dihasilkan_g',
        'weight_loss_percentage',
        'roast_level',
        'waktu_roasting_total_menit',
        'suhu_akhir_celsius',
        'catatan_roasting',
        'green_bean_cost',    // <-- TAMBAHKAN
        'operational_cost',   // <-- TAMBAHKAN
        'total_cost',         // <-- TAMBAHKAN
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tanggal_roasting' => 'datetime', // Atau 'date' jika Anda tidak menyimpan waktu
        'berat_green_bean_digunakan_g' => 'integer',
        'berat_total_roasted_bean_dihasilkan_g' => 'integer',
        'weight_loss_percentage' => 'float',
        'waktu_roasting_total_menit' => 'integer',
        'suhu_akhir_celsius' => 'integer',
        'green_bean_cost' => 'decimal:2',  // <-- TAMBAHKAN
        'operational_cost' => 'decimal:2', // <-- TAMBAHKAN
        'total_cost' => 'decimal:2',       // <-- TAMBAHKAN
    ];

    /**
     * Get the green bean that owns the RoastBatch.
     * Setiap RoastBatch dimiliki oleh satu GreenBean.
     */
    public function greenBean()
    {
        return $this->belongsTo(GreenBean::class);
    }
 /**
     * Scope a query untuk memfilter roast batches.
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return void
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_batch_roasting', 'like', '%' . $search . '%')
                  ->orWhere('roast_level', 'like', '%' . $search . '%')
                  ->orWhere('nama_operator', 'like', '%' . $search . '%')
                  ->orWhereHas('greenBean', function ($subQuery) use ($search) { // Mencari di relasi
                      $subQuery->where('nama_kopi', 'like', '%' . $search . '%')
                               ->orWhere('lot_identifier', 'like', '%' . $search . '%');
                  });
            });
        });
    }
    /**
     * Get the roasted bean record associated with the RoastBatch.
     * Setiap RoastBatch menghasilkan satu entri RoastedBean (inventaris).
     */
    public function roastedBean()
    {
        return $this->hasOne(RoastedBean::class);
    }
}