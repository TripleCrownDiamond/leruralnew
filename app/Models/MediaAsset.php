<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaAsset extends Model
{
    protected $fillable = [
        'user_id',
        'original_name',
        'file_name',
        'mime_type',
        'file_size',
        'extension',
        'kind',
        'disk',
        'path',
        'url',
        'width',
        'height',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function getUrlAttribute($value): ?string
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

