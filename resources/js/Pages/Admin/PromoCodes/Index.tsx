import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Percent, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type PromoCode = {
    id: number;
    code: string;
    name: string | null;
    description: string | null;
    discount_type: 'percent' | 'fixed';
    discount_value: string;
    min_amount: string | null;
    max_discount: string | null;
    usage_limit: number | null;
    used_count: number;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    is_featured: boolean;
    applies_to_all_subscriptions?: boolean;
    subscription_plan_ids?: number[];
};

type Paginator<T> = {
    data: T[];
    links: any[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
};

type Props = {
    promoCodes: Paginator<PromoCode>;
    subscriptionPlans: { id: number; name: string; slug: string; price: number }[];
    filters: { search?: string; status?: string };
};

const emptyForm = {
    code: '',
    name: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '10',
    min_amount: '',
    max_discount: '',
    usage_limit: '',
    starts_at: '',
    ends_at: '',
    is_active: true,
    is_featured: false,
    applies_to_all_subscriptions: true,
    subscription_plan_ids: [] as number[],
};

export default function Index({ promoCodes, subscriptionPlans, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm<any>(emptyForm);

    useEffect(() => {
        if (search === (filters.search ?? '') && status === (filters.status ?? 'all')) return;
        const timer = setTimeout(() => {
            router.visit(route('dashboard.promo-codes.index'), {
                data: {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status]);

    const startCreate = () => {
        setEditingId(null);
        setIsCreating(true);
        form.reset();
        form.setData(emptyForm);
    };

    const startEdit = (promo: PromoCode) => {
        setIsCreating(false);
        setEditingId(promo.id);
        form.setData({
            code: promo.code,
            name: promo.name ?? '',
            description: promo.description ?? '',
            discount_type: promo.discount_type,
            discount_value: String(promo.discount_value ?? ''),
            min_amount: promo.min_amount ?? '',
            max_discount: promo.max_discount ?? '',
            usage_limit: promo.usage_limit ? String(promo.usage_limit) : '',
            starts_at: promo.starts_at ? promo.starts_at.slice(0, 16) : '',
            ends_at: promo.ends_at ? promo.ends_at.slice(0, 16) : '',
            is_active: promo.is_active,
            is_featured: promo.is_featured,
            applies_to_all_subscriptions: promo.applies_to_all_subscriptions ?? true,
            subscription_plan_ids: promo.subscription_plan_ids ?? [],
        });
    };

    const cancelForm = () => {
        setEditingId(null);
        setIsCreating(false);
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const payload = {
            ...form.data,
            code: String(form.data.code || '').toUpperCase().trim(),
            usage_limit: form.data.usage_limit || null,
            min_amount: form.data.min_amount || null,
            max_discount: form.data.max_discount || null,
            starts_at: form.data.starts_at || null,
            ends_at: form.data.ends_at || null,
            applies_to_all_subscriptions: Boolean(form.data.applies_to_all_subscriptions),
            subscription_plan_ids: form.data.applies_to_all_subscriptions ? [] : form.data.subscription_plan_ids,
        };

        if (editingId) {
            form.transform(() => payload);
            form.put(route('dashboard.promo-codes.update', editingId), {
                preserveScroll: true,
                onSuccess: () => cancelForm(),
            });
            return;
        }

        form.transform(() => payload);
        form.post(route('dashboard.promo-codes.store'), {
            preserveScroll: true,
            onSuccess: () => cancelForm(),
        });
    };

    const remove = (id: number) => {
        if (confirm('Supprimer ce code promo ?')) {
            router.delete(route('dashboard.promo-codes.destroy', id), { preserveScroll: true });
        }
    };

    const toggleActive = (promo: PromoCode) => {
        router.post(route('dashboard.promo-codes.toggle-active', promo.id), {}, { preserveScroll: true });
    };

    const toggleFeatured = (promo: PromoCode) => {
        router.post(route('dashboard.promo-codes.toggle-featured', promo.id), {}, { preserveScroll: true });
    };

    const formatReduction = (promo: PromoCode) => {
        if (promo.discount_type === 'percent') {
            return `${promo.discount_value}%`;
        }

        return `${promo.discount_value} FCFA`;
    };

    return (
        <DashboardLayout title="Codes promo">
            <Head title="Codes promo" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Commerce"
                    title="Codes promo"
                    subtitle="Creer, activer et piloter vos reductions checkout."
                    icon={<Percent className="h-6 w-6" />}
                    meta={`${promoCodes.total} codes`}
                    actions={
                        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={startCreate}>
                            Nouveau code
                        </AdminButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher un code, nom ou description..."
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
                />

                {(isCreating || editingId !== null) && (
                    <AdminCard padded>
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {editingId ? 'Edition du code' : 'Creation code promo'}
                        </div>

                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Code</label>
                                <input
                                    type="text"
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="LERURAL10"
                                />
                                {form.errors.code && <p className="mt-1 text-xs text-red-600">{form.errors.code}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Nom</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Promo bienvenue"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Type</label>
                                <select
                                    value={form.data.discount_type}
                                    onChange={(e) => form.setData('discount_type', e.target.value as 'percent' | 'fixed')}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <option value="percent">Pourcentage</option>
                                    <option value="fixed">Montant fixe</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Reduction</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.discount_value}
                                    onChange={(e) => form.setData('discount_value', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="10"
                                />
                                {form.errors.discount_value && <p className="mt-1 text-xs text-red-600">{form.errors.discount_value}</p>}
                            </div>

                            <div className="xl:col-span-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Description</label>
                                <input
                                    type="text"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Offre limitee pour nouveaux abonnes"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Min panier</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.min_amount}
                                    onChange={(e) => form.setData('min_amount', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Plafond remise</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.max_discount}
                                    onChange={(e) => form.setData('max_discount', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="5000"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Limite usages</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.data.usage_limit}
                                    onChange={(e) => form.setData('usage_limit', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Debut</label>
                                <input
                                    type="datetime-local"
                                    value={form.data.starts_at}
                                    onChange={(e) => form.setData('starts_at', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Fin</label>
                                <input
                                    type="datetime-local"
                                    value={form.data.ends_at}
                                    onChange={(e) => form.setData('ends_at', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white/80">
                                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                Actif
                            </label>

                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white/80">
                                <input type="checkbox" checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                Afficher sur Welcome
                            </label>

                            <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white/80">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(form.data.applies_to_all_subscriptions)}
                                        onChange={(e) => form.setData('applies_to_all_subscriptions', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    Valable sur toutes les offres d'abonnement
                                </label>

                                {!form.data.applies_to_all_subscriptions && (
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {subscriptionPlans.map((plan) => {
                                            const selected = (form.data.subscription_plan_ids as number[]).includes(plan.id);
                                            return (
                                                <label key={plan.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
                                                    <span>{plan.name}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={(e) => {
                                                            const current = new Set(form.data.subscription_plan_ids as number[]);
                                                            if (e.target.checked) current.add(plan.id);
                                                            else current.delete(plan.id);
                                                            form.setData('subscription_plan_ids', Array.from(current));
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {form.errors.subscription_plan_ids && (
                                    <p className="mt-2 text-xs text-red-600">{form.errors.subscription_plan_ids}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 md:col-span-2 xl:col-span-4">
                                <AdminButton type="button" variant="ghost" onClick={cancelForm} icon={<X className="h-4 w-4" />}>
                                    Annuler
                                </AdminButton>
                                <AdminButton type="submit" variant="primary" disabled={form.processing} icon={<Check className="h-4 w-4" />}>
                                    {editingId ? 'Enregistrer' : 'Creer'}
                                </AdminButton>
                            </div>
                        </form>
                    </AdminCard>
                )}

                <AdminCard>
                    {promoCodes.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<Percent className="h-7 w-7" />}
                            title="Aucun code promo"
                            subtitle="Creer votre premier code pour activer les reductions checkout."
                            action={
                                <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={startCreate}>
                                    Creer un code
                                </AdminButton>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3">Code</th>
                                            <th className="px-5 py-3">Reduction</th>
                                            <th className="px-5 py-3">Usage</th>
                                            <th className="px-5 py-3">Statut</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {promoCodes.data.map((promo) => (
                                            <tr key={promo.id} className="bg-white/85 transition-colors hover:bg-primary/[0.04] dark:bg-transparent dark:hover:bg-white/[0.02]">
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-black text-gray-900 dark:text-white">{promo.code}</span>
                                                        {promo.is_featured && (
                                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                                                                <Star className="mr-1 h-3 w-3" />
                                                                Welcome
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-white/55">{promo.name || 'Sans titre'}</p>
                                                    <p className="mt-1 text-[11px] text-gray-500 dark:text-white/55">
                                                        {promo.applies_to_all_subscriptions !== false
                                                            ? 'Offres: toutes'
                                                            : 'Offres: ' + String((promo.subscription_plan_ids ?? []).length)}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    <p className="font-bold text-gray-900 dark:text-white">{formatReduction(promo)}</p>
                                                    {promo.min_amount && <p className="text-xs text-gray-500 dark:text-white/55">Min: {promo.min_amount} FCFA</p>}
                                                </td>
                                                <td className="px-5 py-4 align-top text-xs text-gray-600 dark:text-white/65">
                                                    <p>{promo.used_count} utilises</p>
                                                    <p>{promo.usage_limit ? `Limite: ${promo.usage_limit}` : 'Illimite'}</p>
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    <AdminStatusPill tone={promo.is_active ? 'success' : 'neutral'}>
                                                        {promo.is_active ? 'Actif' : 'Inactif'}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <AdminButton size="icon" variant={promo.is_active ? 'ghost' : 'primary'} onClick={() => toggleActive(promo)} icon={promo.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />} title={promo.is_active ? 'Désactiver' : 'Activer'} />
                                                        <AdminButton size="icon" variant={promo.is_featured ? 'primary' : 'ghost'} onClick={() => toggleFeatured(promo)} icon={<Star className="h-4 w-4" />} title={promo.is_featured ? 'Masquer Welcome' : 'Afficher Welcome'} />
                                                        <AdminButton size="icon" variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => startEdit(promo)} title="Éditer" />
                                                        <AdminButton size="icon" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(promo.id)} title="Supprimer" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination links={promoCodes.links} from={promoCodes.from} to={promoCodes.to} total={promoCodes.total} />
                        </>
                    )}
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
