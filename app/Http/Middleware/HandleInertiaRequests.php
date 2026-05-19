<?php

namespace App\Http\Middleware;

use App\Models\PollVote;
use App\Models\PromoCode;
use App\Models\UserSubscription;
use App\Services\CacheService;
use App\Services\SharedContentService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $hasActiveSubscription = false;
        if ($user) {
            $hasActiveSubscription = UserSubscription::query()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->where(function ($query) {
                    $query->whereNull('ends_at')
                        ->orWhere('ends_at', '>', now());
                })
                ->exists();
        }

        PromoCode::ensureDefaultCode();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'has_active_subscription' => $hasActiveSubscription,
            ],
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
                        'locale' => app()->getLocale(),
            'seo' => fn () => [
                'title' => config('app.name', 'LE RURAL'),
                'slogan' => CacheService::seoDefaults()['slogan'],
                'description' => CacheService::seoDefaults()['description'],
                'image' => url(CacheService::seoDefaults()['image']),
                'url' => $request->fullUrl(),
                'type' => $request->routeIs('article.show') ? 'article' : 'website',
                'locale' => Str::of(app()->getLocale())->replace('_', '-')->toString(),
                        ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'widgets' => function () use ($request) {
                // Récupère les sondages depuis le cache
                $cachedPolls = CacheService::activePolls();
                $pollsData = collect();

                if (!empty($cachedPolls)) {
                    $votedPolls = json_decode($request->cookie('voted_polls', '[]'), true);
                    if (!is_array($votedPolls)) {
                        $votedPolls = [];
                    }

                    $ip = $request->ip();
                    $sessionId = $request->session()->getId();

                    // Récupère les IDs des sondages votés par cet utilisateur (une seule requête)
                    $pollIds = collect($cachedPolls)->pluck('id')->all();
                    $votedPollIds = PollVote::whereIn('poll_id', $pollIds)
                        ->where(function ($query) use ($ip, $sessionId) {
                            $query->where('ip_address', $ip)
                                ->orWhere('session_id', $sessionId);
                        })
                        ->pluck('poll_id')
                        ->map(fn ($id) => (int) $id)
                        ->all();

                    $pollsData = collect($cachedPolls)->map(function ($poll) use ($votedPolls, $votedPollIds) {
                        $userHasVoted = in_array($poll['id'], $votedPolls) || in_array($poll['id'], $votedPollIds);

                        return [
                            'id' => $poll['id'],
                            'question' => $poll['question'],
                            'options' => $poll['options'],
                            'user_has_voted' => $userHasVoted,
                        ];
                    });
                }

                return [
                    'polls' => $pollsData,
                    'poll' => $pollsData->first() ?? null,
                    'quote' => CacheService::randomQuote(),
                    'did_you_know' => CacheService::randomDidYouKnow(),
                    'agenda' => CacheService::upcomingAgenda(),
                                ];
            },
            'categories' => fn () => CacheService::categories(),
            'settings' => fn () => CacheService::settings(),
            'promo_offer' => fn () => CacheService::featuredPromo(),
            'footer_pages' => fn () => CacheService::footerPages(),
            'shared_content' => fn () => cache()->remember('shared_content:v1', now()->addHours(1), fn () => app(SharedContentService::class)->get()),
        ]);
    }
}
