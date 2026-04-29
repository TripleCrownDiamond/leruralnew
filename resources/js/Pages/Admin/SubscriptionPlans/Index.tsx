import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Crown, Edit, Plus, Star, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';

interface Plan {
    id: number;
    name: string;
    slug: string;
    price: number;
    currency: string;
    duration_days: number;
    is_active: boolean;
    is_featured: boolean;
}

interface Props {
    plans: {
        data: Plan[];
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
        featured?: string;
    };
}

export default function Index({ plans, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [featured, setFeatured] = useState(filters.featured || 'all');

    useEffect(() => {
        if (
            search === (filters.search || '') &&
            status === (filters.status || 'all') &&
            featured === (filters.featured || 'all')
        ) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.visit(route('dashboard.subscription-plans.index'), {
                data: {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                    featured: featured !== 'all' ? featured : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 280);

        return () => clearTimeout(timeoutId);
    }, [search, status, featured, filters.search, filters.status, filters.featured]);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer ce plan ?')) return;

        router.delete(route('dashboard.subscription-plans.destroy', id), {
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setFeatured('all');

        router.visit(route('dashboard.subscription-plans.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const formatPrice = (amount: number, currency: string) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);

    const from = plans.from ?? (plans.total === 0 ? 0 : (plans.current_page - 1) * plans.per_page + 1);
    const to = plans.to ?? (plans.total === 0 ? 0 : Math.min(plans.current_page * plans.per_page, plans.total));

    return (
        <DashboardLayout title="Plans d'abonnement">
            <Head title="Plans d'abonnement" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Plans d'abonnement"
                    subtitle="Gerez les offres Premium, les prix et la mise en avant depuis une seule grille." 
                    icon={<Crown className="h-6 w-6" />}
                    meta={`${plans.total} plans`}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.subscription-plans.create')}
                            variant="primary"
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Nouveau plan
                        </AdminLinkButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher un plan, une description..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'active', label: 'Actifs' },
                                { key: 'inactive', label: 'Inactifs' },
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
                        <div className="flex items-center gap-2">
                            <select
                                value={featured}
                                onChange={(event) => setFeatured(event.target.value)}
                                className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80"
                            >
                                <option value="all">Toutes visibilites</option>
                                <option value="featured">Mis en avant</option>
                                <option value="not_featured">Standard</option>
                            </select>

                            <AdminButton type="button" variant="ghost" size="sm" onClick={resetFilters}>
                                Reinitialiser
                            </AdminButton>
                        </div>
                    }
                />

                <AdminCard>
                    {plans.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<Crown className="h-7 w-7" />}
                            title="Aucun plan"
                            subtitle="Creez votre premiere offre d'abonnement pour lancer la monetisation."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.subscription-plans.create')}
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                >
                                    Creer un plan
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3">Plan</th>
                                            <th className="px-5 py-3 hidden sm:table-cell">Prix</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Duree</th>
                                            <th className="px-5 py-3">Statut</th>
                                            <th className="px-5 py-3 hidden lg:table-cell">Mise en avant</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {plans.data.map((plan) => (
                                            <tr
                                                key={plan.id}
                                                className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="min-w-0">
                                                        <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                            {plan.name}
                                                        </div>
                                                        <div className="mt-1 font-mono text-[11px] text-gray-500 dark:text-white/50">
                                                            {plan.slug}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-5 py-4 sm:table-cell">
                                                    <span className="font-heading text-sm font-black tabular-nums text-gray-900 dark:text-white">
                                                        {formatPrice(plan.price, plan.currency)}
                                                    </span>
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell">
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-white/75">
                                                        {plan.duration_days} jours
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <AdminStatusPill tone={plan.is_active ? 'success' : 'neutral'}>
                                                        {plan.is_active ? 'Actif' : 'Inactif'}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="hidden px-5 py-4 lg:table-cell">
                                                    {plan.is_featured ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                            <Star className="h-3 w-3" />
                                                            Vedette
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-white/35">
                                                            Standard
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <AdminLinkButton
                                                            href={route('dashboard.subscription-plans.edit', plan.id)}
                                                            variant="secondary"
                                                            size="sm"
                                                            icon={<Edit className="h-3.5 w-3.5" />}
                                                        >
                                                            Modifier
                                                        </AdminLinkButton>
                                                        <AdminButton
                                                            variant="danger"
                                                            size="sm"
                                                            icon={<Trash2 className="h-3.5 w-3.5" />}
                                                            onClick={() => handleDelete(plan.id)}
                                                        >
                                                            Suppr.
                                                        </AdminButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination links={plans.links} from={from} to={to} total={plans.total} />
                        </>
                    )}
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
