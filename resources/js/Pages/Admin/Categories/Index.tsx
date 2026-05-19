import AdminCard, { AdminEmptyState, AdminStatusPill } from '@/Components/Dashboard/AdminCard';
import { AdminButton, AdminLinkButton } from '@/Components/Dashboard/AdminButton';
import AdminPageHeader from '@/Components/Dashboard/AdminPageHeader';
import AdminPagination from '@/Components/Dashboard/AdminPagination';
import AdminSearchBar from '@/Components/Dashboard/AdminSearchBar';
import ImageWithFallback from '@/Components/ImageWithFallback';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Edit, FolderTree, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: number;
    name_fr: string;    slug: string;
    order: number;
    published: boolean;
    image?: string | null;
}

interface Props {
    categories: {
        data: Category[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: 'all' | 'active' | 'inactive';
    };
}

export default function Index({ categories, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(filters.status || 'all');

    useEffect(() => {
        if (search === (filters.search || '') && statusFilter === (filters.status || 'all')) {
            return;
        }

        const timeoutId = setTimeout(() => {
            router.visit(route('dashboard.categories.index'), {
                data: {
                    search: search || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, filters]);

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        router.visit(route('dashboard.categories.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer cette categorie ?')) {
            router.delete(route('dashboard.categories.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const from = categories.total === 0 ? 0 : (categories.current_page - 1) * categories.per_page + 1;
    const to = categories.total === 0 ? 0 : Math.min(categories.current_page * categories.per_page, categories.total);

    return (
        <DashboardLayout title="Categories">
            <Head title="Categories" />

            <div className="space-y-6">
                <AdminPageHeader
                    eyebrow="Taxonomie"
                    title="Categories"
                    subtitle="Organisez les rubriques editoriales avec la meme experience que la gestion des articles."
                    icon={<FolderTree className="h-6 w-6" />}
                    meta={`${categories.total} categories`}
                    actions={
                        <AdminLinkButton
                            href={route('dashboard.categories.create')}
                            variant="primary"
                            icon={<Plus className="h-3.5 w-3.5" />}
                        >
                            Nouvelle categorie
                        </AdminLinkButton>
                    }
                />

                <AdminSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher une categorie..."
                    filters={
                        <div className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-[10px] font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
                            {[
                                { key: 'all', label: 'Toutes' },
                                { key: 'active', label: 'Publiees' },
                                { key: 'inactive', label: 'Brouillons' },
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setStatusFilter(opt.key as 'all' | 'active' | 'inactive')}
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
                        <AdminButton type="button" variant="ghost" size="sm" onClick={resetFilters}>
                            Reinitialiser
                        </AdminButton>
                    }
                />

                <AdminCard>
                    {categories.data.length === 0 ? (
                        <AdminEmptyState
                            icon={<ImageIcon className="h-6 w-6" />}
                            title="Aucune categorie"
                            subtitle="Ajoutez une premiere categorie pour structurer vos articles."
                            action={
                                <AdminLinkButton href={route('dashboard.categories.create')} icon={<Plus className="h-3.5 w-3.5" />}>
                                    Creer
                                </AdminLinkButton>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:bg-white/[0.04] dark:text-white/50">
                                        <tr>
                                            <th className="px-5 py-4">Categorie</th>
                                            <th className="px-5 py-4">Slug</th>
                                            <th className="px-5 py-4">Ordre</th>
                                            <th className="px-5 py-4">Statut</th>
                                            <th className="px-5 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {categories.data.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="cursor-pointer transition-colors hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
                                                onClick={() => router.visit(route('dashboard.categories.edit', category.id))}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-11 w-11 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5">
                                                            <ImageWithFallback
                                                                src={category.image || undefined}
                                                                alt={category.name_fr}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{category.name_fr}</p>                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-mono text-xs text-gray-600 dark:text-white/60">{category.slug}</td>
                                                <td className="px-5 py-4 text-gray-700 dark:text-white/70">{category.order}</td>
                                                <td className="px-5 py-4">
                                                    <AdminStatusPill tone={category.published ? 'success' : 'neutral'}>
                                                        {category.published ? 'Publiee' : 'Brouillon'}
                                                    </AdminStatusPill>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                                                        <AdminButton
                                                            type="button"
                                                            variant="secondary"
                                                            size="icon"
                                                            icon={<Edit className="h-4 w-4" />}
                                                            onClick={() => router.visit(route('dashboard.categories.edit', category.id))}
                                                            title="Modifier"
                                                        />
                                                        <AdminButton
                                                            type="button"
                                                            variant="danger"
                                                            size="icon"
                                                            icon={<Trash2 className="h-4 w-4" />}
                                                            onClick={() => handleDelete(category.id)}
                                                            title="Supprimer"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <AdminPagination links={categories.links} from={from} to={to} total={categories.total} />
                        </>
                    )}
                </AdminCard>
            </div>
        </DashboardLayout>
    );
}
