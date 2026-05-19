import ImageWithFallback from '@/Components/ImageWithFallback';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Copy, FileImage, FileText, HardDriveUpload, Link2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface MediaAsset {
    id: number;
    original_name: string;
    file_name: string;
    mime_type: string;
    file_size: number;
    extension?: string | null;
    kind: string;
    disk: string;
    path?: string | null;
    url: string;
    width?: number | null;
    height?: number | null;
    created_at: string;
}

interface Props {
    assets: {
        data: MediaAsset[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        kind?: string;
    };
    cdnRecommendations: string[];
}

const canPreviewImage = (asset: MediaAsset): boolean => {
    const mime = (asset.mime_type || '').toLowerCase();
    if (asset.kind === 'image' || mime.startsWith('image/')) return true;

    return asset.url.includes('ucarecdn.net') || asset.url.includes('ucarecd.net') || asset.url.includes('ucarecdn.com') || asset.url.includes('cloudinary.com') || asset.url.includes('ik.imagekit.io');
};

const canPreviewVideo = (asset: MediaAsset): boolean => {
    const mime = (asset.mime_type || '').toLowerCase();
    return asset.kind === 'video' || mime.startsWith('video/');
};

export default function MediaIndex({ assets, filters, cdnRecommendations }: Props) {
    const csrfToken = typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
        : '';

    const uploadForm = useForm({
        file: null as File | null,
        _token: csrfToken,
    });

    const kinds = useMemo(() => ([
        { value: 'all', label: 'Tous les types' },
        { value: 'image', label: 'Images' },
        { value: 'video', label: 'Videos' },
        { value: 'audio', label: 'Audio' },
        { value: 'document', label: 'Documents' },
        { value: 'archive', label: 'Archives' },
        { value: 'other', label: 'Autres' },
    ]), []);

    const submitUpload = (event: React.FormEvent) => {
        event.preventDefault();
        if (!uploadForm.data.file) return;

        uploadForm.post(route('dashboard.media.store', undefined, false), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const updateFilter = (next: Partial<{ search: string; kind: string }>) => {
        router.get(route('dashboard.media.index', undefined, false), {
            search: next.search ?? filters.search ?? '',
            kind: next.kind ?? filters.kind ?? 'all',
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const removeAsset = (assetId: number) => {
        if (!confirm('Supprimer ce media ?')) return;

        router.delete(route('dashboard.media.destroy', assetId, false), {
            preserveScroll: true,
        });
    };

    const copyText = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // noop
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
    };

    return (
        <DashboardLayout title="Mediatheque">
            <Head title="Mediatheque" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Media"
                    title="Mediatheque"
                    subtitle="Uploadez vos images/fichiers, recuperez les liens directs et reutilisez-les partout dans vos pages."
                    icon={<HardDriveUpload className="h-6 w-6" />}
                />

                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-gray-900">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <form onSubmit={submitUpload} className="space-y-4 lg:col-span-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Televersement</p>
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-white/15 dark:bg-white/[0.03]">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100">
                                    Fichier (max 25MB)
                                </label>
                                <input
                                    type="file"
                                    className="mt-3 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 dark:border-white/15 dark:bg-gray-950 dark:text-gray-100"
                                    onChange={(e) => uploadForm.setData('file', e.target.files?.[0] ?? null)}
                                    required
                                />
                                {uploadForm.progress && (
                                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                                        <div className="h-full bg-primary" style={{ width: `${uploadForm.progress.percentage ?? 0}%` }} />
                                    </div>
                                )}
                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-300">
                                    Compression automatique active et fallback dynamique selon MEDIA_UPLOAD_PROVIDERS.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={uploadForm.processing}
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-primary/30 transition hover:brightness-110 disabled:opacity-60"
                            >
                                {uploadForm.processing ? 'Upload en cours...' : 'Charger le media'}
                            </button>
                        </form>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">CDN Gratuits</p>
                            <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                {cdnRecommendations.map((cdn) => (
                                    <li key={cdn} className="flex items-center gap-2">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                                        {cdn}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-900">
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={filters.search ?? ''}
                                onChange={(e) => updateFilter({ search: e.target.value })}
                                placeholder="Rechercher un media..."
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 dark:border-white/15 dark:bg-gray-950 dark:text-gray-100"
                            />
                            <select
                                value={filters.kind ?? 'all'}
                                onChange={(e) => updateFilter({ kind: e.target.value })}
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 dark:border-white/15 dark:bg-gray-950 dark:text-gray-100"
                            >
                                {kinds.map((kind) => (
                                    <option key={kind.value} value={kind.value}>{kind.label}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">{assets.data.length} element(s) affiches</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {assets.data.map((asset) => (
                            <article key={asset.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
                                <div className="relative aspect-[16/9] bg-gray-900/80">
                                    {canPreviewImage(asset) ? (
                                        <ImageWithFallback
                                            src={asset.url}
                                            alt={asset.original_name}
                                            fallbackSrc="/images/article-placeholder.svg"
                                            className="h-full w-full object-contain bg-white dark:bg-gray-950"
                                            loading="lazy"
                                        />
                                    ) : canPreviewVideo(asset) ? (
                                        <video
                                            src={asset.url}
                                            className="h-full w-full object-cover"
                                            preload="metadata"
                                            muted
                                            playsInline
                                            controls
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-white/70">
                                            {asset.kind === 'document' ? <FileText className="h-10 w-10" /> : <FileImage className="h-10 w-10" />}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 p-4">
                                    <p className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-gray-100">{asset.original_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-300">{asset.mime_type} - {formatBytes(asset.file_size)}</p>
                                    <div className="rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-600 dark:border-white/10 dark:bg-gray-950/40 dark:text-gray-300">
                                        <p className="line-clamp-1">{asset.url}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => copyText(asset.url)}
                                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-700 hover:border-primary hover:text-primary dark:border-white/20 dark:text-gray-100"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            Copier
                                        </button>
                                        <a
                                            href={asset.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-700 hover:border-primary hover:text-primary dark:border-white/20 dark:text-gray-100"
                                        >
                                            <Link2 className="h-3.5 w-3.5" />
                                            Ouvrir
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => removeAsset(asset.id)}
                                            className="inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

