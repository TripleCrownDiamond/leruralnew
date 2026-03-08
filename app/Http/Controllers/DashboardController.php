<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\SavedArticle;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $stats = [];
        $chartData = [];
        $recentActivities = [];

        if ($user->role === 'admin') {
            // Admin Stats
            $stats = [
                'total_users' => User::count(),
                'total_articles' => Article::count(),
                'pending_comments' => Comment::where('is_approved', false)->count(),
                'total_views' => Article::sum('read_count'),
            ];

            // Chart: Articles per Category
            $chartData['articles_per_category'] = Category::withCount('articles')
                ->get()
                ->map(fn($c) => ['name' => $c->name_fr, 'value' => $c->articles_count])
                ->values();

            // Recent Articles
            $recentActivities['latest_articles'] = Article::with('category')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($a) => [
                    'id' => $a->id,
                    'title' => $a->title_fr,
                    'category' => $a->category->name_fr,
                    'status' => $a->status,
                    'date' => $a->created_at->diffForHumans(),
                    'views' => $a->read_count,
                ]);
            
            // Recent Users
            $recentActivities['latest_users'] = User::latest()
                ->take(5)
                ->get()
                ->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'date' => $u->created_at->diffForHumans(),
                ]);

        } elseif ($user->role === 'editor') {
            // Editor Stats
            $stats = [
                'my_articles' => Article::where('author_id', $user->id)->count(),
                'total_views' => Article::where('author_id', $user->id)->sum('read_count'),
                'published_articles' => Article::where('author_id', $user->id)->where('status', 'Publié')->count(),
            ];

            // Chart: Top Viewed Articles
            $chartData['top_articles'] = Article::where('author_id', $user->id)
                ->orderByDesc('read_count')
                ->take(5)
                ->get()
                ->map(fn($a) => ['name' => \Illuminate\Support\Str::limit($a->title_fr, 20), 'views' => $a->read_count]);

            // Recent Articles
            $recentActivities['latest_articles'] = Article::where('author_id', $user->id)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($a) => [
                    'id' => $a->id,
                    'title' => $a->title_fr,
                    'status' => $a->status,
                    'date' => $a->created_at->diffForHumans(),
                    'views' => $a->read_count,
                ]);

        } else {
            // User & Client
            $stats = [
                'saved_articles' => SavedArticle::where('user_id', $user->id)->count(),
                'my_comments' => Comment::where('author_email', $user->email)->count(),
                'subscription_status' => $user->role === 'client' ? 'Premium' : 'Standard',
            ];

            // Recent Saved Articles
            $recentActivities['saved_articles'] = SavedArticle::where('user_id', $user->id)
                ->with('article')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($s) => [
                    'id' => $s->article->id,
                    'title' => $s->article->title_fr,
                    'slug' => $s->article->slug,
                    'date' => $s->created_at->diffForHumans(),
                ]);
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'recentActivities' => $recentActivities,
        ]);
    }
}
