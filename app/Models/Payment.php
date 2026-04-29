<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    //
    protected $fillable = [
        'user_id',
        'payment_method',
        'transaction_id',
        'amount',
        'currency',
        'status',
        'type',
        'related_id',
        'meta_data',
        'description',
        'paid_at',
        'receipt_image',
        'phone_number',
        'provider',
        'reference',
    ];

    protected $casts = [
        'meta_data' => 'array',
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
