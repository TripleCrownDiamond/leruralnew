<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'slug',
        'name_fr',
        'name_en',
        'description_fr',
        'description_en',
        'order',
        'published',
        'image',
        'image_position_x',
        'image_position_y',
    ];

    protected $casts = [
        'published' => 'boolean',
        'order' => 'integer',
        'image_position_x' => 'integer',
        'image_position_y' => 'integer',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published', true);
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'category_user_follows')->withTimestamps();
    }
}
