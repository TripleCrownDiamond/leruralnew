<?php

use App\Http\Controllers\ArticleController;use App\Http\Controllers\CategoryController;use App\Http\Controllers\PageController;use App\Http\Controllers\EmissionController;use App\Http\Controllers\ProfileController;use App\Http\Controllers\ArticleLikeController;use App\Models\Category;use App\Models\Article;use App\Models\CommodityPrice;use App\Models\WebTvVideo;use App\Models\Partner;use App\Models\Emission;use App\Models\Comment;use Illuminate\Foundation\Application;use Illuminate\Support\Facades\Route;use Illuminate\Support\Str;use Inertia\Inertia;use App\Services\ArticleService;use App\Http\Controllers\Admin\PaymentGatewayController;use App\Http\Controllers\Admin\SettingController;Route::get('/', function (ArticleService $articleService) {    $categoriesCollection = Category::published()->orderBy('order')->get();    $categories = $categoriesCollection->map(fn ($c) => [        'slug' => $c->slug,        'name' => $c->name_fr,    ]);    $featuredArticles = Article::featured()        ->published()        ->orderByDesc('published_at')        ->take(5)        ->get();    if ($featuredArticles->isEmpty()) {        $featuredArticles = Article::published()            ->orderByDesc('published_at')            ->take(5)            ->get();    }    $featured = $featuredArticles->map(fn ($a) => [            'slug' => $a->slug,            'title' => $a->title_fr,            'excerpt' => $a->excerpt_fr,            'content' => strip_tags((string) ($a->content_fr ?? '')),            'image' => $a->featured_image,            'author' => $a->author_name,            'premium' => $a->is_premium,            'price' => $a->price,            'published_human' => optional($a->published_at)->diffForHumans(),            'likes_count' => $a->likes_count,            'views_count' => $a->read_count,            'comments_count' => $a->comments_count,            'is_liked' => $articleService->isLiked($a->id),            'is_saved' => $articleService->isSaved($a->id),            'category' => $a->categories->first() ? $a->categories->first()->name_fr : 'Non classe',        ]);    $latest_by_category = [];    foreach ($categoriesCollection as $c) {        $latest_by_category[$c->slug] = [            'name' => $c->name_fr,            'articles' => Article::whereHas('categories', function ($q) use ($c) {                    $q->where('categories.id', $c->id);                })                ->whereNotNull('published_at')                ->where('published_at', '<=', now())                ->orderByDesc('published_at')                ->take(6)                ->get()                ->map(fn ($a) => [                    'slug' => $a->slug,                    'title' => $a->title_fr,                    'excerpt' => $a->excerpt_fr,            'content' => strip_tags((string) ($a->content_fr ?? '')),                    'image' => $a->featured_image,                    'author' => $a->author_name,                    'premium' => $a->is_premium,                    'price' => $a->price,                    'published_human' => optional($a->published_at)->diffForHumans(),                    'likes_count' => $a->likes_count,                    'views_count' => $a->read_count,                    'comments_count' => $a->comments_count,                    'is_liked' => $articleService->isLiked($a->id),                    'is_saved' => $articleService->isSaved($a->id),                    'category' => $c->name_fr,                ]),        ];    }    $latest_articles = Article::whereNotNull('published_at')        ->where('published_at', '<=', now())        ->with('categories')        ->orderByDesc('published_at')        ->take(10)        ->get()        ->map(fn ($a) => [            'slug' => $a->slug,            'title' => $a->title_fr,            'excerpt' => $a->excerpt_fr,            'content' => strip_tags((string) ($a->content_fr ?? '')),            'image' => $a->featured_image,            'author' => $a->author_name,            'premium' => $a->is_premium,            'price' => $a->price,            'published_human' => optional($a->published_at)->diffForHumans(),            'likes_count' => $a->likes_count,            'views_count' => $a->read_count,            'comments_count' => $a->comments_count,            'is_liked' => $articleService->isLiked($a->id),            'is_saved' => $articleService->isSaved($a->id),            'category' => $a->categories->first() ? $a->categories->first()->name_fr : 'Non classe',        ]);    $market_prices = CommodityPrice::where('active', true)->get()->map(fn ($p) => [        'name' => $p->name . ($p->country ? " ($p->country)" : ''),        'price' => $p->price,        'unit' => $p->unit,        'note' => $p->note,    ]);    $webtv_videos = WebTvVideo::orderByDesc('published_at')->take(4)->get();        $emissions = Emission::where('is_active', true)->orderBy('order')->get();    $partners = Partner::where('is_active', true)->orderBy('order')->get();    $latest_comments = Comment::where('is_approved', true)        ->with('article')        ->latest()        ->take(30)        ->get()        ->map(fn ($c) => [            'author_name' => $c->author_name,            'content' => Str::limit($c->content, 100),            'article_title' => $c->article ? Str::limit($c->article->title_fr, 40) : 'Article supprime',        ]);    return Inertia::render('Welcome', [        'canLogin' => Route::has('login'),        'canRegister' => Route::has('register'),        'laravelVersion' => Application::VERSION,        'phpVersion' => PHP_VERSION,        'categories' => $categories,        'featured' => $featured,        'latest_by_category' => $latest_by_category,        'latest_articles' => $latest_articles,        'market_prices' => $market_prices,        'webtv_videos' => $webtv_videos,        'emissions' => $emissions,        'partners' => $partners,        'latest_comments' => $latest_comments,        'min_subscription_price' => \App\Models\SubscriptionPlan::query()->min('price'),    ]);});Route::get('/categorie/{slug}', [CategoryController::class, 'show'])->name('category.show');Route::get('/article/{slug}', [ArticleController::class, 'show'])->name('article.show');Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/a-propos', [PageController::class, 'about'])->name('about');

