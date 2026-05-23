<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;
    
    protected $appends = ['image_url'];

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'image',
        'short_description',
        'description',
        'price',
        'stock',
        'is_available',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'integer',
        'stock' => 'integer',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        return Storage::url($this->image);
    }

    public function getNameAttribute(?string $value): ?string
    {
        return $this->normalizeText($value);
    }

    public function getShortDescriptionAttribute(?string $value): ?string
    {
        return $this->normalizeText($value);
    }

    public function getDescriptionAttribute(?string $value): ?string
    {
        return $this->normalizeText($value);
    }

    private function normalizeText(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        if (! preg_match('/[\x{00C3}\x{00C2}\x{00E2}]/u', $value)) {
            return $value;
        }

        return mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
    }
}
