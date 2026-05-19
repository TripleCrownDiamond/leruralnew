import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';

interface AgendaItem {
    id: number;
    title: string;
    description: string | null;
    date: string;
    time: string | null;
    location: string | null;
    is_active: boolean;
}

interface Paginator<T> {
    data: T[];
    links: any[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    agendas: Paginator<AgendaItem>;
    filters: { search?: string; status?: string };
}

const emptyForm = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    is_active: true as boolean,
};

export default function Index({ agendas, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, post, put, processing, reset, errors } = useForm(emptyForm);

    useEffect(() => {
        if (search === (filters.search ?? '') && status === (filters.status ?? 'all')) return;
        const timer = setTimeout(() => {
            router.visit(route('dashboard.agendas.index'), {
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

    const startEdit = (agenda: AgendaItem) => {
        setEditingId(agenda.id);
        setIsCreating(false);
        setData({
            title: agenda.title,
            description: agenda.description ?? '',
            date: agenda.date,
            time: agenda.time ?? '',
            location: agenda.location ?? '',
            is_active: agenda.is_active,
        });
    };

    const cancelForm = () => {
        setEditingId(null);
        setIsCreating(false);
        reset();
        setData(emptyForm);
    };

    const startCreate = () => {
        setEditingId(null);
        setIsCreating(true);
        reset();
        setData(emptyForm);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (editingId) {
            put(route('dashboard.agendas.update', editingId), {
                preserveScroll: true,
                onSuccess: () => cancelForm(),
            });
        } else {
            post(route('dashboard.agendas.store'), {
                preserveScroll: true,
                onSuccess: () => cancelForm(),
            });
        }
    };

    const remove = (id: number) => {
        if (confirm('Supprimer cet element agenda ?')) {
            router.delete(route('dashboard.agendas.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title="Agenda">
            <Head title="Agenda" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Programmation"
                    title="Agenda Desk"
                    subtitle="Les elements saisis ici alimentent directement le bloc agenda du dashboard."
                    icon={<CalendarDays className="h-6 w-6" />}
                    meta={`${agendas.total} elements`}
                    actions={
                        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={startCreate}>
                            Nouvel element
                        </AdminButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher par titre, heure ou lieu..."
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
                            {editingId ? 'Mise a jour element' : 'Nouvel element'}
                        </div>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <Field label="Titre" error={errors.title}>
                                <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            </Field>
                            <Field label="Date" error={errors.date}>
                                <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            </Field>
                            <Field label="Heure (ex: 08h00)" error={errors.time}>
                                <input value={data.time} onChange={(e) => setData('time', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            </Field>
                            <Field label="Lieu" error={errors.location}>
                                <input value={data.location} onChange={(e) => setData('location', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Description" error={errors.description}>
                                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                                </Field>
                            </div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white/80">
                                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                Afficher dans l'agenda
                            </label>
                            <div className="flex items-center justify-end gap-2">
                                <AdminButton type="button" variant="ghost" onClick={cancelForm} icon={<X className="h-4 w-4" />}>
                                    Annuler
                                </AdminButton>
                                <AdminButton type="submit" variant="primary" disabled={processing} icon={<Check className="h-4 w-4" />}>
                                    {editingId ? 'Enregistrer' : 'Creer'}
                                </AdminButton>
                            </div>
                        </form>
                    </AdminCard>
                )}

                <AdminCard>
                    {agendas.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<CalendarDays className="h-7 w-7" />}
                            title="Aucun element agenda"
                            subtitle="Ajoutez des points de planning pour alimenter le bloc Desk du dashboard."
                            action={
                                <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={startCreate}>
                                    Ajouter un element
                                </AdminButton>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                    <tr>
                                        <th className="px-5 py-3">Titre</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Heure</th>
                                        <th className="px-5 py-3">Lieu</th>
                                        <th className="px-5 py-3">Statut</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {agendas.data.map((item) => (
                                        <tr key={item.id} className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                                                {item.description && <div className="mt-1 text-xs text-gray-500 dark:text-white/50">{item.description}</div>}
                                            </td>
                                            <td className="px-5 py-4 text-gray-700 dark:text-white/80">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-5 py-4 text-gray-700 dark:text-white/80">{item.time || '-'}</td>
                                            <td className="px-5 py-4 text-gray-700 dark:text-white/80">{item.location || '-'}</td>
                                            <td className="px-5 py-4">
                                                <AdminStatusPill tone={item.is_active ? 'success' : 'neutral'}>
                                                    {item.is_active ? 'Actif' : 'Inactif'}
                                                </AdminStatusPill>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <AdminButton variant="secondary" size="icon" icon={<Pencil className="h-4 w-4" />} onClick={() => startEdit(item)} title="Modifier" />
                                                    <AdminButton variant="danger" size="icon" icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(item.id)} title="Supprimer" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <AdminPagination links={agendas.links} from={agendas.from} to={agendas.to} total={agendas.total} />
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-semibold text-red-600 dark:text-red-300">{error}</span>}
        </label>
    );
}