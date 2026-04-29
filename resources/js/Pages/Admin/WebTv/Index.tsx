import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Play, Plus, Pencil, Trash2, Check, X, Star } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton } from '@/Components/Dashboard/AdminButton';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import ImageWithFallback from '@/Components/ImageWithFallback';
import CloudinaryUpload from '@/Components/CloudinaryUpload';

interface WebTvVideo {
    id: number;
    title: string;
    youtube_id: string;
    thumbnail: string | null;
    emission_name: string | null;
    emission_image: string | null;
    emission_link: string | null;
    section_name: string | null;
    published_at: string | null;
    is_featured: boolean;
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
    videos: Paginator<WebTvVideo>;
    filters: { search?: string; featured?: string };
}

const emptyForm = {
    title: '',
    youtube_id: '',
    youtube_url: '',
    emission_name: '',
    section_name: '',
    emission_link: '',
    published_at: '',
    is_featured: false as boolean,
    thumbnail: null as File | null,
    thumbnail_url: '' as string,
    emission_image_upload: null as File | null,
    emission_image: '' as string,
};

export default function Index({ videos, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [featured, setFeatured] = useState(filters.featured ?? 'all');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm<any>(emptyForm);

    useEffect(() => {
        if (search === (filters.search ?? '') && featured === (filters.featured ?? 'all')) return;
        const timer = setTimeout(() => {
            router.visit(route('dashboard.web-tv.index'), {
                data: {
                    search: search || undefined,
                    featured: featured !== 'all' ? featured : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, featured]);

    const startEdit = (v: WebTvVideo) => {
        setEditingId(v.id);
        setIsCreating(false);
        form.setData({
            title: v.title,
            youtube_id: v.youtube_id,
            youtube_url: v.youtube_id ? `https://www.youtube.com/watch?v=${v.youtube_id}` : '',
            emission_name: v.emission_name ?? '',
            section_name: v.section_name ?? '',
            emission_link: v.emission_link ?? '',
            published_at: v.published_at ? v.published_at.slice(0, 16) : '',
            is_featured: v.is_featured,
            thumbnail: null,
            thumbnail_url: v.thumbnail ?? '',
            emission_image_upload: null,
            emission_image: v.emission_image ?? '',
        });
    };

    const cancelForm = () => {
        setEditingId(null);
        setIsCreating(false);
        form.reset();
    };

    const startCreate = () => {
        setEditingId(null);
        setIsCreating(true);
        form.reset();
        form.setData(emptyForm);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const url = editingId ? route('dashboard.web-tv.update', editingId) : route('dashboard.web-tv.store');

        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => cancelForm(),
        };

        if (editingId) {
            form.transform((data: any) => ({ ...data, _method: 'put' }));
            form.post(url, options);
        } else {
            form.post(url, options);
        }
    };

    const remove = (id: number) => {
        if (confirm('Supprimer cette video ?')) {
            router.delete(route('dashboard.web-tv.destroy', id), { preserveScroll: true });
        }
    };

    const toggleFeatured = (video: WebTvVideo) => {
        router.post(
            route('dashboard.web-tv.update', video.id),
            {
                _method: 'put',
                title: video.title,
                youtube_id: video.youtube_id,
                youtube_url: video.youtube_id ? `https://www.youtube.com/watch?v=${video.youtube_id}` : '',
                emission_name: video.emission_name ?? '',
                section_name: video.section_name ?? '',
                emission_link: video.emission_link ?? '',
                published_at: video.published_at,
                is_featured: !video.is_featured,
            },
            { preserveScroll: true },
        );
    };

    return (
        <DashboardLayout title="Web TV - YouTube">
            <Head title="Web TV - YouTube" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Diffusion"
                    title="Web TV - YouTube"
                    subtitle="Organisez la bibliotheque video diffusee sur l'accueil et la page Web TV."
                    icon={<Play className="h-6 w-6" />}
                    meta={`${videos.total} videos`}
                    actions={
                        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={startCreate}>
                            Nouvelle video
                        </AdminButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher par titre, emission ou section..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Toutes' },
                                { key: 'yes', label: 'Mise en avant' },
                                { key: 'no', label: 'Standard' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setFeatured(opt.key)}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${
                                        featured === opt.key
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
                            {editingId ? 'Mise a jour de la video' : 'Nouvelle video'}
                        </div>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Titre</label>
                                <input
                                    type="text"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Le journal du rural - edition 18h"
                                />
                                {form.errors.title && <p className="mt-1 text-xs text-red-600">{form.errors.title}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">ID YouTube</label>
                                <input
                                    type="text"
                                    value={form.data.youtube_id}
                                    onChange={(e) => form.setData('youtube_id', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="MUIYEPFS-bk"
                                />
                                {form.errors.youtube_id && <p className="mt-1 text-xs text-red-600">{form.errors.youtube_id}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">URL YouTube (optionnel)</label>
                                <input
                                    type="url"
                                    value={form.data.youtube_url}
                                    onChange={(e) => form.setData('youtube_url', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="https://www.youtube.com/watch?v=MUIYEPFS-bk"
                                />
                                {form.errors.youtube_url && <p className="mt-1 text-xs text-red-600">{form.errors.youtube_url}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Date de diffusion</label>
                                <input
                                    type="datetime-local"
                                    value={form.data.published_at}
                                    onChange={(e) => form.setData('published_at', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Emission associee</label>
                                <input
                                    type="text"
                                    value={form.data.emission_name}
                                    onChange={(e) => form.setData('emission_name', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Rural Mag"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Section Web TV</label>
                                <input
                                    type="text"
                                    value={form.data.section_name}
                                    onChange={(e) => form.setData('section_name', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Par exemple: Journal TV"
                                />
                                {form.errors.section_name && <p className="mt-1 text-xs text-red-600">{form.errors.section_name}</p>}
                            </div>`r`n                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">Lien playlist emission</label>
                                <input
                                    type="url"
                                    value={form.data.emission_link}
                                    onChange={(e) => form.setData('emission_link', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="https://www.youtube.com/playlist?list=..."
                                />
                            </div>
                            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                                <CloudinaryUpload
                                    label="Miniature"
                                    onUpload={(url) => {
                                        form.setData('thumbnail_url', url);
                                        form.setData('thumbnail', null);
                                    }}
                                    defaultImage={form.data.thumbnail_url || undefined}
                                />
                                <CloudinaryUpload
                                    label="Logo emission"
                                    onUpload={(url) => {
                                        form.setData('emission_image', url);
                                        form.setData('emission_image_upload', null);
                                    }}
                                    defaultImage={form.data.emission_image || undefined}
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 md:col-span-2 dark:text-white/80">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_featured}
                                    onChange={(e) => form.setData('is_featured', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                Mettre en avant
                            </label>
                            <div className="flex items-center justify-end gap-2 md:col-span-2">
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
                    {videos.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<Play className="h-7 w-7" />}
                            title="Aucune video enregistree"
                            subtitle="Importez votre premiere video YouTube pour alimenter la Web TV."
                            action={
                                <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={startCreate}>
                                    Ajouter
                                </AdminButton>
                            }
                        />
                    ) : (
                        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                            {videos.data.map((v) => (
                                <div
                                    key={v.id}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 dark:border-white/10 dark:bg-white/[0.03]"
                                >
                                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                                        <ImageWithFallback
                                            src={v.thumbnail || `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`}
                                            alt={v.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute left-3 top-3">
                                            {v.is_featured && (
                                                <AdminStatusPill tone="warning">
                                                    <Star className="h-3 w-3" /> Mise en avant
                                                </AdminStatusPill>
                                            )}
                                        </div>
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <h3 className="line-clamp-2 font-heading text-sm font-black uppercase leading-tight tracking-tight text-white">{v.title}</h3>
                                            {v.emission_name && (
                                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/70">{v.emission_name}</p>
                                            )}
                                            {v.section_name && (
                                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-red-200/90">Section: {v.section_name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 p-3">
                                        <code className="truncate text-[11px] font-bold text-gray-500 dark:text-white/50">{v.youtube_id}</code>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => toggleFeatured(v)}
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                                    v.is_featured
                                                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10'
                                                }`}
                                                title="Mise en avant"
                                            >
                                                <Star className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => startEdit(v)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-white/5 dark:text-white/50 dark:hover:bg-primary/20"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(v.id)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <AdminPagination links={videos.links} from={videos.from} to={videos.to} total={videos.total} />
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}











