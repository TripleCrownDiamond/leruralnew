<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class LiveStream extends Model
{
    protected $fillable = [
        'platform',
        'title',
        'stream_url',
        'embed_url',
        'replay_url',
        'thumbnail_url',
        'fallback_image_url',
        'starts_at',
        'ends_at',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        $flush = static function (): void {
            Cache::forget('shared_content:v1');
        };

        static::saved($flush);
        static::deleted($flush);
    }
}
