<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\SavedArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedArticleController extends Controller
{
    public function toggle(Request $request, string $slug)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $article = Article::where('slug', $slug)->firstOrFail();
        $user = Auth::user();

        $saved = SavedArticle::where('user_id', $user->id)
            ->where('article_id', $article->id)
            ->first();

        if ($saved) {
            $saved->delete();
            return response()->json(['saved' => false]);
        }

        SavedArticle::create([
            'user_id' => $user->id,
            'article_id' => $article->id,
        ]);

        return response()->json(['saved' => true]);
    }
}
