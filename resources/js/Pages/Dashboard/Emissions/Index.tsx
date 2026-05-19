import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { Pencil, Trash2, Plus, ExternalLink, Tv, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
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
    const { props } = usePage<PageProps<{ settings?: Record<string, string | null | undefined> }>>();
    const fallbackVideoUrl = props.settings?.live_fallback_video_url?.trim() || 'https://www.youtube.com/playlist?list=PLbG50jPcxecnHpAmGv6XBaQ4mgbPyRAN5';
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const filtered = emissions.filter((e) => {
        const matchesSearch = search
            ? e.name.toLowerCase().includes(search.toLowerCase()) ||
              (e.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
            : true;
        const matchesStatus = status === 'all' ? true : status === 'active' ? e.is_active : !e.is_active;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette emission ?')) {
            router.delete(route('dashboard.emissions.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title="Emissions">
            <Head title="Emissions" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Diffusion"
                    title="Emissions TV"
                    subtitle="Programmez les emissions regulieres avec une source YouTube (video ou playlist). Le jingle du direct se gere dans Widgets."
                    icon={<Tv className="h-6 w-6" />}
                    meta={`${emissions.length} emissions`}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.emissions.create')}
                            variant="primary"
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Nouvelle emission
                        </AdminLinkButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher une emission..."
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

                <AdminCard padded className="flex flex-col gap-4 border border-primary/15 bg-primary/5 dark:border-primary/20 dark:bg-primary/10 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Jingle direct</p>
                        <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            Video de secours / jingle
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                            Definie la video qui tourne en boucle sur la page Direct quand aucune emission n'est programmee.
                        </p>
                        <p className="mt-2 break-all text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Actuel: {fallbackVideoUrl}
                        </p>
                    </div>
                    <AdminLinkButton href={route('dashboard.widgets.index')} variant="primary" icon={<ExternalLink className="h-4 w-4" />}>
                        Gerer dans Widgets
                    </AdminLinkButton>
                </AdminCard>

                <AdminCard>
                    {filtered.length === 0 ? (
                        <AdminEmptyState
                            icon={<Tv className="h-7 w-7" />}
                            title="Aucune emission"
                            subtitle="Creez votre premiere emission pour alimenter la programmation."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.emissions.create')}
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                >
                                    Creer
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                    <tr>
                                        <th className="px-5 py-3">Emission</th>
                                        <th className="px-5 py-3">Source</th>
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
                                        <tr key={emission.id} className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 ring-1 ring-black/5 dark:ring-white/10">
                                                        <ImageWithFallback
                                                            src={emission.image || undefined}
                                                            alt={emission.name}
                                                            className="absolute inset-0 h-full w-full object-cover"
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
                                                <AdminStatusPill tone={emission.is_active ? 'success' : 'neutral'}>
                                                    {emission.is_active ? 'Active' : 'Inactive'}
                                                </AdminStatusPill>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <AdminLinkButton
                                                        href={route('dashboard.emissions.edit', emission.id)}
                                                        variant="secondary"
                                                        size="icon"
                                                        icon={<Pencil className="h-4 w-4" />}
                                                        title="Modifier"
                                                    />
                                                    <AdminButton
                                                        variant="danger"
                                                        size="icon"
                                                        icon={<Trash2 className="h-4 w-4" />}
                                                        onClick={() => handleDelete(emission.id)}
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
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}

