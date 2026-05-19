<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesSharedContentCache;
use Illuminate\Database\Eloquent\Model;

class PressPaper extends Model
{
    use InvalidatesSharedContentCache;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image',
        'pdf_file',
        'price',
        'is_active',
        'published_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function getCoverImageAttribute($value): ?string
    {
        return $this->resolveMediaUrl($value);
    }

    public function getPdfFileAttribute($value): ?string
    {
        return $this->resolveMediaUrl($value);
    }

    private function resolveMediaUrl($value): ?string
    {
        $path = trim((string) $value);

        if ($path === '') {
            return null;
        }

        if (str_starts_with($path, '//')) {
            return 'https:' . $path;
        }

        if (preg_match('/^https?:\/\//i', $path) === 1) {
            return $path;
        }

        $normalized = preg_replace('#^/?storage/#', '', $path) ?? $path;
        $normalized = ltrim((string) preg_replace('#^public/#', '', $normalized), '/');

        if ($normalized === '') {
            return null;
        }

        return url('/public-media/' . ltrim($normalized, '/'));
    }

    public function scopePublished($query)
    {
        return $query
            ->where('is_active', true)
            ->where(function ($subQuery) {
                $subQuery->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }
}