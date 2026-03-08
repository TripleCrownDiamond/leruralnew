<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ArticleLikeController;
use App\Models\Category;
use App\Models\Article;
use App\Models\CommodityPrice;
use App\Models\WebTvVideo;
use App\Models\Partner;
use App\Models\Emission;
use App\Models\Comment;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

use App\Services\ArticleService;
use App\Http\Controllers\Admin\PaymentGatewayController;

Route::get('/', function (ArticleService $articleService) {
    $categoriesCollection = Category::published()->orderBy('order')->get();
    $categories = $categoriesCollection->map(fn ($c) => [
        'slug' => $c->slug,
        'name' => $c->name_fr,
    ]);

    $featured = Article::featured()
        ->published()
        ->orderByDesc('published_at')
        ->take(5)
        ->get()
        ->map(fn ($a) => [
            'slug' => $a->slug,
            'title' => $a->title_fr,
            'excerpt' => $a->excerpt_fr,
            'image' => $a->featured_image,
            'author' => $a->author_name,
            'premium' => $a->is_premium,
            'price' => $a->price,
            'published_human' => optional($a->published_at)->diffForHumans(),
            'likes_count' => $a->likes_count,
            'views_count' => $a->read_count,
            'comments_count' => $a->comments_count,
            'is_liked' => $articleService->isLiked($a->id),
            'is_saved' => $articleService->isSaved($a->id),
            'category' => $a->categories->first() ? $a->categories->first()->name_fr : 'Non classé',
        ]);

    $latest_by_category = [];
    foreach ($categoriesCollection as $c) {
        $latest_by_category[$c->slug] = [
            'name' => $c->name_fr,
            'articles' => Article::whereHas('categories', function ($q) use ($c) {
                    $q->where('categories.id', $c->id);
                })
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->orderByDesc('published_at')
                ->take(6)
                ->get()
                ->map(fn ($a) => [
                    'slug' => $a->slug,
                    'title' => $a->title_fr,
                    'excerpt' => $a->excerpt_fr,
                    'image' => $a->featured_image,
                    'author' => $a->author_name,
                    'premium' => $a->is_premium,
                    'price' => $a->price,
                    'published_human' => optional($a->published_at)->diffForHumans(),
                    'likes_count' => $a->likes_count,
                    'views_count' => $a->read_count,
                    'comments_count' => $a->comments_count,
                    'is_liked' => $articleService->isLiked($a->id),
                    'is_saved' => $articleService->isSaved($a->id),
                    'category' => $c->name_fr,
                ]),
        ];
    }

    $latest_articles = Article::whereNotNull('published_at')
        ->where('published_at', '<=', now())
        ->with('categories')
        ->orderByDesc('published_at')
        ->take(10)
        ->get()
        ->map(fn ($a) => [
            'slug' => $a->slug,
            'title' => $a->title_fr,
            'excerpt' => $a->excerpt_fr,
            'image' => $a->featured_image,
            'author' => $a->author_name,
            'premium' => $a->is_premium,
            'price' => $a->price,
            'published_human' => optional($a->published_at)->diffForHumans(),
            'likes_count' => $a->likes_count,
            'views_count' => $a->read_count,
            'comments_count' => $a->comments_count,
            'is_liked' => $articleService->isLiked($a->id),
            'is_saved' => $articleService->isSaved($a->id),
            'category' => $a->categories->first() ? $a->categories->first()->name_fr : 'Non classé',
        ]);

    $market_prices = CommodityPrice::where('active', true)->get()->map(fn ($p) => [
        'name' => $p->name . ($p->country ? " ($p->country)" : ''),
        'price' => $p->price,
        'unit' => $p->unit,
        'note' => $p->note,
    ]);

    $webtv_videos = WebTvVideo::orderByDesc('published_at')->take(4)->get();
    
    $emissions = Emission::where('is_active', true)->orderBy('order')->get();

    $partners = Partner::where('is_active', true)->orderBy('order')->get();

    $latest_comments = Comment::where('is_approved', true)
        ->with('article')
        ->latest()
        ->take(30)
        ->get()
        ->map(fn ($c) => [
            'author_name' => $c->author_name,
            'content' => Str::limit($c->content, 100),
            'article_title' => $c->article ? Str::limit($c->article->title_fr, 40) : 'Article supprimé',
        ]);

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'categories' => $categories,
        'featured' => $featured,
        'latest_by_category' => $latest_by_category,
        'latest_articles' => $latest_articles,
        'market_prices' => $market_prices,
        'webtv_videos' => $webtv_videos,
        'emissions' => $emissions,
        'partners' => $partners,
        'latest_comments' => $latest_comments,
    ]);
});

