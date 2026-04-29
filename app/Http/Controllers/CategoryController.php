<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Services\ArticleContentService;
use App\Services\ArticleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function __construct(
        protected ArticleService $articleService,
        protected ArticleContentService $articleContentService,
    ) {
    }

    public function show(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $isFollowing = $request->user() ? $request->user()->followedCategories()->where('categories.id', $category->id)->exists() : false;

        $query = Article::where(function ($q) use ($category) {
            $q->where('category_id', $category->id)
                ->orWhereHas('categories', function ($query) use ($category) {
                    $query->where('categories.id', $category->id);
                });
        })
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->with(['category', 'categories']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_fr', 'like', "%{$search}%")
                    ->orWhere('excerpt_fr', 'like', "%{$search}%")
                    ->orWhere('content_fr', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            if ($type === 'premium') {
                $query->where('is_premium', true);
            } elseif ($type === 'free') {
                $query->where('is_premium', false);
            }
        }

        if ($minPrice = $request->input('min_price')) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        $sort = $request->input('sort', 'recent');
        if (is_array($sort)) {
            $sort = 'recent';
        }

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
                'excerpt' => $this->articleContentService->excerpt($article->excerpt_fr, $article->content_fr, 190),
                'image' => $article->featured_image,
                'image_position_x' => $article->featured_image_position_x,
                'image_position_y' => $article->featured_image_position_y,
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
                'categories' => $article->categories->map(fn ($c) => [
                    'name' => $c->name_fr,
                    'slug' => $c->slug,
                ]),
            ]);

        return Inertia::render('Category/Show', [
            'category' => [
                'name' => $category->name_fr,
                'slug' => $category->slug,
                'description' => $category->description_fr,
                'image' => $category->image,
                'image_position_x' => $category->image_position_x,
                'image_position_y' => $category->image_position_y,
                'is_following' => $isFollowing,
                'followers_count' => $category->followers()->count(),
            ],
            'articles' => $articles,
            'filters' => (object) $request->only(['search', 'sort', 'type', 'min_price', 'max_price']),
        ]);
    }
}
