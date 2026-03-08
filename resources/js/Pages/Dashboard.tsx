import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { User } from '@/types';
import {
    Users,
    FileText,
    MessageSquare,
    Eye,
    Bookmark,
    CreditCard,
    TrendingUp,
    Activity,
    Clock,
    CheckCircle,
    ArrowRight,
    Zap,
    PlusCircle,
    Settings,
    LayoutDashboard,
    LogOut,
    Layout,
    Globe,
    File
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard({ stats, chartData, recentActivities }: Props) {
    const { props } = usePage<any>();
    const user = props.auth.user as User;

    const renderStats = () => {
        if (user.role === 'admin') {
            return (
                <>
                    <StatCard
                        title="Utilisateurs"
                        value={stats.total_users || 0}
                        icon={<Users className="h-6 w-6" />}
                        trend="+12%" // Mock trend
                    />
                    <StatCard
                        title="Articles"
                        value={stats.total_articles || 0}
                        icon={<FileText className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Vues Totales"
                        value={stats.total_views || 0}
                        icon={<Eye className="h-6 w-6" />}
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
                    />
                    <StatCard
                        title="Articles Publiés"
                        value={stats.published_articles || 0}
                        icon={<CheckCircle className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Vues Totales"
                        value={stats.total_views || 0}
                        icon={<Eye className="h-6 w-6" />}
                    />
                </>
            );
        } else {
            return (
                <>
                    <StatCard
                        title="Articles Sauvegardés"
                        value={stats.saved_articles || 0}
                        icon={<Bookmark className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Mes Commentaires"
                        value={stats.my_comments || 0}
                        icon={<MessageSquare className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Statut Abonnement"
                        value={stats.subscription_status || 'Standard'}
                        icon={<CreditCard className="h-6 w-6" />}
                        isText
                    />
                </>
            );
        }
    };

    const renderCharts = () => {
        if (user.role === 'admin' && chartData.articles_per_category) {
            return (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Articles par Catégorie
                    </h3>
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.articles_per_category} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.articles_per_category.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        } else if (user.role === 'editor' && chartData.top_articles) {
            return (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Mes Articles les plus vus
                    </h3>
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.top_articles} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="views" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                                    {chartData.top_articles.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderRecentActivity = () => {
        if (user.role === 'admin' && recentActivities.latest_articles && recentActivities.latest_users) {
            return (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Derniers Articles
                        </h3>
                        <div className="space-y-4">
                            {recentActivities.latest_articles.map((article) => (
                                <div key={article.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{article.title}</h4>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{article.category}</span>
                                            <span>•</span>
                                            <span>{article.date}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            article.status === 'Publié' 
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                            : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        }`}>
                                            {article.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-2 text-center border-t border-gray-100 dark:border-gray-700">
                            <Link href={route('dashboard.articles.index')} className="text-sm font-medium text-primary hover:underline">
                                Voir tous les articles
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            Derniers Utilisateurs
                        </h3>
                        <div className="space-y-4">
                            {recentActivities.latest_users.map((u) => (
                                <div key={u.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{u.name}</h4>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500 block">{u.date}</span>
                                        <span className="text-xs font-medium uppercase text-gray-400">{u.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        } else if (user.role === 'editor' && recentActivities.latest_articles) {
             return (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        Mes Derniers Articles
                    </h3>
                    <div className="space-y-4">
                        {recentActivities.latest_articles.map((article) => (
                            <div key={article.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{article.title}</h4>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                        <span>{article.date}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Eye size={12}/> {article.views}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        article.status === 'Publié' 
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    }`}>
                                        {article.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-2 text-center border-t border-gray-100 dark:border-gray-700">
                        <Link href={route('dashboard.articles.index')} className="text-sm font-medium text-primary hover:underline">
                            Gérer mes articles
                        </Link>
                    </div>
                </div>
            );
        } else if (recentActivities.saved_articles && recentActivities.saved_articles.length > 0) {
             return (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bookmark className="h-5 w-5 text-primary" />
                        Articles Récemment Sauvegardés
                    </h3>
                    <div className="space-y-4">
                        {recentActivities.saved_articles.map((article) => (
                            <div key={article.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                                <div>
                                    <Link href={route('article.show', article.slug)} className="font-medium text-gray-900 dark:text-white hover:text-primary line-clamp-1">
                                        {article.title}
                                    </Link>
                                    <div className="mt-1 text-xs text-gray-500">
                                        Sauvegardé {article.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderQuickActions = () => {
        if (user.role === 'admin') {
            return (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <QuickAction
                        title="Nouvel Article"
                        href={route('dashboard.articles.create')}
                        icon={<PlusCircle className="h-5 w-5" />}
                    />
                    <QuickAction
                        title="Gérer Commentaires"
                        href={route('dashboard.comments.index')}
                        icon={<MessageSquare className="h-5 w-5" />}
                    />
                    <QuickAction
                        title="Config. Widgets"
                        href={route('dashboard.widgets.index')}
                        icon={<Layout className="h-5 w-5" />}
                    />
                    <QuickAction
                        title="Ajouter Page"
                        href={route('dashboard.pages.create')}
                        icon={<File className="h-5 w-5" />}
                    />
                    <QuickAction
                        title="Infos Footer"
                        href={route('dashboard.footer.index')}
                        icon={<Globe className="h-5 w-5" />}
                    />
                    <QuickAction
                        title="Paramètres"
                        href={route('dashboard.settings.payment')}
                        icon={<Settings className="h-5 w-5" />}
                    />
                </div>
            );
        } else if (user.role === 'editor') {
            return (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                     <QuickAction
                        title="Nouvel Article"
                        href={route('dashboard.articles.create')}
                        icon={<PlusCircle className="h-5 w-5" />}
                    />
                    <QuickAction
                        title="Mon Profil"
                        href={route('profile.edit')}
                        icon={<Settings className="h-5 w-5" />}
                    />
                </div>
            );
        } else {
             return (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <QuickAction
                        title="Retour à l'accueil"
                        href="/"
                        icon={<LayoutDashboard className="h-5 w-5" />}
                    />
                    <QuickAction
                        title="Mon Profil"
                        href={route('profile.edit')}
                        icon={<Settings className="h-5 w-5" />}
                    />
                </div>
            );
        }
    };

    return (
        <DashboardLayout title="Tableau de bord">
            <Head title="Tableau de bord" />

            <div className="space-y-8">
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Vue d'ensemble
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bienvenue, {user.name} ! Voici ce qui se passe aujourd'hui.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {renderStats()}
                </div>

                {/* Main Content Area: Charts & Lists */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Charts take up 2 columns on large screens if present */}
                    <div className={`lg:col-span-2 space-y-8`}>
                        {renderCharts()}
                        
                        {/* Fallback for users with no charts */}
                        {!chartData.articles_per_category && !chartData.top_articles && (
                             <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Activité Récente</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Vous êtes connecté en tant que <span className="font-bold uppercase">{user.role === 'user' ? 'utilisateur' : user.role}</span>.
                                    Explorez le site pour découvrir les derniers articles et actualités.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Side Lists (Recent Activity) */}
                    <div className="lg:col-span-1 space-y-8">
                         {/* We might want to move Recent Activity here for layout balance */}
                         {/* Actually, for Admin, we have 2 lists (Articles & Users). 
                             Let's just render them below the charts for now, or mix them. 
                             The renderRecentActivity function returns a grid for admin.
                          */}
                    </div>
                </div>
                
                {/* Full Width Recent Activity Section */}
                 {renderRecentActivity()}

            </div>
        </DashboardLayout>
    );
}

function StatCard({ 
    title, 
    value, 
    icon, 
    alert = false, 
    isText = false,
    trend
}: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    alert?: boolean; 
    isText?: boolean;
    trend?: string;
}) {
    return (
        <div className={`rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 transition-all hover:shadow-md ${alert ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between">
                <div className={`rounded-full p-3 ${alert ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        {trend}
                    </span>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <p className={`mt-1 font-bold text-gray-900 dark:text-white ${isText ? 'text-lg' : 'text-3xl'}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function QuickAction({
    href,
    icon,
    title
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
            <div className="text-primary">
                {icon}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
                {title}
            </span>
        </Link>
    );
}