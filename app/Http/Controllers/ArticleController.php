<?php



namespace App\Http\Controllers;



use App\Http\Requests\ArticleRequest;

use App\Models\Article;

use App\Models\Category;

use App\Models\Comment;

use App\Models\CommentLike;

use App\Models\Payment;

use App\Models\SavedArticle;

use App\Models\SubscriptionPlan;

use App\Models\UserSubscription;

use App\Services\ArticleContentService;

use App\Services\ArticleService;

use App\Services\ArticleTransferService;

use Illuminate\Database\Eloquent\Builder;

use Illuminate\Http\RedirectResponse;

use Illuminate\Http\Request;

use Illuminate\Support\Carbon;

use Illuminate\Support\Facades\Mail;

use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Str;

use Inertia\Inertia;

use App\Mail\CategoryArticlePublished;

use Inertia\Response;

use Symfony\Component\HttpFoundation\StreamedResponse;



class ArticleController extends Controller

{

    public function __construct(

        protected ArticleService $articleService,

        protected ArticleContentService $articleContentService,

        protected ArticleTransferService $articleTransferService,

    ) {

    }



    public function index(Request $request): Response

    {

        $user = $this->ensureEditorialAccess();



        $articles = $this->buildDashboardQuery($request, $user)

            ->orderByDesc('created_at')

            ->paginate(12)

            ->withQueryString();



        $articles->setCollection(

            $articles->getCollection()->map(fn (Article $article) => $this->mapDashboardArticle($article))

        );



        return Inertia::render('Dashboard/Articles/Index', [

            'articles' => $articles,

            'filters' => $request->only(['search', 'status', 'type', 'category']),

            'categories' => Category::orderBy('name_fr', 'asc')->get(['id', 'name_fr']),

        ]);

    }



    public function create(): Response

    {

        $this->ensureEditorialAccess();



        return Inertia::render('Dashboard/Articles/Create', [

            'categories' => Category::orderBy('name_fr', 'asc')->get(['id', 'name_fr']),

        ]);

    }



    public function store(ArticleRequest $request): RedirectResponse

    {

        $user = $this->ensureEditorialAccess();

        $validated = $this->normalizeArticlePayload($request->validated(), $user->id);



        $article = Article::create($validated);



        if ($request->filled('categories')) {

            $article->categories()->sync($request->input('categories', []));



        if ($this->isPublishedArticle($article)) {

            $this->notifyFollowersForArticle($article);

        }

        }



        return redirect()

            ->route('dashboard.articles.edit', $article)

            ->with('success', 'Article cree avec succes.');

    }



    public function export(Request $request): StreamedResponse|RedirectResponse

    {

        $user = $this->ensureAdminAccess();

        $selectedIds = $this->extractSelectedIds($request);



        $query = $this->buildDashboardQuery($request, $user)

            ->with(['category', 'categories'])

            ->orderByDesc('created_at');



        if ($selectedIds->isNotEmpty()) {

            $query->whereIn('id', $selectedIds->all());

        }



        $articles = $query->get();



        if ($articles->isEmpty()) {

            return redirect()

                ->route('dashboard.articles.index')

                ->with('error', 'Aucun article a exporter pour cette selection.');

        }



        $payload = $this->articleTransferService->buildSiteExportPayload($articles);

        $filename = 'lerural-articles-' . now()->format('Ymd-His') . '.json';



        return response()->streamDownload(function () use ($payload) {

            echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        }, $filename, [

            'Content-Type' => 'application/json; charset=UTF-8',

        ]);

    }



    public function importSite(Request $request): RedirectResponse

    {

        $user = $this->ensureAdminAccess();



        $validated = $request->validate([

            'file' => ['required', 'file', 'max:20480', 'mimes:json,txt'],

            'publication_mode' => ['required', 'in:preserve,draft,published'],

        ]);



        try {

            $summary = $this->articleTransferService->importSiteJson(

                (string) file_get_contents($request->file('file')->getRealPath()),

                $validated['publication_mode'],

                $user->id,

                $user->name,

            );

        } catch (\Throwable $exception) {

            report($exception);



            return redirect()

                ->route('dashboard.articles.index')

                ->with('error', 'Import JSON impossible: ' . $exception->getMessage());

        }



        return redirect()

            ->route('dashboard.articles.index')

            ->with('success', $this->buildImportMessage('Import JSON', $summary));

    }



