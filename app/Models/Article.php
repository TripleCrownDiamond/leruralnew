<?php

namespace App\Models;

use App\Support\ArticleImageResolver;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'slug',
        'title_fr', 'title_en',
        'excerpt_fr', 'excerpt_en',
        'content_fr', 'content_en',
        'featured_image',
        'featured_image_position_x',
        'featured_image_position_y',
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
        'featured_image_position_x' => 'integer',
        'featured_image_position_y' => 'integer',
    ];
    public function getFeaturedImageAttribute($value): ?string
    {
        $image = trim((string) $value);

        if ($image === '') {
            return null;
        }

        $looksLegacyWordPress = str_contains($image, '/wp-content/uploads/') || str_starts_with($image, '/wp-content/uploads/');

        if ($looksLegacyWordPress) {
            $resolved = ArticleImageResolver::resolveLegacy($image, $this->attributes['slug'] ?? null);
            if ($resolved !== null) {
                return $resolved;
            }
        }

        if (str_starts_with($image, '//')) {
            return 'https:' . $image;
        }

        if (preg_match('/^https?:\/\//i', $image) === 1) {
            return $image;
        }

        return asset(ltrim($image, '/'));
    }
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



