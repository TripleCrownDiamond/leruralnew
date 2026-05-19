
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import ImageWithFallback from '@/Components/ImageWithFallback';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Download, Edit, Eye, FileText, Globe, Plus, Star, Trash2, Upload, Copy, Check } from 'lucide-react';
import type { FormEventHandler, ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface Article {
    id: number;
    title: string;
    slug: string;
    category: string;
    author: string;
    status: string;
    published_at: string;
    views_count: number;
    image?: string;
    is_premium: boolean;
    is_featured: boolean;
    price?: number | null;
}

interface Props {
    articles: {
        data: Article[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
        type?: string;
        category?: string;
    };
    categories: Array<{
        id: number;
        name_fr: string;
    }>;
}

export default function Index({ articles, filters = {}, categories }: Props) {
    const { props } = usePage<any>();
    const csrfToken = typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
        : '';
    const user = props.auth.user;
    const canTransferArticles = user?.role === 'admin';
    const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'scheduled' | 'draft'>(
        (filters.status as 'all' | 'published' | 'scheduled' | 'draft') || 'all',
    );
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [siteImportOpen, setSiteImportOpen] = useState(false);
    const [wordpressImportOpen, setWordpressImportOpen] = useState(false);
    const [copiedArticleId, setCopiedArticleId] = useState<number | null>(null);

    const siteImportForm = useForm<any>({
        file: null,
        publication_mode: 'preserve',
        _token: csrfToken,
    });

    const wordpressImportForm = useForm<any>({
        file: null,
        publication_mode: 'draft',
        _token: csrfToken,
    });
    useEffect(() => {
        if (
            search === (filters.search || '') &&
            statusFilter === ((filters.status as 'all' | 'published' | 'scheduled' | 'draft') || 'all') &&
            typeFilter === (filters.type || 'all') &&
            categoryFilter === (filters.category || 'all')
        ) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.visit(route('dashboard.articles.index'), {
                data: {
                    search,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    type: typeFilter !== 'all' ? typeFilter : undefined,
                    category: categoryFilter !== 'all' ? categoryFilter : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, typeFilter, categoryFilter, filters]);

    const toggleSelectAll = () => {
        if (selectedArticles.length === articles.data.length) {
            setSelectedArticles([]);
            return;
        }

        setSelectedArticles(articles.data.map((article) => article.id));
    };

    const toggleSelect = (id: number) => {
        setSelectedArticles((current) =>
            current.includes(id) ? current.filter((articleId) => articleId !== id) : [...current, id],
        );
    };

    const handleBulkDelete = () => {
        if (!selectedArticles.length) return;

        if (confirm(`Supprimer ${selectedArticles.length} article(s) ?`)) {
            router.delete(route('dashboard.articles.bulk-destroy'), {
                data: { ids: selectedArticles },
                preserveScroll: true,
                onSuccess: () => setSelectedArticles([]),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cet article ?')) {
            router.delete(route('dashboard.articles.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleRowClick = (id: number) => {
        router.visit(route('dashboard.articles.edit', id));
    };

    const copyArticleLink = async (slug: string, id: number) => {
        const url = route('article.show', slug);

        try {
            await navigator.clipboard.writeText(url);
            setCopiedArticleId(id);
            window.setTimeout(() => setCopiedArticleId((current) => (current === id ? null : current)), 1600);
        } catch {
            // noop
        }
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setTypeFilter('all');
        setCategoryFilter('all');
        router.visit(route('dashboard.articles.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();

        if (selectedArticles.length > 0) {
            selectedArticles.forEach((id) => params.append('ids[]', String(id)));
        } else {
            if (search) params.set('search', search);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (typeFilter !== 'all') params.set('type', typeFilter);
            if (categoryFilter !== 'all') params.set('category', categoryFilter);
        }

        const queryString = params.toString();
        window.location.href = `${route('dashboard.articles.export')}${queryString ? `?${queryString}` : ''}`;
    };

    const submitSiteImport: FormEventHandler = (event) => {
        event.preventDefault();
        siteImportForm.post(route('dashboard.articles.import-site'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSiteImportOpen(false);
                siteImportForm.reset();
                siteImportForm.clearErrors();
            },
        });
    };

    const submitWordpressImport: FormEventHandler = (event) => {
        event.preventDefault();
        wordpressImportForm.post(route('dashboard.articles.import-wordpress'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setWordpressImportOpen(false);
                wordpressImportForm.reset();
                wordpressImportForm.clearErrors();
            },
        });
    };

    const from = articles.total === 0 ? 0 : (articles.current_page - 1) * articles.per_page + 1;
    const to = articles.total === 0 ? 0 : Math.min(articles.current_page * articles.per_page, articles.total);

    return (
        <DashboardLayout title="Articles">
            <Head title="Articles" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Redaction"
                    title="Articles"
                    subtitle="Centralisez les contenus, le statut des publications et les acces premium depuis une vue unique."
                    icon={<FileText className="h-6 w-6" />}
                    meta={`${articles.total} articles`}
                    actions={
                        <div className="flex w-full flex-wrap items-stretch gap-2 sm:items-center">
                            {canTransferArticles && (
                                <>
                                    <AdminButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                        icon={<Download className="h-3.5 w-3.5" />}
                                        onClick={handleExport}
                                    >
                                        {selectedArticles.length > 0 ? `Exporter (${selectedArticles.length})` : 'Exporter JSON'}
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                        icon={<Upload className="h-3.5 w-3.5" />}
                                        onClick={() => setSiteImportOpen(true)}
                                    >
                                        Import JSON
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                        icon={<Globe className="h-3.5 w-3.5" />}
                                        onClick={() => setWordpressImportOpen(true)}
                                    >
                                        Import WordPress
                                    </AdminButton>
                                </>
                            )}
                            {selectedArticles.length > 0 && (
                                <AdminButton
                                    variant="danger"
                                    size="sm"
                                    icon={<Trash2 className="h-3.5 w-3.5" />}
                                    onClick={handleBulkDelete}
                                >
                                    Supprimer ({selectedArticles.length})
                                </AdminButton>
                            )}
                            <AdminLinkButton
                                href={route('dashboard.articles.create')}
                                variant="primary"
                                icon={<Plus className="h-3.5 w-3.5" />}
                            >
                                Nouvel article
                            </AdminLinkButton>
                        </div>
                    }
                />
                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher un titre, un extrait ou un auteur..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'published', label: 'Publies' },
                                { key: 'scheduled', label: 'Programmes' },
                                { key: 'draft', label: 'Brouillons' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setStatusFilter(opt.key as 'all' | 'published' | 'scheduled' | 'draft')}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${
                                        statusFilter === opt.key
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
                        <div className="flex flex-wrap items-center gap-2">
                            <FilterSelect value={typeFilter} onChange={setTypeFilter}>
                                <option value="all">Tous les acces</option>
                                <option value="free">Gratuit</option>
                                <option value="premium">Premium</option>
                            </FilterSelect>

                            <FilterSelect value={categoryFilter} onChange={setCategoryFilter}>
                                <option value="all">Toutes rubriques</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={String(category.id)}>
                                        {category.name_fr}
                                    </option>
                                ))}
                            </FilterSelect>

                            <AdminButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                            >
                                Reinitialiser
                            </AdminButton>
                        </div>
                    }
                />

                <AdminCard>
                    {articles.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<FileText className="h-7 w-7" />}
                            title="Aucun article"
                            subtitle="Ajustez les filtres ou creez un nouvel article pour alimenter la redaction."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.articles.create')}
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                >
                                    Creer un article
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-3 w-10">
                                                <Checkbox
                                                    checked={
                                                        selectedArticles.length === articles.data.length &&
                                                        articles.data.length > 0
                                                    }
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-5 py-3">Article</th>
                                            <th className="px-5 py-3 hidden lg:table-cell">Rubrique</th>
                                            <th className="px-5 py-3 hidden md:table-cell">Statut</th>
                                            <th className="px-5 py-3 hidden xl:table-cell">Acces</th>
                                            <th className="px-5 py-3 hidden xl:table-cell">Vues</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {articles.data.map((article) => (
                                            <tr
                                                key={article.id}
                                                className="cursor-pointer transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                                onClick={() => handleRowClick(article.id)}
                                            >
                                                <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedArticles.includes(article.id)}
                                                        onCheckedChange={() => toggleSelect(article.id)}
                                                    />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                                                            <ImageWithFallback
                                                                src={article.image || undefined}
                                                                alt={article.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            {article.is_featured && (
                                                                <span className="absolute left-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/40">
                                                                    <Star className="h-3 w-3 fill-current" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="line-clamp-2 font-heading text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                                                {article.title}
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                                                                <span>{article.author}</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-white/20" />
                                                                <span>{article.published_at}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-5 py-4 lg:table-cell">
                                                    <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
                                                        {article.category}
                                                    </span>
                                                </td>
                                                <td className="hidden px-5 py-4 md:table-cell">
                                                    <StatusBadge status={article.status} />
                                                </td>
                                                <td className="hidden px-5 py-4 xl:table-cell">
                                                    <AccessBadge premium={article.is_premium} price={article.price} />
                                                </td>
                                                <td className="hidden px-5 py-4 xl:table-cell">
                                                    <span className="tabular-nums font-bold text-gray-900 dark:text-white">
                                                        {new Intl.NumberFormat('fr-FR').format(article.views_count)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                                                                                <AdminLinkButton
                                                            href={route('dashboard.articles.edit', article.id)}
                                                            variant="secondary"
                                                            size="icon"
                                                            icon={<Edit className="h-4 w-4" />}
                                                            title="Modifier"
                                                        />
                                                        <AdminButton
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            icon={copiedArticleId === article.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                            onClick={() => copyArticleLink(article.slug, article.id)}
                                                            title={copiedArticleId === article.id ? 'Lien copié' : 'Copier le lien'}
                                                        />
                                                        <AdminLinkButton
                                                            href={route('article.show', article.slug)}
                                                            as="a"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            variant="ghost"
                                                            size="icon"
                                                            icon={<Eye className="h-4 w-4" />}
                                                            title="Voir l'article"
                                                        />
                                                        <AdminButton
                                                            variant="danger"
                                                            size="icon"
                                                            icon={<Trash2 className="h-4 w-4" />}
                                                            onClick={() => handleDelete(article.id)}
                                                            title="Supprimer"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination
                                links={articles.links}
                                from={from}
                                to={to}
                                total={articles.total}
                            />
                        </>
                    )}
                </AdminCard>
            </div>

            <Dialog open={siteImportOpen} onOpenChange={setSiteImportOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Importer un export LE RURAL</DialogTitle>
                        <DialogDescription>
                            Importez un fichier JSON natif du site. Vous pouvez conserver le statut source ou forcer brouillon/publie.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitSiteImport} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <ImportHintCard
                                icon={<FileText className="h-5 w-5" />}
                                title="Format attendu"
                                description="Un fichier JSON exporte depuis la bibliotheque editoriale LE RURAL."
                            />
                            <ImportHintCard
                                icon={<Upload className="h-5 w-5" />}
                                title="Comportement"
                                description="Les categories manquantes sont creees automatiquement et le contenu markdown reste compatible."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Fichier JSON</label>
                            <input
                                type="file"
                                accept=".json,application/json,text/plain"
                                onChange={(event) => siteImportForm.setData('file', event.target.files?.[0] ?? null)}
                                className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.16em] file:text-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            />
                            <InputError message={siteImportForm.errors.file} className="mt-2" />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Statut de publication</label>
                            <select
                                value={siteImportForm.data.publication_mode}
                                onChange={(event) =>
                                    siteImportForm.setData(
                                        'publication_mode',
                                        event.target.value as 'preserve' | 'draft' | 'published',
                                    )
                                }
                                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-gray-950"
                            >
                                <option value="preserve">Conserver le statut source</option>
                                <option value="draft">Tout importer en brouillon</option>
                                <option value="published">Tout publier immediatement</option>
                            </select>
                            <InputError message={siteImportForm.errors.publication_mode} className="mt-2" />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSiteImportOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={siteImportForm.processing}>
                                {siteImportForm.processing ? 'Import en cours...' : "Lancer l'import JSON"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={wordpressImportOpen} onOpenChange={setWordpressImportOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Importer des articles WordPress</DialogTitle>
                        <DialogDescription>
                            Importez un export XML WordPress. Les articles seront convertis dans le format editorial du site.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitWordpressImport} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <ImportHintCard
                                icon={<Globe className="h-5 w-5" />}
                                title="Source acceptee"
                                description="Fichier XML WordPress de type export d'articles."
                            />
                            <ImportHintCard
                                icon={<FileText className="h-5 w-5" />}
                                title="Traitement"
                                description="Le contenu HTML WordPress est garde, l'image principale est detectee depuis le premier media du contenu."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Fichier XML WordPress</label>
                            <input
                                type="file"
                                accept=".xml,text/xml,application/xml,text/plain"
                                onChange={(event) => wordpressImportForm.setData('file', event.target.files?.[0] ?? null)}
                                className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.16em] file:text-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            />
                            <InputError message={wordpressImportForm.errors.file} className="mt-2" />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Statut apres import</label>
                            <select
                                value={wordpressImportForm.data.publication_mode}
                                onChange={(event) =>
                                    wordpressImportForm.setData(
                                        'publication_mode',
                                        event.target.value as 'draft' | 'published',
                                    )
                                }
                                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-gray-950"
                            >
                                <option value="draft">Importer en brouillon</option>
                                <option value="published">Importer en publie</option>
                            </select>
                            <InputError message={wordpressImportForm.errors.publication_mode} className="mt-2" />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setWordpressImportOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={wordpressImportForm.processing}>
                                {wordpressImportForm.processing ? 'Import en cours...' : "Lancer l'import WordPress"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}

function ImportHintCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {icon}
            </div>
            <div className="text-sm font-black uppercase tracking-[0.16em] text-gray-900 dark:text-white">{title}</div>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    );
}

function FilterSelect({
    value,
    onChange,
    children,
}: {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80"
        >
            {children}
        </select>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Publie') {
        return <AdminStatusPill tone="success">Publie</AdminStatusPill>;
    }

    if (status === 'Programme') {
        return <AdminStatusPill tone="info">Programme</AdminStatusPill>;
    }

    return <AdminStatusPill tone="warning">Brouillon</AdminStatusPill>;
}

function AccessBadge({ premium, price }: { premium: boolean; price?: number | null }) {
    if (!premium) {
        return <AdminStatusPill tone="neutral">Gratuit</AdminStatusPill>;
    }

    return (
        <AdminStatusPill tone="info">
            {price ? `${Number(price).toLocaleString('fr-FR')} FCFA` : 'Premium'}
        </AdminStatusPill>
    );
}




