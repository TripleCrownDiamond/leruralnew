import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Repeat, Users2 } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton } from '@/Components/Dashboard/AdminButton';

interface Subscription {
    id: number;
    user: { name: string; email: string };
    plan: { name: string; duration_days: number };
    starts_at: string;
    ends_at: string;
    status: 'active' | 'expired' | 'cancelled';
    is_recurring: boolean;
}

interface Props {
    subscriptions: {
        data: Subscription[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function Index({ subscriptions, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    useEffect(() => {
        if (search === (filters.search || '') && status === (filters.status || 'all')) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.visit(route('dashboard.subscriptions.index'), {
                data: {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 280);

        return () => clearTimeout(timeoutId);
    }, [search, status, filters.search, filters.status]);

    const resetFilters = () => {
        setSearch('');
        setStatus('all');

        router.visit(route('dashboard.subscriptions.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const from = subscriptions.from ?? (subscriptions.total === 0 ? 0 : (subscriptions.current_page - 1) * subscriptions.per_page + 1);
    const to = subscriptions.to ?? (subscriptions.total === 0 ? 0 : Math.min(subscriptions.current_page * subscriptions.per_page, subscriptions.total));

    return (
        <DashboardLayout title="Souscriptions">
            <Head title="Souscriptions" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Souscriptions"
                    subtitle="Suivez les abonnements actifs, expires et annules avec la meme lisibilite que la page Articles." 
                    icon={<Users2 className="h-6 w-6" />}
                    meta={`${subscriptions.total} entrees`}
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher un utilisateur, email ou plan..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'active', label: 'Actifs' },
                                { key: 'expired', label: 'Expires' },
                                { key: 'cancelled', label: 'Annules' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setStatus(opt.key)}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${
                                        status === opt.key
                                            ? 'bg-gradient-to-br from-primary to-emerald-700 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-white hover:text-primary dark:text-white/60 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    }
                    trailing={
                        <AdminButton type="button" variant="ghost" size="sm" onClick={resetFilters}>
                            Reinitialiser
                        </AdminButton>
                    }
                />

                <AdminCard>
                    {subscriptions.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<Users2 className="h-7 w-7" />}
                            title="Aucune souscription"
                            subtitle="Aucun abonnement ne correspond aux filtres actuels."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3">Utilisateur</th>
                                            <th className="px-5 py-3">Plan</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Debut</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Fin</th>
                                            <th className="px-5 py-3">Statut</th>
                                            <th className="px-5 py-3 text-right">Recurrence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {subscriptions.data.map((sub) => (
                                            <tr key={sub.id} className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-sm font-black text-white shadow-md shadow-primary/20">
                                                            {sub.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{sub.user.name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-white/50">{sub.user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                        {sub.plan.name}
                                                    </span>
                                                    <div className="mt-1 text-xs text-gray-500 dark:text-white/50">
                                                        {sub.plan.duration_days} jours
                                                    </div>
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell tabular-nums text-gray-600 dark:text-white/70">
                                                    {new Date(sub.starts_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell tabular-nums text-gray-600 dark:text-white/70">
                                                    {new Date(sub.ends_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <AdminStatusPill
                                                        tone={
                                                            sub.status === 'active'
                                                                ? 'success'
                                                                : sub.status === 'expired'
                                                                ? 'neutral'
                                                                : 'danger'
                                                        }
                                                    >
                                                        {sub.status === 'active'
                                                            ? 'Actif'
                                                            : sub.status === 'expired'
                                                            ? 'Expire'
                                                            : 'Annule'}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {sub.is_recurring ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                                                            <Repeat className="h-3.5 w-3.5" />
                                                            Oui
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-white/35">
                                                            Non
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination links={subscriptions.links} from={from} to={to} total={subscriptions.total} />
                        </>
                    )}
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
