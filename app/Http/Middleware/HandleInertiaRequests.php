<?php

namespace App\Http\Middleware;

use App\Models\Agenda;
use App\Models\Category;
use App\Models\DidYouKnow;
use App\Models\Poll;
use App\Models\PollVote;
use App\Models\PromoCode;
use App\Models\Quote;
use App\Models\Setting;
use App\Models\StaticPage;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Services\SharedContentService;
use Illuminate\Http\Request;
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
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'widgets' => function () use ($request) {
                $polls = Poll::with('options')
                    ->where('is_active', true)
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    })
                    ->latest()
                    ->get();

                $pollsData = collect();

                if ($polls->isNotEmpty()) {
                    $votedPolls = json_decode($request->cookie('voted_polls', '[]'), true);
                    if (!is_array($votedPolls)) {
                        $votedPolls = [];
                    }

                    $ip = $request->ip();
                    $sessionId = $request->session()->getId();

                    $pollsData = $polls->map(function ($poll) use ($votedPolls, $ip, $sessionId) {
                        $userHasVoted = in_array($poll->id, $votedPolls);

                        if (!$userHasVoted) {
                            $userHasVoted = PollVote::where('poll_id', $poll->id)
                                ->where(function ($query) use ($ip, $sessionId) {
                                    $query->where('ip_address', $ip)
                                        ->orWhere('session_id', $sessionId);
                                })
                                ->exists();
                        }

                        return [
                            'id' => $poll->id,
                            'question' => $poll->question,
                            'options' => $poll->options->map(fn ($option) => [
                                'id' => $option->id,
                                'label' => $option->label,
                                'votes' => $option->votes,
                            ]),
                            'user_has_voted' => $userHasVoted,
                        ];
                    });
                }

                $quote = Quote::where('is_active', true)->inRandomOrder()->first();
                $didYouKnow = DidYouKnow::where('is_active', true)->inRandomOrder()->first();
                $agenda = Agenda::where('is_active', true)
                    ->whereDate('date', '>=', now())
                    ->orderBy('date')
                    ->orderBy('time')
                    ->take(6)
                    ->get()
                    ->map(fn ($event) => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'description' => $event->description,
                        'date' => $event->date->format('d M'),
                        'time' => $event->time,
                        'location' => $event->location,
                    ]);

                return [
                    'polls' => $pollsData,
                    'poll' => $pollsData->first() ?? null,
                    'quote' => $quote ? [
                        'content' => $quote->content,
                        'author' => $quote->author,
                    ] : null,
                    'did_you_know' => $didYouKnow ? [
                        'content' => $didYouKnow->content,
                    ] : null,
                    'agenda' => $agenda,
                ];
            },
            'categories' => function () {
                return Category::published()->orderBy('order')->get()->map(fn ($category) => [
                    'slug' => $category->slug,
                    'name' => $category->name_fr,
                ]);
            },
            'settings' => fn () => Setting::pluck('value', 'key')->all(),
            'promo_offer' => fn () => optional(PromoCode::currentFeatured(), function (PromoCode $promo): array {
                $targetPlans = collect();

                if (method_exists($promo, 'targetedSubscriptionPlanIds')) {
                    $targetIds = $promo->targetedSubscriptionPlanIds();
                    if ($targetIds->isNotEmpty()) {
                        $targetPlans = SubscriptionPlan::query()
                            ->whereIn('id', $targetIds->all())
                            ->where('is_active', true)
                            ->get(['id', 'name', 'slug', 'price'])
                            ->sortBy(fn (SubscriptionPlan $plan) => $targetIds->search((int) $plan->id))
                            ->values();
                    }
                }

                return [
                    'code' => $promo->code,
                    'name' => $promo->name,
                    'description' => $promo->description,
                    'discount_type' => $promo->discount_type,
                    'discount_value' => (float) $promo->discount_value,
                    'min_amount' => $promo->min_amount !== null ? (float) $promo->min_amount : null,
                    'applies_to_all_subscriptions' => property_exists($promo, 'applies_to_all_subscriptions')
                        ? (bool) $promo->applies_to_all_subscriptions
                        : true,
                    'target_subscription_plans' => $targetPlans->map(fn (SubscriptionPlan $plan) => [
                        'id' => $plan->id,
                        'slug' => $plan->slug,
                        'name' => $plan->name,
                        'price' => (float) $plan->price,
                    ])->all(),
                    'checkout_plan_id' => $targetPlans->first()?->slug ?? 'default',
                ];
            }),
            'footer_pages' => function () {
                StaticPage::ensureDefaultPages();

                return StaticPage::query()
                    ->where('is_published', true)
                    ->whereIn('category', ['legal', 'info'])
                    ->where('slug', '!=', 'contact')
                    ->orderBy('category')
                    ->orderBy('order')
                    ->get(['id', 'slug', 'title', 'category'])
                    ->map(fn ($page) => [
                        'id' => $page->id,
                        'slug' => $page->slug,
                        'title' => $page->title,
                        'category' => $page->category,
                    ])
                    ->values();
            },
            'shared_content' => fn () => cache()->remember('shared_content:v1', now()->addMinutes(10), fn () => app(SharedContentService::class)->get()),
        ]);
    }
}
