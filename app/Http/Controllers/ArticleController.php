<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleRequest;
use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\Category;
use App\Models\SavedArticle;
use App\Models\CommentLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Services\ArticleService;
use Inertia\Inertia;
use App\Models\Payment;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;

class ArticleController extends Controller
{
    protected $articleService;

    public function __construct(ArticleService $articleService)
    {
        $this->articleService = $articleService;
    }

    public function saved(Request $request)
    {
        $articles = SavedArticle::where('user_id', $request->user()->id)
            ->with(['article.category', 'article.categories'])
            ->latest()
            ->paginate(12)
            ->through(function ($saved) {
                $article = $saved->article;
                return [
                    'id' => $article->id,
                    'title' => $article->title_fr,
                    'slug' => $article->slug,
                    'excerpt' => $article->excerpt_fr,
                    'image' => $article->featured_image,
                    'category' => $article->category ? $article->category->name_fr : ($article->categories->first() ? $article->categories->first()->name_fr : 'Non classé'),
                    'author' => $article->author_name,
                    'premium' => $article->is_premium,
                    'published_at' => optional($article->published_at)->format('d M Y'),
                    'saved_at' => $saved->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard/SavedArticles', [
            'articles' => $articles
        ]);
    }

    /**
     * Display a listing of the resource (Dashboard).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Ensure user is authorized (admin or editor)
        if (!in_array($user->role, ['admin', 'editor'])) {
            abort(403);
        }

        $query = Article::with(['category', 'categories'])->latest();

        // If editor, only show own articles
        if ($user->role === 'editor') {
            $query->where('author_id', $user->id);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title_fr', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%")
                  ->orWhere('excerpt_fr', 'like', "%{$search}%")
                  ->orWhere('excerpt_en', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $categoryId = $request->input('category');
            if ($categoryId !== 'all') {
                $query->whereHas('categories', function($q) use ($categoryId) {
                    $q->where('categories.id', $categoryId);
                });
            }
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->input('status') === 'published') {
                $query->whereNotNull('published_at');
            } elseif ($request->input('status') === 'draft') {
                $query->whereNull('published_at');
            }
        }

        // Type filter (Premium/Free)
        if ($request->filled('type')) {
            if ($request->input('type') === 'premium') {
                $query->where('is_premium', true);
            } elseif ($request->input('type') === 'free') {
                $query->where('is_premium', false);
            }
        }

        $articles = $query->paginate(10)
            ->withQueryString()
            ->through(function ($article) {
                return [
                    'id' => $article->id,
                    'title' => $article->title_fr,
                    'slug' => $article->slug,
                    'category' => $article->category ? $article->category->name_fr : ($article->categories->first() ? $article->categories->first()->name_fr : 'Non classé'),
                    'categories' => $article->categories->map(fn($c) => ['id' => $c->id, 'name' => $c->name_fr]),
                    'author' => $article->author_name,
                    'status' => $article->published_at ? 'Publié' : 'Brouillon',
                    'published_at' => optional($article->published_at)->format('d/m/Y H:i'),
                    'views_count' => $article->read_count,
                    'image' => $article->featured_image, // Add image for dashboard list
                    'is_premium' => $article->is_premium,
                    'price' => $article->price,
                    'is_featured' => $article->is_featured,
                    'featured_until' => $article->featured_until ? $article->featured_until->format('d/m/Y H:i') : null,
                ];
            });

        return Inertia::render('Dashboard/Articles/Index', [
            'articles' => $articles,
            'filters' => $request->only(['search', 'status', 'type', 'category']),
            'categories' => Category::orderBy('name_fr')->get(['id', 'name_fr']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/Articles/Create', [
            'categories' => Category::select('id', 'name_fr')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ArticleRequest $request)
    {
        $validated = $request->validated();
        
        $article = new Article($validated);
        
        // Generate clean slug from title
        $baseSlug = Str::slug($validated['title_fr']);
        $slug = $baseSlug;
        $counter = 1;
        
        // Ensure uniqueness
        while (Article::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        $article->slug = $slug;
        $article->author_id = $request->user()->id;
        
        // Handle single category for backward compatibility or if chosen
        if (isset($validated['category_id'])) {
             $article->category_id = $validated['category_id'];
        }

        $article->save();
        
        // Sync categories
        if ($request->has('categories')) {
            $article->categories()->sync($request->input('categories'));
        } elseif (isset($validated['category_id'])) {
            $article->categories()->sync([$validated['category_id']]);
        }

        return redirect()->route('dashboard.articles.index')
            ->with('success', 'Article créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $slug)
    {
        $article = Article::where('slug', $slug)
            ->with(['category', 'categories', 'comments' => function($query) {
                $query->where('is_approved', true)
                      ->whereNull('parent_id')
                      ->with(['replies' => function($q) {
                          $q->where('is_approved', true)->latest()->with(['replies' => function($sq) {
                              $sq->where('is_approved', true)->latest();
                          }]);
                      }])
                      ->latest();
            }])
            ->firstOrFail();

        // Increment view count
        $article->increment('read_count');

        // Calculate and save reading time if missing
        if (!$article->reading_time) {
            $words = str_word_count(strip_tags($article->content_fr));
            $article->reading_time = ceil($words / 200);
            $article->save();
        }

        // Get minimum subscription price
        $min_subscription_price = SubscriptionPlan::min('price');

        // Check if main article is liked
        $is_liked = $this->articleService->isLiked($article->id);

        // Check if saved (only for auth users)
        $is_saved = $this->articleService->isSaved($article->id);

        // Check access for premium articles
        $can_read = true;
        if ($article->is_premium) {
            $user = $request->user();
            if (!$user) {
                $can_read = false;
            } elseif ($user->role === 'admin' || $user->role === 'editor') {
                $can_read = true;
            } else {
                // Check if user has purchased the article or has an active subscription
                $has_purchased = Payment::where('user_id', $user->id)
                    ->where('payable_type', Article::class)
                    ->where('payable_id', $article->id)
                    ->where('status', 'completed')
                    ->exists();

                $has_subscription = UserSubscription::where('user_id', $user->id)
                    ->where('status', 'active')
                    ->where('expires_at', '>', now())
                    ->exists();

                $can_read = $has_purchased || $has_subscription;
            }
        }

        // Similar articles (same category, exclude current)
        $similar_articles = Article::where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->with('category')
            ->published()
            ->inRandomOrder()
            ->take(3)
            ->get()
            ->map(fn ($a) => [
                'slug' => $a->slug,
                'title' => $a->title_fr,
                'excerpt' => $a->excerpt_fr,
                'image' => $a->featured_image,
                'premium' => $a->is_premium,
                'price' => $a->price,
                'published_human' => optional($a->published_at)->diffForHumans(),
                'views_count' => $a->read_count,
                'category' => $a->category->name_fr,
            ]);

        // Transform comments to include like status for auth user
        $comments = $article->comments->map(function ($comment) {
            $comment->is_liked = false;
            if (Auth::check()) {
                $comment->is_liked = CommentLike::where('comment_id', $comment->id)
                    ->where('user_id', Auth::id())
                    ->exists();
            }
            return $comment;
        });

        return Inertia::render('Article/Show', [
            'article' => [
                'id' => $article->id,
                'title' => $article->title_fr,
                'content' => $can_read ? $article->content_fr : Str::limit(strip_tags($article->content_fr), 300),
                'excerpt' => $article->excerpt_fr,
                'image' => $article->featured_image,
                'author' => $article->author_name,
                'published_at' => optional($article->published_at)->isoFormat('LL'),
                'read_time' => $article->reading_time,
                'views_count' => $article->read_count,
                'premium' => $article->is_premium,
                'price' => $article->price,
                'category' => $article->category,
                'categories' => $article->categories->map(fn($c) => ['name' => $c->name_fr, 'slug' => $c->slug]),
                'can_read' => $can_read,
            ],
            'min_subscription_price' => $min_subscription_price,
            'comments' => $comments,
            'similar_articles' => $similar_articles,
            'is_liked' => $is_liked,
            'is_saved' => $is_saved,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Article $article)
    {
        // Authorization check
        if (request()->user()->role !== 'admin' && request()->user()->id !== $article->author_id) {
            abort(403);
        }
        
        $article->load('categories');

        return Inertia::render('Dashboard/Articles/Edit', [
            'article' => $article,
            'categories' => Category::select('id', 'name_fr')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ArticleRequest $request, Article $article)
    {
        // Authorization check
        if (request()->user()->role !== 'admin' && request()->user()->id !== $article->author_id) {
            abort(403);
        }

        $validated = $request->validated();
        
        // Update slug only if title changes significantly (optional, maybe keep slug stable)
        // $article->slug = Str::slug($validated['title_fr']);

        $article->update($validated);
        
        // Handle single category update
        if (isset($validated['category_id'])) {
            $article->category_id = $validated['category_id'];
            $article->save();
        }

        // Sync categories
        if ($request->has('categories')) {
            $article->categories()->sync($request->input('categories'));
        } elseif (isset($validated['category_id'])) {
            $article->categories()->sync([$validated['category_id']]);
        }

        return redirect()->route('dashboard.articles.index')
            ->with('success', 'Article mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article)
    {
        // Authorization check
        if (request()->user()->role !== 'admin' && request()->user()->id !== $article->author_id) {
            abort(403);
        }

        $article->delete();

        return redirect()->route('dashboard.articles.index')
            ->with('success', 'Article supprimé avec succès.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:articles,id',
        ]);

        $ids = $request->input('ids');
        
        // Optional: Add authorization check for each ID or generally
        // For simplicity, assuming admin can delete any, or use policy
        if ($request->user()->role !== 'admin') {
             // Filter IDs to only those owned by user if not admin
             $ids = Article::whereIn('id', $ids)->where('author_id', $request->user()->id)->pluck('id');
        }

        Article::whereIn('id', $ids)->delete();

        return redirect()->route('dashboard.articles.index')
            ->with('success', count($ids) . ' articles supprimés avec succès.');
    }
}