// Frontend Routes
Route::get('/categorie/{slug}', [CategoryController::class, 'show'])->name('category.show');
Route::get('/article/{slug}', [ArticleController::class, 'show'])->name('article.show');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/a-propos', [PageController::class, 'about'])->name('about');

use App\Http\Controllers\PollController;

use App\Http\Controllers\CommentController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\SavedArticleController;

Route::post('/polls/{poll}/vote', [PollController::class, 'vote'])->name('polls.vote');
Route::post('/articles/{slug}/like', [ArticleLikeController::class, 'toggle'])->name('articles.like');
Route::post('/articles/{slug}/save', [SavedArticleController::class, 'toggle'])->name('articles.save');
Route::post('/articles/{article}/comments', [CommentController::class, 'store'])->name('comments.store');
Route::post('/comments/{comment}/like', [CommentController::class, 'toggleLike'])->name('comments.like');
Route::post('/newsletter', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/api/search', [SearchController::class, 'index'])->name('api.search');

Route::get('/en', function (ArticleService $articleService) {
    $categoriesCollection = Category::published()->orderBy('order')->get();
    $categories = $categoriesCollection->map(fn ($c) => [
        'slug' => $c->slug,
        'name' => $c->name_en,
    ]);

    $alaune = $categoriesCollection->firstWhere('slug', 'a-la-une');
    $featured = [];
    if ($alaune) {
        $featured = Article::where('category_id', $alaune->id)
            ->orderByDesc('published_at')
            ->take(5)
            ->get()
            ->map(fn ($a) => [
                'slug' => $a->slug,
                'title' => $a->title_en,
                'excerpt' => $a->excerpt_en,
                'image' => $a->featured_image,
                'author' => $a->author_name,
                'premium' => $a->is_premium,
                'price' => $a->price,
                'published_human' => optional($a->published_at)->diffForHumans(),
                'likes_count' => $a->likes_count,
                'views_count' => $a->read_count,
                'comments_count' => $a->comments_count,
                'is_liked' => $articleService->isLiked($a->id),
                'is_saved' => $articleService->isSaved($a->id),
            ]);
    }

    $latest_by_category = [];
    foreach ($categoriesCollection as $c) {
        $latest_by_category[$c->slug] = [
            'name' => $c->name_en,
            'articles' => Article::where('category_id', $c->id)
                ->orderByDesc('published_at')
                ->take(6)
                ->get()
                ->map(fn ($a) => [
                    'slug' => $a->slug,
                    'title' => $a->title_en,
                    'excerpt' => $a->excerpt_en,
                    'image' => $a->featured_image,
                    'author' => $a->author_name,
                    'premium' => $a->is_premium,
                    'price' => $a->price,
                    'published_human' => optional($a->published_at)->diffForHumans(),
                    'likes_count' => $a->likes_count,
                    'views_count' => $a->read_count,
                    'comments_count' => $a->comments_count,
                    'is_liked' => $articleService->isLiked($a->id),
                    'is_saved' => $articleService->isSaved($a->id),
                ]),
        ];
    }

    $latest_articles = Article::whereNotNull('published_at')
        ->orderByDesc('published_at')
        ->take(10)
        ->get()
        ->map(fn ($a) => [
            'slug' => $a->slug,
            'title' => $a->title_en,
            'excerpt' => $a->excerpt_en,
            'image' => $a->featured_image,
            'author' => $a->author_name,
            'premium' => $a->is_premium,
            'price' => $a->price,
            'published_human' => optional($a->published_at)->diffForHumans(),
            'likes_count' => $a->likes_count,
            'views_count' => $a->read_count,
            'comments_count' => $a->comments_count,
            'is_liked' => $articleService->isLiked($a->id),
            'is_saved' => $articleService->isSaved($a->id),
        ]);

    $market_prices = CommodityPrice::where('active', true)->get()->map(fn ($p) => [
        'name' => $p->name . ($p->country ? " ($p->country)" : ''),
        'price' => $p->price,
        'unit' => $p->unit,
        'note' => $p->note,
    ]);

    $webtv_videos = WebTvVideo::orderByDesc('published_at')->take(4)->get();

    $emissions = Emission::where('is_active', true)->orderBy('order')->get();

    $partners = Partner::where('is_active', true)->orderBy('order')->get();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'categories' => $categories,
        'featured' => $featured,
        'latest_by_category' => $latest_by_category,
        'latest_articles' => $latest_articles,
        'market_prices' => $market_prices,
        'webtv_videos' => $webtv_videos,
        'emissions' => $emissions,
        'partners' => $partners,
    ]);
});

