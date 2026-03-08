import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Trash2, Plus, Eye, Search, Filter, MoreHorizontal, CheckSquare, Square, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import ImageWithFallback from '@/Components/ImageWithFallback';
import { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/Components/ui/dropdown-menu"

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
    price?: number;
}

interface Props {
    articles: {
        data: Article[];
        links: any[];
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
    categories: {
        id: number;
        name_fr: string;
    }[];
}

export default function Index({ articles, filters = {}, categories }: Props) {
    const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    // Debounce search
    useEffect(() => {
        // Skip if search matches initial prop to avoid double fetch on mount
        if (search === (filters.search || '') && 
            statusFilter === (filters.status || 'all') && 
            typeFilter === (filters.type || 'all') &&
            categoryFilter === (filters.category || 'all')) return;

        const timeoutId = setTimeout(() => {
            router.visit(
                route('dashboard.articles.index'),
                {
                    data: { 
                        search, 
                        status: statusFilter !== 'all' ? statusFilter : undefined,
                        type: typeFilter !== 'all' ? typeFilter : undefined,
                        category: categoryFilter !== 'all' ? categoryFilter : undefined
                    },
                    preserveState: true,
                    replace: true,
                    preserveScroll: true
                }
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, typeFilter, categoryFilter]);

    // Handle status change
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        router.visit(
            route('dashboard.articles.index'),
            {
                data: { search, status: status !== 'all' ? status : undefined },
                preserveState: true,
                replace: true,
                preserveScroll: true
            }
        );
    };

    const toggleSelectAll = () => {
        if (selectedArticles.length === articles.data.length) {
            setSelectedArticles([]);
        } else {
            setSelectedArticles(articles.data.map(a => a.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedArticles.includes(id)) {
            setSelectedArticles(selectedArticles.filter(aId => aId !== id));
        } else {
            setSelectedArticles([...selectedArticles, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedArticles.length} articles ?`)) {
            router.delete(route('dashboard.articles.bulk-destroy'), {
                data: { ids: selectedArticles },
                onSuccess: () => setSelectedArticles([]),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            router.delete(route('dashboard.articles.destroy', id));
        }
    };

    const handleRowClick = (id: number) => {
        router.visit(route('dashboard.articles.edit', id));
    };

    return (
        <DashboardLayout title="Gestion des Articles">
            <Head title="Gestion des Articles" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Articles
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Gérez vos articles, brouillons et publications
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {selectedArticles.length > 0 && (
                            <Button variant="destructive" onClick={handleBulkDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer ({selectedArticles.length})
                            </Button>
                        )}
                        <Button asChild className="w-full sm:w-auto">
                            <Link href={route('dashboard.articles.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvel Article
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <TextInput
                                className="pl-9 w-full"
                                placeholder="Rechercher un article (titre, extrait, contenu...)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="h-4 w-4" />
                                        {statusFilter === 'all' ? 'Statut' : (statusFilter === 'published' ? 'Publié' : 'Brouillon')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel>Statut</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter === 'all'}
                                        onCheckedChange={() => setStatusFilter('all')}
                                    >
                                        Tous les statuts
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter === 'published'}
                                        onCheckedChange={() => setStatusFilter('published')}
                                    >
                                        Publié
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter === 'draft'}
                                        onCheckedChange={() => setStatusFilter('draft')}
                                    >
                                        Brouillon
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="h-4 w-4" />
                                        {typeFilter === 'all' ? 'Type' : (typeFilter === 'premium' ? 'Payant' : 'Gratuit')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel>Type d'accès</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem 
                                        checked={typeFilter === 'all'}
                                        onCheckedChange={() => setTypeFilter('all')}
                                    >
                                        Tous les types
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={typeFilter === 'free'}
                                        onCheckedChange={() => setTypeFilter('free')}
                                    >
                                        Gratuit
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={typeFilter === 'premium'}
                                        onCheckedChange={() => setTypeFilter('premium')}
                                    >
                                        Payant
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="h-4 w-4" />
                                        Catégorie
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                                    <DropdownMenuLabel>Catégories</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem 
                                        checked={categoryFilter === 'all'}
                                        onCheckedChange={() => setCategoryFilter('all')}
                                    >
                                        Toutes les catégories
                                    </DropdownMenuCheckboxItem>
                                    {categories.map((cat) => (
                                        <DropdownMenuCheckboxItem 
                                            key={cat.id}
                                            checked={Number(categoryFilter) === cat.id}
                                            onCheckedChange={() => setCategoryFilter(String(cat.id))}
                                        >
                                            {cat.name_fr}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Articles Grid/List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3 w-4">
                                        <Checkbox 
                                            checked={selectedArticles.length === articles.data.length && articles.data.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th scope="col" className="px-6 py-3">Article</th>
                                    <th scope="col" className="px-6 py-3 hidden md:table-cell">Catégorie</th>
                                    <th scope="col" className="px-6 py-3 hidden sm:table-cell">Statut</th>
                                    <th scope="col" className="px-6 py-3 text-center hidden lg:table-cell">Accès</th>
                                    <th scope="col" className="px-6 py-3 text-center hidden lg:table-cell">Vues</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {articles.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Aucun article trouvé. Commencez par en créer un !
                                        </td>
                                    </tr>
                                ) : (
                                    articles.data.map((article) => (
                                        <tr 
                                            key={article.id} 
                                            className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${selectedArticles.includes(article.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                            onClick={() => handleRowClick(article.id)}
                                        >
                                            <td className="px-4 py-4 w-4" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox 
                                                    checked={selectedArticles.includes(article.id)}
                                                    onCheckedChange={() => toggleSelect(article.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        <ImageWithFallback
                                                            src={article.image || undefined}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                            fallbackComponent={
                                                                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400">
                                                                    <Eye className="h-5 w-5" />
                                                                </div>
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px] sm:max-w-xs group-hover:text-primary transition-colors">
                                                            {article.title}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                            <span className="truncate max-w-[100px]">{article.author}</span>
                                                            <span>•</span>
                                                            <span>{article.published_at}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {article.category}
                                                    </span>
                                                    {article.is_featured && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-700">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            À la une
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    article.status === 'Publié' 
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        article.status === 'Publié' ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}></span>
                                                    {article.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center hidden lg:table-cell">
                                                {article.is_premium ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                        {article.price ? `${Number(article.price).toLocaleString('fr-FR')} FCFA` : 'Premium'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                        Gratuit
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">
                                                {article.views_count}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => router.visit(route('dashboard.articles.edit', article.id))}>
                                                            <Edit className="mr-2 h-4 w-4" /> Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => window.open(route('article.show', article.slug), '_blank')}>
                                                            <Eye className="mr-2 h-4 w-4" /> Voir
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => handleDelete(article.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {articles.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Affichage de {((articles.current_page - 1) * articles.per_page) + 1} à {Math.min(articles.current_page * articles.per_page, articles.total)} sur {articles.total} résultats
                            </div>
                            <div className="flex gap-1 items-center">
                                {articles.links.map((link, i) => {
                                    let content;
                                    const isPrevious = link.label.includes('Previous') || link.label.includes('pagination.previous');
                                    const isNext = link.label.includes('Next') || link.label.includes('pagination.next');

                                    if (isPrevious) {
                                        content = <ChevronLeft className="h-4 w-4" />;
                                    } else if (isNext) {
                                        content = <ChevronRight className="h-4 w-4" />;
                                    } else {
                                        content = <span dangerouslySetInnerHTML={{ __html: link.label }} />;
                                    }

                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center justify-center min-w-[32px] h-8 ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-md text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-not-allowed flex items-center justify-center min-w-[32px] h-8"
                                        >
                                            {content}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
