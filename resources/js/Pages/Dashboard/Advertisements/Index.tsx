import CloudinaryUpload from '@/Components/CloudinaryUpload';
import InputError from '@/Components/InputError';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { Button } from '@/Components/ui/button';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';

interface Advertisement {
    id: number;
    location_id: string;
    title: string | null;
    description: string | null;
    image_url: string;
    redirect_url: string | null;
    is_active: boolean;
}

interface SlotGuide {
    id: string;
    label: string;
    recommended_size: string;
    usage: string;
    notes?: string;
}

interface Props {
    advertisements: Advertisement[];
    locationPresets: string[];
}

const emptyForm = {
    location_id: '',
    title: '',
    description: '',
    image_url: '',
    redirect_url: '',
    is_active: true,
};

const SLOT_GUIDES: Record<string, Omit<SlotGuide, 'id'>> = {
    sidebar_top: {
        label: 'Sidebar haut',
        recommended_size: '300x250 px',
        usage: 'Widget pub en haut de la sidebar home.',
    },
    sidebar_middle_skyscraper: {
        label: 'Sidebar milieu',
        recommended_size: '300x600 px',
        usage: 'Grand format vertical dans la sidebar.',
    },
    paywall_sponsor: {
        label: 'Paywall sponsor',
        recommended_size: '1200x280 px',
        usage: 'Banniere sponsor dans le bloc paywall.',
        notes: 'Format horizontal large recommande pour eviter le crop.',
    },
    footer_banner: {
        label: 'Footer banner',
        recommended_size: '970x120 px',
        usage: 'Banniere en bas de page.',
    },
    home_inline_feature: {
        label: 'Home inline feature',
        recommended_size: '970x250 px',
        usage: 'Encart hero/intersection sur la home.',
    },
    article_single_bottom: {
        label: 'Article bas de page',
        recommended_size: '1200x300 px',
        usage: 'Sous le contenu d\'un article.',
    },
    checkout_article_sidebar: {
        label: 'Checkout article',
        recommended_size: '400x220 px',
        usage: 'Resume checkout article (colonne droite).',
    },
    checkout_subscription_sidebar: {
        label: 'Checkout abonnement',
        recommended_size: '400x220 px',
        usage: 'Resume checkout abonnement (colonne droite).',
    },
};

const resolveSlotGuide = (locationId: string): SlotGuide | null => {
    const normalized = locationId.trim();
    if (!normalized) {
        return null;
    }

    if (SLOT_GUIDES[normalized]) {
        return {
            id: normalized,
            ...SLOT_GUIDES[normalized],
        };
    }

    if (/^home_category_.+_bottom$/i.test(normalized)) {
        return {
            id: normalized,
            label: 'Categorie home (dynamique)',
            recommended_size: '970x120 px',
            usage: 'Pub entre sections categories sur la home.',
            notes: 'Pattern attendu: home_category_<slug>_bottom',
        };
    }

    return null;
};

