<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Article;
use App\Models\Comment;
use App\Models\NewsletterSubscriber;
use App\Models\PageView;
use App\Models\SafebRegistration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            'safeb' => $this->safebStats($period, $range),
            'health' => $this->healthChecks(),
            'temps' => $this->tempsDeLecture($range),
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

    /**
     * Squelette de periode partage par les series temporelles multi-mesures.
     *
     * @return array{step: string, labels: array<string, string>}
     */
    private function periodBuckets(string $period, ?array $range): array
    {
        $start = $range['start'] ?? Carbon::parse(PageView::min('created_at') ?? now()->subDays(30));
        $end = $range['end'] ?? now();
        $step = $period === 'year' ? 'month' : 'day';

        $labels = [];
        $cursor = $start->copy();
        $guard = 0;

        while ($cursor->lte($end) && $guard < 400) {
            $key = $step === 'month' ? $cursor->format('Y-m') : $cursor->format('Y-m-d');
            $labels[$key] = $step === 'month'
                ? $cursor->translatedFormat('M Y')
                : $cursor->translatedFormat('d M');
            $step === 'month' ? $cursor->addMonth() : $cursor->addDay();
            $guard++;
        }

        return ['step' => $step, 'labels' => $labels];
    }

    /**
     * Regroupe une serie journaliere sur la granularite demandee.
     *
     * @return array<string, int>
     */
    private function bucketize(Collection $daily, int $keyLength): array
    {
        $out = [];

        foreach ($daily as $day => $total) {
            $key = substr((string) $day, 0, $keyLength);
            $out[$key] = ($out[$key] ?? 0) + (int) $total;
        }

        return $out;
    }

    /**
     * Audience, inscriptions et conversion des pages SAFEB.
     */
    private function safebStats(string $period, ?array $range): array
    {
        $types = [
            'panel' => 'Participant au panel',
            'partner' => 'Partenaire',
            'stand' => 'Reservation de stand',
            'masterclass' => 'Inscription masterclass',
            'pitch' => 'Concours de pitch',
            'culinary' => "Concours d'art culinaire",
            'film' => 'Concours de films',
        ];

        $inRange = fn ($q) => $q->when($range, fn ($qq) => $qq->where('created_at', '>=', $range['start'])
            ->when($range['end'], fn ($q2) => $q2->where('created_at', '<=', $range['end'])));

        $views = $inRange(PageView::query()->where('path', 'like', '/safeb%'));
        $registrations = $inRange(SafebRegistration::query());

        $viewsByPath = (clone $views)
            ->selectRaw('path, count(*) as total')
            ->groupBy('path')
            ->pluck('total', 'path');

        $registrationsByType = (clone $registrations)
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $statusCounts = (clone $registrations)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Entonnoir : vues du formulaire -> inscriptions effectives, par type
        $funnel = collect($types)
            ->map(function (string $label, string $type) use ($viewsByPath, $registrationsByType) {
                $formViews = (int) ($viewsByPath['/safeb/inscription/' . $type] ?? 0);
                $signups = (int) ($registrationsByType[$type] ?? 0);

                return [
                    'type' => $type,
                    'label' => $label,
                    'form_views' => $formViews,
                    'registrations' => $signups,
                    'conversion' => $formViews > 0 ? round(($signups / $formViews) * 100, 1) : null,
                ];
            })
            ->values();

        $buckets = $this->periodBuckets($period, $range);
        $keyLength = $buckets['step'] === 'month' ? 7 : 10;

        $viewsDaily = $this->bucketize((clone $views)
            ->selectRaw('date(created_at) as day, count(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day'), $keyLength);

        $signupsDaily = $this->bucketize((clone $registrations)
            ->selectRaw('date(created_at) as day, count(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day'), $keyLength);

        $series = collect($buckets['labels'])
            ->map(fn (string $label, string $key) => [
                'label' => $label,
                'views' => $viewsDaily[$key] ?? 0,
                'registrations' => $signupsDaily[$key] ?? 0,
            ])
            ->values()
            ->all();

        $landingViews = (int) ($viewsByPath['/safeb'] ?? 0);
        $formViews = (int) $funnel->sum('form_views');
        $totalRegistrations = (int) (clone $registrations)->count();

        return [
            'totals' => [
                'page_views' => (int) (clone $views)->count(),
                'landing_views' => $landingViews,
                'form_views' => $formViews,
                'unique_visitors' => (int) (clone $views)->distinct('ip_hash')->count('ip_hash'),
                'registrations' => $totalRegistrations,
                'conversion' => $formViews > 0 ? round(($totalRegistrations / $formViews) * 100, 1) : null,
            ],
            'funnel' => $funnel->all(),
            'series' => $series,
            'by_status' => collect([
                SafebRegistration::STATUS_NEW => 'Nouveau',
                SafebRegistration::STATUS_CONTACTED => 'Contacte',
                SafebRegistration::STATUS_CONFIRMED => 'Confirme',
            ])
                ->map(fn (string $label, string $status) => [
                    'status' => $status,
                    'label' => $label,
                    'total' => (int) ($statusCounts[$status] ?? 0),
                ])
                ->values()
                ->all(),
            'pages' => collect($viewsByPath)
                ->map(fn ($total, string $path) => ['path' => $path, 'views' => (int) $total])
                ->sortByDesc('views')
                ->values()
                ->all(),
        ];
    }

    /**
     * Controles de sante : emplacements publicitaires reellement remplis et
     * articles a la une encore valides (la page d'accueil retombe silencieusement
     * sur les derniers articles quand plus aucun n'est en cours de mise en avant).
     */
    private function healthChecks(): array
    {
        $ads = Advertisement::query()->get()->keyBy('location_id');

        $slots = collect(Advertisement::LOCATIONS)
            ->map(function (string $label, string $locationId) use ($ads) {
                $ad = $ads->get($locationId);
                $views = (int) ($ad->view_count ?? 0);
                $clicks = (int) ($ad->click_count ?? 0);

                return [
                    'location_id' => $locationId,
                    'label' => $label,
                    'filled' => $ad !== null,
                    'active' => (bool) ($ad->is_active ?? false),
                    'has_image' => filled($ad->image_url ?? null),
                    'title' => $ad->title ?? null,
                    'views' => $views,
                    'clicks' => $clicks,
                    'ctr' => $views > 0 ? round(($clicks / $views) * 100, 2) : null,
                ];
            })
            ->values();

        $featuredActive = Article::featured()->published()->count();

        return [
            'pending_migrations' => $this->migrationsEnAttente(),
            'ad_slots' => $slots->all(),
            'ad_slots_missing' => $slots->reject(fn (array $slot) => $slot['filled'] && $slot['active'] && $slot['has_image'])
                ->pluck('label')
                ->values()
                ->all(),
            'featured' => [
                'active' => $featuredActive,
                'expired' => Article::query()
                    ->where('is_featured', true)
                    ->whereNotNull('featured_until')
                    ->where('featured_until', '<=', now())
                    ->count(),
                'fallback' => $featuredActive === 0,
            ],
        ];
    }

    /**
     * Temps passe sur le site : moyenne globale, par type de page et par article.
     * Seules les visites reellement mesurees comptent ; celles anterieures a la
     * mise en place du suivi n'ont pas de duree et sont ecartees.
     */
    private function tempsDeLecture(?array $range): array
    {
        $base = PageView::query()
            ->whereNotNull('duration_seconds')
            ->when($range, fn ($q) => $q->where('created_at', '>=', $range['start'])
                ->when($range['end'], fn ($q2) => $q2->where('created_at', '<=', $range['end'])));

        $mesurees = (int) (clone $base)->count();

        if ($mesurees === 0) {
            return [
                'mesurees' => 0,
                'moyenne' => null,
                'par_type' => [],
                'articles' => [],
            ];
        }

        // Regroupement par chemin, puis par famille de page cote PHP : la
        // classification par prefixe est illisible en SQL portable.
        $parType = [];

        foreach ((clone $base)->selectRaw('path, count(*) as n, sum(duration_seconds) as total')->groupBy('path')->get() as $ligne) {
            $type = $this->typeDePage((string) $ligne->path);
            $parType[$type]['visites'] = ($parType[$type]['visites'] ?? 0) + (int) $ligne->n;
            $parType[$type]['cumul'] = ($parType[$type]['cumul'] ?? 0) + (int) $ligne->total;
        }

        $types = collect($parType)
            ->map(fn (array $v, string $type) => [
                'type' => $type,
                'visites' => $v['visites'],
                'moyenne' => (int) round($v['cumul'] / max($v['visites'], 1)),
            ])
            ->sortByDesc('visites')
            ->values()
            ->all();

        // Articles les plus lus en duree. Un minimum de visites evite qu'une
        // mesure isolee ne prenne la premiere place.
        $lignes = (clone $base)
            ->whereNotNull('article_id')
            ->selectRaw('article_id, count(*) as n, avg(duration_seconds) as moyenne')
            ->groupBy('article_id')
            ->havingRaw('count(*) >= 3')
            ->orderByDesc('moyenne')
            ->take(10)
            ->get();

        $titres = Article::query()
            ->whereIn('id', $lignes->pluck('article_id')->all())
            ->pluck('title_fr', 'id');

        return [
            'mesurees' => $mesurees,
            'moyenne' => (int) round((float) (clone $base)->avg('duration_seconds')),
            'par_type' => $types,
            'articles' => $lignes->map(fn ($l) => [
                'id' => (int) $l->article_id,
                'titre' => $titres[$l->article_id] ?? 'Article supprime',
                'visites' => (int) $l->n,
                'moyenne' => (int) round((float) $l->moyenne),
            ])->all(),
        ];
    }

    /**
     * Nombre de migrations non encore appliquees.
     * Sert a signaler qu'une mise a jour du schema reste a declencher, faute
     * d'acces SSH sur cet hebergement.
     */
    private function migrationsEnAttente(): int
    {
        try {
            $appliquees = \DB::table('migrations')->pluck('migration')->all();

            $fichiers = collect(glob(database_path('migrations/*.php')) ?: [])
                ->map(fn (string $chemin) => basename($chemin, '.php'));

            return $fichiers->diff($appliquees)->count();
        } catch (\Throwable $e) {
            return 0;
        }
    }

    /**
     * Famille de page deduite de l'URL.
     */
    private function typeDePage(string $path): string
    {
        return match (true) {
            $path === '/' || $path === '/en' => 'Accueil',
            str_starts_with($path, '/article/') => 'Articles',
            str_starts_with($path, '/safeb') => 'SAFEB',
            str_starts_with($path, '/categorie/'), str_starts_with($path, '/category/') => 'Rubriques',
            str_starts_with($path, '/direct'), str_starts_with($path, '/live') => 'Direct',
            str_starts_with($path, '/search') => 'Recherche',
            str_starts_with($path, '/parutions'), str_starts_with($path, '/press') => 'Parutions',
            default => 'Autres pages',
        };
    }

    /**
     * Export CSV des jeux de donnees affiches sur le tableau de bord.
     */
    public function exportCsv(Request $request, string $dataset): StreamedResponse
    {
        $period = $this->normalizePeriod($request->input('period', 'month'));
        $range = $this->periodRange($period);

        [$filename, $header, $rows] = match ($dataset) {
            'safeb-conversion' => [
                'safeb-conversion',
                ['Type', 'Vues du formulaire', 'Inscriptions', 'Taux de conversion (%)'],
                collect($this->safebStats($period, $range)['funnel'])
                    ->map(fn (array $r) => [$r['label'], $r['form_views'], $r['registrations'], $r['conversion'] ?? '']),
            ],
            'safeb-evolution' => [
                'safeb-evolution',
                ['Periode', 'Visites SAFEB', 'Inscriptions'],
                collect($this->safebStats($period, $range)['series'])
                    ->map(fn (array $r) => [$r['label'], $r['views'], $r['registrations']]),
            ],
            'safeb-pages' => [
                'safeb-pages',
                ['Page', 'Visites'],
                collect($this->safebStats($period, $range)['pages'])
                    ->map(fn (array $r) => [$r['path'], $r['views']]),
            ],
            'publicites' => [
                'publicites-performance',
                ['Emplacement', 'Identifiant', 'Rempli', 'Active', 'Vues', 'Clics', 'CTR (%)'],
                collect($this->healthChecks()['ad_slots'])
                    ->map(fn (array $r) => [
                        $r['label'],
                        $r['location_id'],
                        $r['filled'] ? 'oui' : 'non',
                        $r['active'] ? 'oui' : 'non',
                        $r['views'],
                        $r['clicks'],
                        $r['ctr'] ?? '',
                    ]),
            ],
            default => abort(404),
        };

        return response()->stream(function () use ($header, $rows) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF"); // BOM UTF-8 pour Excel

            fputcsv($file, $header);

            foreach ($rows as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '-' . $period . '.csv"',
        ]);
    }
}
