<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->get('q');

        if (!$query || strlen($query) < 3) {
            return response()->json([]);
        }

        $articles = Article::where(function ($q) use ($query) {
                $q->whereRaw('LOWER(title_fr) LIKE ?', ['%'.strtolower($query).'%'])
                  ->orWhereRaw('LOWER(excerpt_fr) LIKE ?', ['%'.strtolower($query).'%']);
            })
            ->published()
            ->latest('published_at')
            ->take(10)
            ->get()
            ->map(fn ($article) => [
                'id' => $article->id,
                'slug' => $article->slug,
                'title' => $article->title_fr,
                'image' => $article->featured_image,
                'published_human' => optional($article->published_at)->diffForHumans(),
            ]);

        return response()->json($articles);
    }
}
