<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',
        'image_url',
        'redirect_url',
        'title',
        'description',
        'is_active',
    ];

    protected $casts = [
        'view_count' => 'integer',
        'click_count' => 'integer',
        'is_active' => 'boolean',
    ];


    protected static function booted(): void
    {
        static::saved(static fn () => Cache::forget('shared_content:v1'));
        static::deleted(static fn () => Cache::forget('shared_content:v1'));
    }

    public function getImageUrlAttribute($value): ?string
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

    /**
     * Recuperer une publicite active par location_id
     */
    public static function getActiveByLocation(string $locationId): ?self
    {
        return self::where('location_id', $locationId)
            ->where('is_active', true)
            ->first();
    }
}

