import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    BarChart3,
    Calendar,
    Download,
    Eye,
    Pencil,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import Notifications from '@/Components/Notifications';

interface PollOption {
    id: number;
    label: string;
    votes: number;
}

interface Poll {
    id: number;
    question: string;
    is_active: boolean;
    expires_at?: string;
    created_at: string;
    options_count: number;
    options: PollOption[];
}

interface Props {
    polls: {
        data: Poll[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function Index({ polls, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>(
        (filters.status as any) || 'all',
    );
    const [selected, setSelected] = useState<number[]>([]);
    const resolvePollResultsHref = (pollId: number) => {
        try {
            const routeHelper = route();
            if (typeof routeHelper?.has === 'function' && routeHelper.has('dashboard.polls.results')) {
                return route('dashboard.polls.results', pollId);
            }
        } catch {
            // Ignore Ziggy lookup errors and fallback to a static URL.
        }

        return `/dashboard/polls/${pollId}/results`;
    };

    const pollExportHref = (() => {
        try {
            const routeHelper = route();
            if (typeof routeHelper?.has === 'function' && routeHelper.has('dashboard.polls.export-all')) {
                return route('dashboard.polls.export-all', 'csv');
            }
        } catch {
            // Ignore Ziggy errors and fallback to no-link state.
        }

        return null;
    })();


    useEffect(() => {
        if (
            search === (filters.search || '') &&
            status === ((filters.status as any) || 'all')
        )
            return;

        const timeout = setTimeout(() => {
            router.visit(route('dashboard.polls.index'), {
                data: {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, status]);

    const toggle = (id: number) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );

    const toggleAll = () => {
        setSelected((prev) =>
            prev.length === polls.data.length ? [] : polls.data.map((p) => p.id),
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer ce sondage ?')) {
            router.delete(route('dashboard.polls.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleBulkDelete = () => {
        if (selected.length === 0) return;
        if (confirm(`Supprimer ${selected.length} sondage(s) ?`)) {
            router.post(
                route('dashboard.polls.bulk-delete'),
                { poll_ids: selected },
                { preserveScroll: true, onSuccess: () => setSelected([]) },
            );
        }
    };

    return (
        <DashboardLayout title="Sondages">
            <Head title="Sondages" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Engagement"
                    title="Sondages"
                    subtitle="Creez des consultations eclair pour sonder votre audience rurale."
                    icon={<BarChart3 className="h-6 w-6" />}
                    meta={`${polls.total} sondages`}
                    actions={
                        <div className="flex items-center gap-2">
                            {selected.length > 0 && (
                                <AdminButton
                                    variant="danger"
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={handleBulkDelete}
                                >
                                    Supprimer ({selected.length})
                                </AdminButton>
                            )}
                            <AdminLinkButton
                                href={route('dashboard.polls.create')}
                                variant="primary"
                                icon={<Plus className="h-4 w-4" />}
                            >
                                Nouveau sondage
                            </AdminLinkButton>
                        </div>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher une question, une option..."
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
                                    onClick={() => setStatus(opt.key as any)}
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
                        pollExportHref ? (
                            <AdminLinkButton
                                href={pollExportHref}
                                variant="ghost"
                                size="sm"
                                icon={<Download className="h-3.5 w-3.5" />}
                            >
                                CSV
                            </AdminLinkButton>
                        ) : (
                            <AdminButton type="button" variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} disabled>
                                CSV indisponible
                            </AdminButton>
                        )
                    }
                />

                <AdminCard>
                    {polls.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<BarChart3 className="h-7 w-7" />}
                            title="Aucun sondage"
                            subtitle="Lancez votre premier sondage pour activer la communaute."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.polls.create')}
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                >
                                    Creer un sondage
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selected.length === polls.data.length &&
                                                        polls.data.length > 0
                                                    }
                                                    onChange={toggleAll}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </th>
                                            <th className="px-5 py-3">Question</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Votes</th>
                                            <th className="px-5 py-3 hidden lg:table-cell">Statut</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {polls.data.map((poll) => {
                                            const totalVotes = poll.options.reduce(
                                                (sum, o) => sum + o.votes,
                                                0,
                                            );
                                            return (
                                                <tr
                                                    key={poll.id}
                                                    className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.includes(poll.id)}
                                                            onChange={() => toggle(poll.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="min-w-0">
                                                            <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                                {poll.question}
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-white/50">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Users className="h-3 w-3" />
                                                                    {poll.options_count} options
                                                                </span>
                                                                {poll.expires_at && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {new Date(poll.expires_at).toLocaleDateString('fr-FR')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden px-5 py-4 md:table-cell">
                                                        <span className="tabular-nums font-bold text-gray-900 dark:text-white">
                                                            {totalVotes}
                                                        </span>
                                                        <span className="ml-1 text-[11px] font-medium text-gray-400 dark:text-white/40">
                                                            votes
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-5 py-4 lg:table-cell">
                                                        <AdminStatusPill
                                                            tone={poll.is_active ? 'success' : 'neutral'}
                                                        >
                                                            {poll.is_active ? 'Actif' : 'Inactif'}
                                                        </AdminStatusPill>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                                                                                <div className="flex items-center justify-end gap-2">
                                                            <AdminLinkButton
                                                                href={resolvePollResultsHref(poll.id)}
                                                                variant="ghost"
                                                                size="icon"
                                                                icon={<Eye className="h-4 w-4" />}
                                                                title="Voir les résultats"
                                                            />
                                                            <AdminLinkButton
                                                                href={route('dashboard.polls.edit', poll.id)}
                                                                variant="secondary"
                                                                size="icon"
                                                                icon={<Pencil className="h-4 w-4" />}
                                                                title="Modifier"
                                                            />
                                                            <AdminButton
                                                                variant="danger"
                                                                size="icon"
                                                                icon={<Trash2 className="h-4 w-4" />}
                                                                onClick={() => handleDelete(poll.id)}
                                                                title="Supprimer"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination
                                links={polls.links}
                                from={polls.from}
                                to={polls.to}
                                total={polls.total}
                            />
                        </>
                    )}
                </AdminCard>
            </div>

            <Notifications />
        </DashboardLayout>
    );
}

