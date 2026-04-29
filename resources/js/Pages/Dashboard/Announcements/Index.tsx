import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import InputError from '@/Components/InputError';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Announcement {
    id: number;
    label: string | null;
    message: string;
    link_url: string | null;
    sort_order: number;
    is_active: boolean;
}

interface FormData {
    id?: number;
    label: string;
    message: string;
    link_url: string;
    sort_order: number;
    is_active: boolean;
}

const emptyForm: FormData = {
    label: '',
    message: '',
    link_url: '',
    sort_order: 0,
    is_active: true,
};

export default function Index({ announcements }: { announcements: Announcement[] }) {
    const form = useForm<FormData>(emptyForm);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const isEditing = typeof form.data.id === 'number';

    const filteredAnnouncements = useMemo(() => {
        const term = search.trim().toLowerCase();

        return announcements
            .filter((announcement) => {
                if (status === 'active' && !announcement.is_active) return false;
                if (status === 'inactive' && announcement.is_active) return false;

                if (!term) return true;

                const haystack = [
                    announcement.label ?? '',
                    announcement.message,
                    announcement.link_url ?? '',
                    String(announcement.sort_order),
                ]
                    .join(' ')
                    .toLowerCase();

                return haystack.includes(term);
            })
            .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }, [announcements, search, status]);

    const resetForm = () => {
        form.clearErrors();
        form.setData({ ...emptyForm });
    };

    const startEdit = (announcement: Announcement) => {
        form.clearErrors();
        form.setData({
            id: announcement.id,
            label: announcement.label ?? '',
            message: announcement.message,
            link_url: announcement.link_url ?? '',
            sort_order: announcement.sort_order,
            is_active: announcement.is_active,
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEditing && form.data.id) {
            form.put(route('dashboard.announcements.update', form.data.id), {
                preserveScroll: true,
                onSuccess: resetForm,
            });
            return;
        }

        form.post(route('dashboard.announcements.store'), {
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer cette annonce ?')) return;

        router.delete(route('dashboard.announcements.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                if (form.data.id === id) {
                    resetForm();
                }
            },
        });
    };

    return (
        <DashboardLayout title="Annonces">
            <Head title="Annonces" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Fil annonce"
                    title="Annonces"
                    subtitle="Configurez les messages du ruban sticky affiche sous les rubriques du site."
                    icon={<Megaphone className="h-6 w-6" />}
                    meta={`${announcements.length} annonce(s)`}
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher un message, un badge ou un lien..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'active', label: 'Actives' },
                                { key: 'inactive', label: 'Inactives' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setStatus(opt.key as 'all' | 'active' | 'inactive')}
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
                        <AdminButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setStatus('all');
                            }}
                        >
                            Reinitialiser
                        </AdminButton>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <AdminCard padded>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">
                                        Edition
                                    </p>
                                    <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                        {isEditing ? 'Modifier annonce' : 'Nouvelle annonce'}
                                    </h2>
                                </div>

                                {isEditing && (
                                    <AdminButton type="button" variant="ghost" size="sm" onClick={resetForm}>
                                        Annuler
                                    </AdminButton>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">
                                    Badge
                                </label>
                                <input
                                    value={form.data.label}
                                    onChange={(event) => form.setData('label', event.target.value)}
                                    placeholder="Urgent"
                                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                                />
                                <InputError message={form.errors.label} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">
                                    Message
                                </label>
                                <textarea
                                    value={form.data.message}
                                    onChange={(event) => form.setData('message', event.target.value)}
                                    rows={4}
                                    placeholder="Votre message d'annonce"
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                                />
                                <InputError message={form.errors.message} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">
                                    Lien
                                </label>
                                <input
                                    type="url"
                                    value={form.data.link_url}
                                    onChange={(event) => form.setData('link_url', event.target.value)}
                                    placeholder="https://..."
                                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                                />
                                <InputError message={form.errors.link_url} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-white/50">
                                    Ordre
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.sort_order}
                                    onChange={(event) => form.setData('sort_order', Number(event.target.value) || 0)}
                                    className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                                />
                                <InputError message={form.errors.sort_order} className="mt-2" />
                            </div>

                            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) => form.setData('is_active', event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary"
                                />
                                Activer l'annonce
                            </label>

                            <AdminButton
                                type="submit"
                                variant="primary"
                                size="md"
                                icon={<Plus className="h-4 w-4" />}
                                disabled={form.processing}
                                className="w-full"
                            >
                                {isEditing ? 'Mettre a jour' : 'Ajouter'}
                            </AdminButton>
                        </form>
                    </AdminCard>

                    <AdminCard>
                        {filteredAnnouncements.length === 0 ? (
                            <AdminEmptyState
                                icon={<Megaphone className="h-7 w-7" />}
                                title="Aucune annonce"
                                subtitle="Ajoutez votre premiere annonce pour alimenter le ruban public."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3">Annonce</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Ordre</th>
                                            <th className="px-5 py-3 hidden lg:table-cell">Statut</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {filteredAnnouncements.map((announcement) => (
                                            <tr
                                                key={announcement.id}
                                                className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                                                                {announcement.label || 'Annonce'}
                                                            </span>
                                                            {announcement.link_url && (
                                                                <span className="truncate text-xs text-gray-500 dark:text-white/50">
                                                                    {announcement.link_url}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                            {announcement.message}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell">
                                                    <span className="font-bold text-gray-900 dark:text-white">{announcement.sort_order}</span>
                                                </td>
                                                <td className="hidden px-5 py-4 lg:table-cell">
                                                    <AdminStatusPill tone={announcement.is_active ? 'success' : 'neutral'}>
                                                        {announcement.is_active ? 'Active' : 'Inactive'}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <AdminButton
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            icon={<Pencil className="h-3.5 w-3.5" />}
                                                            onClick={() => startEdit(announcement)}
                                                        >
                                                            Modifier
                                                        </AdminButton>
                                                        <AdminButton
                                                            type="button"
                                                            variant="danger"
                                                            size="sm"
                                                            icon={<Trash2 className="h-3.5 w-3.5" />}
                                                            onClick={() => handleDelete(announcement.id)}
                                                        >
                                                            Suppr.
                                                        </AdminButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </AdminCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