// SAFEB 2026 - Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin
use App\Http\Controllers\SafebController;
Route::get('/safeb', [SafebController::class, 'index'])->name('safeb.index');
Route::get('/safeb/inscription/{type}', [SafebController::class, 'registerForm'])->name('safeb.register.form');
Route::post('/safeb/inscription', [SafebController::class, 'register'])->name('safeb.register');
Route::get('/safeb/brochure.pdf', [SafebController::class, 'downloadPdf'])->name('safeb.pdf');use App\Http\Controllers\PollController;use App\Http\Controllers\CommentController;use App\Http\Controllers\NewsletterController;use App\Http\Controllers\SavedArticleController;Route::post('/polls/{poll}/vote', [PollController::class, 'vote'])->name('polls.vote');Route::post('/articles/{slug}/like', [ArticleLikeController::class, 'toggle'])->name('articles.like');Route::post('/articles/{slug}/save', [SavedArticleController::class, 'toggle'])->name('articles.save');Route::post('/articles/{article}/comments', [CommentController::class, 'store'])->name('comments.store');Route::post('/comments/{comment}/like', [CommentController::class, 'toggleLike'])->name('comments.like');Route::post('/newsletter', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');Route::get('/api/search', [SearchController::class, 'index'])->name('api.search');Route::get('/en', function (ArticleService $articleService) {    $categoriesCollection = Category::published()->orderBy('order')->get();    $categories = $categoriesCollection->map(fn ($c) => [        'slug' => $c->slug,        'name' => $c->name_en,    ]);    $featuredArticles = Article::featured()        ->published()        ->orderByDesc('published_at')        ->take(5)        ->get();    if ($featuredArticles->isEmpty()) {        $featuredArticles = Article::published()            ->orderByDesc('published_at')            ->take(5)            ->get();    }$featured = $featuredArticles->map(fn ($a) => [                'slug' => $a->slug,                'title' => $a->title_en,                'excerpt' => $a->excerpt_en,            'content' => strip_tags((string) ($a->content_en ?? '')),                'image' => $a->featured_image,                'author' => $a->author_name,                'premium' => $a->is_premium,                'price' => $a->price,                'published_human' => optional($a->published_at)->diffForHumans(),                'likes_count' => $a->likes_count,                'views_count' => $a->read_count,                'comments_count' => $a->comments_count,                'is_liked' => $articleService->isLiked($a->id),                'is_saved' => $articleService->isSaved($a->id),            ]);    $latest_by_category = [];    foreach ($categoriesCollection as $c) {        $latest_by_category[$c->slug] = [            'name' => $c->name_en,            'articles' => Article::where('category_id', $c->id)                ->orderByDesc('published_at')                ->take(6)                ->get()                ->map(fn ($a) => [                    'slug' => $a->slug,                    'title' => $a->title_en,                    'excerpt' => $a->excerpt_en,            'content' => strip_tags((string) ($a->content_en ?? '')),                    'image' => $a->featured_image,                    'author' => $a->author_name,                    'premium' => $a->is_premium,                    'price' => $a->price,                    'published_human' => optional($a->published_at)->diffForHumans(),                    'likes_count' => $a->likes_count,                    'views_count' => $a->read_count,                    'comments_count' => $a->comments_count,                    'is_liked' => $articleService->isLiked($a->id),                    'is_saved' => $articleService->isSaved($a->id),                ]),        ];    }    $latest_articles = Article::whereNotNull('published_at')        ->orderByDesc('published_at')        ->take(10)        ->get()        ->map(fn ($a) => [            'slug' => $a->slug,            'title' => $a->title_en,            'excerpt' => $a->excerpt_en,            'content' => strip_tags((string) ($a->content_en ?? '')),            'image' => $a->featured_image,            'author' => $a->author_name,            'premium' => $a->is_premium,            'price' => $a->price,            'published_human' => optional($a->published_at)->diffForHumans(),            'likes_count' => $a->likes_count,            'views_count' => $a->read_count,            'comments_count' => $a->comments_count,            'is_liked' => $articleService->isLiked($a->id),            'is_saved' => $articleService->isSaved($a->id),        ]);    $market_prices = CommodityPrice::where('active', true)->get()->map(fn ($p) => [        'name' => $p->name . ($p->country ? " ($p->country)" : ''),        'price' => $p->price,        'unit' => $p->unit,        'note' => $p->note,    ]);    $webtv_videos = WebTvVideo::orderByDesc('published_at')->take(4)->get();    $emissions = Emission::where('is_active', true)->orderBy('order')->get();    $partners = Partner::where('is_active', true)->orderBy('order')->get();    return Inertia::render('Welcome', [        'canLogin' => Route::has('login'),        'canRegister' => Route::has('register'),        'laravelVersion' => Application::VERSION,        'phpVersion' => PHP_VERSION,        'categories' => $categories,        'featured' => $featured,        'latest_by_category' => $latest_by_category,        'latest_articles' => $latest_articles,        'market_prices' => $market_prices,        'webtv_videos' => $webtv_videos,        'emissions' => $emissions,        'partners' => $partners,    ]);});use App\Http\Controllers\SearchController;Route::get('/search', [SearchController::class, 'index'])->name('search.index');Route::get('/api/search', [SearchController::class, 'apiSearch'])->name('api.search');use App\Http\Controllers\DashboardController;use App\Http\Controllers\Admin\SubscriptionPlanController;use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;use App\Http\Controllers\Admin\UserSubscriptionController as AdminSubscriptionController;use App\Http\Controllers\PaymentController;Route::middleware(['auth', 'verified'])->group(function () {    Route::get('/checkout', [PaymentController::class, 'checkout'])->name('payment.checkout');    Route::post('/payment/process', [PaymentController::class, 'process'])->name('payment.process');});Route::get('/dashboard', [DashboardController::class, 'index'])    ->middleware(['auth', 'verified'])    ->name('dashboard');Route::middleware(['auth', 'verified', 'role:admin,editor'])->prefix('dashboard')->name('dashboard.')->group(function () {    Route::delete('articles/bulk-destroy', [ArticleController::class, 'bulkDestroy'])->name('articles.bulk-destroy');    Route::resource('articles', ArticleController::class)->except(['show']);    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class)->names('categories');    Route::resource('emissions', EmissionController::class)->except(['show']);    Route::middleware(['auth'])->group(function () {        Route::resource('subscription-plans', SubscriptionPlanController::class)->names('subscription-plans');        Route::resource('payments', AdminPaymentController::class)->only(['index', 'show', 'update'])->names('payments');        Route::resource('subscriptions', AdminSubscriptionController::class)->only(['index'])->names('subscriptions');                Route::get('/settings/payment', [PaymentGatewayController::class, 'index'])->name('settings.payment');        Route::post('/settings/payment', [PaymentGatewayController::class, 'store'])->name('settings.payment.store');        Route::post('/settings/payment/upload-logo', [PaymentGatewayController::class, 'uploadLogo'])->name('settings.payment.upload-logo');        Route::put('/settings/payment/{gateway}', [PaymentGatewayController::class, 'update'])->name('settings.payment.update');        Route::delete('/settings/payment/{gateway}', [PaymentGatewayController::class, 'destroy'])->name('settings.payment.destroy');        Route::get('/settings/socials', [SettingController::class, 'socials'])->name('settings.socials');        Route::put('/settings/socials', [SettingController::class, 'updateSocials'])->name('settings.socials.update');        Route::get('/settings/integrations', [SettingController::class, 'integrations'])->name('settings.integrations');        Route::put('/settings/integrations', [SettingController::class, 'updateIntegrations'])->name('settings.integrations.update');        Route::resource('comments', \App\Http\Controllers\Admin\CommentController::class)->only(['index', 'update', 'destroy'])->names('comments');        Route::resource('pages', \App\Http\Controllers\Admin\PageController::class)->names('pages');        Route::resource('widgets', \App\Http\Controllers\Admin\WidgetController::class)->names('widgets');        Route::get('/settings/footer', [\App\Http\Controllers\Admin\FooterController::class, 'index'])->name('footer.index');        Route::post('/settings/footer', [\App\Http\Controllers\Admin\FooterController::class, 'update'])->name('footer.update');        Route::resource('polls', \App\Http\Controllers\Admin\PollController::class)->names('polls');    });});use App\Http\Controllers\UserSubscriptionController;Route::middleware('auth')->group(function () {    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');        Route::get('/subscription', [UserSubscriptionController::class, 'index'])->name('user.subscription');    Route::post('/subscription/cancel', [UserSubscriptionController::class, 'cancel'])->name('user.subscription.cancel');    Route::get('/purchases', [PaymentController::class, 'history'])->name('user.purchases');
    Route::get('/purchases/{payment}/invoice', [PaymentController::class, 'invoice'])->name('user.purchases.invoice');    Route::get('/saved-articles', [ArticleController::class, 'saved'])->name('user.saved-articles');});require __DIR__.'/auth.php';
