import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminCard from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import CloudinaryUpload from '@/Components/CloudinaryUpload';

interface User {
    id: number;
    name: string;
    email: string;
}

const STATUSES = [
    { value: 'pending', label: 'En attente', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
    { value: 'completed', label: 'Complete', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
    { value: 'failed', label: 'Echoue', tone: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300' },
    { value: 'cancelled', label: 'Annule', tone: 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-white/60' },
] as const;

const TYPES = [
    { value: 'subscription', label: 'Abonnement' },
    { value: 'one_time', label: 'Paiement unique' },
    { value: 'refund', label: 'Remboursement' },
] as const;

const inputClass =
    'h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white';

const labelClass =
    'mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50';

export default function Create({ users }: { users: User[] }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        amount: '',
        currency: 'XOF',
        status: 'pending',
        payment_method: '',
        type: 'subscription',
        transaction_id: '',
        description: '',
        paid_at: '',
        receipt_image: '',
        phone_number: '',
        provider: '',
        reference: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('dashboard.payments.store'));
    };

    const isMobileMoney =
        data.payment_method?.includes('money') || data.payment_method === 'wave';
    const isMobileBanking = ['bmo_ci', 'ecobank', 'nsia', 'sgbci'].some((p) =>
        data.payment_method?.includes(p),
    );
    const isTransfer = ['western_union', 'moneygram'].some((p) =>
        data.payment_method?.includes(p),
    );

    return (
        <DashboardLayout title="Nouveau paiement">
            <Head title="Nouveau paiement" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Nouveau paiement"
                    subtitle="Enregistrez une transaction manuellement (cash, transfert, mobile money)."
                    icon={<CreditCard className="h-6 w-6" />}
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

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Identite et montant
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Utilisateur</label>
                                        <select
                                            value={data.user_id}
                                            onChange={(e) => setData('user_id', e.target.value)}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Selectionner un utilisateur</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} - {user.email}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.user_id && <p className="mt-1 text-xs text-red-600">{errors.user_id}</p>}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Montant</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className={`${inputClass} font-heading text-lg font-black tabular-nums`}
                                        />
                                        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Devise</label>
                                        <select
                                            value={data.currency}
                                            onChange={(e) => setData('currency', e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="XOF">XOF (FCFA)</option>
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Methode de paiement</label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Selectionner une methode</option>
                                            <optgroup label="Mobile Money">
                                                <option value="orange_money">Orange Money</option>
                                                <option value="mtn_money">MTN Mobile Money</option>
                                                <option value="moov_money">Moov Money</option>
                                                <option value="wave">Wave</option>
                                            </optgroup>
                                            <optgroup label="Banque Mobile">
                                                <option value="bmo_ci">BMO CI</option>
                                                <option value="ecobank">Ecobank</option>
                                                <option value="nsia">NSIA</option>
                                                <option value="sgbci">SGBCI</option>
                                            </optgroup>
                                            <optgroup label="Cartes">
                                                <option value="visa">Visa</option>
                                                <option value="mastercard">Mastercard</option>
                                                <option value="unionpay">UnionPay</option>
                                            </optgroup>
                                            <optgroup label="Virement">
                                                <option value="bank_transfer">Virement bancaire</option>
                                                <option value="western_union">Western Union</option>
                                                <option value="moneygram">MoneyGram</option>
                                            </optgroup>
                                            <optgroup label="Autres">
                                                <option value="cash">Especes</option>
                                                <option value="check">Cheque</option>
                                            </optgroup>
                                        </select>
                                        {errors.payment_method && <p className="mt-1 text-xs text-red-600">{errors.payment_method}</p>}
                                    </div>

                                    {isMobileMoney && (
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Numero de telephone</label>
                                            <input
                                                type="tel"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                placeholder="+225 XX XX XX XX XX"
                                                className={inputClass}
                                            />
                                        </div>
                                    )}

                                    {isMobileBanking && (
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Fournisseur</label>
                                            <input
                                                type="text"
                                                value={data.provider}
                                                onChange={(e) => setData('provider', e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    )}

                                    {isTransfer && (
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Reference</label>
                                            <input
                                                type="text"
                                                value={data.reference}
                                                onChange={(e) => setData('reference', e.target.value)}
                                                placeholder="Reference du transfert"
                                                className={inputClass}
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>ID de transaction</label>
                                        <input
                                            type="text"
                                            value={data.transaction_id}
                                            onChange={(e) => setData('transaction_id', e.target.value)}
                                            placeholder="TXN123456789"
                                            className={`${inputClass} font-mono`}
                                        />
                                    </div>
                                </div>
                            </AdminCard>

                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Justificatif et description
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Recu / preuve</label>
                                        <CloudinaryUpload
                                            onUpload={(url) => setData('receipt_image', url)}
                                            defaultImage={data.receipt_image}
                                            label=""
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                            placeholder="Details de la transaction"
                                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </AdminCard>
                        </div>

                        <div className="space-y-6">
                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Statut
                                </div>
                                <div className="space-y-2">
                                    {STATUSES.map((opt) => {
                                        const active = data.status === opt.value;
                                        return (
                                            <label
                                                key={opt.value}
                                                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                                                    active
                                                        ? 'border-primary bg-primary/5 font-bold text-primary dark:border-primary dark:bg-primary/10'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-white/10 dark:bg-white/5 dark:text-white/60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value={opt.value}
                                                        checked={active}
                                                        onChange={() => setData('status', opt.value)}
                                                        className="h-4 w-4 text-primary focus:ring-primary"
                                                    />
                                                    {opt.label}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${opt.tone} rounded-full px-2 py-0.5`}>
                                                    {opt.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </AdminCard>

                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Type
                                </div>
                                <div className="space-y-2">
                                    {TYPES.map((opt) => {
                                        const active = data.type === opt.value;
                                        return (
                                            <label
                                                key={opt.value}
                                                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                                                    active
                                                        ? 'border-primary bg-primary/5 font-bold text-primary dark:border-primary dark:bg-primary/10'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-white/10 dark:bg-white/5 dark:text-white/60'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={opt.value}
                                                    checked={active}
                                                    onChange={() => setData('type', opt.value)}
                                                    className="h-4 w-4 text-primary focus:ring-primary"
                                                />
                                                {opt.label}
                                            </label>
                                        );
                                    })}
                                </div>
                            </AdminCard>

                            <AdminCard padded>
                                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Date de paiement
                                </div>
                                <input
                                    type="datetime-local"
                                    value={data.paid_at}
                                    onChange={(e) => setData('paid_at', e.target.value)}
                                    className={`${inputClass} dark:[color-scheme:dark]`}
                                />
                            </AdminCard>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <AdminLinkButton href={route('dashboard.payments.index')} variant="ghost">
                            Annuler
                        </AdminLinkButton>
                        <AdminButton type="submit" variant="primary" disabled={processing} icon={<Check className="h-4 w-4" />}>
                            Creer le paiement
                        </AdminButton>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
