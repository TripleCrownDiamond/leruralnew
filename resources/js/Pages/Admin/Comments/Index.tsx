import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import Notifications from '@/Components/Notifications';
import { Checkbox } from '@/Components/ui/checkbox';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock3, MessageSquare, Settings, ShieldAlert, Trash2, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Article {
    id: number;
    title_fr: string;
}

interface Comment {
    id: number;
    content: string;
    is_approved: boolean;
    auto_flagged: boolean;
    created_at: string;
    approved_at?: string | null;
    author_name: string;
    author_email: string;
    user: User | null;
    article: Article | null;
}

interface Props {
    comments: {
        data: Comment[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    redFlags: string[];
    filters?: {
        search?: string;
        status?: string;
        auto_moderation?: string;
    };
}

type StatusFilter = 'all' | 'approved' | 'pending';
type ModerationFilter = 'all' | 'flagged' | 'clean';

export default function Index({ comments, redFlags, filters = {} }: Props) {
    const [selectedComments, setSelectedComments] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>((filters.status as StatusFilter) || 'all');
    const [moderationFilter, setModerationFilter] = useState<ModerationFilter>(
        (filters.auto_moderation as ModerationFilter) || 'all',
    );

    useEffect(() => {
        if (
            search === (filters.search || '') &&
            statusFilter === ((filters.status as StatusFilter) || 'all') &&
            moderationFilter === ((filters.auto_moderation as ModerationFilter) || 'all')
        ) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.visit(route('dashboard.comments.index'), {
                data: {
                    search: search || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    auto_moderation: moderationFilter !== 'all' ? moderationFilter : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, moderationFilter, filters]);

    const toggleSelectAll = () => {
        if (selectedComments.length === comments.data.length) {
            setSelectedComments([]);
            return;
        }

        setSelectedComments(comments.data.map((comment) => comment.id));
    };

    const toggleSelect = (commentId: number) => {
        setSelectedComments((current) =>
            current.includes(commentId)
                ? current.filter((id) => id !== commentId)
                : [...current, commentId],
        );
    };

    const handleApprove = (commentId: number) => {
        router.post(route('dashboard.comments.approve', commentId), {}, { preserveScroll: true });
    };

    const handleReject = (commentId: number) => {
        router.post(route('dashboard.comments.reject', commentId), {}, { preserveScroll: true });
    };

    const handleDelete = (commentId: number) => {
        if (!confirm('Supprimer ce commentaire ?')) return;

        router.delete(route('dashboard.comments.destroy', commentId), {
            preserveScroll: true,
            onSuccess: () => setSelectedComments((current) => current.filter((id) => id !== commentId)),
        });
    };

    const handleBulkApprove = () => {
        if (!selectedComments.length) return;

        if (confirm(`Approuver ${selectedComments.length} commentaire(s) ?`)) {
            router.post(
                route('dashboard.comments.bulk-approve'),
                { comment_ids: selectedComments },
                {
                    preserveScroll: true,
                    onSuccess: () => setSelectedComments([]),
                },
            );
        }
    };

    const handleBulkReject = () => {
        if (!selectedComments.length) return;

        if (confirm(`Rejeter ${selectedComments.length} commentaire(s) ?`)) {
            router.post(
                route('dashboard.comments.bulk-reject'),
                { comment_ids: selectedComments },
                {
                    preserveScroll: true,
                    onSuccess: () => setSelectedComments([]),
                },
            );
        }
    };

    const handleBulkDelete = () => {
        if (!selectedComments.length) return;

        if (confirm(`Supprimer ${selectedComments.length} commentaire(s) ?`)) {
            router.post(
                route('dashboard.comments.bulk-delete'),
                { comment_ids: selectedComments },
                {
                    preserveScroll: true,
                    onSuccess: () => setSelectedComments([]),
                },
            );
        }
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setModerationFilter('all');
        router.visit(route('dashboard.comments.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const from = comments.total === 0 ? 0 : (comments.current_page - 1) * comments.per_page + 1;
    const to = comments.total === 0 ? 0 : Math.min(comments.current_page * comments.per_page, comments.total);
    const commentsSettingsHref = (() => {
        try {
            const routeHelper = route();
            if (typeof routeHelper?.has === 'function' && routeHelper.has('dashboard.comments.settings')) {
                return route('dashboard.comments.settings');
            }
        } catch {
            // Ignore Ziggy errors and use fallback.
        }

        return '/dashboard/comments/settings';
    })();

    const stats = useMemo(() => {
        const approved = comments.data.filter((comment) => comment.is_approved).length;
        const flagged = comments.data.filter((comment) => comment.auto_flagged).length;
        const pending = comments.data.filter((comment) => !comment.is_approved).length;

        return { approved, flagged, pending };
    }, [comments.data]);

    return (
        <DashboardLayout title="Commentaires">
            <Head title="Commentaires" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Moderation"
                    title="Commentaires"
                    subtitle="Traitez les validations, rejets et signalements depuis une vue unique et rapide."
                    icon={<MessageSquare className="h-6 w-6" />}
                    meta={`${comments.total} commentaires`}
                    actions={
                        <>
                            {selectedComments.length > 0 && (
                                <>
                                    <AdminButton
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                        onClick={handleBulkApprove}
                                    >
                                        Approuver ({selectedComments.length})
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        icon={<XCircle className="h-3.5 w-3.5" />}
                                        onClick={handleBulkReject}
                                    >
                                        Rejeter ({selectedComments.length})
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                        onClick={handleBulkDelete}
                                    >
                                        Supprimer ({selectedComments.length})
                                    </AdminButton>
                                </>
                            )}
                            <AdminLinkButton
                                href={commentsSettingsHref}
                                variant="secondary"
                                size="sm"
                                icon={<Settings className="h-3.5 w-3.5" />}
                            >
                                Parametres
                            </AdminLinkButton>
                        </>
                    }
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Approuves (page)" value={stats.approved} tone="success" />
                    <StatCard icon={<Clock3 className="h-4 w-4" />} label="En attente (page)" value={stats.pending} tone="warning" />
                    <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="Signales (page)" value={stats.flagged} tone="danger" />
                </div>

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher dans les commentaires, auteurs, articles..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'approved', label: 'Approuves' },
                                { key: 'pending', label: 'En attente' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setStatusFilter(opt.key as StatusFilter)}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${
                                        statusFilter === opt.key
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
                        <div className="flex flex-wrap items-center gap-2">
                            <FilterSelect value={moderationFilter} onChange={(value) => setModerationFilter(value as ModerationFilter)}>
                                <option value="all">Moderation: tout</option>
                                <option value="flagged">Signales auto</option>
                                <option value="clean">Sans signalement</option>
                            </FilterSelect>

                            <AdminButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                            >
                                Reinitialiser
                            </AdminButton>
                        </div>
                    }
                />

                <AdminCard className="overflow-hidden">
                    {comments.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<MessageSquare className="h-7 w-7" />}
                            title="Aucun commentaire"
                            subtitle="Ajustez les filtres ou attendez de nouvelles interactions lecteurs."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[960px]">
                                    <thead className="border-b border-gray-100 bg-gray-50/80 dark:border-white/10 dark:bg-white/[0.03]">
                                        <tr>
                                            <th className="w-12 px-4 py-3 text-left">
                                                <Checkbox
                                                    checked={comments.data.length > 0 && selectedComments.length === comments.data.length}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Commentaire</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Auteur</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Article</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Date</th>
                                            <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comments.data.map((comment) => {
                                            const authorName = comment.user?.name || comment.author_name || 'Anonyme';
                                            const authorEmail = comment.user?.email || comment.author_email || '-';
                                            const articleTitle = comment.article?.title_fr || 'Article supprime';

                                            return (
                                                <tr
                                                    key={comment.id}
                                                    className="border-b border-gray-100 transition-colors hover:bg-primary/[0.035] dark:border-white/5 dark:hover:bg-white/[0.03]"
                                                >
                                                    <td className="px-4 py-4">
                                                        <Checkbox
                                                            checked={selectedComments.includes(comment.id)}
                                                            onCheckedChange={() => toggleSelect(comment.id)}
                                                        />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="max-w-xl space-y-2">
                                                            <p className="line-clamp-2 text-sm text-gray-700 dark:text-white/80">{comment.content}</p>
                                                            <CommentStatusPill comment={comment} />
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{authorName}</p>
                                                            <p className="text-xs text-gray-500 dark:text-white/50">{authorEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="max-w-[260px] truncate text-sm text-gray-700 dark:text-white/70">{articleTitle}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-gray-600 dark:text-white/60">{formatDate(comment.created_at)}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                                                                                        <AdminButton
                                                                type="button"
                                                                variant="secondary"
                                                                size="icon"
                                                                icon={<CheckCircle2 className="h-4 w-4" />}
                                                                onClick={() => handleApprove(comment.id)}
                                                                title="Approuver"
                                                            />
                                                            <AdminButton
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                icon={<XCircle className="h-4 w-4" />}
                                                                onClick={() => handleReject(comment.id)}
                                                                title="Rejeter"
                                                            />
                                                            <AdminButton
                                                                type="button"
                                                                variant="danger"
                                                                size="icon"
                                                                icon={<Trash2 className="h-4 w-4" />}
                                                                onClick={() => handleDelete(comment.id)}
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

                            <AdminPagination links={comments.links} from={from} to={to} total={comments.total} />
                        </>
                    )}
                </AdminCard>

                <AdminCard padded>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-gray-900 dark:text-white">Mots signales actifs</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-white/60">
                                Ces termes alimentent la moderation automatique des commentaires.
                            </p>
                        </div>
                        <AdminLinkButton
                            href={commentsSettingsHref}
                            variant="secondary"
                            size="sm"
                            icon={<Settings className="h-3.5 w-3.5" />}
                        >
                            Gerer la liste
                        </AdminLinkButton>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {redFlags.length > 0 ? (
                            redFlags.slice(0, 30).map((word) => (
                                <span
                                    key={word}
                                    className="inline-flex items-center rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                                >
                                    <AlertTriangle className="mr-1.5 h-3 w-3" />
                                    {word}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-white/60">Aucun mot signale actif.</p>
                        )}
                    </div>
                </AdminCard>
            </div>

            <Notifications />
        </DashboardLayout>
    );
}

function StatCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: 'success' | 'warning' | 'danger' }) {
    const tones: Record<'success' | 'warning' | 'danger', string> = {
        success: 'from-emerald-500/15 to-emerald-500/5 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
        warning: 'from-amber-500/15 to-amber-500/5 text-amber-700 ring-amber-500/20 dark:text-amber-300',
        danger: 'from-red-500/15 to-red-500/5 text-red-700 ring-red-500/20 dark:text-red-300',
    };

    return (
        <div className={`rounded-2xl bg-gradient-to-br p-4 ring-1 ring-inset ${tones[tone]}`}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.14em]">{label}</p>
                {icon}
            </div>
            <p className="mt-2 text-2xl font-black leading-none">{value}</p>
        </div>
    );
}

function FilterSelect({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: ReactNode }) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80"
        >
            {children}
        </select>
    );
}

function CommentStatusPill({ comment }: { comment: Comment }) {
    if (comment.auto_flagged) {
        return <AdminStatusPill tone="danger">Signale</AdminStatusPill>;
    }

    if (comment.is_approved) {
        return <AdminStatusPill tone="success">Approuve</AdminStatusPill>;
    }

    return <AdminStatusPill tone="warning">En attente</AdminStatusPill>;
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}



