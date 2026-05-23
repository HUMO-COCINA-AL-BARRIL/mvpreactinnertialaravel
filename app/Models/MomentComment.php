<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MomentComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'moment_id',
        'name',
        'comment',
    ];

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
