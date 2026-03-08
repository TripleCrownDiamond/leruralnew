<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Setting;
use App\Models\Poll;
use App\Models\Quote;
use App\Models\DidYouKnow;
use App\Models\Agenda;
use App\Models\PollVote;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
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
                // Poll Logic
                $polls = \App\Models\Poll::with('options')
                    ->where('is_active', true)
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                    })
                    ->latest()
                    ->get();
                
                $pollsData = [];
                
                if ($polls->isNotEmpty()) {
                    // Check if user has voted via cookie
                    $votedPolls = json_decode($request->cookie('voted_polls', '[]'), true);
                    if (!is_array($votedPolls)) {
                        $votedPolls = [];
                    }
                    
                    $ip = $request->ip();
                    $sessionId = $request->session()->getId();

                    $pollsData = $polls->map(function($poll) use ($votedPolls, $ip, $sessionId) {
                        $userHasVoted = in_array($poll->id, $votedPolls);

                        // Also check IP/Session if cookie check fails (e.g. cleared cookies)
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
                            'options' => $poll->options->map(fn($o) => [
                                'id' => $o->id,
                                'label' => $o->label,
                                'votes' => $o->votes // Use direct votes column
                            ]),
                            'user_has_voted' => $userHasVoted,
                        ];
                    });
                }

                $quote = Quote::where('is_active', true)->inRandomOrder()->first();
                $did_you_know = DidYouKnow::where('is_active', true)->inRandomOrder()->first();
                $agenda = Agenda::where('is_active', true)
                    ->whereDate('date', '>=', now())
                    ->orderBy('date')
                    ->take(3)
                    ->get()
                    ->map(fn ($e) => [
                        'id' => $e->id,
                        'title' => $e->title,
                        'date' => $e->date->format('d M'),
                        'location' => $e->location,
                    ]);

                return [
                    'polls' => $pollsData,
                    'poll' => $pollsData->first() ?? null, // Keep backward compatibility
                    'quote' => $quote ? [
                        'content' => $quote->content,
                        'author' => $quote->author,
                    ] : null,
                    'did_you_know' => $did_you_know ? [
                        'content' => $did_you_know->content,
                    ] : null,
                    'agenda' => $agenda,
                ];
            },
            'categories' => function () use ($request) {
                // Return only needed fields
                return Category::published()->orderBy('order')->get()->map(fn ($c) => [
                    'slug' => $c->slug,
                    'name' => app()->getLocale() === 'en' ? $c->name_en : $c->name_fr,
                ]);
            },
            'settings' => fn () => Setting::pluck('value', 'key')->all(),
        ]);
    }
}
