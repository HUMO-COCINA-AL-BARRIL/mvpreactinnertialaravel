<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Moment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'tag',
        'caption',
        'rating',
        'image_path',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function comments(): HasMany
    {
        return $this->hasMany(MomentComment::class)->latest();
    }

    public function images(): HasMany
    {
        return $this->hasMany(MomentImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MomentReaction::class);
    }

    public function likeReactions(): HasMany
    {
        return $this->reactions()->where('type', MomentReaction::TYPE_LIKE);
    }
}
