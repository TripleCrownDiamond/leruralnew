<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use App\Models\NewsletterSubscriber;
use App\Models\PageView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class StatsController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $this->normalizePeriod($request->input('period', 'month'));
        $range = $this->periodRange($period);

        $baseQuery = PageView::query()
            ->when($range, fn ($q) => $q->where('created_at', '>=', $range['start'])
                ->when($range['end'], fn ($q2) => $q2->where('created_at', '<=', $range['end'])));

        // KPI totals
        $totalViews = (clone $baseQuery)->count();
        $uniqueVisitors = (clone $baseQuery)->distinct('ip_hash')->count('ip_hash');
        $articlesViewed = (clone $baseQuery)->whereNotNull('article_id')->distinct('article_id')->count('article_id');

        // Daily series (fill every day of the period)
        $daily = (clone $baseQuery)
            ->selectRaw("date(created_at) as day, count(*) as total")
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->pluck('total', 'day');

        $series = $this->buildDailySeries($daily, $period, $range);

        // Top articles by views within the period
        $topRows = (clone $baseQuery)
            ->whereNotNull('article_id')
            ->selectRaw('article_id, count(*) as total')
            ->groupBy('article_id')
            ->orderByDesc('total')
            ->take(10)
            ->get();

        $articlesById = Article::query()
            ->whereIn('id', $topRows->pluck('article_id')->all())
            ->get()
            ->keyBy('id');

        $topArticles = $topRows->map(function ($row) use ($articlesById) {
            $article = $articlesById->get($row->article_id);

            return [
                'id' => $row->article_id,
                'title' => $article?->title_fr ?? 'Article supprime',
                'slug' => $article?->slug ?? null,
                'views' => (int) $row->total,
                'image' => $article?->featured_image ?? null,
            ];
        });

        // Top pages
        $topPages = (clone $baseQuery)
            ->selectRaw('path, count(*) as total')
            ->groupBy('path')
            ->orderByDesc('total')
            ->take(12)
            ->get()
            ->map(fn ($row) => [
                'path' => $row->path,
                'views' => (int) $row->total,
            ]);

        // Comparison vs previous period
        $previous = $this->previousRange($range);
        $previousViews = PageView::query()
            ->when($previous, fn ($q) => $q->where('created_at', '>=', $previous['start'])
                ->when($previous['end'], fn ($q2) => $q2->where('created_at', '<=', $previous['end'])))
            ->count();

        $evolution = $previousViews > 0
            ? round((($totalViews - $previousViews) / $previousViews) * 100, 1)
            : null;

        // Global lifetime counters
        $lifetime = [
            'article_views' => (int) Article::sum('read_count'),
            'articles' => Article::count(),
            'users' => User::count(),
            'newsletter_subscribers' => NewsletterSubscriber::count(),
            'comments' => Comment::count(),
        ];

        return Inertia::render('Dashboard/Stats/Index', [
            'period' => $period,
            'totals' => [
                'views' => $totalViews,
                'unique_visitors' => $uniqueVisitors,
                'articles_viewed' => $articlesViewed,
                'evolution' => $evolution,
            ],
            'series' => $series,
            'top_articles' => $topArticles,
            'top_pages' => $topPages,
            'lifetime' => $lifetime,
        ]);
    }

    private function normalizePeriod(string $period): string
    {
        return in_array($period, ['today', 'week', 'month', 'year', 'all'], true) ? $period : 'month';
    }

    /**
     * @return array{start: Carbon, end: Carbon|null}|null
     */
    private function periodRange(string $period): ?array
    {
        $now = now();

        return match ($period) {
            'today' => ['start' => $now->copy()->startOfDay(), 'end' => $now],
            'week' => ['start' => $now->copy()->startOfWeek(), 'end' => $now],
            'month' => ['start' => $now->copy()->startOfMonth(), 'end' => $now],
            'year' => ['start' => $now->copy()->startOfYear(), 'end' => $now],
            default => null,
        };
    }

    /**
     * @return array{start: Carbon, end: Carbon|null}|null
     */
    private function previousRange(?array $range): ?array
    {
        if ($range === null) {
            return null;
        }

        $length = $range['end'] ? $range['end']->diffInSeconds($range['start']) : null;

        return [
            'start' => $range['start']->copy()->subSeconds($length ?? 86400 * 30),
            'end' => $range['end'] ? $range['end']->copy()->subSeconds($length ?? 86400 * 30) : null,
        ];
    }

    private function buildDailySeries(\Illuminate\Support\Collection $daily, string $period, ?array $range): array
    {
        $start = $range['start'] ?? Carbon::parse(PageView::min('created_at') ?? now()->subDays(30));
        $end = $range['end'] ?? now();

        $step = match ($period) {
            'year' => 'month',
            default => 'day',
        };

        $labels = [];
        $cursor = $start->copy();
        $guard = 0;

        while ($cursor->lte($end) && $guard < 400) {
            $key = $step === 'month' ? $cursor->format('Y-m') : $cursor->format('Y-m-d');
            $labels[$key] = 0;
            $step === 'month' ? $cursor->addMonth() : $cursor->addDay();
            $guard++;
        }

        foreach ($daily as $day => $total) {
            $key = $step === 'month' ? substr((string) $day, 0, 7) : (string) $day;
            if (array_key_exists($key, $labels)) {
                $labels[$key] = (int) $total;
            }
        }

        return collect($labels)
            ->map(fn ($total, $label) => [
                'label' => $step === 'month'
                    ? Carbon::parse($label . '-01')->translatedFormat('M Y')
                    : Carbon::parse($label)->translatedFormat('d M'),
                'views' => $total,
            ])
            ->values()
            ->all();
    }
}
