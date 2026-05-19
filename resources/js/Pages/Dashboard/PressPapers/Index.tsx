import EmptySectionState from '@/Components/EmptySectionState';
import ImageWithFallback from '@/Components/ImageWithFallback';
import CloudinaryUpload from '@/Components/CloudinaryUpload';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import InputError from '@/Components/InputError';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';

interface PressPaper {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    cover_url: string | null;
    pdf_url: string;
    price: number;
    is_active: boolean;
    published_at: string | null;
}

const emptyForm = {
    title: '',
    description: '',
    cover_image: null as File | null,
    cover_image_url: '',
    pdf_file: null as File | null,
    pdf_file_url: '',
    price: 0,
    is_active: true,
    published_at: '',
};

export default function Index({ pressPapers }: { pressPapers: PressPaper[] }) {
    const csrfToken = typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
        : '';

    const form = useForm({ ...(emptyForm as any), id: null as number | null, _token: csrfToken });
    const isEditing = Boolean(form.data.id);

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        form.setData({ ...(emptyForm as any), id: null, _token: csrfToken });
    };

    const startEdit = (paper: PressPaper) => {
        form.setData({
            id: paper.id,
            title: paper.title,
            description: paper.description ?? '',
            cover_image: null,
            cover_image_url: paper.cover_url ?? '',
            pdf_file: null,
            pdf_file_url: paper.pdf_url ?? '',
            price: paper.price,
            is_active: paper.is_active,
            published_at: paper.published_at ?? '',
            _token: csrfToken,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            form.put(route('dashboard.press-papers.update', form.data.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: resetForm,
            });
            return;
        }

        form.post(route('dashboard.press-papers.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    return (
        <DashboardLayout title="Nos parutions">
            <Head title="Nos parutions" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Redaction"
                    title="Nos parutions"
                    subtitle="Gerez les editions papier avec leur scan de premiere page, le PDF complet et le prix associe."
                    icon={<BookOpen className="h-6 w-6" />}
                    meta={`${pressPapers.length} edition${pressPapers.length > 1 ? 's' : ''}`}
                    actions={
                        <AdminLinkButton href={route('press-papers.index')} variant="secondary">
                            Voir la page publique
                        </AdminLinkButton>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <form onSubmit={submit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            {isEditing ? 'Modifier un numero' : 'Nouveau numero'}
                        </h2>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Titre</label>
                                <input
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.title} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">Description</label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.description} className="mt-1" />
                            </div>

                            <div className="space-y-3">
                                <CloudinaryUpload
                                    label="Scan de premiere page"
                                    onUpload={(url) => {
                                        form.setData('cover_image_url', url);
                                        form.setData('cover_image', null);
                                    }}
                                    defaultImage={form.data.cover_image_url || undefined}
                                />
                                <InputError message={form.errors.cover_image_url} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">Fichier PDF {isEditing ? '(optionnel)' : ''}</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => form.setData('pdf_file', e.target.files?.[0] ?? null)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <div className="mt-2">
                                    <label className="mb-1 block text-xs font-semibold text-gray-500">ou URL PDF complete</label>
                                    <input
                                        type="url"
                                        value={form.data.pdf_file_url}
                                        onChange={(e) => form.setData('pdf_file_url', e.target.value)}
                                        placeholder="https://.../journal.pdf"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                    />
                                </div>
                                <InputError message={form.errors.pdf_file} className="mt-1" />
                                <InputError message={form.errors.pdf_file_url} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">Prix (XOF)</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="100"
                                    value={form.data.price}
                                    onChange={(e) => form.setData('price', Number(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.price} className="mt-1" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">Date de parution</label>
                                <input
                                    type="datetime-local"
                                    value={form.data.published_at ?? ''}
                                    onChange={(e) => form.setData('published_at', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-950"
                                />
                                <InputError message={form.errors.published_at} className="mt-1" />
                            </div>

                            <label className="flex items-center gap-2 text-sm font-semibold">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                />
                                Publication active
                            </label>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <AdminButton type="submit" icon={<Plus className="h-4 w-4" />} disabled={form.processing}>
                                {isEditing ? 'Mettre a jour' : 'Ajouter'}
                            </AdminButton>
                            {isEditing && (
                                <AdminButton type="button" variant="secondary" onClick={resetForm}>
                                    Annuler
                                </AdminButton>
                            )}
                        </div>
                    </form>

                    <div className="grid gap-4 md:grid-cols-2">
                        {pressPapers.length > 0 ? (
                            pressPapers.map((paper) => (
                                <article key={paper.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                                    <div className="relative h-44 bg-gray-100 dark:bg-white/5">
                                        <ImageWithFallback
                                            src={paper.cover_url || undefined}
                                            alt={paper.title}
                                            className="h-full w-full object-cover"
                                            fallbackSrc="/images/article-placeholder.svg"
                                        />
                                        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary backdrop-blur dark:bg-gray-950/90">
                                            Premiere page
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-heading text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{paper.title}</h3>
                                        <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-white/60">{paper.description || 'Edition papier du journal LE RURAL.'}</p>
                                        <div className="mt-3 flex items-center justify-between text-sm font-black text-primary">
                                            <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(paper.price)}</span>
                                            {paper.published_at && <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500 dark:text-white/50">Publie</span>}
                                        </div>
                                        <a href={paper.pdf_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary hover:underline">
                                            PDF complet
                                        </a>

                                                                                <div className="mt-4 flex flex-wrap gap-2">
                                            <AdminButton type="button" variant="secondary" size="icon" icon={<Pencil className="h-4 w-4" />} onClick={() => startEdit(paper)} title="Modifier" />
                                            <AdminButton
                                                type="button"
                                                variant="danger"
                                                size="icon"
                                                icon={<Trash2 className="h-4 w-4" />}
                                                onClick={() => {
                                                    if (confirm('Supprimer ce numéro ?')) {
                                                        router.delete(route('dashboard.press-papers.destroy', paper.id), { preserveScroll: true });
                                                    }
                                                }}
                                                title="Supprimer"
                                            />
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <EmptySectionState
                                eyebrow="Nos parutions"
                                title="Aucune parution active"
                                description="La section apparaitra ici des qu'une edition papier active sera ajoutee."
                                tone="primary"
                                className="md:col-span-2"
                            />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