use App\Http\Controllers\SearchController;

Route::get('/search', [SearchController::class, 'index'])->name('search.index');
Route::get('/api/search', [SearchController::class, 'apiSearch'])->name('api.search');

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\SubscriptionPlanController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\UserSubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\PaymentController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/checkout', [PaymentController::class, 'checkout'])->name('payment.checkout');
    Route::post('/payment/process', [PaymentController::class, 'process'])->name('payment.process');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::delete('articles/bulk-destroy', [ArticleController::class, 'bulkDestroy'])->name('articles.bulk-destroy');
    Route::resource('articles', ArticleController::class)->except(['show']);
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class)->names('categories');
    Route::resource('emissions', EmissionController::class)->except(['show']);

    // Admin Routes for Subscriptions and Payments
    Route::middleware(['auth'])->group(function () {
        Route::resource('subscription-plans', SubscriptionPlanController::class)->names('subscription-plans');
        Route::resource('payments', AdminPaymentController::class)->only(['index', 'show', 'update'])->names('payments');
        Route::resource('subscriptions', AdminSubscriptionController::class)->only(['index'])->names('subscriptions');
        
        // Settings
        Route::get('/settings/payment', [PaymentGatewayController::class, 'index'])->name('settings.payment');
        Route::post('/settings/payment', [PaymentGatewayController::class, 'store'])->name('settings.payment.store');
        Route::post('/settings/payment/upload-logo', [PaymentGatewayController::class, 'uploadLogo'])->name('settings.payment.upload-logo');
        Route::put('/settings/payment/{gateway}', [PaymentGatewayController::class, 'update'])->name('settings.payment.update');
        Route::delete('/settings/payment/{gateway}', [PaymentGatewayController::class, 'destroy'])->name('settings.payment.destroy');

        // New Admin Features
        Route::resource('comments', \App\Http\Controllers\Admin\CommentController::class)->only(['index', 'update', 'destroy'])->names('comments');
        Route::resource('pages', \App\Http\Controllers\Admin\PageController::class)->names('pages');
        Route::resource('widgets', \App\Http\Controllers\Admin\WidgetController::class)->names('widgets');
        Route::get('/settings/footer', [\App\Http\Controllers\Admin\FooterController::class, 'index'])->name('footer.index');
        Route::post('/settings/footer', [\App\Http\Controllers\Admin\FooterController::class, 'update'])->name('footer.update');
        Route::resource('polls', \App\Http\Controllers\Admin\PollController::class)->names('polls');
    });
});

use App\Http\Controllers\UserSubscriptionController;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // User Subscription & Dashboard Pages
    Route::get('/subscription', [UserSubscriptionController::class, 'index'])->name('user.subscription');
    Route::post('/subscription/cancel', [UserSubscriptionController::class, 'cancel'])->name('user.subscription.cancel');
    Route::get('/purchases', [PaymentController::class, 'history'])->name('user.purchases');
    Route::get('/saved-articles', [ArticleController::class, 'saved'])->name('user.saved-articles');
});

require __DIR__.'/auth.php';
