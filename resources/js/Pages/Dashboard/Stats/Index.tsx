import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    CalendarRange,
    CheckCircle2,
    Clock3,
    Download,
    Eye,
    FileText,
    Globe,
    Megaphone,
    MessageSquare,
    Newspaper,
    Radio,
    Sparkles,
    Target,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

interface SeriesPoint {
    label: string;
    views: number;
}

interface TopArticle {
    id: number;
    title: string;
    slug: string | null;
    views: number;
    image: string | null;
}

interface TopPage {
    path: string;
    views: number;
}

interface SafebSeriesPoint {
    label: string;
    views: number;
    registrations: number;
}

interface SafebFunnelRow {
    type: string;
    label: string;
    form_views: number;
    registrations: number;
    conversion: number | null;
}

interface AdSlot {
    location_id: string;
    label: string;
    filled: boolean;
    active: boolean;
    has_image: boolean;
    title: string | null;
    views: number;
    clicks: number;
    ctr: number | null;
}

interface Props {
    period: Period;
    totals: {
        views: number;
        unique_visitors: number;
        articles_viewed: number;
        evolution: number | null;
    };
    series: SeriesPoint[];
    top_articles: TopArticle[];
    top_pages: TopPage[];
    lifetime: {
        article_views: number;
        articles: number;
        users: number;
        newsletter_subscribers: number;
        comments: number;
    };
    safeb: {
        totals: {
            page_views: number;
            landing_views: number;
            form_views: number;
            unique_visitors: number;
            registrations: number;
            conversion: number | null;
        };
        funnel: SafebFunnelRow[];
        series: SafebSeriesPoint[];
        by_status: { status: string; label: string; total: number }[];
        pages: TopPage[];
    };
    health: {
        pending_migrations: number;
        ad_slots: AdSlot[];
        ad_slots_missing: string[];
        featured: { active: number; expired: number; fallback: boolean };
    };
    temps: {
        mesurees: number;
        moyenne: number | null;
        par_type: Array<{ type: string; visites: number; moyenne: number }>;
        articles: Array<{
            id: number;
            titre: string;
            visites: number;
            moyenne: number;
        }>;
    };
}

const PERIODS: { key: Period; label: string }[] = [
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: '7 jours' },
    { key: 'month', label: '30 jours' },
    { key: 'year', label: '12 mois' },
    { key: 'all', label: 'Tout' },
];

const SECTIONS: { id: string; label: string; icon: React.ReactNode }[] = [
    {
        id: 'apercu',
        label: 'Apercu',
        icon: <Activity className="h-3.5 w-3.5" />,
    },
    {
        id: 'trafic',
        label: 'Trafic',
        icon: <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
        id: 'contenus',
        label: 'Contenus',
        icon: <Newspaper className="h-3.5 w-3.5" />,
    },
    { id: 'safeb', label: 'SAFEB', icon: <UserPlus className="h-3.5 w-3.5" /> },
    { id: 'temps', label: 'Temps', icon: <Clock3 className="h-3.5 w-3.5" /> },
    {
        id: 'controles',
        label: 'Publicites',
        icon: <Megaphone className="h-3.5 w-3.5" />,
    },
    { id: 'cumuls', label: 'Cumuls', icon: <Eye className="h-3.5 w-3.5" /> },
];

const CHART_COLORS = {
    primary: '#2f6a11',
    primaryLight: '#4a8a1f',
    emerald300: '#86efac',
    emerald500: '#10b981',
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value || 0);
}

/** Duree en secondes -> "3 min 20 s", lisible d'un coup d'oeil. */
function formatDuree(secondes: number | null): string {
    if (secondes === null || secondes <= 0) return '—';
    if (secondes < 60) return `${secondes} s`;

    const minutes = Math.floor(secondes / 60);
    const reste = secondes % 60;

    return reste === 0 ? `${minutes} min` : `${minutes} min ${reste} s`;
}

