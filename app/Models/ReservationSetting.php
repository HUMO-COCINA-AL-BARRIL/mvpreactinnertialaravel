<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class ReservationSetting extends Model
{
    protected $fillable = [
        'capacity_total',
        'reservation_duration_minutes',
        'slot_interval_minutes',
        'open_time',
        'close_time',
    ];

    protected $casts = [
        'capacity_total' => 'integer',
        'reservation_duration_minutes' => 'integer',
        'slot_interval_minutes' => 'integer',
    ];

    public static function current(): self
    {
        if (! Schema::hasTable('reservation_settings')) {
            return new static(static::defaults());
        }

        return static::query()->firstOrCreate(['id' => 1], static::defaults());
    }

    public static function defaults(): array
    {
        return [
            'capacity_total' => 40,
            'reservation_duration_minutes' => 120,
            'slot_interval_minutes' => 30,
            'open_time' => '12:00',
            'close_time' => '22:00',
        ];
    }
}
