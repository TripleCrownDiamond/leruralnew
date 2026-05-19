<?php

namespace App\Models\Concerns;

use Illuminate\Support\Facades\Cache;

trait InvalidatesSharedContentCache
{
    protected static function bootInvalidatesSharedContentCache(): void
    {
        $flush = static function (): void {
            Cache::forget('shared_content:v1');
        };

        static::saved($flush);
        static::deleted($flush);
    }
}