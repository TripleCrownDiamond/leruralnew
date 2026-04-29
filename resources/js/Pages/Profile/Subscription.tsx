import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    Crown,
    Calendar,
    CreditCard,
    ArrowUpRight,
    Sparkles,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    duration_days: number;
}

interface UserSubscription {
    id: number;
    plan: SubscriptionPlan;
    starts_at: string;
    ends_at: string;
    status: string;
}

interface Props {
    auth: any;
    currentSubscription: UserSubscription | null;
    subscriptionHistory: UserSubscription[];
    availablePlans: SubscriptionPlan[];
}

export default function Subscription({ currentSubscription, subscriptionHistory, availablePlans }: Props) {
    const isSubscriptionActive = !!currentSubscription && new Date(currentSubscription.ends_at) > new Date();
    const daysRemaining = isSubscriptionActive
        ? Math.max(0, Math.ceil((new Date(currentSubscription!.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const formatCfa = (value: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(value);

    const totalSpent = subscriptionHistory.reduce((sum, s) => sum + (s.plan?.price ?? 0), 0);
    const activeCount = subscriptionHistory.filter((s) => new Date(s.ends_at) > new Date() && s.status === 'active').length;

    return (
        <DashboardLayout title="Mon Abonnement">
            <Head title="Mon Abonnement" />

            {/* Editorial header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900 sm:p-8">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                            <span>Abonnement</span>
                            <span className="h-px w-6 bg-primary/40" />
                            <span className="text-gray-500 dark:text-gray-400">
                                {subscriptionHistory.length} au total
                            </span>
                        </div>
                        <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Mes abonnements
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                            Gerez votre abonnement premium et consultez l'historique de vos souscriptions.
                        </p>
                    </div>
                    <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-lg shadow-primary/30 sm:flex">
                        <Crown className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Current subscription banner */}
            {isSubscriptionActive ? (
                <div className="mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-emerald-700 to-emerald-800 p-[1px] shadow-[0_20px_60px_-35px_rgba(47,106,17,0.45)]">
                    <div className="rounded-3xl bg-gray-950 px-6 py-7 text-white sm:px-8 sm:py-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                                    <Sparkles className="h-6 w-6 text-emerald-300" />
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-300">
                                            Plan actif
                                        </span>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">
                                        {currentSubscription!.plan.name}
                                    </h2>
                                    <p className="mt-1.5 flex items-center gap-2 text-sm text-gray-300">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Expire le{' '}
                                        <span className="font-bold text-white">
                                            {format(new Date(currentSubscription!.ends_at), 'dd MMMM yyyy', { locale: fr })}
                                        </span>
                                        <span className="ml-1 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]">
                                            J-{daysRemaining}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('payment.checkout', {
                                    type: 'subscription',
                                    id: currentSubscription!.plan.slug,
                                })}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-primary transition hover:-translate-y-0.5 hover:bg-gray-100"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Prolonger
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8 overflow-hidden rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-7 dark:border-amber-900/40 dark:bg-amber-950/20 sm:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="mb-1 text-[9px] font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400">
                                    Aucun abonnement actif
                                </div>
                                <h2 className="font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                                    Passez au premium
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    Debloquez l'acces aux analyses payantes, archives et dossiers exclusifs.
                                </p>
                            </div>
                        </div>
                        <a
                            href="#plans"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-emerald-700 px-6 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] transition hover:-translate-y-0.5"
                        >
                            Decouvrir les offres
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            )}

            {/* KPI mini-cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MiniStat
                    label="Plans disponibles"
                    value={availablePlans.length.toString()}
                    icon={<Crown className="h-5 w-5" />}
                    accent="from-primary to-emerald-700"
                />
                <MiniStat
                    label="Abonnements actifs"
                    value={activeCount.toString()}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    accent="from-emerald-500 to-primary"
                />
                <MiniStat
                    label="Total investi"
                    value={formatCfa(totalSpent)}
                    icon={<TrendingUp className="h-5 w-5" />}
                    accent="from-sky-500 to-blue-600"
                />
            </div>

            {/* Available plans */}
            <section id="plans" className="mb-8">
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Catalogue</div>
                        <h2 className="mt-1 font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            Nos offres
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {availablePlans.map((plan) => {
                        const isCurrent = currentSubscription?.plan.id === plan.id && isSubscriptionActive;
                        return (
                            <div
                                key={plan.id}
                                className={`group relative overflow-hidden rounded-3xl border transition-all hover:-translate-y-0.5 ${
                                    isCurrent
                                        ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-emerald-50 shadow-[0_15px_40px_-20px_rgba(47,106,17,0.3)] dark:from-primary/10 dark:to-emerald-950/40'
                                        : 'border-gray-200 bg-white shadow-sm hover:border-primary/30 hover:shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900'
                                }`}
                            >
                                {isCurrent && (
                                    <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-primary">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Actuel
                                    </div>
                                )}
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/[0.05] transition-transform group-hover:scale-110"
                                />
                                <div className="relative flex h-full flex-col p-6">
                                    <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                                        Plan
                                        <span className="h-px w-4 bg-primary/40" />
                                    </div>
                                    <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                    <div className="mt-3 flex items-baseline gap-1">
                                        <span className="font-heading text-4xl font-black tabular-nums text-primary">
                                            {formatCfa(plan.price)}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            / {plan.duration_days}j
                                        </span>
                                    </div>
                                    <p className="mt-3 flex-grow text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        {plan.description}
                                    </p>
                                    <Link
                                        href={route('payment.checkout', { type: 'subscription', id: plan.slug })}
                                        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition ${
                                            isCurrent
                                                ? 'border border-primary/20 bg-white text-primary hover:bg-primary/5 dark:bg-gray-800'
                                                : 'bg-gradient-to-r from-primary to-emerald-700 text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {isCurrent ? (
                                            <>
                                                <RefreshCw className="h-3 w-3" />
                                                Renouveler
                                            </>
                                        ) : (
                                            <>
                                                Choisir
                                                <ArrowUpRight className="h-3 w-3" />
                                            </>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* History */}
            <section>
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Archives</div>
                        <h2 className="mt-1 font-heading text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            Historique
                        </h2>
                    </div>
                </div>

                {subscriptionHistory.length > 0 ? (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_30px_-15px_rgba(47,106,17,0.12)] dark:border-white/10 dark:bg-gray-900 md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 dark:border-gray-800">
                                        <tr className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                                            <th className="px-6 py-4">Plan</th>
                                            <th className="px-6 py-4">Debut</th>
                                            <th className="px-6 py-4">Fin</th>
                                            <th className="px-6 py-4">Montant</th>
                                            <th className="px-6 py-4">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {subscriptionHistory.map((sub) => {
                                            const active =
                                                new Date(sub.ends_at) > new Date() && sub.status === 'active';
                                            return (
                                                <tr
                                                    key={sub.id}
                                                    className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                                                                <Crown className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 dark:text-white">
                                                                    {sub.plan?.name ?? '—'}
                                                                </div>
                                                                <div className="mt-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                                                                    SUB-{sub.id.toString().padStart(6, '0')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="tabular-nums">
                                                                {format(new Date(sub.starts_at), 'dd/MM/yyyy')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="tabular-nums">
                                                                {format(new Date(sub.ends_at), 'dd/MM/yyyy')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-heading text-base font-black tabular-nums text-primary">
                                                            {formatCfa(sub.plan?.price ?? 0)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {active ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Actif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                Expire
                                                            </span>
                                                        )}
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
                            {subscriptionHistory.map((sub) => {
                                const active = new Date(sub.ends_at) > new Date() && sub.status === 'active';
                                return (
                                    <div
                                        key={sub.id}
                                        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                                                    <Crown className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-bold text-gray-900 dark:text-white">
                                                        {sub.plan?.name ?? '—'}
                                                    </div>
                                                    <div className="mt-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                                                        SUB-{sub.id.toString().padStart(6, '0')}
                                                    </div>
                                                </div>
                                            </div>
                                            {active ? (
                                                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Actif
                                                </span>
                                            ) : (
                                                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                                    <XCircle className="h-3 w-3" />
                                                    Expire
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                                                    Debut
                                                </div>
                                                <div className="mt-0.5 text-sm font-bold tabular-nums text-gray-700 dark:text-gray-200">
                                                    {format(new Date(sub.starts_at), 'dd/MM/yyyy')}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                                                    Fin
                                                </div>
                                                <div className="mt-0.5 text-sm font-bold tabular-nums text-gray-700 dark:text-gray-200">
                                                    {format(new Date(sub.ends_at), 'dd/MM/yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 border-t border-dashed border-gray-200 pt-3 text-right dark:border-gray-800">
                                            <span className="font-heading text-lg font-black tabular-nums text-primary">
                                                {formatCfa(sub.plan?.price ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center dark:border-white/10 dark:bg-gray-900">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                                backgroundSize: '20px 20px',
                            }}
                        />
                        <div className="relative mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5">
                            <Clock className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="relative font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            Aucun historique
                        </h3>
                        <p className="relative mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                            Vous n'avez pas encore souscrit d'abonnement. Decouvrez nos offres ci-dessus.
                        </p>
                    </div>
                )}
            </section>
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
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.05]"
            />
            <div className="relative flex items-center justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-primary/20`}
                >
                    {icon}
                </div>
            </div>
            <div className="relative mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                    {label}
                </p>
                <p className="mt-1 font-heading text-2xl font-black tabular-nums tracking-tight text-gray-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );
}
