<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebTvVideo extends Model
{
    protected $fillable = [
        'title',
        'youtube_id',
        'thumbnail',
        'emission_name',
        'emission_image',
        'emission_link',
        'published_at',
        'is_featured',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
    ];
}
