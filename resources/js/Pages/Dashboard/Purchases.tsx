import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Calendar, CheckCircle2, XCircle, CreditCard, Clock, FileText, ArrowUpRight, Receipt, Download, BookOpen, TrendingUp } from 'lucide-react';

interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    date: string;
    description: string;
    method: string;
    type: 'article' | 'subscription' | 'paper' | string;
    related_name?: string | null;
    access_url?: string | null;
    access_label?: string | null;
    invoice_url?: string | null;
    reference?: string | null;
}

interface Props {
    payments: Payment[];
}

export default function Purchases({ payments }: Props) {
    const getStatusMeta = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Payé',
                    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                    classes: 'bg-primary/10 text-primary border border-primary/20',
                };
            case 'pending':
                return {
                    label: 'En attente',
                    icon: <Clock className="h-3.5 w-3.5" />,
                    classes: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400',
                };
            case 'failed':
                return {
                    label: 'Échoué',
                    icon: <XCircle className="h-3.5 w-3.5" />,
                    classes: 'bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400',
                };
            default:
                return {
                    label: status,
                    icon: null,
                    classes: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
                };
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const totalSpent = payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
    const completed = payments.filter((p) => p.status === 'completed').length;
    const pending = payments.filter((p) => p.status === 'pending').length;
    const articlesAccessible = payments.filter(
        (p) => p.status === 'completed' && (p.type === 'article' || p.type === 'paper') && p.access_url,
    ).length;

    return (
        <DashboardLayout title="Historique d'achats">
            <Head title="Historique d'achats" />

            {/* Editorial header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900 sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                     style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span>Facturation</span>
                            <span className="h-px w-6 bg-primary/40" />
                            <span className="text-gray-500 dark:text-gray-400">{payments.length} transaction{payments.length > 1 ? 's' : ''}</span>
                        </div>
                        <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Historique d'achats
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                            Suivez vos abonnements, articles premium et moyens de paiement utilisés.
                        </p>
                    </div>
                    <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-lg shadow-primary/30">
                        <Receipt className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* KPI mini-cards */}
            {payments.length > 0 && (
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MiniStat
                        label="Total dépensé"
                        value={formatCurrency(totalSpent, payments[0]?.currency || 'XOF')}
                        icon={<CreditCard className="h-5 w-5" />}
                        accent="from-primary to-emerald-700"
                    />
                    <MiniStat
                        label="Paiements réussis"
                        value={completed.toString()}
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        accent="from-emerald-500 to-primary"
                    />
                    <MiniStat
                        label="En attente"
                        value={pending.toString()}
                        icon={<Clock className="h-5 w-5" />}
                        accent="from-amber-500 to-amber-600"
                    />
                    <MiniStat
                        label="Contenus accessibles"
                        value={articlesAccessible.toString()}
                        icon={<BookOpen className="h-5 w-5" />}
                        accent="from-sky-500 to-blue-600"
                    />
                </div>
            )}

            {payments.length > 0 ? (
                <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_30px_-15px_rgba(47,106,17,0.12)] dark:border-white/10 dark:bg-gray-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 dark:border-gray-800">
                                    <tr className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Montant</th>
                                        <th className="px-6 py-4">Moyen</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {payments.map((payment) => {
                                        const status = getStatusMeta(payment.status);
                                        return (
                                            <tr key={payment.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                                                            {getTypeIcon(payment.type)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">
                                                                {payment.description}
                                                            </div>
                                                            <div className="mt-1 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
                                                                {getTypeLabel(payment.type)}
                                                            </div>
                                                            <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 font-mono">
                                                                {payment.reference ?? `INV-${payment.id.toString().padStart(6, '0')}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="tabular-nums">{payment.date}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-heading text-base font-black tabular-nums text-primary">
                                                        {formatCurrency(payment.amount, payment.currency)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 capitalize">
                                                        <CreditCard className="h-4 w-4 text-gray-400" />
                                                        {payment.method}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${status.classes}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        {payment.access_url && (
                                                            <Link
                                                                href={payment.access_url}
                                                                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary transition hover:border-primary/40 hover:bg-primary/10"
                                                            >
                                                                {payment.type === 'paper' ? <Download className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                                                                {payment.access_label ?? 'Acceder'}
                                                            </Link>
                                                        )}
                                                        {payment.invoice_url && (
                                                            <a
                                                                href={payment.invoice_url}
                                                                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                                            >
                                                                <Receipt className="h-3 w-3" />
                                                                Facture PDF
                                                            </a>
                                                        )}
                                                        {!payment.access_url && !payment.invoice_url && (
                                                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile cards */}
                    <div className="grid gap-4 md:hidden">
                        {payments.map((payment) => {
                            const status = getStatusMeta(payment.status);
                            return (
                                <div key={payment.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                                                {getTypeIcon(payment.type)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-900 dark:text-white truncate">
                                                    {payment.description}
                                                </div>
                                                <div className="mt-1 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
                                                    {getTypeLabel(payment.type)}
                                                </div>
                                                <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 font-mono">
                                                    {payment.reference ?? `INV-${payment.id.toString().padStart(6, '0')}`}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${status.classes}`}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-end justify-between border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {payment.date}
                                        </div>
                                        <span className="font-heading text-lg font-black tabular-nums text-primary">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </span>
                                    </div>
                                    {(payment.access_url || payment.invoice_url) && (
                                        <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                                            {payment.access_url && (
                                                <Link
                                                    href={payment.access_url}
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary hover:bg-primary/10"
                                                >
                                                    {payment.type === 'paper' ? <Download className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                                                    {payment.access_label ?? 'Acceder'}
                                                </Link>
                                            )}
                                            {payment.invoice_url && (
                                                <a
                                                    href={payment.invoice_url}
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <Receipt className="h-3 w-3" />
                                                    Facture
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center dark:border-white/10 dark:bg-gray-900">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                         style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    <div className="relative mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                        <ShoppingBag className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="relative font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        Aucun achat effectué
                    </h3>
                    <p className="relative mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                        Vous n'avez pas encore d'historique. Explorez nos articles premium ou souscrivez à un abonnement.
                    </p>
                    <Link
                        href="/"
                        className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] transition hover:-translate-y-0.5"
                    >
                        Explorer les articles
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            )}
        </DashboardLayout>
    );
}

function MiniStat({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    accent: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_15px_40px_-20px_rgba(47,106,17,0.25)] dark:border-white/10 dark:bg-gray-900">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.05]" />
            <div className="relative flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-primary/20`}>
                    {icon}
                </div>
            </div>
            <div className="relative mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-1 font-heading text-2xl font-black tabular-nums tracking-tight text-gray-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );
}


function getTypeLabel(type: string): string {
    switch (type) {
        case 'article':
            return 'Article';
        case 'subscription':
            return 'Abonnement';
        case 'paper':
            return 'Nos parutions';
        default:
            return 'Achat';
    }
}

function getTypeIcon(type: string): React.ReactNode {
    switch (type) {
        case 'subscription':
            return <TrendingUp className="h-5 w-5" />;
        case 'paper':
            return <Download className="h-5 w-5" />;
        case 'article':
            return <BookOpen className="h-5 w-5" />;
        default:
            return <FileText className="h-5 w-5" />;
    }
}
