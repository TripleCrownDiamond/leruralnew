<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class CommentController extends Controller
{
    public function store(Request $request, Article $article)
    {
        $user = auth()->user();

        $request->validate([
            'content' => 'required|string|max:1000',
            'author_name' => $user ? 'nullable' : 'required|string|max:50',
            'author_email' => $user ? 'nullable' : 'required|email|max:100',
            'rating' => $user ? 'nullable' : 'required|integer|min:1|max:5',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $moderation = Setting::where('key', 'comment_moderation')->value('value') ?? 'auto';
        $isApproved = $moderation === 'auto';

        $comment = Comment::create([
            'article_id' => $article->id,
            'content' => $request->content,
            'author_name' => $user ? $user->name : $request->author_name,
            'author_email' => $user ? $user->email : $request->author_email,
            'user_id' => $user ? $user->id : null,
            'rating' => $request->rating ?? 5,
            'is_approved' => $isApproved,
            'parent_id' => $request->parent_id,
        ]);

        if ($isApproved) {
            return back()->with('success', 'Votre commentaire a été publié.');
        }

        return back()->with('success', 'Votre commentaire est en attente de modération.');
    }

    public function toggleLike(Request $request, Comment $comment)
    {
        $userId = $request->user()?->id;
        $sessionId = $userId ? null : $request->session()->getId();

        $query = CommentLike::where('comment_id', $comment->id);
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            // For guests, we use session ID to track likes
            if (!Schema::hasTable('comment_likes')) {
                // Fallback if table doesn't exist yet (should not happen if migrated)
                return response()->json(['error' => 'Feature not available'], 503);
            }
            $query->where('session_id', $sessionId);
        }

        $existing = $query->first();

        if ($existing) {
            $existing->delete();
            $comment->decrement('likes_count');
            return response()->json([
                'liked' => false,
                'likes_count' => $comment->fresh()->likes_count
            ]);
        }

        CommentLike::create([
            'comment_id' => $comment->id,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'ip' => $request->ip(),
        ]);

        $comment->increment('likes_count');

        return response()->json([
            'liked' => true,
            'likes_count' => $comment->fresh()->likes_count
        ]);
    }
}
