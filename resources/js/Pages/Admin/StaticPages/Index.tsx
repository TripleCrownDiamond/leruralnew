import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { File, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';

interface StaticPage {
    id: number;
    slug: string;
    title: string;
    category: 'legal' | 'info' | 'other';
    is_published: boolean;
    order: number;
    updated_at: string;
}

interface Paginator<T> {
    data: T[];
    links: any[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    pages: Paginator<StaticPage>;
    filters: { search?: string; category?: string };
}

const CATEGORY_LABEL: Record<string, string> = {
    legal: 'Legal',
    info: 'Info',
    other: 'Autre',
};

export default function Index({ pages, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? 'all');

    useEffect(() => {
        if (search === (filters.search ?? '') && category === (filters.category ?? 'all')) return;
        const timer = setTimeout(() => {
            router.visit(route('dashboard.static-pages.index'), {
                data: {
                    search: search || undefined,
                    category: category !== 'all' ? category : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, category]);

    const remove = (id: number) => {
        if (confirm('Supprimer cette page ?')) {
            router.delete(route('dashboard.static-pages.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title="Pages statiques">
            <Head title="Pages statiques" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Editorial"
                    title="Pages statiques & informations"
                    subtitle="Mentions legales, CGU, politique de confidentialite et pages informatives."
                    icon={<File className="h-6 w-6" />}
                    meta={`${pages.total} pages`}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.static-pages.create')}
                            variant="primary"
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Nouvelle page
                        </AdminLinkButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher par titre ou slug..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Toutes' },
                                { key: 'legal', label: 'Legal' },
                                { key: 'info', label: 'Info' },
                                { key: 'other', label: 'Autre' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setCategory(opt.key)}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${
                                        category === opt.key
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
                    {pages.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<File className="h-7 w-7" />}
                            title="Aucune page"
                            subtitle="Creez vos mentions legales, CGU ou politiques de confidentialite."
                            action={
                                <AdminLinkButton
                                    href={route('dashboard.static-pages.create')}
                                    variant="primary"
                                    icon={<Plus className="h-4 w-4" />}
                                >
                                    Nouvelle page
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/50">
                                    <tr>
                                        <th className="px-5 py-3">Titre</th>
                                        <th className="px-5 py-3">Slug</th>
                                        <th className="px-5 py-3">Categorie</th>
                                        <th className="px-5 py-3">Statut</th>
                                        <th className="px-5 py-3">Modifiee</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {pages.data.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {p.title}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-white/5 dark:text-white/70">
                                                    /pages/{p.slug}
                                                </code>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                    {CATEGORY_LABEL[p.category] ?? p.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <AdminStatusPill tone={p.is_published ? 'success' : 'neutral'}>
                                                    {p.is_published ? 'Publiee' : 'Brouillon'}
                                                </AdminStatusPill>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500 dark:text-white/50">
                                                {new Date(p.updated_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {p.is_published && (
                                                        <a
                                                            href={`/pages/${p.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-white/5 dark:text-white/60"
                                                            title="Voir"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                    <AdminLinkButton
                                                        href={route('dashboard.static-pages.edit', p.id)}
                                                        variant="secondary"
                                                        size="icon"
                                                        icon={<Pencil className="h-4 w-4" />}
                                                        title="Modifier"
                                                    />
                                                    <AdminButton
                                                        variant="danger"
                                                        size="icon"
                                                        icon={<Trash2 className="h-4 w-4" />}
                                                        onClick={() => remove(p.id)}
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

                    <AdminPagination
                        links={pages.links}
                        from={pages.from}
                        to={pages.to}
                        total={pages.total}
                    />
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
