<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesSharedContentCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Announcement extends Model
{
    use HasFactory;
    use InvalidatesSharedContentCache;

    protected $fillable = [
        'label',
        'message',
        'link_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}