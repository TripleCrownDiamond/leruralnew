<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ArticleLikeController extends Controller
{
    public function toggle(Request $request, string $slug)
    {
        $article = Article::where('slug', $slug)->firstOrFail();

        if (!Schema::hasTable('article_likes')) {
            $key = 'liked_articles';
            $liked = $request->session()->get($key, []);
            $articleId = $article->id;
            $alreadyLiked = in_array($articleId, $liked, true);

            if ($alreadyLiked) {
                $liked = array_values(array_filter($liked, fn ($id) => $id !== $articleId));
                $request->session()->put($key, $liked);
                if ($article->likes_count > 0) {
                    $article->decrement('likes_count');
                }

                return response()->json([
                    'liked' => false,
                    'likes_count' => $article->fresh()->likes_count,
                ]);
            }

            $liked[] = $articleId;
            $request->session()->put($key, $liked);
            $article->increment('likes_count');

            return response()->json([
                'liked' => true,
                'likes_count' => $article->fresh()->likes_count,
            ]);
        }

        $userId = $request->user()?->id;
        $sessionId = $userId ? null : $request->session()->getId();

        $query = ArticleLike::where('article_id', $article->id);
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $existing = $query->first();
        if ($existing) {
            $existing->delete();
            if ($article->likes_count > 0) {
                $article->decrement('likes_count');
            }

            return response()->json([
                'liked' => false,
                'likes_count' => $article->fresh()->likes_count,
            ]);
        }

        ArticleLike::create([
            'article_id' => $article->id,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'ip' => $request->ip(),
        ]);

        $article->increment('likes_count');

        return response()->json([
            'liked' => true,
            'likes_count' => $article->fresh()->likes_count,
        ]);
    }
}