const formatLocationName = (locationId: string): string => {
    const guide = resolveSlotGuide(locationId);
    if (guide) {
        return guide.label;
    }

    return locationId
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};
export default function Index({ advertisements, locationPresets }: Props) {

    const form = useForm(emptyForm);
    const isEditing = typeof (form.data as any).id === 'number';
    const selectedGuide = resolveSlotGuide(form.data.location_id);

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        form.setData(emptyForm);
    };

    const startEdit = (advertisement: Advertisement) => {
        form.setData({
            ...(emptyForm as any),
            id: advertisement.id,
            location_id: advertisement.location_id,
            title: advertisement.title ?? '',
            description: advertisement.description ?? '',
            image_url: advertisement.image_url,
            redirect_url: advertisement.redirect_url ?? '',
            is_active: advertisement.is_active,
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEditing) {
            form.put(route('dashboard.advertisements.update', (form.data as any).id), {
                preserveScroll: true,
                onSuccess: resetForm,
            });
            return;
        }

        form.post(route('dashboard.advertisements.store'), {
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    return (
        <DashboardLayout title="Publicites">
            <Head title="Publicites" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Monetisation"
                    title="Espaces pub"
                    subtitle="Gerez les visuels sponsorises et leurs liens pour la home, les sidebars, le paywall et les slots specifiques."
                    icon={<ImagePlus className="h-6 w-6" />}
                    meta={`${advertisements.length} slot${advertisements.length > 1 ? 's' : ''}`}
                />

                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <form onSubmit={submit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Slot</p>
                                <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                    {isEditing ? 'Modifier la pub' : 'Nouvelle pub'}
                                </h2>
                            </div>
                            {isEditing && (
                                <Button type="button" variant="outline" onClick={resetForm} className="rounded-full">
                                    Annuler
                                </Button>
                            )}
                        </div>

                        <div className="mb-4 grid gap-2">
                            {locationPresets.map((preset) => {
                                const guide = resolveSlotGuide(preset);
                                return (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => form.setData('location_id', preset)}
                                        className={`rounded-2xl border px-3 py-2 text-left ${form.data.location_id === preset ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-700 dark:border-white/10 dark:text-gray-300'}`}
                                    >
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em]">{guide?.label ?? formatLocationName(preset)}</p>
                                        <p className="mt-1 text-[11px] font-semibold opacity-80">ID: {preset}</p>
                                        <p className="mt-1 text-xs opacity-70">{guide?.recommended_size ?? 'Taille libre'}</p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Location ID</label>
                                <input
                                    value={form.data.location_id}
                                    onChange={(event) => form.setData('location_id', event.target.value)}
                                    placeholder="home_category_economie_bottom"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Utilisez un ID libre pour un slot specifique d'article ou de categorie.</p>
                                {selectedGuide && (
                                    <div className="mt-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Taille recommandee: {selectedGuide.recommended_size}</p>
                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{selectedGuide.usage}</p>
                                        {selectedGuide.notes && <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{selectedGuide.notes}</p>}
                                    </div>
                                )}
                                <InputError message={form.errors.location_id} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Titre</label>
                                <input
                                    value={form.data.title}
                                    onChange={(event) => form.setData('title', event.target.value)}
                                    placeholder="Sponsor campagne"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.title} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Image</label>
                                <CloudinaryUpload key={`${form.data.location_id}-${form.data.image_url || 'empty'}`} onUpload={(url) => form.setData('image_url', url)} defaultImage={form.data.image_url || undefined} />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {selectedGuide ? `Format conseille: ${selectedGuide.recommended_size}` : 'Selectionnez un slot pour voir la taille recommandee.'}
                                </p>
                                <InputError message={form.errors.image_url} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Lien</label>
                                <input
                                    type="url"
                                    value={form.data.redirect_url}
                                    onChange={(event) => form.setData('redirect_url', event.target.value)}
                                    placeholder="https://..."
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.redirect_url} className="mt-2" />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(event) => form.setData('description', event.target.value)}
                                    rows={3}
                                    placeholder="Texte interne pour reconnaitre le slot"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.description} className="mt-2" />
                            </div>

                            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-white/10 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) => form.setData('is_active', event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary"
                                />
                                Activer ce visuel
                            </label>
                        </div>

                        <Button type="submit" disabled={form.processing} className="mt-6 w-full rounded-full text-xs font-black uppercase tracking-[0.18em]">
                            <Plus className="mr-2 h-4 w-4" />
                            {isEditing ? 'Mettre a jour' : 'Ajouter'}
                        </Button>
                    </form>

                    <div className="grid gap-4 md:grid-cols-2">
                        {advertisements.length > 0 ? (
                            advertisements.map((advertisement) => {
                                const guide = resolveSlotGuide(advertisement.location_id);
                                return (
                                    <article key={advertisement.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-950">
                                            <img src={advertisement.image_url} alt={advertisement.title || advertisement.location_id} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="p-5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                                                    {formatLocationName(advertisement.location_id)}
                                                </span>
                                                {guide && (
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-gray-700 dark:bg-white/10 dark:text-gray-200">
                                                        {guide.recommended_size}
                                                    </span>
                                                )}
                                                <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${advertisement.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60'}`}>
                                                    {advertisement.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                {advertisement.title || 'Visuel sponsorise'}
                                            </h3>
                                            {guide && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{guide.usage}</p>}
                                            <p className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">ID: {advertisement.location_id}</p>
                                            {advertisement.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{advertisement.description}</p>}
                                            {advertisement.redirect_url && (
                                                <a href={advertisement.redirect_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
                                                    Ouvrir le lien
                                                </a>
                                            )}
                                            <div className="mt-5 flex gap-2">
                                                <Button type="button" variant="outline" onClick={() => startEdit(advertisement)} className="rounded-full">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Modifier
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (confirm('Supprimer cet espace pub ?')) {
                                                            router.delete(route('dashboard.advertisements.destroy', advertisement.id), { preserveScroll: true });
                                                        }
                                                    }}
                                                    className="rounded-full"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-400 md:col-span-2">
                                Aucun espace pub n'est configure. Les slots publics afficheront leur empty state tant qu'aucun visuel actif n'est ajoute.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


