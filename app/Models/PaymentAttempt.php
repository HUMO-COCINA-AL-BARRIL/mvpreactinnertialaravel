<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'provider',
        'external_reference',
        'status',
        'amount',
        'currency',
        'payload',
        'response',
    ];

    protected $casts = [
        'amount' => 'integer',
        'payload' => 'array',
        'response' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
