import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import { usePendingPurchase } from '@/Hooks/usePendingPurchase';
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    Bookmark,
    CheckCircle,
    Clock,
    CreditCard,
    Eye,
    File,
    FileText,
    Globe,
    Layout,
    LayoutDashboard,
    MessageSquare,
    PlusCircle,
    Settings,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Stats {
    total_users?: number;
    total_articles?: number;
    pending_comments?: number;
    total_views?: number;
    my_articles?: number;
    published_articles?: number;
    saved_articles?: number;
    my_comments?: number;
    subscription_status?: string;
}

interface ChartData {
    articles_per_category?: { name: string; value: number }[];
    top_articles?: { name: string; views: number }[];
}

interface RecentActivity {
    latest_articles?: {
        id: number;
        title: string;
        category?: string;
        status: string;
        date: string;
        views?: number;
    }[];
    latest_users?: {
        id: number;
        name: string;
        email: string;
        role: string;
        date: string;
    }[];
    saved_articles?: {
        id: number;
        title: string;
        slug: string;
        date: string;
    }[];
}

interface Props {
    stats: Stats;
    chartData: ChartData;
    recentActivities: RecentActivity;
}

// Brand-coherent chart palette - primary-driven, editorial greens + accents
const CHART_PALETTE = [
    '#2f6a11', // primary
    '#4a8a1f', // primary lighter
    '#86efac', // emerald 300
    '#10b981', // emerald 500
    '#059669', // emerald 600
    '#f59e0b', // amber for contrast
];

function safeRoute(name: string, params?: any): string {
    try {
        if (typeof route === 'function' && route().has(name)) return route(name, params);
        return '#';
    } catch {
        return '#';
    }
}

function greeting(user: User): string {
    if (user.role === 'admin') return 'Bonjour Admin';
    if (user.role === 'editor') return `Bonjour ${user.name?.split(' ')[0] || 'Editeur'}`;
    return `Bonjour ${user.name?.split(' ')[0] || 'Abonne'}`;
}

function roleLabel(role?: string): string {
    switch ((role || '').toLowerCase()) {
        case 'admin':
            return 'Administration';
        case 'editor':
            return 'Redaction';
        case 'client':
            return 'Abonne Premium';
        default:
            return 'Abonne';
    }
}

function ChartTooltip({ active, payload, label, suffix }: any) {
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
                {suffix && <span className="ml-1 text-[10px] font-black uppercase tracking-wider text-gray-400">{suffix}</span>}
            </div>
        </div>
    );
}

