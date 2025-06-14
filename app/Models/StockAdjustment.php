<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $adjustable_type
 * @property int $adjustable_id
 * @property int|null $user_id
 * @property string $adjustment_type
 * @property numeric $quantity_adjusted_g
 * @property numeric|null $stock_before_adjustment_g
 * @property numeric|null $stock_after_adjustment_g
 * @property string|null $reason
 * @property \Illuminate\Support\Carbon $adjustment_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Model|\Eloquent $adjustable
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAdjustableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAdjustableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAdjustmentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAdjustmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereQuantityAdjustedG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereStockAfterAdjustmentG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereStockBeforeAdjustmentG($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereUserId($value)
 * @mixin \Eloquent
 */
class StockAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'adjustable_id',
        'adjustable_type',
        'user_id',
        'adjustment_type',
        'quantity_adjusted_g',
        'stock_before_adjustment_g',
        'stock_after_adjustment_g',
        'reason',
        'adjustment_date',
    ];

    protected $casts = [
        'adjustment_date' => 'datetime',
        'quantity_adjusted_g' => 'decimal:2',
        'stock_before_adjustment_g' => 'decimal:2',
        'stock_after_adjustment_g' => 'decimal:2',
    ];

    /**
     * Get the parent adjustable model (GreenBean or RoastedBean).
     */
    public function adjustable()
    {
        return $this->morphTo();
    }

    /**
     * Get the user who made the adjustment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}