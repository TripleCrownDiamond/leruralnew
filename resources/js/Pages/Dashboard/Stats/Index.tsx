import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    CalendarRange,
    Eye,
    FileText,
    Globe,
    MessageSquare,
    Newspaper,
    Radio,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
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
}

const PERIODS: { key: Period; label: string }[] = [
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: '7 jours' },
    { key: 'month', label: '30 jours' },
    { key: 'year', label: '12 mois' },
    { key: 'all', label: 'Tout' },
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

function safeRoute(name: string, params?: any): string {
    try {
        if (typeof route === 'function' && route().has(name)) return route(name, params);
        return '#';
    } catch {
        return '#';
    }
}

function changePeriod(period: Period) {
    router.get(safeRoute('dashboard.stats.index'), { period }, { preserveState: true, preserveScroll: true, replace: true });
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
                <span className="ml-1 text-[10px] font-black uppercase tracking-wider text-gray-400">vues</span>
            </div>
        </div>
    );
}

export default function StatsIndex({ period, totals, series, top_articles, top_pages, lifetime }: Props) {
    const hasData = totals.views > 0;
    const totalSeries = series.reduce((sum, point) => sum + (point.views || 0), 0);

    const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? '30 jours';

    return (
        <DashboardLayout title="Statistiques">
            <Head title="Statistiques" />

            <div className="space-y-10">
                {/* Editorial Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-primary/40 p-8 text-white shadow-[0_30px_80px_-30px_rgba(47,106,17,0.6)] sm:p-10">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '26px 26px' }}
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

                        <h1 className="font-heading text-4xl font-black uppercase tracking-tight leading-[0.95] sm:text-5xl">
                            Audience &amp; trafic<span className="text-primary">.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                            Mesurez l'impact de la redaction : pages vues, articles consultes et evolution de l'audience.
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

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={`Vues · ${periodLabel}`}
                        value={totals.views}
                        icon={<Eye className="h-6 w-6" />}
                        accent="primary"
                        trend={totals.evolution === null ? undefined : `${totals.evolution >= 0 ? '+' : ''}${totals.evolution}%`}
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
                <section>
                    <SectionHeader eyebrow="Analyse" title="Evolution du trafic" />
                    <ChartCard
                        eyebrow="Frequentation"
                        title={`Trafic · ${periodLabel}`}
                        subtitle={hasData ? `${formatNumber(totalSeries)} pages vues sur la periode` : 'Les statistiques se remplissent au fil des visites'}
                        icon={<BarChart3 className="h-5 w-5" />}
                        meta={series.length > 0 ? `${series.length} points` : undefined}
                    >
                        {hasData && series.length > 0 ? (
                            <div className="h-80 w-full min-h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={series} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={CHART_COLORS.primaryLight} stopOpacity={0.85} />
                                                <stop offset="55%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                                                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', fillOpacity: 0.55 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickMargin={12}
                                            minTickGap={24}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', fillOpacity: 0.5 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={36}
                                        />
                                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART_COLORS.primary, strokeOpacity: 0.3, strokeDasharray: '3 3' }} />
                                        <Area
                                            type="monotone"
                                            dataKey="views"
                                            stroke={CHART_COLORS.primary}
                                            strokeWidth={2.5}
                                            fill="url(#trafficGrad)"
                                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
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
                                    Le suivi d'audience vient d'etre active : les premieres donnees apparaissent des les prochaines visites du site.
                                </p>
                            </div>
                        )}
                    </ChartCard>
                </section>

                {/* Top articles + top pages */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ChartCard
                        eyebrow="Contenus"
                        title="Articles les plus vus"
                        subtitle={`Classement sur ${periodLabel}`}
                        icon={<Newspaper className="h-5 w-5" />}
                        meta={`Top ${top_articles.length}`}
                    >
                        {top_articles.length > 0 ? (
                            <div className="space-y-2">
                                {top_articles.map((article, index) => (                                    <div key={article.id}
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
                                                <Link href={safeRoute('article.show', article.slug)} className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors hover:text-primary dark:text-white">
                                                    {article.title}
                                                </Link>
                                            ) : (
                                                <span className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">{article.title}</span>
                                            )}
                                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-white/40">
                                                <Eye className="h-3 w-3 text-primary" />
                                                {formatNumber(article.views)} vues
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
                                    const width = Math.max((page.views / maxViews) * 100, 6);
                                    return (
                                        <div key={page.path} className="group flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-3">
                                                    <span className="line-clamp-1 font-mono text-xs font-bold text-gray-900 dark:text-white">
                                                        /{page.path.replace(/^\//, '')}
                                                    </span>
                                                    <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-primary tabular-nums">
                                                        {formatNumber(page.views)}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 group-hover:from-emerald-600 group-hover:to-primary"
                                                        style={{ width: `${width}%` }}
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

                {/* Lifetime counters */}
                <section>
                    <SectionHeader eyebrow="Cumuls" title="Chiffres cles du site" />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        <CounterCard label="Lectures cumulees" value={lifetime.article_views} icon={<Eye className="h-4 w-4" />} />
                        <CounterCard label="Articles publies" value={lifetime.articles} icon={<FileText className="h-4 w-4" />} />
                        <CounterCard label="Comptes" value={lifetime.users} icon={<Users className="h-4 w-4" />} />
                        <CounterCard label="Abonnes newsletter" value={lifetime.newsletter_subscribers} icon={<MessageSquare className="h-4 w-4" />} />
                        <CounterCard label="Commentaires" value={lifetime.comments} icon={<Radio className="h-4 w-4" />} />
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
            <span className="text-[10px] font-black uppercase tracking-[0.26em] text-primary">{eyebrow}</span>
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${accentGradient}`}>
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
            <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative border-b border-gray-100 p-5 dark:border-white/5 sm:p-6">
                <div className="mb-3 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                    <span>LE RURAL</span>
                    <span className="h-px w-6 bg-primary/30" />
                    <span className="text-gray-400 dark:text-white/40">{eyebrow}</span>
                    {meta && <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{meta}</span>}
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

function EmptyBlock({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5">
            <CalendarRange className="h-6 w-6 text-gray-300 dark:text-white/25" />
            <p className="text-sm font-semibold text-gray-500 dark:text-white/50">{text}</p>
        </div>
    );
}

function CounterCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
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
