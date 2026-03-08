<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommodityPrice extends Model
{
    protected $fillable = [
        'name',
        'price',
        'unit',
        'note',
        'country',
        'active',
    ];
}
