<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RedFlag extends Model
{
    protected $fillable = [
        'word',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
