import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    Crown,
    Download,
    Pencil,
    TrendingUp,
    Users,
} from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard, { AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import Notifications from '@/Components/Notifications';

interface PollOption {
    id: number;
    label: string;
    votes: number;
    percentage?: number;
}

interface Poll {
    id: number;
    question: string;
    is_active: boolean;
    expires_at?: string;
    created_at: string;
    options: PollOption[];
    total_votes: number;
}

export default function Results({ poll }: { poll: Poll }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
        setIsExporting(true);
        router.visit(route('dashboard.polls.export', { id: poll.id, format }), {
            onFinish: () => setIsExporting(false),
        });
    };

    const pct = (votes: number) =>
        poll.total_votes === 0 ? 0 : Math.round((votes / poll.total_votes) * 100);

    const sorted = [...poll.options].sort((a, b) => b.votes - a.votes);
    const winner = sorted[0];
    const maxVotes = Math.max(...poll.options.map((o) => o.votes), 0);
    const average =
        poll.total_votes > 0
            ? Math.round(poll.total_votes / poll.options.length)
            : 0;

    const createdLabel = new Date(poll.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <DashboardLayout title={`Résultats · ${poll.question}`}>
            <Head title={`Résultats - ${poll.question}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Résultats"
                    title={poll.question}
                    subtitle={`Créé le ${createdLabel} · ${poll.total_votes} votes comptabilisés`}
                    icon={<BarChart3 className="h-6 w-6" />}
                    meta={
                        <AdminStatusPill tone={poll.is_active ? 'success' : 'neutral'}>
                            {poll.is_active ? 'Actif' : 'Clôturé'}
                        </AdminStatusPill>
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            <AdminLinkButton
                                href={route('dashboard.polls.index')}
                                variant="ghost"
                                icon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Retour
                            </AdminLinkButton>
                            <AdminLinkButton
                                href={route('dashboard.polls.edit', poll.id)}
                                variant="secondary"
                                icon={<Pencil className="h-4 w-4" />}
                            >
                                Modifier
                            </AdminLinkButton>
                        </div>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: 'Votes totaux',
                            value: poll.total_votes,
                            icon: <Users className="h-4 w-4" />,
                        },
                        {
                            label: 'Options',
                            value: poll.options.length,
                            icon: <BarChart3 className="h-4 w-4" />,
                        },
                        {
                            label: 'Votes max',
                            value: maxVotes,
                            icon: <TrendingUp className="h-4 w-4" />,
                        },
                        {
                            label: 'Moyenne',
                            value: average,
                            icon: <Calendar className="h-4 w-4" />,
                        },
                    ].map((stat) => (
                        <AdminCard key={stat.label} padded>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                <span>{stat.label}</span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    {stat.icon}
                                </span>
                            </div>
                            <div className="mt-3 font-heading text-3xl font-black tabular-nums text-gray-900 dark:text-white">
                                {stat.value}
                            </div>
                        </AdminCard>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <AdminCard padded>
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Répartition détaillée
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-white/40">
                                    {poll.options.length} option(s)
                                </span>
                            </div>

                            <div className="space-y-5">
                                {sorted.map((option, index) => {
                                    const percentage = pct(option.votes);
                                    const isWinner = index === 0 && option.votes > 0;
                                    return (
                                        <div key={option.id} className="space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 font-mono text-[10px] font-black text-gray-500 dark:bg-white/5 dark:text-white/50">
                                                        {index + 1}
                                                    </span>
                                                    <span className="truncate font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                        {option.label}
                                                    </span>
                                                    {isWinner && (
                                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white">
                                                            <Crown className="h-2.5 w-2.5" />
                                                            Top
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-gray-500 dark:text-white/50">
                                                        {option.votes} vote{option.votes !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="font-heading font-black tabular-nums text-gray-900 dark:text-white">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                                                <div
                                                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                                                        isWinner
                                                            ? 'bg-gradient-to-r from-primary via-emerald-600 to-emerald-700'
                                                            : 'bg-gradient-to-r from-primary/60 to-primary/80'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </AdminCard>
                    </div>

                    <div className="space-y-6">
                        {winner && poll.total_votes > 0 && (
                            <AdminCard padded className="relative overflow-hidden">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/30 to-primary/20 blur-3xl"
                                />
                                <div className="relative">
                                    <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-600 dark:text-amber-400">
                                        <Crown className="h-3.5 w-3.5" />
                                        Option gagnante
                                    </div>
                                    <div className="font-heading text-xl font-black uppercase leading-tight tracking-tight text-gray-900 dark:text-white">
                                        {winner.label}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500 dark:text-white/50">
                                        {winner.votes} votes · {pct(winner.votes)}%
                                    </div>
                                </div>
                            </AdminCard>
                        )}

                        <AdminCard padded>
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Exporter
                            </div>
                            <div className="flex flex-col gap-2">
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={<Download className="h-3.5 w-3.5" />}
                                    disabled={isExporting}
                                    onClick={() => handleExport('csv')}
                                >
                                    Télécharger CSV
                                </AdminButton>
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={<Download className="h-3.5 w-3.5" />}
                                    disabled={isExporting}
                                    onClick={() => handleExport('excel')}
                                >
                                    Télécharger Excel
                                </AdminButton>
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={<Download className="h-3.5 w-3.5" />}
                                    disabled={isExporting}
                                    onClick={() => handleExport('pdf')}
                                >
                                    Télécharger PDF
                                </AdminButton>
                            </div>
                        </AdminCard>

                        <AdminCard padded>
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Informations
                            </div>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-white/50">Créé le</dt>
                                    <dd className="font-bold text-gray-900 dark:text-white">
                                        {createdLabel}
                                    </dd>
                                </div>
                                {poll.expires_at && (
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-gray-500 dark:text-white/50">Expire le</dt>
                                        <dd className="font-bold text-gray-900 dark:text-white">
                                            {new Date(poll.expires_at).toLocaleDateString('fr-FR')}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-white/50">Statut</dt>
                                    <dd>
                                        <AdminStatusPill
                                            tone={poll.is_active ? 'success' : 'neutral'}
                                        >
                                            {poll.is_active ? 'Actif' : 'Inactif'}
                                        </AdminStatusPill>
                                    </dd>
                                </div>
                            </dl>
                        </AdminCard>
                    </div>
                </div>
            </div>

            <Notifications />
        </DashboardLayout>
    );
}
