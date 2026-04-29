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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
