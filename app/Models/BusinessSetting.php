<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class BusinessSetting extends Model
{
    protected $fillable = [
        'business_name',
        'is_open',
        'closed_message',
    ];

    protected $casts = [
        'is_open' => 'boolean',
    ];

    public static function current(): self
    {
        if (! Schema::hasTable('business_settings')) {
            return new static([
                'business_name' => 'HUMO Cocina al Barril',
                'is_open' => true,
                'closed_message' => 'El local esta cerrado en este momento. Vuelve pronto.',
            ]);
        }

        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'business_name' => 'HUMO Cocina al Barril',
                'is_open' => true,
                'closed_message' => 'El local esta cerrado en este momento. Vuelve pronto.',
            ]
        );
    }
}
