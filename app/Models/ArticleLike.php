<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleLike extends Model
{
    protected $fillable = [
        'article_id',
        'user_id',
        'session_id',
        'ip',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}

