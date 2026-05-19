<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesSharedContentCache;
use Illuminate\Database\Eloquent\Model;

class Emission extends Model
{
    use InvalidatesSharedContentCache;

    protected $fillable = [
        'name',
        'description',
        'image',
        'playlist_url',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function getImageAttribute($value): ?string
    {
        $image = trim((string) $value);

        if ($image === '') {
            return null;
        }

        if (str_starts_with($image, '//')) {
            return 'https:' . $image;
        }

        if (preg_match('/^https?:\/\//i', $image) === 1) {
            return $image;
        }

        return asset(ltrim($image, '/'));
    }
}