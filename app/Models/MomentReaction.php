<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MomentReaction extends Model
{
    use HasFactory;

    public const TYPE_LIKE = 'like';

    protected $fillable = [
        'moment_id',
        'session_id',
        'type',
    ];

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
