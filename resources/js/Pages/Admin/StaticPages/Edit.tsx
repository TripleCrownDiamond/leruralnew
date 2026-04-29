import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import { FileText, ArrowLeft, Check, Eye, Copy, Image as ImageIcon, Link2 } from 'lucide-react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminCard from '@/Components/Dashboard/AdminCard';
import MediaLibraryPicker from '@/Components/MediaLibraryPicker';

interface StaticPage {
    id: number;
    slug: string;
    title: string;
    category: string;
    content: string | null;
    meta_description: string | null;
    hero_image_url?: string | null;
    is_published: boolean;
    order: number;
}

interface MediaAssetHint {
    id: number;
    original_name: string;
    url: string;
    kind: 'image' | 'document' | string;
    mime_type: string;
    created_at: string;
}

interface CdnStatus {
    provider_order?: string[];
    active_provider: string;
    cloudinary: {
        configured_upload: boolean;
        configured_destroy: boolean;
        missing: string[];
    };
    fallback: string;
    supported_alternatives: string[];
}

interface Props {
    page: StaticPage | null;
    mediaAssets?: MediaAssetHint[];
    cdnStatus?: CdnStatus;
}

export default function Edit({ page, mediaAssets = [], cdnStatus }: Props) {
    const isEdit = !!page;
    const [mediaSearch, setMediaSearch] = useState('');

    const form = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        category: page?.category ?? 'legal',
        content: page?.content ?? '',
        meta_description: page?.meta_description ?? '',
        hero_image_url: page?.hero_image_url ?? '',
        is_published: page?.is_published ?? true,
        order: page?.order ?? 0,
    });

    const filteredAssets = useMemo(() => {
        const needle = mediaSearch.trim().toLowerCase();
        if (!needle) return mediaAssets;

        return mediaAssets.filter((asset) =>
            asset.original_name.toLowerCase().includes(needle) ||
            asset.url.toLowerCase().includes(needle),
        );
    }, [mediaAssets, mediaSearch]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && page) {
            form.put(route('dashboard.static-pages.update', page.id));
        } else {
            form.post(route('dashboard.static-pages.store'));
        }
    };

    const copyText = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // noop
        }
    };

    const appendImageSnippet = (
        url: string,
        layout: 'left' | 'center' | 'right' = 'center',
        width = 'min(100%, 760px)',
    ) => {
        const margin = layout === 'left'
            ? '0 auto 0 0'
            : layout === 'right'
                ? '0 0 0 auto'
                : '0 auto';

        const snippet = `\n\n<figure style="margin: 1.2rem 0;">\n  <img src="${url}" alt="Illustration" loading="lazy" style="display:block; width:${width}; max-width:100%; height:auto; margin:${margin}; border-radius:14px;" />\n  <figcaption style="margin-top:0.45rem; color:#6b7280; font-size:0.82rem; text-align:${layout === 'center' ? 'center' : layout};">Description de l'image</figcaption>\n</figure>\n`;

        form.setData('content', `${form.data.content || ''}${snippet}`);
    };

    return (
        <DashboardLayout title={isEdit ? `Modifier - ${page!.title}` : 'Nouvelle page'}>
            <Head title={isEdit ? `Modifier - ${page!.title}` : 'Nouvelle page'} />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow={isEdit ? 'Modification' : 'Creation'}
                    title={isEdit ? page!.title : 'Nouvelle page'}
                    subtitle={
                        isEdit
                            ? `Slug public : /pages/${page!.slug}`
                            : 'Redigez une nouvelle page statique informative ou editoriale.'
                    }
                    icon={<FileText className="h-6 w-6" />}
                    actions={
                        <>
                            {isEdit && page!.is_published && (
                                <AdminLinkButton
                                    href={`/pages/${page!.slug}`}
                                    as="a"
                                    target="_blank"
                                    rel="noreferrer"
                                    variant="secondary"
                                    icon={<Eye className="h-4 w-4" />}
                                >
                                    Apercu
                                </AdminLinkButton>
                            )}
                            <AdminLinkButton
                                href={route('dashboard.static-pages.index')}
                                variant="secondary"
                                icon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Retour
                            </AdminLinkButton>
                        </>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    <AdminCard padded>
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Informations
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Titre
                                </label>
                                <input
                                    type="text"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Mentions legales"
                                    required
                                />
                                {form.errors.title && (
                                    <p className="mt-1 text-xs text-red-600">{form.errors.title}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Slug (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={form.data.slug}
                                    onChange={(e) => form.setData('slug', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="mentions-legales"
                                />
                                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
                                    Laisser vide pour generer automatiquement depuis le titre.
                                </p>
                                {form.errors.slug && (
                                    <p className="mt-1 text-xs text-red-600">{form.errors.slug}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Categorie
                                </label>
                                <select
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <option value="legal">Legal (mentions, CGU, confidentialite)</option>
                                    <option value="info">Info (a propos, equipe, FAQ)</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Ordre d'affichage
                                </label>
                                <input
                                    type="number"
                                    value={form.data.order}
                                    onChange={(e) => form.setData('order', parseInt(e.target.value, 10) || 0)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Image de couverture (URL)
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="min-w-[280px] flex-1">
                                        <input
                                            type="text"
                                            value={form.data.hero_image_url}
                                            onChange={(e) => form.setData('hero_image_url', e.target.value)}
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                            placeholder="https://.../image.jpg"
                                        />
                                    </div>
                                    <MediaLibraryPicker
                                        buttonLabel="Choisir media"
                                        title="Selectionner une image de couverture"
                                        onSelect={(url) => form.setData('hero_image_url', url)}
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-gray-500 dark:text-white/50">
                                    Cette image s'affiche en haut de la page publique. Vous pouvez la choisir directement depuis la mediatheque.
                                </p>
                                {form.errors.hero_image_url && (
                                    <p className="mt-1 text-xs text-red-600">{form.errors.hero_image_url}</p>
                                )}
                            </div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white/80">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_published}
                                    onChange={(e) => form.setData('is_published', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                Publier immediatement
                            </label>
                        </div>
                    </AdminCard>

                    <AdminCard padded>
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Contenu
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                    Meta description (SEO)
                                </label>
                                <input
                                    type="text"
                                    value={form.data.meta_description}
                                    onChange={(e) => form.setData('meta_description', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Resume pour les moteurs de recherche (160 car.)"
                                    maxLength={500}
                                />
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                        Contenu HTML / Markdown
                                    </label>
                                    <MediaLibraryPicker
                                        buttonLabel="Inserer image"
                                        title="Selectionner une image pour le contenu"
                                        onSelect={appendImageSnippet}
                                    />
                                </div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <button type="button" onClick={() => appendImageSnippet('https://', 'left', 'min(100%, 420px)')} className="rounded-full border border-gray-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200">Snippet image gauche</button>
                                    <button type="button" onClick={() => appendImageSnippet('https://', 'center', 'min(100%, 760px)')} className="rounded-full border border-gray-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200">Snippet image centre</button>
                                    <button type="button" onClick={() => appendImageSnippet('https://', 'right', 'min(100%, 420px)')} className="rounded-full border border-gray-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 dark:border-white/20 dark:text-gray-200">Snippet image droite</button>
                                </div>
                                <textarea
                                    value={form.data.content}
                                    onChange={(e) => form.setData('content', e.target.value)}
                                    rows={16}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="<h2>Article 1</h2>&#10;<p>...</p>"
                                />
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard padded>
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Aide images & mediatheque
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    1) Uploadez vos images dans <strong>Admin {'>'} Media</strong>. 2) Copiez le lien. 3) Collez le lien dans "Image de couverture" ou dans le contenu HTML.
                                </p>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs font-mono text-gray-700 dark:border-white/10 dark:bg-gray-950 dark:text-gray-300">
                                    {`<img src=\"https://...\" alt=\"Description\" loading=\"lazy\" />`}
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs font-mono text-gray-700 dark:border-white/10 dark:bg-gray-950 dark:text-gray-300">
                                    {`<a href=\"https://...\" target=\"_blank\" rel=\"noreferrer\">Lien utile</a>`}
                                </div>
                                <AdminLinkButton href={route('dashboard.media.index')} variant="secondary" icon={<Link2 className="h-4 w-4" />}>
                                    Ouvrir la mediatheque
                                </AdminLinkButton>
                            </div>

                            <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">CDN</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    CDN actif: <span className="text-primary">{cdnStatus?.active_provider ?? 'Local storage'}</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-white/60">
                                    Ordre de bascule: {(cdnStatus?.provider_order ?? ['cloudinary', 'imagekit', 'storage']).join(' -> ')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-white/60">
                                    Fallback actuel: {cdnStatus?.fallback ?? 'storage/public'}
                                </p>
                                {cdnStatus?.cloudinary?.missing && cdnStatus.cloudinary.missing.length > 0 && (
                                    <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                                        {cdnStatus.cloudinary.missing.map((item) => (
                                            <li key={item}>- Manquant: {item}</li>
                                        ))}
                                    </ul>
                                )}
                                <p className="text-xs text-gray-500 dark:text-white/60">Autres CDN possibles (a integrer ensuite): {(cdnStatus?.supported_alternatives ?? []).join(', ')}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
                                Rechercher dans la mediatheque locale
                            </label>
                            <input
                                type="text"
                                value={mediaSearch}
                                onChange={(e) => setMediaSearch(e.target.value)}
                                placeholder="Nom de fichier ou lien..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredAssets.slice(0, 18).map((asset) => (
                                <article key={asset.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950">
                                    <div className="aspect-[16/9] bg-gray-100 dark:bg-white/5">
                                        {asset.kind === 'image' ? (
                                            <img src={asset.url} alt={asset.original_name} className="h-full w-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-500 dark:text-white/50">
                                                <ImageIcon className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 p-3">
                                        <p className="line-clamp-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{asset.original_name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => copyText(asset.url)} className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-700 hover:border-primary hover:text-primary dark:border-white/20 dark:text-gray-200">
                                                <Copy className="h-3 w-3" />
                                                Copier lien
                                            </button>
                                            {asset.kind === 'image' && (
                                                <button type="button" onClick={() => appendImageSnippet(asset.url, 'center', 'min(100%, 760px)')} className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary hover:bg-primary/10">
                                                    Inserer balise img
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </AdminCard>

                    <div className="flex justify-end gap-2">
                        <AdminLinkButton
                            href={route('dashboard.static-pages.index')}
                            variant="ghost"
                        >
                            Annuler
                        </AdminLinkButton>
                        <AdminButton
                            type="submit"
                            variant="primary"
                            disabled={form.processing}
                            icon={<Check className="h-4 w-4" />}
                        >
                            {isEdit ? 'Enregistrer' : 'Creer la page'}
                        </AdminButton>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}




