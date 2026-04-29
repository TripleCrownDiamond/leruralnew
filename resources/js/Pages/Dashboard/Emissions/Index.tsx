import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, ExternalLink, Tv, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import ImageWithFallback from '@/Components/ImageWithFallback';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';

interface Emission {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    playlist_url: string;
    is_active: boolean;
    order: number;
}

interface Props {
    emissions: Emission[];
}

export default function Index({ emissions }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const filtered = emissions.filter((e) => {
        const matchesSearch = search
            ? e.name.toLowerCase().includes(search.toLowerCase()) ||
              (e.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
            : true;
        const matchesStatus =
            status === 'all' ? true : status === 'active' ? e.is_active : !e.is_active;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette émission ?')) {
            router.delete(route('dashboard.emissions.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title="Émissions">
            <Head title="Émissions" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Diffusion"
                    title="Émissions TV"
                    subtitle="Programmez les émissions régulières et leurs playlists YouTube."
                    icon={<Tv className="h-6 w-6" />}
                    meta={`${emissions.length} émissions`}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.emissions.create')}
                            variant="primary"
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Nouvelle émission
                        </AdminLinkButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher une émission…"
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Toutes' },
                                { key: 'active', label: 'Actives' },
                                { key: 'inactive', label: 'Inactives' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setStatus(opt.key as any)}
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

                <AdminCard>
                    {filtered.length === 0 ? (
                        <AdminEmptyState
                            icon={<Tv className="h-7 w-7" />}
                            title="Aucune émission"
                            subtitle="Créez votre première émission pour alimenter la programmation."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.emissions.create')}
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                >
                                    Créer
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                    <tr>
                                        <th className="px-5 py-3">Émission</th>
                                        <th className="px-5 py-3">Playlist</th>
                                        <th className="px-5 py-3">
                                            <span className="inline-flex items-center gap-1">
                                                <ArrowUpDown className="h-3 w-3" /> Ordre
                                            </span>
                                        </th>
                                        <th className="px-5 py-3">Statut</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filtered.map((emission) => (
                                        <tr
                                            key={emission.id}
                                            className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 ring-1 ring-black/5 dark:ring-white/10">
                                                        <ImageWithFallback
                                                            src={emission.image || undefined}
                                                            alt={emission.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                            {emission.name}
                                                        </div>
                                                        {emission.description && (
                                                            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-white/50">
                                                                {emission.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <a
                                                    href={emission.playlist_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-primary hover:underline"
                                                >
                                                    Ouvrir
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </td>
                                            <td className="px-5 py-4 tabular-nums font-bold text-gray-900 dark:text-white">
                                                {emission.order}
                                            </td>
                                            <td className="px-5 py-4">
                                                <AdminStatusPill
                                                    tone={emission.is_active ? 'success' : 'neutral'}
                                                >
                                                    {emission.is_active ? 'Active' : 'Inactive'}
                                                </AdminStatusPill>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <AdminLinkButton
                                                        href={route('dashboard.emissions.edit', emission.id)}
                                                        variant="secondary"
                                                        size="sm"
                                                        icon={<Pencil className="h-3.5 w-3.5" />}
                                                    >
                                                        Modifier
                                                    </AdminLinkButton>
                                                    <AdminButton
                                                        variant="danger"
                                                        size="sm"
                                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                                        onClick={() => handleDelete(emission.id)}
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
        </DashboardLayout>
    );
}