    public function importWordPress(Request $request): RedirectResponse

    {

        $user = $this->ensureAdminAccess();



        $validated = $request->validate([

            'file' => ['required', 'file', 'max:20480', 'mimes:xml,txt'],

            'publication_mode' => ['required', 'in:draft,published'],

        ]);



        try {

            $summary = $this->articleTransferService->importWordPressXml(

                (string) file_get_contents($request->file('file')->getRealPath()),

                $validated['publication_mode'],

                $user->id,

                $user->name,

            );

        } catch (\Throwable $exception) {

            report($exception);



            return redirect()

                ->route('dashboard.articles.index')

                ->with('error', 'Import WordPress impossible: ' . $exception->getMessage());

        }



        return redirect()

            ->route('dashboard.articles.index')

            ->with('success', $this->buildImportMessage('Import WordPress', $summary));

    }



    public function show(Request $request, string $slug): Response

    {

        $article = Article::where('slug', $slug)

            ->with(['category', 'categories'])

            ->firstOrFail();



        $viewer = $request->user();

        $canSeeUnapprovedComments = $viewer && in_array($viewer->role, ['admin', 'editor'], true);



        $baseCommentsQuery = $article->comments();

        if (!$canSeeUnapprovedComments) {

            $baseCommentsQuery->where('is_approved', true);

        }



        $commentsCount = (clone $baseCommentsQuery)->count();



        $likedCommentIds = [];

        if ($viewer) {

            $likedCommentIds = CommentLike::query()

                ->where('user_id', $viewer->id)

                ->pluck('comment_id')

                ->map(fn ($id) => (int) $id)

                ->all();

        }



        $rootCommentsQuery = $article->comments()->whereNull('parent_id');

        if (!$canSeeUnapprovedComments) {

            $rootCommentsQuery->where('is_approved', true);

        }



        $comments = $rootCommentsQuery

            ->with([

                'replies' => function ($replyQuery) use ($canSeeUnapprovedComments) {

                    if (!$canSeeUnapprovedComments) {

                        $replyQuery->where('is_approved', true);

                    }



                    $replyQuery->latest()->with([

                        'replies' => function ($nestedReplyQuery) use ($canSeeUnapprovedComments) {

                            if (!$canSeeUnapprovedComments) {

                                $nestedReplyQuery->where('is_approved', true);

                            }



                            $nestedReplyQuery->latest();

                        },

                    ]);

                },

            ])

            ->latest()

            ->get();



        if ($comments->isEmpty() && $commentsCount > 0) {

            $fallbackQuery = $article->comments();

            if (!$canSeeUnapprovedComments) {

                $fallbackQuery->where('is_approved', true);

            }



            $comments = $fallbackQuery

                ->with([

                    'replies' => function ($replyQuery) use ($canSeeUnapprovedComments) {

                        if (!$canSeeUnapprovedComments) {

                            $replyQuery->where('is_approved', true);

                        }



                        $replyQuery->latest();

                    },

                ])

                ->latest()

                ->get();

        }



        $setLikes = function (Comment $comment) use (&$setLikes, $likedCommentIds) {

            $comment->is_liked = in_array((int) $comment->id, $likedCommentIds, true);



            if ($comment->relationLoaded('replies') && $comment->replies->isNotEmpty()) {

                $comment->setRelation(

                    'replies',

                    $comment->replies->map(fn (Comment $reply) => $setLikes($reply))->values()

                );

            }



            return $comment;

        };



        $comments = $comments->map(fn (Comment $comment) => $setLikes($comment))->values();



        $article->increment('read_count');



                $renderedContent = $this->articleContentService->render($article->content_fr);
        $plainContent = $this->articleContentService->plainText($article->content_fr);
        $shareDescription = filled($article->meta_description ?? null)
            ? $this->articleContentService->cleanText($article->meta_description)
            : $this->articleContentService->excerpt($article->excerpt_fr, $article->content_fr, 180);
        $shareImage = $this->toSocialPreviewImageUrl($article->featured_image, asset('images/article-placeholder.svg'));
        $shareUrl = route('article.show', $article->slug);



        if (!$article->reading_time) {

            $article->reading_time = $this->articleContentService->readingTime($article->content_fr);

            $article->save();

        }



        $minSubscriptionPrice = SubscriptionPlan::min('price');

        $isLiked = $this->articleService->isLiked($article->id);

        $isSaved = $this->articleService->isSaved($article->id);

        $authorBio = null;
        if (!empty($article->author_id)) {
            $authorBio = \App\Models\User::whereKey($article->author_id)->value('bio');
        }
        if (blank($authorBio)) {
            $authorBio = \App\Models\User::where('name', $article->author_name)->value('bio');
        }
        $authorBio = filled($authorBio) ? trim((string) $authorBio) : null;



        $canRead = true;

        if ($article->is_premium) {

            $user = $request->user();



            if (!$user) {

                $canRead = false;

            } elseif (in_array($user->role, ['admin', 'editor'], true)) {

                $canRead = true;

            } else {

                $hasPurchased = Payment::where('user_id', $user->id)

                    ->where('payable_type', Article::class)

                    ->where('payable_id', $article->id)

                    ->where('status', 'completed')

                    ->exists();



                $hasSubscription = $this->hasSubscriptionScope($user->id, 'access_premium_articles');



                $canRead = $hasPurchased || $hasSubscription;

            }

        }



        $similarArticles = Article::where('id', '!=', $article->id)

            ->where(function ($query) use ($article) {

                if (Schema::hasColumn('articles', 'category_id') && !empty($article->category_id)) {

                    $query->where('category_id', $article->category_id);

                }



                if ($article->categories->isNotEmpty()) {

                    $categoryIds = $article->categories->pluck('id')->all();

                    $query->orWhereHas('categories', function ($categoryQuery) use ($categoryIds) {

                        $categoryQuery->whereIn('categories.id', $categoryIds);

                    });

                }

            })

            ->with(['category', 'categories'])

            ->published()

            ->inRandomOrder()

            ->take(3)

            ->get()

            ->map(function (Article $similarArticle) {

                $primaryCategory = $similarArticle->categories->first()?->name_fr

                    ?? $similarArticle->category?->name_fr

                    ?? 'Categorie';



                return [

                    'slug' => $similarArticle->slug,

                    'title' => $similarArticle->title_fr,

                    'excerpt' => $this->articleContentService->excerpt($similarArticle->excerpt_fr, $similarArticle->content_fr, 190),

                    'image' => $similarArticle->featured_image,

                    'image_position_x' => $similarArticle->featured_image_position_x,

                    'image_position_y' => $similarArticle->featured_image_position_y,

                    'premium' => $similarArticle->is_premium,

                    'price' => $similarArticle->price,

                    'published_human' => optional($similarArticle->published_at)->diffForHumans(),

                    'views_count' => $similarArticle->read_count,

                    'category' => $primaryCategory,

                    'likes_count' => $similarArticle->likes_count,

                    'is_liked' => $this->articleService->isLiked($similarArticle->id),

                ];

            });



        return Inertia::render('Article/Show', [

            'article' => [

                'id' => $article->id,

                'slug' => $article->slug,

                'title' => $article->title_fr,

                'content' => $canRead ? $renderedContent : nl2br(e(Str::limit($plainContent, 300))),

                'excerpt' => $this->articleContentService->excerpt($article->excerpt_fr, $article->content_fr, null),

                'share_description' => $shareDescription,

                'share_image' => $shareImage,

                'share_url' => $shareUrl,

                'image' => $article->featured_image,

                'image_position_x' => $article->featured_image_position_x,

                'image_position_y' => $article->featured_image_position_y,

                'author' => $article->author_name,

                'author_bio' => $authorBio,

                'published_at' => optional($article->published_at)->isoFormat('LL'),

                'published_human' => optional($article->published_at)->diffForHumans(),

                'read_time' => $article->reading_time,

                'likes_count' => $article->likes_count,

                'views_count' => $article->read_count,

                'comments_count' => $commentsCount,

                'comments' => $comments,

                'is_liked' => $isLiked,

                'is_saved' => $isSaved,

                'premium' => $article->is_premium,

                'price' => $article->price,

                'category' => $article->category,

                'categories' => $article->categories->map(fn ($category) => [

                    'name' => $category->name_fr,

                    'slug' => $category->slug,

                ]),

                'can_read' => $canRead,

            ],

            'min_subscription_price' => $minSubscriptionPrice,

            'similar_articles' => $similarArticles,

        ]);

    }

