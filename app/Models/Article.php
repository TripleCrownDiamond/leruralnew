<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'slug',
        'title_fr', 'title_en',
        'excerpt_fr', 'excerpt_en',
        'content_fr', 'content_en',
        'featured_image',
        'is_premium',
        'price',
        'published_at',
        'author_name',
        'read_count',
        'likes_count',
        'comments_count',
        'category_id',
        'author_id',
        'meta_title',
        'meta_description',
        'focus_keyword',
        'is_featured',
        'featured_until',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'featured_until' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'article_category');
    }

    /**
     * @deprecated Use categories() instead
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    
    public function likes()
    {
        return $this->hasMany(ArticleLike::class);
    }

    public function savedByUsers()
    {
        return $this->hasMany(SavedArticle::class);
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)
                     ->where(function($q) {
                         $q->whereNull('featured_until')
                           ->orWhere('featured_until', '>', now());
                     });
    }
}