// Additional commerce, media and moderation routes
Route::get('/nos-journaux', [\App\Http\Controllers\PressPaperController::class, 'index'])->name('press-papers.index');
Route::get('/presse-ecrite', fn () => redirect()->route('press-papers.index', [], 301));
Route::get('/presse-papier', fn () => redirect()->route('press-papers.index', [], 301));
Route::get('/nos-journaux/{pressPaper:slug}/telecharger', [\App\Http\Controllers\PressPaperController::class, 'download'])->middleware('auth')->name('press-papers.download');
Route::get('/presse-ecrite/{pressPaper:slug}/telecharger', fn (\App\Models\PressPaper $pressPaper) => redirect()->route('press-papers.download', $pressPaper->slug))->middleware('auth');

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::resource('press-papers', \App\Http\Controllers\Admin\PressPaperController::class)
        ->except(['show', 'create', 'edit'])
        ->names('press-papers');

    Route::resource('live-streams', \App\Http\Controllers\Admin\LiveStreamController::class)
        ->except(['show', 'create', 'edit'])
        ->names('live-streams');

    Route::resource('advertisements', \App\Http\Controllers\Admin\AdvertisementController::class)
        ->except(['show', 'create', 'edit'])
        ->names('advertisements');

    Route::get('comments/settings', [\App\Http\Controllers\Admin\CommentController::class, 'settings'])->name('comments.settings');
    Route::post('comments/{comment}/approve', [\App\Http\Controllers\Admin\CommentController::class, 'approve'])->name('comments.approve');
    Route::post('comments/{comment}/reply', [\App\Http\Controllers\Admin\CommentController::class, 'reply'])->name('comments.reply');
    Route::post('comments/{comment}/reject', [\App\Http\Controllers\Admin\CommentController::class, 'reject'])->name('comments.reject');
    Route::post('comments/bulk-approve', [\App\Http\Controllers\Admin\CommentController::class, 'bulkApprove'])->name('comments.bulk-approve');
    Route::post('comments/bulk-reject', [\App\Http\Controllers\Admin\CommentController::class, 'bulkReject'])->name('comments.bulk-reject');
    Route::post('comments/bulk-delete', [\App\Http\Controllers\Admin\CommentController::class, 'bulkDelete'])->name('comments.bulk-delete');
    Route::post('comments/update-auto-moderation', [\App\Http\Controllers\Admin\CommentController::class, 'updateAutoModeration'])->name('comments.update-auto-moderation');

    Route::post('polls/bulk-delete', [\App\Http\Controllers\Admin\PollController::class, 'bulkDelete'])->name('polls.bulk-delete');
    Route::match(['get', 'post'], 'polls/export-selected/{format}', [\App\Http\Controllers\Admin\PollController::class, 'exportSelected'])->name('polls.export-selected');
    Route::get('polls/export-all/{format}', [\App\Http\Controllers\Admin\PollController::class, 'exportAll'])->name('polls.export-all');
    Route::get('polls/{poll}/results', [\App\Http\Controllers\Admin\PollController::class, 'results'])->name('polls.results');
    Route::get('polls/{poll}/export', [\App\Http\Controllers\Admin\PollController::class, 'export'])->name('polls.export');
});

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('media', [\App\Http\Controllers\Admin\MediaLibraryController::class, 'index'])->name('media.index');
    Route::get('media/library', [\App\Http\Controllers\Admin\MediaLibraryController::class, 'library'])->name('media.library');
    Route::post('media', [\App\Http\Controllers\Admin\MediaLibraryController::class, 'store'])->name('media.store');
    Route::delete('media/{media}', [\App\Http\Controllers\Admin\MediaLibraryController::class, 'destroy'])->name('media.destroy');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('settings/whatsapp', [\App\Http\Controllers\Admin\SettingController::class, 'whatsapp'])->name('settings.whatsapp');
    Route::put('settings/whatsapp', [\App\Http\Controllers\Admin\SettingController::class, 'updateWhatsapp'])->name('settings.whatsapp.update');
});


