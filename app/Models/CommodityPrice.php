<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesSharedContentCache;
use Illuminate\Database\Eloquent\Model;

class CommodityPrice extends Model
{
    use InvalidatesSharedContentCache;

    protected $fillable = [
        'name',
        'price',
        'unit',
        'note',
        'country',
        'active',
    ];
}