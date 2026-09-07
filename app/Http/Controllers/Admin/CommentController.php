<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Article;
use App\Models\RedFlag;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\CommentModerationStatus;

class CommentController extends AdminController
{
    public function index(Request $request)
    {
        $query = Comment::with(['user', 'article'])
            ->select([
                'id',
                'content',
                'is_approved',
                'auto_flagged',
                'created_at',
                'approved_at',
                'author_name',
                'author_email',
                'user_id',
                'article_id'
            ])
            ->latest();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%")
                  ->orWhere('author_email', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('article', function($articleQuery) use ($search) {
                      $articleQuery->where('title_fr', 'like', "%{$search}%")
                                  ->orWhere('title_en', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        // Auto-moderation filter
        if ($request->filled('auto_moderation')) {
            if ($request->auto_moderation === 'flagged') {
                $query->where('auto_flagged', true);
            } elseif ($request->auto_moderation === 'clean') {
                $query->where('auto_flagged', false);
            }
        }

        $comments = $query->paginate(10);

        // Get red flags for auto-moderation
        $redFlags = RedFlag::where('active', true)->pluck('word');

        return Inertia::render('Admin/Comments/Index', [
            'comments' => $comments,
            'redFlags' => $redFlags,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'auto_moderation' => $request->auto_moderation,
            ]
        ]);
    }

    public function settings()
    {
        // RÃ©cupÃ©rer le paramÃ¨tre auto_approve depuis la table settings
        $autoApproveSetting = Setting::where('key', 'comments.auto_approve')->first();
        $autoApprove = $autoApproveSetting ? (bool) $autoApproveSetting->value : false;
        
        $redFlags = RedFlag::where('active', true)->pluck('word')->toArray();

        return Inertia::render('Admin/Comments/Settings', [
            'autoApprove' => $autoApprove,
            'redFlags' => $redFlags,
        ]);
    }

    /**
     * Repondre publiquement a un commentaire, au nom de la redaction.
     * La reponse est rattachee au commentaire parent et publiee directement :
     * elle emane d'un membre de l'equipe, elle n'a pas a passer la moderation.
     */
    public function reply(Request $request, Comment $comment)
    {
        $data = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        $author = auth()->user();

        Comment::create([
            'article_id' => $comment->article_id,
            'parent_id' => $comment->id,
            'content' => $data['content'],
            'author_name' => $author?->name ?? 'La redaction',
            'author_email' => $author?->email,
            'user_id' => $author?->id,
            'rating' => 5,
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => $author?->id,
        ]);

        // Repondre vaut approbation du commentaire parent : sans cela la reponse
        // serait publiee sous un commentaire qui, lui, resterait invisible.
        if (! $comment->is_approved) {
            $comment->update([
                'is_approved' => true,
                'auto_flagged' => false,
                'approved_at' => now(),
                'approved_by' => $author?->id,
            ]);
        }

        return back()->with('success', 'Reponse publiee.');
    }

    public function approve(Comment $comment)
    {
        $comment->update([
            'is_approved' => true,
            'auto_flagged' => false,
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Commentaire approuvÃ© avec succÃ¨s.');
    }

    public function reject(Comment $comment)
    {
        $comment->update([
            'is_approved' => false,
            'rejected_at' => now(),
            'rejected_by' => auth()->id(),
        ]);

        return back()->with('success', 'Commentaire rejetÃ© avec succÃ¨s.');
    }

    public function destroy(Comment $comment)
    {
        $comment->delete();

        return back()->with('success', 'Commentaire supprimÃ© avec succÃ¨s.');
    }

    public function bulkApprove(Request $request)
    {
        $commentIds = $request->input('comment_ids', []);
        
        Comment::whereIn('id', $commentIds)->update([
            'is_approved' => true,
            'auto_flagged' => false,
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', count($commentIds) . ' commentaire(s) approuvÃ©(s) avec succÃ¨s.');
    }

    public function bulkReject(Request $request)
    {
        $commentIds = $request->input('comment_ids', []);
        
        Comment::whereIn('id', $commentIds)->update([
            'is_approved' => false,
            'rejected_at' => now(),
            'rejected_by' => auth()->id(),
        ]);

        return back()->with('success', count($commentIds) . ' commentaire(s) rejetÃ©(s) avec succÃ¨s.');
    }

    public function bulkDelete(Request $request)
    {
        $commentIds = $request->input('comment_ids', []);
        
        Comment::whereIn('id', $commentIds)->delete();

        return back()->with('success', count($commentIds) . ' commentaire(s) supprimÃ©(s) avec succÃ¨s.');
    }

    private function notifyCommentModerationStatus(Comment $comment, string $status): void
    {
        try {
            $comment->loadMissing('user', 'article');

            $recipient = $comment->user?->email ?: $comment->author_email;
            if (!$recipient) {
                return;
            }

            Mail::to($recipient)->send(new CommentModerationStatus($comment, $status));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
    public function updateAutoModeration(Request $request)
    {
        $request->validate([
            'auto_approve' => 'boolean',
            'red_flags' => 'array',
            'red_flags.*' => 'string',
        ]);

        // Sauvegarder le paramÃ¨tre auto_approve dans la table settings
        Setting::updateOrCreate(
            ['key' => 'comments.auto_approve'],
            ['value' => $request->auto_approve ? '1' : '0']
        );
        
        // Update existing red flags
        RedFlag::where('active', true)->update(['active' => false]);
        
        foreach ($request->red_flags as $word) {
            RedFlag::updateOrCreate(
                ['word' => strtolower(trim($word))],
                ['active' => true]
            );
        }

        return back()->with('success', 'ParamÃ¨tres de modÃ©ration automatique mis Ã  jour.');
    }
}
