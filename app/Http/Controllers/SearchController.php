<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\ArticleContentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function __construct(
        protected ArticleContentService $articleContentService,
    ) {
    }

    public function index(Request $request)
    {
        $query = $request->input('q');

        $articles = Article::query()
            ->with('categories')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(function ($q) use ($query) {
                $q->where('title_fr', 'like', "%{$query}%")
                    ->orWhere('title_en', 'like', "%{$query}%")
                    ->orWhere('excerpt_fr', 'like', "%{$query}%")
                    ->orWhere('excerpt_en', 'like', "%{$query}%")
                    ->orWhere('content_fr', 'like', "%{$query}%")
                    ->orWhere('content_en', 'like', "%{$query}%")
                    ->orWhere('author_name', 'like', "%{$query}%");
            })
            ->orderByDesc('published_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($article) => [
                'id' => $article->id,
                'title' => $article->title_fr,
                'slug' => $article->slug,
                'excerpt' => $this->articleContentService->excerpt($article->excerpt_fr, $article->content_fr, 190),
                'image' => $article->featured_image,
                'author' => $article->author_name,
                'published_at' => $article->published_at,
                'published_human' => optional($article->published_at)->diffForHumans(),
                'category' => $article->categories->first() ? [
                    'name' => $article->categories->first()->name_fr,
                    'slug' => $article->categories->first()->slug,
                ] : null,
                'views_count' => $article->read_count,
                'premium' => $article->is_premium,
                'price' => $article->price,
            ]);

        return Inertia::render('Search/Index', [
            'query' => $query,
            'results' => $articles,
        ]);
    }

    public function apiSearch(Request $request)
    {
        $query = trim((string) $request->input('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $lower = mb_strtolower($query);

        $articles = Article::query()
            ->with('categories')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(function ($q) use ($query) {
                $q->where('title_fr', 'like', "%{$query}%")
                    ->orWhere('title_en', 'like', "%{$query}%")
                    ->orWhere('excerpt_fr', 'like', "%{$query}%")
                    ->orWhere('excerpt_en', 'like', "%{$query}%")
                    ->orWhere('author_name', 'like', "%{$query}%");
            })
            ->orderByRaw(
                "CASE
                    WHEN LOWER(COALESCE(title_fr, '')) = ? THEN 0
                    WHEN LOWER(COALESCE(title_fr, '')) LIKE ? THEN 1
                    WHEN LOWER(COALESCE(title_fr, '')) LIKE ? THEN 2
                    WHEN LOWER(COALESCE(author_name, '')) LIKE ? THEN 3
                    ELSE 4
                END",
                [$lower, $lower . '%', '%' . $lower . '%', '%' . $lower . '%']
            )
            ->orderByDesc('published_at')
            ->take(8)
            ->get()
            ->map(fn ($article) => [
                'id' => $article->id,
                'title' => $article->title_fr ?: $article->title_en,
                'slug' => $article->slug,
                'excerpt' => $this->articleContentService->excerpt($article->excerpt_fr, $article->content_fr, 120),
                'image' => $article->featured_image,
                'author' => $article->author_name,
                'published_human' => optional($article->published_at)->diffForHumans(),
                'premium' => (bool) $article->is_premium,
                'category' => $article->categories->first() ? [
                    'name' => $article->categories->first()->name_fr,
                ] : null,
            ])
            ->values();

        return response()->json($articles);
    }
}