    public function edit(Article $article): Response

    {

        $this->ensureEditorialAccess();

        $this->authorizeArticleManagement($article);



        return Inertia::render('Dashboard/Articles/Edit', [

            'article' => $article->load('categories'),

            'categories' => Category::orderBy('name_fr', 'asc')->get(['id', 'name_fr']),

        ]);

    }



    public function update(ArticleRequest $request, Article $article): RedirectResponse

    {

        $user = $this->ensureEditorialAccess();

        $this->authorizeArticleManagement($article);



        $validated = $this->normalizeArticlePayload($request->validated(), $article->author_id ?? $user->id, $article->id);



        $wasPublished = $this->isPublishedArticle($article);

        $beforeCategoryIds = $article->categories()->pluck('categories.id')->map(fn ($id) => (int) $id)->sort()->values()->all();



        $article->update($validated);

        $article->categories()->sync($request->input('categories', []));



        $article->refresh();

        $isPublished = $this->isPublishedArticle($article);

        $afterCategoryIds = $article->categories()->pluck('categories.id')->map(fn ($id) => (int) $id)->sort()->values()->all();

        $categoriesChanged = $beforeCategoryIds !== $afterCategoryIds;



        if ($isPublished && (!$wasPublished || $categoriesChanged)) {

            $this->notifyFollowersForArticle($article);

        }



        return redirect()

            ->route('dashboard.articles.edit', $article)

            ->with('success', 'Article mis a jour avec succes.');

    }



