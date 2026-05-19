import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CreditCard, Eye, Plus } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';

interface Payment {
    id: number;
    user: { name: string; email: string };
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_method: string;
    type: string;
    created_at: string;
}

interface Props {
    payments: {
        data: Payment[];
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
        type?: string;
    };
}

const STATUS_LABEL: Record<Payment['status'], string> = {
    completed: 'Complete',
    pending: 'En attente',
    failed: 'Echoue',
    cancelled: 'Annule',
};

const STATUS_TONE: Record<Payment['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    cancelled: 'neutral',
};

export default function Index({ payments, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [type, setType] = useState(filters.type || 'all');

    useEffect(() => {
        if (
            search === (filters.search || '') &&
            status === (filters.status || 'all') &&
            type === (filters.type || 'all')
        ) {
            return;
        }

        const timeout = setTimeout(() => {
            router.visit(route('dashboard.payments.index'), {
                data: {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                    type: type !== 'all' ? type : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 280);

        return () => clearTimeout(timeout);
    }, [search, status, type, filters.search, filters.status, filters.type]);

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setType('all');

        router.visit(route('dashboard.payments.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const formatMoney = (amount: number, currency: string) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);

    const from = payments.from ?? (payments.total === 0 ? 0 : (payments.current_page - 1) * payments.per_page + 1);
    const to = payments.to ?? (payments.total === 0 ? 0 : Math.min(payments.current_page * payments.per_page, payments.total));

    return (
        <DashboardLayout title="Paiements">
            <Head title="Paiements" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Paiements"
                    subtitle="Supervisez les transactions, validez les preuves et activez les abonnements."
                    icon={<CreditCard className="h-6 w-6" />}
                    meta={`${payments.total} transactions`}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.payments.create')}
                            variant="primary"
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Nouveau paiement
                        </AdminLinkButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher un utilisateur, email, transaction..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'completed', label: 'Completes' },
                                { key: 'pending', label: 'En attente' },
                                { key: 'failed', label: 'Echoues' },
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
                        <div className="flex items-center gap-2">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80"
                            >
                                <option value="all">Tous les types</option>
                                <option value="subscription">Abonnement</option>
                                <option value="one_time">Paiement unique</option>
                                <option value="refund">Remboursement</option>
                            </select>

                            <AdminButton type="button" variant="ghost" size="sm" onClick={resetFilters}>
                                Reinitialiser
                            </AdminButton>
                        </div>
                    }
                />

                <AdminCard>
                    {payments.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<CreditCard className="h-7 w-7" />}
                            title="Aucun paiement"
                            subtitle="Aucune transaction ne correspond aux filtres selectionnes."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.payments.create')}
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                >
                                    Enregistrer un paiement
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3">Utilisateur</th>
                                            <th className="px-5 py-3 hidden sm:table-cell">Montant</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Type</th>
                                            <th className="px-5 py-3 hidden lg:table-cell">Methode</th>
                                            <th className="px-5 py-3">Statut</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Date</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {payments.data.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="min-w-0">
                                                        <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                            {payment.user?.name ?? '-'}
                                                        </div>
                                                        <div className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-white/50">
                                                            {payment.user?.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-5 py-4 sm:table-cell">
                                                    <span className="font-heading text-sm font-black tabular-nums text-gray-900 dark:text-white">
                                                        {formatMoney(payment.amount, payment.currency)}
                                                    </span>
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell">
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-600 dark:bg-white/5 dark:text-white/60">
                                                        {payment.type}
                                                    </span>
                                                </td>
                                                <td className="hidden px-5 py-4 lg:table-cell">
                                                    <code className="rounded-full bg-gray-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-gray-600 dark:bg-white/5 dark:text-white/70">
                                                        {payment.payment_method}
                                                    </code>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <AdminStatusPill tone={STATUS_TONE[payment.status]}>
                                                        {STATUS_LABEL[payment.status]}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell text-[11px] text-gray-500 dark:text-white/50">
                                                    {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <AdminLinkButton
                                                        href={route('dashboard.payments.show', payment.id)}
                                                        variant="secondary"
                                                        size="icon"
                                                        icon={<Eye className="h-4 w-4" />}
                                                        title="Détails"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination links={payments.links} from={from} to={to} total={payments.total} />
                        </>
                    )}
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
