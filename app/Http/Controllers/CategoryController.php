<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Article;
use Inertia\Inertia;
use Illuminate\Http\Request;

use App\Services\ArticleService;

class CategoryController extends Controller
{
    protected $articleService;

    public function __construct(ArticleService $articleService)
    {
        $this->articleService = $articleService;
    }

    public function show(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        
        $query = Article::where(function($q) use ($category) {
                $q->where('category_id', $category->id)
                  ->orWhereHas('categories', function($query) use ($category) {
                      $query->where('categories.id', $category->id);
                  });
            })
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_fr', 'like', "%{$search}%")
                  ->orWhere('excerpt_fr', 'like', "%{$search}%");
            });
        }

        // Type Filter (Free/Premium)
        if ($type = $request->input('type')) {
            if ($type === 'premium') {
                $query->where('is_premium', true);
            } elseif ($type === 'free') {
                $query->where('is_premium', false);
            }
        }

        // Price Filter (Min/Max)
        if ($minPrice = $request->input('min_price')) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        // Sort
        $sort = $request->input('sort', 'recent');
        if (is_array($sort)) $sort = 'recent'; // Safety check

        if ($sort === 'popular') {
            $query->orderByDesc('read_count');
        } elseif ($sort === 'oldest') {
            $query->orderBy('published_at');
        } elseif ($sort === 'az') {
            $query->orderBy('title_fr');
        } elseif ($sort === 'za') {
            $query->orderByDesc('title_fr');
        } else {
            $query->orderByDesc('published_at');
        }

        $articles = $query->paginate(12)
            ->withQueryString()
            ->through(fn ($article) => [
                'id' => $article->id,
                'slug' => $article->slug,
                'title' => $article->title_fr,
                'excerpt' => $article->excerpt_fr,
                'image' => $article->featured_image,
                'author' => $article->author_name,
                'price' => $article->price,
                'published_human' => optional($article->published_at)->diffForHumans(),
                'likes_count' => $article->likes_count,
                'views_count' => $article->read_count,
                'comments_count' => $article->comments_count,
                'premium' => $article->is_premium,
                'is_liked' => $this->articleService->isLiked($article->id),
                'is_saved' => $this->articleService->isSaved($article->id),
                'category' => $category->name_fr,
                'categories' => $article->categories->map(fn($c) => [
                    'name' => $c->name_fr,
                    'slug' => $c->slug,
                ]),
            ]);

        return Inertia::render('Category/Show', [
            'category' => [
                'name' => $category->name_fr,
                'slug' => $category->slug,
                'description' => $category->description_fr,
            ],
            'articles' => $articles,
            'filters' => (object) $request->only(['search', 'sort', 'type', 'min_price', 'max_price']),
        ]);
    }
}