    public function destroy(Article $article): RedirectResponse

    {

        $this->ensureEditorialAccess();

        $this->authorizeArticleManagement($article);



        $article->categories()->detach();

        $article->delete();



        return redirect()

            ->route('dashboard.articles.index')

            ->with('success', 'Article supprime avec succes.');

    }



    public function bulkDestroy(Request $request): RedirectResponse

    {

        $this->ensureEditorialAccess();



        $ids = collect($request->input('ids', []))

            ->filter()

            ->map(fn ($id) => (int) $id)

            ->unique()

            ->values();



        if ($ids->isEmpty()) {

            return redirect()

                ->route('dashboard.articles.index')

                ->with('error', 'Aucun article selectionne.');

        }



        $articles = Article::with('categories')->whereIn('id', $ids)->get();



        foreach ($articles as $article) {

            $this->authorizeArticleManagement($article);

        }



        foreach ($articles as $article) {

            $article->categories()->detach();

            $article->delete();

        }



        return redirect()

            ->route('dashboard.articles.index')

            ->with('success', 'Articles supprimes avec succes.');

    }



    public function saved(Request $request): Response

    {

        $articles = SavedArticle::query()

            ->where('user_id', $request->user()->id)

            ->with(['article.category', 'article.categories'])

            ->latest()

            ->paginate(12)

            ->through(function (SavedArticle $savedArticle) {

                $article = $savedArticle->article;

                $primaryCategory = $article?->categories->first()?->name_fr

                    ?? $article?->category?->name_fr

                    ?? 'Categorie';



                return [

                    'id' => $article?->id,

                    'title' => $article?->title_fr,

                    'slug' => $article?->slug,

                    'excerpt' => $this->articleContentService->excerpt($article?->excerpt_fr, $article?->content_fr, 180),

                    'image' => $article?->featured_image,

                    'image_position_x' => $article?->featured_image_position_x,

                    'image_position_y' => $article?->featured_image_position_y,

                    'category' => $primaryCategory,

                    'author' => $article?->author_name,

                    'premium' => (bool) $article?->is_premium,

                    'published_at' => optional($article?->published_at)->diffForHumans() ?? 'Brouillon',

                    'saved_at' => optional($savedArticle->created_at)->diffForHumans() ?? 'Maintenant',

                ];

            });



        return Inertia::render('Dashboard/SavedArticles', [

            'articles' => $articles,

        ]);

    }



    private function isPublishedArticle(Article $article): bool

    {

        return $article->published_at !== null && $article->published_at->lte(now());

    }



    private function notifyFollowersForArticle(Article $article): void

    {

        $article->loadMissing('categories');



        foreach ($article->categories as $category) {

            $emails = $category->followers()

                ->whereNotNull('email')

                ->pluck('email')

                ->filter()

                ->unique()

                ->values();



            foreach ($emails as $email) {

                try {

                    Mail::to($email)->send(new CategoryArticlePublished($category, $article));

                } catch (\Throwable $exception) {

                    report($exception);

                }

            }

        }

    }