export default function Dashboard({ stats, chartData, recentActivities }: Props) {
    usePendingPurchase();
    const { props } = usePage<any>();
    const user = props.auth.user as User;
    const settings = props.settings ?? {};
    const sharedWidgets = props.widgets ?? {};

    const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
    const dashboardHeroTitle = settings.dashboard_hero_title?.trim() || greeting(user);
    const dashboardQuickActionsTitle = settings.dashboard_quick_actions_title?.trim() || 'Actions rapides';
    const dashboardAgendaTitle = settings.dashboard_agenda_title?.trim() || "Aujourd'hui";
    const dashboardEmptyChartTitle = settings.dashboard_empty_chart_title?.trim() || 'Bienvenue sur votre espace';
    const dashboardEmptyChartSubtitle = settings.dashboard_empty_chart_subtitle?.trim() || 'Votre tableau de bord personnel';
    const dashboardEmptyChartText = settings.dashboard_empty_chart_text?.trim() || '';
    const dashboardAgendaItems = ((sharedWidgets.agenda ?? []) as any[])
        .slice(0, 3)
        .map((item, index) => ({
            label: item?.title ?? 'Element agenda',
            time: item?.time || item?.date || '-',
            dot: ['bg-primary', 'bg-emerald-500', 'bg-amber-500'][index % 3],
        }));

    const renderStats = () => {
        if (user.role === 'admin') {
            return (
                <>
                    <StatCard
                        title="Utilisateurs"
                        value={stats.total_users || 0}
                        icon={<Users className="h-6 w-6" />}
                        accent="primary"
                        trend="+12%"
                    />
                    <StatCard
                        title="Articles"
                        value={stats.total_articles || 0}
                        icon={<FileText className="h-6 w-6" />}
                        accent="emerald"
                    />
                    <StatCard
                        title="Vues Totales"
                        value={stats.total_views || 0}
                        icon={<Eye className="h-6 w-6" />}
                        accent="primary"
                        trend="+28%"
                    />
                    <StatCard
                        title="Commentaires en attente"
                        value={stats.pending_comments || 0}
                        icon={<MessageSquare className="h-6 w-6" />}
                        alert={stats.pending_comments ? stats.pending_comments > 0 : false}
                    />
                </>
            );
        } else if (user.role === 'editor') {
            return (
                <>
                    <StatCard
                        title="Mes Articles"
                        value={stats.my_articles || 0}
                        icon={<FileText className="h-6 w-6" />}
                        accent="primary"
                    />
                    <StatCard
                        title="Articles Publies"
                        value={stats.published_articles || 0}
                        icon={<CheckCircle className="h-6 w-6" />}
                        accent="emerald"
                    />
                    <StatCard
                        title="Vues Totales"
                        value={stats.total_views || 0}
                        icon={<Eye className="h-6 w-6" />}
                        accent="primary"
                    />
                </>
            );
        } else {
            return (
                <>
                    <StatCard
                        title="Articles Sauvegardes"
                        value={stats.saved_articles || 0}
                        icon={<Bookmark className="h-6 w-6" />}
                        accent="primary"
                    />
                    <StatCard
                        title="Mes Commentaires"
                        value={stats.my_comments || 0}
                        icon={<MessageSquare className="h-6 w-6" />}
                        accent="emerald"
                    />
                    <StatCard
                        title="Statut Abonnement"
                        value={stats.subscription_status || 'Standard'}
                        icon={<CreditCard className="h-6 w-6" />}
                        accent="amber"
                        isText
                    />
                </>
            );
        }
    };

    const renderCharts = () => {
        if (user.role === 'admin' && chartData.articles_per_category) {
            const maxValue = Math.max(...chartData.articles_per_category.map((d) => d.value), 1);
            return (
                <ChartCard
                    eyebrow="Analyse"
                    title="Articles par categorie"
                    subtitle="Repartition editoriale"
                    icon={<TrendingUp className="h-5 w-5" />}
                    meta={`${chartData.articles_per_category.length} rubriques`}
                >
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.articles_per_category} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                                <defs>
                                    {chartData.articles_per_category.map((_, i) => (
                                        <linearGradient key={`grad-${i}`} id={`catGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={CHART_PALETTE[i % CHART_PALETTE.length]} stopOpacity={1} />
                                            <stop offset="100%" stopColor={CHART_PALETTE[i % CHART_PALETTE.length]} stopOpacity={0.45} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', fillOpacity: 0.55 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={12}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', fillOpacity: 0.5 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={32}
                                />
                                <Tooltip content={<ChartTooltip suffix="articles" />} cursor={{ fill: 'rgba(47,106,17,0.08)', radius: 12 }} />
                                <Bar dataKey="value" radius={[12, 12, 4, 4]} maxBarSize={64}>
                                    {chartData.articles_per_category.map((_, i) => (
                                        <Cell key={`cell-${i}`} fill={`url(#catGrad-${i})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-white/5">
                        {chartData.articles_per_category.slice(0, 6).map((item, i) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                            >
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                                {item.name}
                                <span className="ml-1 text-gray-400 tabular-nums dark:text-white/40">
                                    {Math.round((item.value / maxValue) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            );
        }
        if (user.role === 'editor' && chartData.top_articles) {
            return (
                <ChartCard
                    eyebrow="Performance"
                    title="Mes articles les plus vus"
                    subtitle="Classement par lectures"
                    icon={<Activity className="h-5 w-5" />}
                    meta={`Top ${chartData.top_articles.length}`}
                >
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData.top_articles}
                                layout="vertical"
                                margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="topArticleGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#2f6a11" stopOpacity={0.7} />
                                        <stop offset="100%" stopColor="#86efac" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.08} horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', fillOpacity: 0.5 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={160}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor', fillOpacity: 0.75 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<ChartTooltip suffix="vues" />} cursor={{ fill: 'rgba(47,106,17,0.06)', radius: 12 }} />
                                <Bar dataKey="views" radius={[4, 12, 12, 4]} barSize={22} fill="url(#topArticleGrad)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            );
        }
        return null;
    };

    const renderRecentActivity = () => {
        if (user.role === 'admin' && recentActivities.latest_articles && recentActivities.latest_users) {
            return (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ListCard
                        eyebrow="Redaction"
                        title="Derniers articles"
                        icon={<FileText className="h-5 w-5" />}
                        cta={{ href: safeRoute('dashboard.articles.index'), label: 'Voir tous' }}
                    >
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {recentActivities.latest_articles.map((article) => (
                                <div key={article.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">
                                            {article.title}
                                        </h4>
                                        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-white/50">
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                                {article.category}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-white/20" />
                                            <span>{article.date}</span>
                                        </div>
                                    </div>
                                    <StatusPill status={article.status} />
                                </div>
                            ))}
                        </div>
                    </ListCard>

                    <ListCard
                        eyebrow="Communaute"
                        title="Nouveaux abonnes"
                        icon={<Users className="h-5 w-5" />}
                        cta={{ href: safeRoute('dashboard.users.index'), label: 'Gerer' }}
                    >
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {recentActivities.latest_users.map((u) => (
                                <div key={u.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-sm font-black text-white shadow-lg shadow-primary/30">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                {u.name}
                                            </h4>
                                            <p className="truncate text-xs text-gray-500 dark:text-white/50">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                            {u.role}
                                        </span>
                                        <span className="mt-0.5 block text-[10px] text-gray-400 dark:text-white/40">
                                            {u.date}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ListCard>
                </div>
            );
        }
        if (user.role === 'editor' && recentActivities.latest_articles) {
            return (
                <ListCard
                    eyebrow="Mes publications"
                    title="Derniers articles"
                    icon={<Clock className="h-5 w-5" />}
                    cta={{ href: safeRoute('dashboard.articles.index'), label: 'Gerer' }}
                >
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {recentActivities.latest_articles.map((article) => (
                            <div key={article.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                <div className="min-w-0 flex-1">
                                    <h4 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">
                                        {article.title}
                                    </h4>
                                    <div className="mt-1.5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-white/50">
                                        <span>{article.date}</span>
                                        <span className="flex items-center gap-1 text-primary">
                                            <Eye className="h-3 w-3" /> {article.views ?? 0}
                                        </span>
                                    </div>
                                </div>
                                <StatusPill status={article.status} />
                            </div>
                        ))}
                    </div>
                </ListCard>
            );
        }
        if (recentActivities.saved_articles && recentActivities.saved_articles.length > 0) {
            return (
                <ListCard
                    eyebrow="Mes favoris"
                    title="Articles sauvegardes"
                    icon={<Bookmark className="h-5 w-5" />}
                >
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {recentActivities.saved_articles.map((article) => (
                            <div key={article.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={safeRoute('article.show', article.slug)}
                                        className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors hover:text-primary dark:text-white"
                                    >
                                        {article.title}
                                    </Link>
                                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-white/50">
                                        Sauvegarde {article.date}
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-300 dark:text-white/30" />
                            </div>
                        ))}
                    </div>
                </ListCard>
            );
        }
        return null;
    };

    const renderQuickActions = () => {
        if (user.role === 'admin') {
            return (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                    <QuickAction title="Nouvel article" href={safeRoute('dashboard.articles.create')} icon={<PlusCircle className="h-5 w-5" />} />
                    <QuickAction title="Articles" href={safeRoute('dashboard.articles.index')} icon={<FileText className="h-5 w-5" />} />
                    <QuickAction title="Utilisateurs" href={safeRoute('dashboard.users.index')} icon={<Users className="h-5 w-5" />} />
                    <QuickAction title="Commentaires" href={safeRoute('dashboard.comments.index')} icon={<MessageSquare className="h-5 w-5" />} />
                    <QuickAction title="Categories" href={safeRoute('dashboard.categories.index')} icon={<Bookmark className="h-5 w-5" />} />
                    <QuickAction title="Nos parutions" href={safeRoute('dashboard.press-papers.index')} icon={<File className="h-5 w-5" />} />
                    <QuickAction title="Paiements" href={safeRoute('dashboard.payments.index')} icon={<CreditCard className="h-5 w-5" />} />
                    <QuickAction title="Abonnements" href={safeRoute('dashboard.subscriptions.index')} icon={<Sparkles className="h-5 w-5" />} />
                    <QuickAction title="Mediatheque" href={safeRoute('dashboard.media.index')} icon={<Layout className="h-5 w-5" />} />
                    <QuickAction title="Sondages" href={safeRoute('dashboard.polls.index')} icon={<Activity className="h-5 w-5" />} />
                    <QuickAction title="Pages" href={safeRoute('dashboard.static-pages.index')} icon={<Globe className="h-5 w-5" />} />
                    <QuickAction title="Parametres" href={safeRoute('dashboard.settings.payment')} icon={<Settings className="h-5 w-5" />} />
                </div>
            );
        } else if (user.role === 'editor') {
            return (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    <QuickAction title="Nouvel article" href={safeRoute('dashboard.articles.create')} icon={<PlusCircle className="h-5 w-5" />} />
                    <QuickAction title="Mon profil" href={safeRoute('profile.edit')} icon={<Settings className="h-5 w-5" />} />
                </div>
            );
        } else {
            return (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    <QuickAction title="Accueil" href="/" icon={<LayoutDashboard className="h-5 w-5" />} />
                    <QuickAction title="Mon profil" href={safeRoute('profile.edit')} icon={<Settings className="h-5 w-5" />} />
                </div>
            );
        }
    };

    const heroSubtitle =
        user.role === 'admin'
            ? "Supervisez la redaction, les abonnes et les performances editoriales de LE RURAL."
            : user.role === 'editor'
              ? 'Gerez vos articles, suivez leurs performances et publiez de nouveaux contenus.'
              : 'Retrouvez vos articles favoris, vos commentaires et le statut de votre abonnement.';

    return (
        <DashboardLayout title="Tableau de bord">
            <Head title="Tableau de bord" />

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

                    <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <div className="mb-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.32em] text-white/70">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-80" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                                </span>
                                <span>LE RURAL</span>
                                <span className="text-white/25">/</span>
                                <span className="text-primary">{roleLabel(user.role)}</span>
                                <span className="text-white/25">.</span>
                                <span className="capitalize text-white/50">{today}</span>
                            </div>

                            <h1 className="font-heading text-4xl font-black uppercase tracking-tight leading-[0.95] sm:text-5xl">
                                {dashboardHeroTitle}
                                <span className="text-primary">.</span>
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                                {heroSubtitle}
                            </p>
                        </div>

                        {/* Live status card */}
                        <div className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:w-auto">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg shadow-primary/30">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/50">
                                        Statut
                                    </div>
                                    <div className="font-heading text-lg font-black uppercase tracking-tight">
                                        En ligne
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">Desk</div>
                                    <div className="mt-0.5 font-heading text-sm font-black">Actif</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">Diffusion</div>
                                    <div className="mt-0.5 font-heading text-sm font-black text-primary">Live</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">Zone</div>
                                    <div className="mt-0.5 font-heading text-sm font-black">Afrique O.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {renderStats()}
                </div>

                {/* Quick Actions */}
                <div>
                    <SectionHeader eyebrow="Raccourcis" title={dashboardQuickActionsTitle} />
                    {renderQuickActions()}
                </div>

                {/* Charts & activity */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <SectionHeader eyebrow="Analyse" title="Performance editoriale" />
                        {renderCharts() || (
                            <ChartCard
                                eyebrow="Activite"
                                title={dashboardEmptyChartTitle}
                                subtitle={dashboardEmptyChartSubtitle}
                                icon={<Activity className="h-5 w-5" />}
                                meta={roleLabel(user.role)}
                            >
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-white/60">
                                    {dashboardEmptyChartText || (
                                        <>
                                            Vous etes connecte en tant que <span className="font-black text-primary">{roleLabel(user.role)}</span>.
                                            Parcourez vos raccourcis ci-dessus pour retrouver vos contenus, gerer votre profil ou decouvrir les
                                            derniers articles publies par la redaction.
                                        </>
                                    )}
                                </p>
                            </ChartCard>
                        )}
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        <SectionHeader eyebrow="Agenda" title={dashboardAgendaTitle} />
                        <AgendaCard today={today} items={dashboardAgendaItems} />
                    </div>
                </div>

                {/* Recent activity */}
                <div>
                    <SectionHeader eyebrow="Activite recente" title="Ce qui bouge" />
                    {renderRecentActivity()}
                </div>
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
    alert = false,
    isText = false,
    trend,
    accent = 'primary',
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    alert?: boolean;
    isText?: boolean;
    trend?: string;
    accent?: 'primary' | 'emerald' | 'amber';
}) {
    const formattedValue = typeof value === 'number' ? new Intl.NumberFormat('fr-FR').format(value) : value;
    const accentGradient = alert
        ? 'from-red-500 to-red-600 shadow-red-500/30'
        : accent === 'emerald'
          ? 'from-emerald-500 to-emerald-700 shadow-emerald-500/30'
          : accent === 'amber'
            ? 'from-amber-400 to-amber-600 shadow-amber-500/30'
            : 'from-primary to-emerald-700 shadow-primary/30';

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_50px_-20px_rgba(47,106,17,0.3)] dark:bg-gray-900 ${
                alert
                    ? 'border-red-300 shadow-[0_10px_30px_-15px_rgba(239,68,68,0.4)] dark:border-red-500/40'
                    : 'border-gray-200 shadow-[0_10px_30px_-18px_rgba(47,106,17,0.15)] dark:border-white/10'
            }`}
        >
            {/* Diagonal accent stripe */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/[0.06] transition-transform duration-500 group-hover:scale-125 dark:bg-primary/10"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }}
            />

            <div className="relative flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${accentGradient}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </span>
                )}
            </div>

            <div className="relative mt-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-white/50">
                    {title}
                </h3>
                <p className={`mt-2 font-heading font-black tracking-tight text-gray-900 dark:text-white ${isText ? 'text-2xl' : 'text-4xl'}`}>
                    {formattedValue}
                </p>
            </div>

            {/* Bottom rail */}
            <div
                aria-hidden="true"
                className={`absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-gradient-to-r ${
                    alert ? 'from-red-500/40 via-red-500 to-red-500/40' : 'from-primary/30 via-primary to-primary/30'
                } opacity-60 transition-opacity group-hover:opacity-100`}
            />
        </div>
    );
}

function QuickAction({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
    return (
        <Link
            href={href}
            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_14px_30px_-15px_rgba(47,106,17,0.3)] dark:border-white/10 dark:bg-gray-900"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -right-16 w-32 rotate-12 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
            />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-emerald-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30">
                {icon}
            </div>
            <span className="relative flex-1 text-sm font-bold text-gray-900 dark:text-white">{title}</span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary dark:text-white/30" />
        </Link>
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
                className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
            />
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

function ListCard({
    eyebrow,
    title,
    icon,
    cta,
    children,
}: {
    eyebrow: string;
    title: string;
    icon?: React.ReactNode;
    cta?: { href: string; label: string };
    children: React.ReactNode;
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900">
            <div className="border-b border-gray-100 p-5 dark:border-white/5 sm:p-6">
                <div className="mb-3 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                    <span>LE RURAL</span>
                    <span className="h-px w-6 bg-primary/30" />
                    <span className="text-gray-400 dark:text-white/40">{eyebrow}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    {icon && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            {icon}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
            {cta && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                    <Link
                        href={cta.href}
                        className="group flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary transition-colors hover:text-emerald-700"
                    >
                        {cta.label}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            )}
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isPublished = status === 'Publie' || status === 'published';
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                isPublished
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {status}
        </span>
    );
}

function AgendaCard({ today, items }: { today: string; items: { label: string; time: string; dot: string }[] }) {
    const hour = new Date().getHours();
    const block = hour < 12 ? 'Matinee' : hour < 18 ? 'Apres-midi' : 'Soiree';

    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative">
                <div className="mb-3 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                    <span>LE RURAL</span>
                    <span className="h-px w-6 bg-primary/30" />
                    <span className="text-gray-400 dark:text-white/40">Desk</span>
                </div>

                <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {block}
                </h3>
                <p className="mt-1 text-xs font-medium capitalize text-gray-500 dark:text-white/50">{today}</p>

                <div className="mt-6 space-y-3">
                    {items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-xs font-semibold text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                            Aucun element agenda actif pour le moment.
                        </div>
                    ) : items.map((item, index) => (
                        <div
                            key={`${item.label}-${index}`}
                            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/5 dark:bg-white/[0.02]"
                        >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.dot} bg-opacity-15 text-[10px] font-black uppercase tracking-wider`}>
                                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-white/40">
                                    {item.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}



