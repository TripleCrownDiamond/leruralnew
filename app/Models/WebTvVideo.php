<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesSharedContentCache;
use Illuminate\Database\Eloquent\Model;

class WebTvVideo extends Model
{
    use InvalidatesSharedContentCache;

    protected $fillable = [
        'title',
        'youtube_id',
        'thumbnail',
        'emission_name',
        'emission_image',
        'emission_link',
        'section_name',
        'published_at',
        'is_featured',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
    ];

    public function getThumbnailAttribute($value): ?string
    {
        $thumbnail = trim((string) $value);

        if ($thumbnail !== '') {
            if (str_starts_with($thumbnail, '//')) {
                return 'https:' . $thumbnail;
            }

            if (preg_match('/^https?:\/\//i', $thumbnail) === 1) {
                return $thumbnail;
            }

            return asset(ltrim($thumbnail, '/'));
        }

        $emissionImage = trim((string) ($this->attributes['emission_image'] ?? ''));
        if ($emissionImage !== '') {
            if (str_starts_with($emissionImage, '//')) {
                return 'https:' . $emissionImage;
            }

            if (preg_match('/^https?:\/\//i', $emissionImage) === 1) {
                return $emissionImage;
            }

            return asset(ltrim($emissionImage, '/'));
        }

        $youtubeId = trim((string) ($this->attributes['youtube_id'] ?? ''));

        return $youtubeId !== ''
            ? 'https://img.youtube.com/vi/' . $youtubeId . '/hqdefault.jpg'
            : null;
    }

    public function getEmissionImageAttribute($value): ?string
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