    protected function ensureEditorialAccess()

    {

        $user = Auth::user();



        abort_unless($user && in_array($user->role, ['admin', 'editor'], true), 403, 'Unauthorized action.');



        return $user;

    }



    protected function ensureAdminAccess()

    {

        $user = Auth::user();



        abort_unless($user && $user->role === 'admin', 403, 'Unauthorized action.');



        return $user;

    }



    protected function authorizeArticleManagement(Article $article): void

    {

        $user = Auth::user();



        if ($user->role === 'admin') {

            return;

        }



        $canManage = (int) $article->author_id === (int) $user->id

            || (empty($article->author_id) && $article->author_name === $user->name);



        abort_unless($canManage, 403, 'Unauthorized action.');

    }



    protected function buildDashboardQuery(Request $request, $user): Builder

    {

        $query = Article::query()

            ->with(['category', 'categories'])

            ->withCount('comments');



        if ($user->role === 'editor') {

            $query->where(function ($builder) use ($user) {

                $builder->where('author_id', $user->id)

                    ->orWhere(function ($legacyQuery) use ($user) {

                        $legacyQuery->whereNull('author_id')

                            ->where('author_name', $user->name);

                    });

            });

        }



        if ($request->filled('search')) {

            $search = trim((string) $request->string('search'));



            $query->where(function ($builder) use ($search) {

                $builder->where('title_fr', 'like', "%{$search}%")

                    ->orWhere('title_en', 'like', "%{$search}%")

                    ->orWhere('excerpt_fr', 'like', "%{$search}%")

                    ->orWhere('excerpt_en', 'like', "%{$search}%")

                    ->orWhere('content_fr', 'like', "%{$search}%")

                    ->orWhere('content_en', 'like', "%{$search}%")

                    ->orWhere('author_name', 'like', "%{$search}%");

            });

        }



        $status = $request->string('status')->toString();

        if ($status === 'published') {

            $query->published();

        } elseif ($status === 'scheduled') {

            $query->whereNotNull('published_at')

                ->where('published_at', '>', now());

        } elseif ($status === 'draft') {

            $query->whereNull('published_at');

        }



        $type = $request->string('type')->toString();

        if ($type === 'premium') {

            $query->where('is_premium', true);

        } elseif ($type === 'free') {

            $query->where('is_premium', false);

        }



        $categoryId = $request->input('category');

        if (!empty($categoryId) && $categoryId !== 'all') {

            $query->where(function ($builder) use ($categoryId) {

                $builder->whereHas('categories', function ($categoryQuery) use ($categoryId) {

                    $categoryQuery->where('categories.id', $categoryId);

                });



                if (Schema::hasColumn('articles', 'category_id')) {

                    $builder->orWhere('category_id', $categoryId);

                }

            });

        }



        return $query;

    }



    protected function normalizeArticlePayload(array $validated, int $authorId, ?int $ignoreArticleId = null): array

    {

        $categories = array_map('intval', $validated['categories'] ?? []);

        $primaryCategoryId = $this->resolvePrimaryCategoryId($categories);

        $publicationMode = (string) ($validated['publication_mode'] ?? 'draft');



        $validated['title_en'] = $validated['title_en'] ?? '';

        $validated['excerpt_en'] = $validated['excerpt_en'] ?? '';

        $validated['content_en'] = $validated['content_en'] ?? '';
        $validated['meta_description'] = filled($validated['meta_description'] ?? null)
            ? trim((string) $validated['meta_description'])
            : trim((string) ($validated['excerpt_fr'] ?? ''));

        $validated['published_at'] = match ($publicationMode) {

            'now' => now()->format('Y-m-d H:i:s'),

            'scheduled' => !empty($validated['published_at'])

                ? Carbon::parse($validated['published_at'])->format('Y-m-d H:i:s')

                : null,

            default => null,

        };

        $validated['featured_until'] = !empty($validated['is_featured'])

            ? (!empty($validated['featured_until'])

                ? Carbon::parse($validated['featured_until'])->format('Y-m-d H:i:s')

                : null)

            : null;

        $validated['price'] = !empty($validated['is_premium']) ? ($validated['price'] ?: null) : null;

        $validated['featured_image_position_x'] = isset($validated['featured_image_position_x']) ? (int) $validated['featured_image_position_x'] : 50;

        $validated['featured_image_position_y'] = isset($validated['featured_image_position_y']) ? (int) $validated['featured_image_position_y'] : 50;

        $validated['author_id'] = $authorId;

        $validated['slug'] = $this->generateUniqueSlug($validated['title_fr'], $ignoreArticleId);



        if (Schema::hasColumn('articles', 'category_id')) {

            $validated['category_id'] = $primaryCategoryId;

        }



        unset($validated['publication_mode']);



        return $validated;

    }



