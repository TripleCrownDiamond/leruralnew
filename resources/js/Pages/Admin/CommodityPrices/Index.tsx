import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';

interface CommodityPrice {
    id: number;
    name: string;
    price: string;
    unit: string;
    note: string | null;
    country: string | null;
    active: boolean;
}

interface Paginator<T> {
    data: T[];
    links: any[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    prices: Paginator<CommodityPrice>;
    filters: { search?: string; status?: string };
}

const emptyForm = {
    name: '',
    price: '',
    unit: 'FCFA/kg',
    country: '',
    note: '',
    active: true as boolean,
};

export default function Index({ prices, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, post, put, processing, reset, errors } = useForm(emptyForm);

    useEffect(() => {
        if (search === (filters.search ?? '') && status === (filters.status ?? 'all')) return;
        const timer = setTimeout(() => {
            router.visit(route('dashboard.commodity-prices.index'), {
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

    const startEdit = (price: CommodityPrice) => {
        setEditingId(price.id);
        setIsCreating(false);
        setData({
            name: price.name,
            price: price.price,
            unit: price.unit,
            country: price.country ?? '',
            note: price.note ?? '',
            active: price.active,
        });
    };

    const cancelForm = () => {
        setEditingId(null);
        setIsCreating(false);
        reset();
    };

    const startCreate = () => {
        setEditingId(null);
        setIsCreating(true);
        reset();
        setData(emptyForm);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('dashboard.commodity-prices.update', editingId), {
                preserveScroll: true,
                onSuccess: () => cancelForm(),
            });
        } else {
            post(route('dashboard.commodity-prices.store'), {
                preserveScroll: true,
                onSuccess: () => cancelForm(),
            });
        }
    };

    const remove = (id: number) => {
        if (confirm('Supprimer ce prix de marché ?')) {
            router.delete(route('dashboard.commodity-prices.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title="Prix des marchés">
            <Head title="Prix des marchés" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Prix des marchés"
                    title="Cours des matières"
                    subtitle="Suivi des prix des denrées agricoles affichés dans le widget des marchés."
                    icon={<DollarSign className="h-6 w-6" />}
                    meta={`${prices.total} prix`}
                    actions={
                        <AdminButton
                            variant="primary"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={startCreate}
                        >
                            Nouveau prix
                        </AdminButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher par denrée, pays ou note…"
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'active', label: 'Actifs' },
                                { key: 'inactive', label: 'Archivés' },
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
                            {editingId ? 'Mise à jour' : 'Nouveau prix'}
                        </div>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-6">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Denrée
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Maïs, Niébé…"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Prix
                                </label>
                                <input
                                    type="text"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="300"
                                />
                                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Unité
                                </label>
                                <input
                                    type="text"
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="FCFA/kg"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Pays
                                </label>
                                <input
                                    type="text"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Bénin"
                                />
                            </div>
                            <div className="md:col-span-6">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Note
                                </label>
                                <input
                                    type="text"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Hausse de 5% vs semaine précédente"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 md:col-span-3 dark:text-white/80">
                                <input
                                    type="checkbox"
                                    checked={data.active}
                                    onChange={(e) => setData('active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                Afficher dans le widget public
                            </label>
                            <div className="flex items-center justify-end gap-2 md:col-span-3">
                                <AdminButton
                                    type="button"
                                    variant="ghost"
                                    onClick={cancelForm}
                                    icon={<X className="h-4 w-4" />}
                                >
                                    Annuler
                                </AdminButton>
                                <AdminButton
                                    type="submit"
                                    variant="primary"
                                    disabled={processing}
                                    icon={<Check className="h-4 w-4" />}
                                >
                                    {editingId ? 'Enregistrer' : 'Créer'}
                                </AdminButton>
                            </div>
                        </form>
                    </AdminCard>
                )}

                <AdminCard>
                    {prices.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<DollarSign className="h-7 w-7" />}
                            title="Aucun prix enregistré"
                            subtitle="Commencez par ajouter les cours des matières premières."
                            action={
                                <AdminButton
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                    onClick={startCreate}
                                >
                                    Ajouter un prix
                                </AdminButton>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                    <tr>
                                        <th className="px-5 py-3">Denrée</th>
                                        <th className="px-5 py-3">Prix</th>
                                        <th className="px-5 py-3">Pays</th>
                                        <th className="px-5 py-3">Note</th>
                                        <th className="px-5 py-3">Statut</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {prices.data.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-heading text-lg font-black tabular-nums text-primary">
                                                    {p.price}
                                                </span>
                                                <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">
                                                    {p.unit}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-white/70">
                                                {p.country ?? '—'}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500 dark:text-white/50">
                                                {p.note ?? '—'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <AdminStatusPill tone={p.active ? 'success' : 'neutral'}>
                                                    {p.active ? 'Affiché' : 'Archivé'}
                                                </AdminStatusPill>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <AdminButton
                                                        variant="secondary"
                                                        size="icon"
                                                        icon={<Pencil className="h-4 w-4" />}
                                                        onClick={() => startEdit(p)}
                                                        title="Modifier"
                                                    />
                                                    <AdminButton
                                                        variant="danger"
                                                        size="icon"
                                                        icon={<Trash2 className="h-4 w-4" />}
                                                        onClick={() => remove(p.id)}
                                                        title="Supprimer"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <AdminPagination
                        links={prices.links}
                        from={prices.from}
                        to={prices.to}
                        total={prices.total}
                    />
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
