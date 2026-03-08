<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q');
        
        $articles = Article::query()
            ->with('category')
            ->whereNotNull('published_at')
            ->where(function($q) use ($query) {
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
                'excerpt' => $article->excerpt_fr,
                'image' => $article->featured_image,
                'author' => $article->author_name,
                'published_at' => $article->published_at,
                'published_human' => optional($article->published_at)->diffForHumans(),
                'category' => [
                    'name' => $article->category->name_fr,
                    'slug' => $article->category->slug,
                ],
                'views_count' => $article->read_count,
            ]);

        return Inertia::render('Search/Index', [
            'query' => $query,
            'results' => $articles,
        ]);
    }

    public function apiSearch(Request $request)
    {
        $query = $request->input('q');
        
        if (strlen($query) < 3) {
            return response()->json([]);
        }

        $articles = Article::query()
            ->with('category')
            ->whereNotNull('published_at')
            ->where(function($q) use ($query) {
                $q->where('title_fr', 'like', "%{$query}%")
                  ->orWhere('title_en', 'like', "%{$query}%")
                  ->orWhere('author_name', 'like', "%{$query}%");
            })
            ->orderByDesc('published_at')
            ->take(5)
            ->get()
            ->map(fn ($article) => [
                'id' => $article->id,
                'title' => $article->title_fr,
                'slug' => $article->slug,
                'excerpt' => $article->excerpt_fr,
                'image' => $article->featured_image,
                'category' => [
                    'name' => $article->category->name_fr,
                ],
            ]);

        return response()->json($articles);
    }
}