    protected function hasSubscriptionScope(int $userId, string $scope): bool

    {

        $activeSubscriptions = UserSubscription::query()

            ->where('user_id', $userId)

            ->where('status', 'active')

            ->where('ends_at', '>', now())

            ->with('plan:id,features')

            ->get();



        foreach ($activeSubscriptions as $subscription) {

            $features = collect($subscription->plan?->features ?? [])

                ->map(fn ($feature) => (string) $feature)

                ->filter();



            // Backward compatibility: old plans without feature list keep full access.

            if ($features->isEmpty()) {

                return true;

            }



            if ($features->contains($scope)) {

                return true;

            }

        }



        return false;

    }



    protected function resolvePrimaryCategoryId(array $categories): ?int

    {

        return !empty($categories) ? (int) $categories[0] : null;

    }



    protected function generateUniqueSlug(string $title, ?int $ignoreArticleId = null): string

    {

        $baseSlug = Str::slug($title);

        $slug = $baseSlug !== '' ? $baseSlug : 'article';

        $counter = 2;



        while (

            Article::query()

                ->when($ignoreArticleId, fn ($query) => $query->where('id', '!=', $ignoreArticleId))

                ->where('slug', $slug)

                ->exists()

        ) {

            $slug = $baseSlug !== '' ? $baseSlug . '-' . $counter : 'article-' . $counter;

            $counter++;

        }



        return $slug;

    }



    protected function mapDashboardArticle(Article $article): array

    {

        $primaryCategory = $article->categories->first()?->name_fr

            ?? $article->category?->name_fr

            ?? 'Sans categorie';



        $isScheduled = filled($article->published_at) && $article->published_at > now();

        $isPublished = filled($article->published_at) && !$isScheduled;



        return [

            'id' => $article->id,

            'title' => $article->title_fr,

            'slug' => $article->slug,

            'category' => $primaryCategory,

            'author' => $article->author_name,

            'status' => $isPublished ? 'Publie' : ($isScheduled ? 'Programme' : 'Brouillon'),

            'published_at' => optional($article->published_at)->format('d/m/Y H:i') ?? 'Non publie',

            'views_count' => $article->read_count,

            'image' => $article->featured_image,

            'is_premium' => (bool) $article->is_premium,

            'is_featured' => (bool) $article->is_featured,

            'price' => $article->price,

        ];

    }



    protected function extractSelectedIds(Request $request)

    {

        $ids = $request->input('ids', []);



        if (is_string($ids)) {

            $ids = array_filter(array_map('trim', explode(',', $ids)));

        }



        return collect($ids)

            ->flatten()

            ->map(fn ($id) => (int) $id)

            ->filter()

            ->unique()

            ->values();
    }

    private function toSocialPreviewImageUrl(?string $path, string $fallback): string
    {
        $publicUrl = $this->toPublicUrl($path, $fallback);

        if (!Str::contains($publicUrl, 'res.cloudinary.com')) {
            return $publicUrl;
        }

        return preg_replace(
            '#/upload/(?!v\d+/)#',
            '/upload/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/',
            $publicUrl,
            1
        ) ?? $publicUrl;
    }

    private function toPublicUrl(?string $path, string $fallback): string
    {
        if (!filled($path)) {
            return $fallback;
        }

        $value = trim((string) $path);

        if (Str::startsWith($value, ['http://', 'https://', '//'])) {
            return $value;
        }

        return url($value);
    }

    protected function buildImportMessage(string $label, array $summary): string

    {

        $message = sprintf('%s termine: %d article(s) importes.', $label, $summary['imported']);



        if (($summary['skipped'] ?? 0) > 0) {

            $message .= sprintf(' %d ignore(s).', $summary['skipped']);

        }



        if (!empty($summary['errors'])) {

            $message .= ' ' . Str::limit(implode(' ', $summary['errors']), 220);

        }



        return $message;

    }

}











