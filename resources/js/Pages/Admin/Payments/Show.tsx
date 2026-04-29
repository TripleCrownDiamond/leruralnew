import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    CheckCircle,
    CreditCard,
    Download,
    FileText,
    XCircle,
} from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard, { AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';

interface Payment {
    id: number;
    user: { name: string; email: string };
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_method: string;
    type: string;
    related_id: number;
    transaction_id: string;
    description?: string;
    receipt_image?: string;
    phone_number?: string;
    provider?: string;
    reference?: string;
    meta_data?: any;
    paid_at?: string;
    created_at: string;
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

export default function Show({ payment }: { payment: Payment }) {
    const [actionLocked, setActionLocked] = useState(false);
    const [processing, setProcessing] = useState(false);
    const isCompleted = payment.status === 'completed';
    const isBusy = processing || actionLocked;

    const changeStatus = (status: 'completed' | 'failed' | 'cancelled') => {
        if (isBusy) return;
        if (isCompleted && status !== 'completed') return;

        const label = STATUS_LABEL[status];
        if (!confirm(`Passer ce paiement en \"${label}\" ?`)) return;

        setActionLocked(true);
        setProcessing(true);
        router.put(
            route('dashboard.payments.update', payment.id),
            { status },
            {
                preserveScroll: true,
                onError: () => setActionLocked(false),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const formatMoney = (amount: number, currency: string) =>
        new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency,
        }).format(amount);

    const proofSrc =
        payment.receipt_image ||
        (payment.meta_data?.proof_path ? `/storage/${payment.meta_data.proof_path}` : null);

    return (
        <DashboardLayout title={`Paiement #${payment.id}`}>
            <Head title={`Paiement #${payment.id}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Transaction"
                    title={`#${payment.id} - ${payment.user?.name ?? 'Utilisateur'}`}
                    subtitle={`Cree le ${new Date(payment.created_at).toLocaleString('fr-FR')}`}
                    icon={<CreditCard className="h-6 w-6" />}
                    meta={
                        <AdminStatusPill tone={STATUS_TONE[payment.status]}>
                            {STATUS_LABEL[payment.status]}
                        </AdminStatusPill>
                    }
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.payments.index')}
                            variant="secondary"
                            icon={<ArrowLeft className="h-4 w-4" />}
                        >
                            Retour
                        </AdminLinkButton>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <AdminCard padded>
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Informations generales
                            </div>

                            <dl className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Utilisateur
                                    </dt>
                                    <dd className="mt-1 font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                        {payment.user?.name ?? '-'}
                                    </dd>
                                    <dd className="text-xs text-gray-500 dark:text-white/50">
                                        {payment.user?.email}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Montant
                                    </dt>
                                    <dd className="mt-1 font-heading text-2xl font-black tabular-nums text-primary">
                                        {formatMoney(payment.amount, payment.currency)}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Type
                                    </dt>
                                    <dd className="mt-1 text-sm font-bold capitalize text-gray-900 dark:text-white">
                                        {payment.type}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Methode
                                    </dt>
                                    <dd className="mt-1">
                                        <code className="rounded-full bg-gray-100 px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-gray-700 dark:bg-white/5 dark:text-white/80">
                                            {payment.payment_method}
                                        </code>
                                    </dd>
                                </div>

                                {payment.transaction_id && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                            ID de transaction
                                        </dt>
                                        <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                                            {payment.transaction_id}
                                        </dd>
                                    </div>
                                )}

                                {payment.phone_number && (
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                            Telephone
                                        </dt>
                                        <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                                            {payment.phone_number}
                                        </dd>
                                    </div>
                                )}

                                {payment.reference && (
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                            Reference
                                        </dt>
                                        <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                                            {payment.reference}
                                        </dd>
                                    </div>
                                )}

                                {payment.paid_at && (
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                            Paye le
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(payment.paid_at).toLocaleString('fr-FR')}
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            {payment.description && (
                                <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                    <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Description
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-700 dark:text-white/80">
                                        {payment.description}
                                    </p>
                                </div>
                            )}
                        </AdminCard>

                        {proofSrc && (
                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <FileText className="h-3.5 w-3.5" />
                                    Preuve de paiement
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]">
                                    <img
                                        src={proofSrc}
                                        alt="Preuve de paiement"
                                        className="mx-auto max-h-96 w-auto object-contain p-4"
                                    />
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <AdminLinkButton
                                        href={proofSrc}
                                        as="a"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="secondary"
                                        size="sm"
                                        icon={<Download className="h-3.5 w-3.5" />}
                                    >
                                        Telecharger
                                    </AdminLinkButton>
                                </div>
                            </AdminCard>
                        )}
                    </div>

                    <div className="space-y-6">
                        <AdminCard padded>
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Actions admin
                            </div>

                            {payment.status === 'completed' ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                                        Ce paiement est valide et le service est active.
                                    </div>
                                    {payment.type === 'subscription' && (
                                        <AdminButton
                                            variant="secondary"
                                            size="md"
                                            className="w-full justify-center"
                                            disabled={isBusy}
                                            icon={<CheckCircle className="h-4 w-4" />}
                                            onClick={() => changeStatus('completed')}
                                        >
                                            Resynchroniser la souscription
                                        </AdminButton>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <AdminButton
                                        variant="primary"
                                        size="md"
                                        className="w-full justify-center"
                                        disabled={isBusy}
                                        icon={<CheckCircle className="h-4 w-4" />}
                                        onClick={() => changeStatus('completed')}
                                    >
                                        Valider et activer
                                    </AdminButton>
                                    {payment.status === 'pending' && (
                                        <AdminButton
                                            variant="danger"
                                            size="md"
                                            className="w-full justify-center"
                                            disabled={isBusy}
                                            icon={<XCircle className="h-4 w-4" />}
                                            onClick={() => changeStatus('failed')}
                                        >
                                            Rejeter le paiement
                                        </AdminButton>
                                    )}
                                    <AdminButton
                                        variant="ghost"
                                        size="md"
                                        className="w-full justify-center"
                                        disabled={isBusy}
                                        onClick={() => changeStatus('cancelled')}
                                    >
                                        Marquer annule
                                    </AdminButton>
                                </div>
                            )}
                        </AdminCard>

                        <AdminCard padded>
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Resume
                            </div>
                            <dl className="space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-white/50">Statut</dt>
                                    <dd>
                                        <AdminStatusPill tone={STATUS_TONE[payment.status]}>
                                            {STATUS_LABEL[payment.status]}
                                        </AdminStatusPill>
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-white/50">ID paiement</dt>
                                    <dd className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                                        #{payment.id}
                                    </dd>
                                </div>
                                {payment.provider && (
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-gray-500 dark:text-white/50">Fournisseur</dt>
                                        <dd className="font-bold text-gray-900 dark:text-white">
                                            {payment.provider}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </AdminCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