function safeRoute(name: string, params?: any): string {
    try {
        if (typeof route === 'function' && route().has(name))
            return route(name, params);
        return '#';
    } catch {
        return '#';
    }
}

function changePeriod(period: Period) {
    router.get(
        safeRoute('dashboard.stats.index'),
        { period },
        { preserveState: true, preserveScroll: true, replace: true },
    );
}

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95">
            <div className="mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                <span>LE RURAL</span>
            </div>
            <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                {label}
            </div>
            <div className="mt-1 font-heading text-2xl font-black tabular-nums text-primary">
                {new Intl.NumberFormat('fr-FR').format(payload[0].value)}
                <span className="ml-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    {payload[0].name && payload[0].name !== payload[0].dataKey
                        ? payload[0].name
                        : 'vues'}
                </span>
            </div>
        </div>
    );
}

export default function StatsIndex({
    period,
    totals,
    series,
    top_articles,
    top_pages,
    lifetime,
    safeb,
    health,
    temps,
}: Props) {
    const hasData = totals.views > 0;
    const totalSeries = series.reduce(
        (sum, point) => sum + (point.views || 0),
        0,
    );

    const periodLabel =
        PERIODS.find((p) => p.key === period)?.label ?? '30 jours';

    return (
        <DashboardLayout title="Statistiques">
            <Head title="Statistiques" />

            <div className="space-y-10">
                {/* Editorial Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-primary/40 p-8 text-white shadow-[0_30px_80px_-30px_rgba(47,106,17,0.6)] sm:p-10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '26px 26px',
                        }}
                    />

                    <div className="relative">
                        <div className="mb-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.32em] text-white/70">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-80" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                            </span>
                            <span>LE RURAL</span>
                            <span className="text-white/25">/</span>
                            <span className="text-primary">Statistiques</span>
                        </div>

                        <h1 className="font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
                            Audience &amp; trafic
                            <span className="text-primary">.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                            Mesurez l'impact de la redaction : pages vues,
                            articles consultes et evolution de l'audience.
                        </p>

                        {/* Period selector */}
                        <div className="mt-7 inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => changePeriod(p.key)}
                                    className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                                        period === p.key
                                            ? 'bg-gradient-to-r from-primary to-emerald-700 text-white shadow-lg shadow-primary/30'
                                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Navigation interne : la page est longue, cette barre reste
                    accessible pendant le defilement. */}
                <nav
                    aria-label="Sections des statistiques"
                    className="sticky top-0 z-30 -mx-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white/90 px-1 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/90"
                >
                    <ul className="flex min-w-max items-center gap-1 px-1">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary dark:text-white/55 dark:hover:text-white"
                                >
                                    {section.icon}
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* KPI Cards */}
                <div
                    id="apercu"
                    className="grid scroll-mt-24 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                >
                    <StatCard
                        title={`Vues · ${periodLabel}`}
                        value={totals.views}
                        icon={<Eye className="h-6 w-6" />}
                        accent="primary"
                        trend={
                            totals.evolution === null
                                ? undefined
                                : `${totals.evolution >= 0 ? '+' : ''}${totals.evolution}%`
                        }
                    />
                    <StatCard
                        title="Visiteurs uniques"
                        value={totals.unique_visitors}
                        icon={<Users className="h-6 w-6" />}
                        accent="emerald"
                    />
                    <StatCard
                        title="Articles consultes"
                        value={totals.articles_viewed}
                        icon={<FileText className="h-6 w-6" />}
                        accent="primary"
                    />
                    <StatCard
                        title="Vues depuis toujours"
                        value={lifetime.article_views}
                        icon={<TrendingUp className="h-6 w-6" />}
                        accent="amber"
                    />
                </div>

                {/* Traffic chart */}
                <section id="trafic" className="scroll-mt-24">
                    <SectionHeader
                        eyebrow="Analyse"
                        title="Evolution du trafic"
                    />
                    <ChartCard
                        eyebrow="Frequentation"
                        title={`Trafic · ${periodLabel}`}
                        subtitle={
                            hasData
                                ? `${formatNumber(totalSeries)} pages vues sur la periode`
                                : 'Les statistiques se remplissent au fil des visites'
                        }
                        icon={<BarChart3 className="h-5 w-5" />}
                        meta={
                            series.length > 0
                                ? `${series.length} points`
                                : undefined
                        }
                    >
                        {hasData && series.length > 0 ? (
                            <div className="h-80 min-h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={series}
                                        margin={{
                                            top: 10,
                                            right: 12,
                                            left: -10,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="trafficGrad"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={
                                                        CHART_COLORS.primaryLight
                                                    }
                                                    stopOpacity={0.85}
                                                />
                                                <stop
                                                    offset="55%"
                                                    stopColor={
                                                        CHART_COLORS.primary
                                                    }
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={
                                                        CHART_COLORS.primary
                                                    }
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="2 4"
                                            stroke="currentColor"
                                            strokeOpacity={0.08}
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                fill: 'currentColor',
                                                fillOpacity: 0.55,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickMargin={12}
                                            minTickGap={24}
                                        />
                                        <YAxis
                                            tick={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                fill: 'currentColor',
                                                fillOpacity: 0.5,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={36}
                                        />
                                        <Tooltip
                                            content={<ChartTooltip />}
                                            cursor={{
                                                stroke: CHART_COLORS.primary,
                                                strokeOpacity: 0.3,
                                                strokeDasharray: '3 3',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="views"
                                            stroke={CHART_COLORS.primary}
                                            strokeWidth={2.5}
                                            fill="url(#trafficGrad)"
                                            activeDot={{
                                                r: 5,
                                                strokeWidth: 2,
                                                stroke: '#fff',
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-80 w-full flex-col items-center justify-center gap-3 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-white/60">
                                    Aucune vue enregistree sur cette periode.
                                </p>
                                <p className="max-w-sm text-xs text-gray-400 dark:text-white/40">
                                    Le suivi d'audience vient d'etre active :
                                    les premieres donnees apparaissent des les
                                    prochaines visites du site.
                                </p>
                            </div>
                        )}
                    </ChartCard>
                </section>

                {/* Top articles + top pages */}
                <div
                    id="contenus"
                    className="grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-2"
                >
                    <ChartCard
                        eyebrow="Contenus"
                        title="Articles les plus vus"
                        subtitle={`Classement sur ${periodLabel}`}
                        icon={<Newspaper className="h-5 w-5" />}
                        meta={`Top ${top_articles.length}`}
                    >
                        {top_articles.length > 0 ? (
                            <div className="space-y-2">
                                {top_articles.map((article, index) => (
                                    <div
                                        key={article.id}
                                        className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 transition-all hover:border-primary/30 hover:bg-white hover:shadow-[0_10px_30px_-18px_rgba(47,106,17,0.35)] dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-xs font-black tabular-nums text-primary">
                                            {index + 1}
                                        </span>
                                        {article.image && (
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                loading="lazy"
                                                className="h-9 w-12 shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-white/10"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            {article.slug ? (
                                                <Link
                                                    href={safeRoute(
                                                        'article.show',
                                                        article.slug,
                                                    )}
                                                    className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors hover:text-primary dark:text-white"
                                                >
                                                    {article.title}
                                                </Link>
                                            ) : (
                                                <span className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">
                                                    {article.title}
                                                </span>
                                            )}
                                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-white/40">
                                                <Eye className="h-3 w-3 text-primary" />
                                                {formatNumber(article.views)}{' '}
                                                vues
                                            </div>
                                        </div>
                                        {article.slug && (
                                            <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary dark:text-white/25" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyBlock text="Aucun article consulte sur cette periode." />
                        )}
                    </ChartCard>

                    <ChartCard
                        eyebrow="Navigation"
                        title="Pages les plus visitees"
                        subtitle={`Chemins les plus empruntes · ${periodLabel}`}
                        icon={<Globe className="h-5 w-5" />}
                        meta={`Top ${top_pages.length}`}
                    >
                        {top_pages.length > 0 ? (
                            <div className="space-y-2">
                                {top_pages.map((page) => {
                                    const maxViews = top_pages[0]?.views || 1;
                                    const width = Math.max(
                                        (page.views / maxViews) * 100,
                                        6,
                                    );
                                    return (
                                        <div
                                            key={page.path}
                                            className="group flex items-center gap-3"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-3">
                                                    <span className="line-clamp-1 font-mono text-xs font-bold text-gray-900 dark:text-white">
                                                        /
                                                        {page.path.replace(
                                                            /^\//,
                                                            '',
                                                        )}
                                                    </span>
                                                    <span className="shrink-0 text-[10px] font-black uppercase tabular-nums tracking-[0.14em] text-primary">
                                                        {formatNumber(
                                                            page.views,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 group-hover:from-emerald-600 group-hover:to-primary"
                                                        style={{
                                                            width: `${width}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyBlock text="Aucune navigation enregistree sur cette periode." />
                        )}
                    </ChartCard>
                </div>

                {/* SAFEB : audience, inscriptions et conversion.
                    Les couleurs sont declinees par theme : le vert de marque est trop sombre
                    sur fond sombre, chaque mode a donc son propre pas de la meme rampe. */}
                <section
                    id="safeb"
                    className="scroll-mt-24 space-y-6 [--c-safeb-signups:#10b981] [--c-safeb-views:#2f6a11] dark:[--c-safeb-signups:#059669] dark:[--c-safeb-views:#4a8a1f]"
                >
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <SectionHeader
                            eyebrow="SAFEB"
                            title="Audience et inscriptions"
                        />
                        <div className="flex flex-wrap gap-2 pb-4">
                            <ExportButton
                                dataset="safeb-evolution"
                                period={period}
                                label="Evolution"
                            />
                            <ExportButton
                                dataset="safeb-conversion"
                                period={period}
                                label="Conversion"
                            />
                            <ExportButton
                                dataset="safeb-pages"
                                period={period}
                                label="Pages"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Visites des pages SAFEB"
                            value={safeb.totals.page_views}
                            icon={<Eye className="h-5 w-5" />}
                        />
                        <StatCard
                            title="Visiteurs uniques"
                            value={safeb.totals.unique_visitors}
                            icon={<Users className="h-5 w-5" />}
                            accent="emerald"
                        />
                        <StatCard
                            title="Vues des formulaires"
                            value={safeb.totals.form_views}
                            icon={<FileText className="h-5 w-5" />}
                            accent="amber"
                        />
                        <StatCard
                            title="Inscriptions"
                            value={safeb.totals.registrations}
                            icon={<UserPlus className="h-5 w-5" />}
                            accent="emerald"
                        />
                    </div>

                    {/* Deux mesures d'ordres de grandeur tres differents (des centaines de visites
                        contre quelques inscriptions) : deux graphiques distincts partageant le meme
                        axe temporel, jamais deux echelles superposees. */}
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <ChartCard
                            eyebrow="SAFEB"
                            title="Evolution des visites"
                            subtitle="Page de presentation et formulaires d'inscription"
                            icon={<Activity className="h-5 w-5" />}
                        >
                            {safeb.series.length > 0 ? (
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart
                                            data={safeb.series}
                                            margin={{
                                                top: 10,
                                                right: 12,
                                                left: -10,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="safebViewsFill"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="var(--c-safeb-views)"
                                                        stopOpacity={0.55}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="var(--c-safeb-views)"
                                                        stopOpacity={0.02}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                stroke="currentColor"
                                                strokeOpacity={0.08}
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    fill: 'currentColor',
                                                    fillOpacity: 0.55,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                minTickGap={24}
                                            />
                                            <YAxis
                                                tick={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    fill: 'currentColor',
                                                    fillOpacity: 0.55,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={48}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                content={<ChartTooltip />}
                                                cursor={{
                                                    stroke: 'currentColor',
                                                    strokeOpacity: 0.25,
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="views"
                                                name="Visites"
                                                stroke="var(--c-safeb-views)"
                                                strokeWidth={2}
                                                fill="url(#safebViewsFill)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <EmptyBlock text="Aucune visite enregistree sur cette periode." />
                            )}
                        </ChartCard>

                        <ChartCard
                            eyebrow="SAFEB"
                            title="Inscriptions enregistrees"
                            subtitle="Formulaires effectivement soumis"
                            icon={<UserPlus className="h-5 w-5" />}
                        >
                            {safeb.series.length > 0 ? (
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={safeb.series}
                                            margin={{
                                                top: 10,
                                                right: 12,
                                                left: -10,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                stroke="currentColor"
                                                strokeOpacity={0.08}
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    fill: 'currentColor',
                                                    fillOpacity: 0.55,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                minTickGap={24}
                                            />
                                            <YAxis
                                                tick={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    fill: 'currentColor',
                                                    fillOpacity: 0.55,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={48}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                content={<ChartTooltip />}
                                                cursor={{
                                                    fill: 'currentColor',
                                                    fillOpacity: 0.05,
                                                }}
                                            />
                                            <Bar
                                                dataKey="registrations"
                                                name="Inscriptions"
                                                fill="var(--c-safeb-signups)"
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={18}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <EmptyBlock text="Aucune inscription sur cette periode." />
                            )}
                        </ChartCard>
                    </div>

                    <ChartCard
                        eyebrow="Conversion"
                        title="Entonnoir par type d'inscription"
                        subtitle={
                            safeb.totals.conversion !== null
                                ? `Taux de conversion global : ${safeb.totals.conversion} % des vues de formulaire`
                                : 'Pas encore assez de vues pour calculer un taux de conversion'
                        }
                        icon={<Target className="h-5 w-5" />}
                    >
                        {safeb.totals.form_views > 0 ? (
                            <div className="space-y-6">
                                {/* Une seule mesure sur le graphique (les vues) : les categories sont
                                    nominales, donc une teinte unique et pas de degrade par valeur. */}
                                <div className="h-64">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={safeb.funnel}
                                            layout="vertical"
                                            margin={{
                                                top: 4,
                                                right: 40,
                                                left: 8,
                                                bottom: 4,
                                            }}
                                        >
                                            <CartesianGrid
                                                stroke="currentColor"
                                                strokeOpacity={0.08}
                                                horizontal={false}
                                            />
                                            <XAxis
                                                type="number"
                                                hide
                                                allowDecimals={false}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    fill: 'currentColor',
                                                    fillOpacity: 0.7,
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={168}
                                            />
                                            <Tooltip
                                                content={<ChartTooltip />}
                                                cursor={{
                                                    fill: 'currentColor',
                                                    fillOpacity: 0.05,
                                                }}
                                            />
                                            <Bar
                                                dataKey="form_views"
                                                name="Vues du formulaire"
                                                fill="var(--c-safeb-views)"
                                                radius={[0, 4, 4, 0]}
                                                maxBarSize={16}
                                                label={{
                                                    position: 'right',
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    fill: 'currentColor',
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Tableau jumeau : toutes les valeurs du graphique restent lisibles
                                    sans survol, y compris les inscriptions et le taux de conversion. */}
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[520px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/10 dark:text-white/50">
                                                <th className="py-2 pr-4">
                                                    Type
                                                </th>
                                                <th className="py-2 pr-4 text-right">
                                                    Vues
                                                </th>
                                                <th className="py-2 pr-4 text-right">
                                                    Inscriptions
                                                </th>
                                                <th className="py-2 text-right">
                                                    Conversion
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="tabular-nums">
                                            {safeb.funnel.map((row) => (
                                                <tr
                                                    key={row.type}
                                                    className="border-b border-gray-100 last:border-0 dark:border-white/5"
                                                >
                                                    <td className="py-2.5 pr-4 font-bold text-gray-900 dark:text-white">
                                                        {row.label}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-right text-gray-600 dark:text-white/70">
                                                        {formatNumber(
                                                            row.form_views,
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-right text-gray-600 dark:text-white/70">
                                                        {formatNumber(
                                                            row.registrations,
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 text-right font-bold text-gray-900 dark:text-white">
                                                        {row.conversion === null
                                                            ? '—'
                                                            : `${row.conversion} %`}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {safeb.by_status.map((status) => (
                                        <div
                                            key={status.status}
                                            className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.03]"
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                                {status.label}
                                            </div>
                                            <div className="mt-0.5 text-xl font-black text-gray-900 dark:text-white">
                                                {formatNumber(status.total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <EmptyBlock text="Aucune vue de formulaire sur cette periode." />
                        )}
                    </ChartCard>

                    <ChartCard
                        eyebrow="Pages"
                        title="Detail par page SAFEB"
                        subtitle="Visites par URL"
                        icon={<Globe className="h-5 w-5" />}
                    >
                        {safeb.pages.length > 0 ? (
                            <ul className="space-y-2">
                                {safeb.pages.map((page) => (
                                    <li
                                        key={page.path}
                                        className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-2.5 dark:border-white/5"
                                    >
                                        <span className="truncate font-mono text-xs text-gray-600 dark:text-white/70">
                                            {page.path}
                                        </span>
                                        <span className="shrink-0 text-sm font-black tabular-nums text-gray-900 dark:text-white">
                                            {formatNumber(page.views)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyBlock text="Aucune page SAFEB visitee sur cette periode." />
                        )}
                    </ChartCard>
                </section>

                {/* Temps de lecture */}
                <section id="temps" className="scroll-mt-24 space-y-6">
                    <SectionHeader
                        eyebrow="Engagement"
                        title="Temps passe sur le site"
                    />
                    {temps.mesurees === 0 ? (
                        <EmptyBlock text="Aucune duree mesuree sur cette periode. La mesure demarre a la premiere visite suivant la mise en ligne du suivi." />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <ChartCard
                                eyebrow="Par type de page"
                                title="Duree moyenne"
                                subtitle={`${formatNumber(temps.mesurees)} visite(s) mesuree(s) — moyenne generale ${formatDuree(temps.moyenne)}`}
                                icon={<Clock3 className="h-5 w-5" />}
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[420px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/10 dark:text-white/50">
                                                <th className="py-2 pr-4">
                                                    Type de page
                                                </th>
                                                <th className="py-2 pr-4 text-right">
                                                    Visites
                                                </th>
                                                <th className="py-2 text-right">
                                                    Duree moyenne
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="tabular-nums">
                                            {temps.par_type.map((ligne) => (
                                                <tr
                                                    key={ligne.type}
                                                    className="border-b border-gray-100 last:border-0 dark:border-white/5"
                                                >
                                                    <td className="py-2.5 pr-4 font-bold text-gray-900 dark:text-white">
                                                        {ligne.type}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-right text-gray-600 dark:text-white/70">
                                                        {formatNumber(
                                                            ligne.visites,
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 text-right font-bold text-gray-900 dark:text-white">
                                                        {formatDuree(
                                                            ligne.moyenne,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>

                            <ChartCard
                                eyebrow="Articles"
                                title="Les plus lus en duree"
                                subtitle="Articles totalisant au moins 3 visites mesurees"
                                icon={<Newspaper className="h-5 w-5" />}
                            >
                                {temps.articles.length > 0 ? (
                                    <ul className="space-y-2">
                                        {temps.articles.map((article) => (
                                            <li
                                                key={article.id}
                                                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-2.5 dark:border-white/5"
                                            >
                                                <span className="line-clamp-2 text-sm text-gray-700 dark:text-white/75">
                                                    {article.titre}
                                                </span>
                                                <span className="shrink-0 text-right">
                                                    <span className="block text-sm font-black tabular-nums text-gray-900 dark:text-white">
                                                        {formatDuree(
                                                            article.moyenne,
                                                        )}
                                                    </span>
                                                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-white/40">
                                                        {article.visites}{' '}
                                                        visites
                                                    </span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <EmptyBlock text="Pas encore assez de visites mesurees par article." />
                                )}
                            </ChartCard>
                        </div>
                    )}
                </section>

                {/* Controles de sante : emplacements publicitaires et articles a la une */}
                <section id="controles" className="scroll-mt-24 space-y-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <SectionHeader
                            eyebrow="Controles"
                            title="Publicites et mise en avant"
                        />
                        <div className="pb-4">
                            <ExportButton
                                dataset="publicites"
                                period={period}
                                label="Publicites"
                            />
                        </div>
                    </div>

                    {health.featured.fallback ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="text-sm">
                                <p className="font-black text-amber-900 dark:text-amber-200">
                                    Aucun article a la une actuellement
                                </p>
                                <p className="mt-1 text-amber-800 dark:text-amber-200/80">
                                    {health.featured.expired > 0
                                        ? `${health.featured.expired} article(s) ont ete mis en avant mais leur date de fin est depassee. `
                                        : ''}
                                    La page d'accueil affiche donc les derniers
                                    articles publies a la place. Prolongez la
                                    date de mise en avant d'un article pour
                                    reprendre la main sur ce bloc.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-sm">
                                <p className="font-black text-emerald-900 dark:text-emerald-200">
                                    {health.featured.active} article(s) a la une
                                </p>
                                <p className="mt-1 text-emerald-800 dark:text-emerald-200/80">
                                    Le bloc de mise en avant de la page
                                    d'accueil est alimente par la redaction.
                                </p>
                            </div>
                        </div>
                    )}

                    <ChartCard
                        eyebrow="Publicites"
                        title="Emplacements publicitaires"
                        subtitle={
                            health.ad_slots_missing.length > 0
                                ? `${health.ad_slots_missing.length} emplacement(s) a completer : ${health.ad_slots_missing.join(', ')}`
                                : 'Tous les emplacements sont remplis et actifs'
                        }
                        icon={<Megaphone className="h-5 w-5" />}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/10 dark:text-white/50">
                                        <th className="py-2 pr-4">
                                            Emplacement
                                        </th>
                                        <th className="py-2 pr-4">Etat</th>
                                        <th className="py-2 pr-4 text-right">
                                            Vues
                                        </th>
                                        <th className="py-2 pr-4 text-right">
                                            Clics
                                        </th>
                                        <th className="py-2 text-right">CTR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {health.ad_slots.map((slot) => {
                                        const ok =
                                            slot.filled &&
                                            slot.active &&
                                            slot.has_image;

                                        return (
                                            <tr
                                                key={slot.location_id}
                                                className="border-b border-gray-100 last:border-0 dark:border-white/5"
                                            >
                                                <td className="py-2.5 pr-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {slot.label}
                                                    </div>
                                                    <div className="font-mono text-[11px] text-gray-400 dark:text-white/40">
                                                        {slot.location_id}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${
                                                            ok
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                                                        }`}
                                                    >
                                                        {ok ? (
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <AlertTriangle className="h-3.5 w-3.5" />
                                                        )}
                                                        {!slot.filled
                                                            ? 'Aucune publicite'
                                                            : !slot.active
                                                              ? 'Desactivee'
                                                              : !slot.has_image
                                                                ? 'Image manquante'
                                                                : 'Diffusee'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums text-gray-600 dark:text-white/70">
                                                    {formatNumber(slot.views)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums text-gray-600 dark:text-white/70">
                                                    {formatNumber(slot.clicks)}
                                                </td>
                                                <td className="py-2.5 text-right font-bold tabular-nums text-gray-900 dark:text-white">
                                                    {slot.ctr === null
                                                        ? '—'
                                                        : `${slot.ctr} %`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </section>

                {/* Lifetime counters */}
                <section id="cumuls" className="scroll-mt-24">
                    <SectionHeader
                        eyebrow="Cumuls"
                        title="Chiffres cles du site"
                    />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        <CounterCard
                            label="Lectures cumulees"
                            value={lifetime.article_views}
                            icon={<Eye className="h-4 w-4" />}
                        />
                        <CounterCard
                            label="Articles publies"
                            value={lifetime.articles}
                            icon={<FileText className="h-4 w-4" />}
                        />
                        <CounterCard
                            label="Comptes"
                            value={lifetime.users}
                            icon={<Users className="h-4 w-4" />}
                        />
                        <CounterCard
                            label="Abonnes newsletter"
                            value={lifetime.newsletter_subscribers}
                            icon={<MessageSquare className="h-4 w-4" />}
                        />
                        <CounterCard
                            label="Commentaires"
                            value={lifetime.comments}
                            icon={<Radio className="h-4 w-4" />}
                        />
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.26em] text-primary">
                {eyebrow}
            </span>
            <span className="h-px w-6 bg-primary/40" />
            <h2 className="font-heading text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                {title}
            </h2>
            <span className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-white/10" />
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    trend,
    accent = 'primary',
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: string;
    accent?: 'primary' | 'emerald' | 'amber';
}) {
    const accentGradient =
        accent === 'emerald'
            ? 'from-emerald-500 to-emerald-700 shadow-emerald-500/30'
            : accent === 'amber'
              ? 'from-amber-400 to-amber-600 shadow-amber-500/30'
              : 'from-primary to-emerald-700 shadow-primary/30';
    const isPositive = (trend ?? '').startsWith('+');

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_50px_-20px_rgba(47,106,17,0.3)] dark:border-white/10 dark:bg-gray-900">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/[0.06] transition-transform duration-500 group-hover:scale-125 dark:bg-primary/10"
            />
            <div className="relative flex items-start justify-between">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${accentGradient}`}
                >
                    {icon}
                </div>
                {trend && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${
                            isPositive
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30'
                                : 'bg-red-50 text-red-600 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30'
                        }`}
                    >
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative mt-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-white/50">
                    {title}
                </h3>
                <p className="mt-2 font-heading text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                    {formatNumber(value)}
                </p>
            </div>
            <div
                aria-hidden="true"
                className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-60 transition-opacity group-hover:opacity-100"
            />
        </div>
    );
}

function ChartCard({
    eyebrow,
    title,
    subtitle,
    icon,
    meta,
    children,
}: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    meta?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative border-b border-gray-100 p-5 dark:border-white/5 sm:p-6">
                <div className="mb-3 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                    <span>LE RURAL</span>
                    <span className="h-px w-6 bg-primary/30" />
                    <span className="text-gray-400 dark:text-white/40">
                        {eyebrow}
                    </span>
                    {meta && (
                        <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                            {meta}
                        </span>
                    )}
                </div>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-white/50">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-lg shadow-primary/30">
                            {icon}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
        </div>
    );
}

function ExportButton({
    dataset,
    period,
    label,
}: {
    dataset: string;
    period: Period;
    label: string;
}) {
    return (
        <a
            href={safeRoute('dashboard.stats.export', { dataset, period })}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-tight text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:text-white"
        >
            <Download className="h-3.5 w-3.5" />
            {label}
        </a>
    );
}

function EmptyBlock({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5">
            <CalendarRange className="h-6 w-6 text-gray-300 dark:text-white/25" />
            <p className="text-sm font-semibold text-gray-500 dark:text-white/50">
                {text}
            </p>
        </div>
    );
}

function CounterCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(47,106,17,0.3)] dark:border-white/10 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-emerald-700 group-hover:text-white">
                    {icon}
                </div>
                <Sparkles className="h-3.5 w-3.5 text-primary/40" />
            </div>
            <div className="mt-4">
                <p className="font-heading text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                    {formatNumber(value)}
                </p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
                    {label}
                </p>
            </div>
        </div>
    );
}
