<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\SavedArticle;
use App\Models\CommentLike;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;

class ArticleService
{
    public function formatArticle(Article $article)
    {
        return [
            'id' => $article->id,
            'slug' => $article->slug,
            'title' => $article->title_fr,
            'excerpt' => $article->excerpt_fr,
            'image' => $article->featured_image,
            'author' => $article->author_name,
            'premium' => $article->is_premium,
            'price' => $article->price,
            'published_human' => optional($article->published_at)->diffForHumans(),
            'likes_count' => $article->likes_count,
            'views_count' => $article->read_count,
            'comments_count' => $article->comments_count,
            'is_liked' => $this->isLiked($article->id),
            'is_saved' => $this->isSaved($article->id),
        ];
    }

    public function isLiked($articleId)
    {
        $request = request();
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();
        
        // Check session cache first for guests/performance
        $likedSession = $request->session()->get('liked_articles', []);
        if (in_array($articleId, $likedSession)) {
            return true;
        }

        if (!Schema::hasTable('article_likes')) {
            return false;
        }

        if ($userId) {
            return ArticleLike::where('article_id', $articleId)
                ->where('user_id', $userId)
                ->exists();
        }

        return ArticleLike::where('article_id', $articleId)
            ->where('session_id', $sessionId)
            ->exists();
    }

    public function isSaved($articleId)
    {
        if (!Auth::check()) {
            return false;
        }

        return SavedArticle::where('user_id', Auth::id())
            ->where('article_id', $articleId)
            ->exists();
    }

    public function isCommentLiked($commentId)
    {
        $request = request();
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        if (!Schema::hasTable('comment_likes')) {
            return false;
        }

        if ($userId) {
            return CommentLike::where('comment_id', $commentId)
                ->where('user_id', $userId)
                ->exists();
        }

        return CommentLike::where('comment_id', $commentId)
            ->where('session_id', $sessionId)
            ->exists();
    }
}