Route::middleware(['auth', 'verified', 'role:admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::resource('announcements', \App\Http\Controllers\Admin\AnnouncementController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('announcements');

    Route::resource('static-pages', \App\Http\Controllers\Admin\StaticPageController::class)
        ->except(['show'])
        ->names('static-pages');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::resource('web-tv', \App\Http\Controllers\Admin\WebTvVideoController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('web-tv');

    Route::resource('commodity-prices', \App\Http\Controllers\Admin\CommodityPriceController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('commodity-prices');

    Route::resource('agendas', \App\Http\Controllers\Admin\AgendaController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('agendas');

    Route::get('safeb-registrations/export', [\App\Http\Controllers\Admin\SafebRegistrationController::class, 'exportCsv'])
        ->name('safeb-registrations.export');
    Route::post('safeb-registrations/bulk-status', [\App\Http\Controllers\Admin\SafebRegistrationController::class, 'bulkStatusChange'])
        ->name('safeb-registrations.bulk-status');
    Route::post('safeb-registrations/bulk-delete', [\App\Http\Controllers\Admin\SafebRegistrationController::class, 'bulkDelete'])
        ->name('safeb-registrations.bulk-delete');
    Route::resource('safeb-registrations', \App\Http\Controllers\Admin\SafebRegistrationController::class)
        ->only(['index', 'update', 'destroy'])
        ->names('safeb-registrations');

    Route::get('safeb-settings', [\App\Http\Controllers\Admin\SafebSettingController::class, 'index'])->name('safeb-settings.index');
    Route::post('safeb-settings', [\App\Http\Controllers\Admin\SafebSettingController::class, 'update'])->name('safeb-settings.update');
    Route::post('safeb-settings/reset/{section}', [\App\Http\Controllers\Admin\SafebSettingController::class, 'reset'])->name('safeb-settings.reset');

    Route::get('stats', [\App\Http\Controllers\Admin\StatsController::class, 'index'])->name('stats.index');
    Route::get('stats/export/{dataset}', [\App\Http\Controllers\Admin\StatsController::class, 'exportCsv'])->name('stats.export');

    Route::resource('partners', \App\Http\Controllers\Admin\PartnerController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('partners');

    Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->names('users');
    Route::delete('users/bulk-delete', [\App\Http\Controllers\Admin\UserController::class, 'bulkDelete'])->name('users.bulk-delete');
    Route::post('users/bulk-resend-verification', [\App\Http\Controllers\Admin\UserController::class, 'bulkResendVerification'])->name('users.bulk-resend-verification');
    Route::post('users/{user}/resend-invitation', [\App\Http\Controllers\Admin\UserController::class, 'resendInvitation'])->name('users.resend-invitation');
    Route::post('users/{user}/resend-verification', [\App\Http\Controllers\Admin\UserController::class, 'resendVerification'])->name('users.resend-verification');
    Route::patch('users/{user}/update-status', [\App\Http\Controllers\Admin\UserController::class, 'updateStatus'])->name('users.update-status');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::resource('promo-codes', \App\Http\Controllers\Admin\PromoCodeController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('promo-codes');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::match(['post','patch'], 'promo-codes/{promoCode}/toggle-active', [\App\Http\Controllers\Admin\PromoCodeController::class, 'toggleActive'])->name('promo-codes.toggle-active');
    Route::match(['post','patch'], 'promo-codes/{promoCode}/toggle-featured', [\App\Http\Controllers\Admin\PromoCodeController::class, 'toggleFeatured'])->name('promo-codes.toggle-featured');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/payment/success/{payment}', [\App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/payment/failed', [\App\Http\Controllers\PaymentController::class, 'failed'])->name('payment.failed');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/categories/{category:slug}/follow', [\App\Http\Controllers\CategoryFollowController::class, 'store'])->name('categories.follow');
    Route::delete('/categories/{category:slug}/follow', [\App\Http\Controllers\CategoryFollowController::class, 'destroy'])->name('categories.unfollow');
});

// Routes pour les notifications
Route::middleware(['auth'])->prefix('api/notifications')->name('notifications.')->group(function () {
    Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
    Route::post('/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('read');
    Route::post('/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('read-all');
    Route::delete('/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
    Route::get('/preferences', [\App\Http\Controllers\NotificationController::class, 'preferences'])->name('preferences');
    Route::put('/preferences', [\App\Http\Controllers\NotificationController::class, 'updatePreferences'])->name('preferences.update');
});
Route::get('/direct', fn () => Inertia::render('Live/Index'))->name('live.index');
Route::get('/live', fn () => redirect()->route('live.index', [], 301));
Route::get('/streaming', fn () => redirect()->route('live.index', [], 301));
Route::get('/public-media/{path}', [\App\Http\Controllers\PublicMediaController::class, 'show'])->where('path', '.*')->name('media.public');
// Temps passe sur une page, renvoye par le navigateur en quittant celle-ci.
// Le prefixe api/ est deja exclu du suivi, l'appel ne cree donc pas de visite.
Route::post('/api/page-time', [\App\Http\Controllers\PageTimeController::class, 'store'])->name('page-time.store');
Route::get('/public-advertisements/{advertisement}/view', [\App\Http\Controllers\AdvertisementTrackingController::class, 'view'])->name('public-advertisements.view');
Route::get('/public-advertisements/{advertisement}/click', [\App\Http\Controllers\AdvertisementTrackingController::class, 'click'])->name('public-advertisements.click');

