<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'is_active' => 'boolean',
    ];

    /**
     * Récupérer une publicité active par location_id
     */
    public static function getActiveByLocation(string $locationId): ?self
    {
        return self::where('location_id', $locationId)
            ->where('is_active', true)
            ->first();
    }
}
