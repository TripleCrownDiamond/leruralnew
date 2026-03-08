import MainLayout from '@/Layouts/MainLayout';
import { Link, usePage } from '@inertiajs/react';
import ArticleCard from '@/Components/ArticleCard';
import HomeSidebar from '@/Components/HomeSidebar';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Grid, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import AdSpace from '@/Components/AdSpace';
import StickyCategoryNav from '@/Components/StickyCategoryNav';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/Components/ui/dropdown-menu"

interface Article {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    image: string | null;
    author: string;
    premium: boolean;
    price: number | string | null;
    published_human: string | null;
    likes_count?: number;
    views_count?: number;
    comments_count?: number;
    is_liked?: boolean;
}

interface CategoryShowProps {
    category: {
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
    };
    articles: {
        data: Article[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        sort?: string;
        type?: string;
        min_price?: string;
        max_price?: string;
    };
    market_prices?: any[];
    webtv_videos?: any[];
    partners?: any[];
    latest_comments?: any[];
}

export default function CategoryShow({ 
    category, 
    articles, 
    filters = {},
    market_prices = [],
    webtv_videos = [],
    partners = [],
    latest_comments = [] 
}: CategoryShowProps) {
    const { props } = usePage<any>();
    const locale = props.locale ?? 'fr';

    const [liked, setLiked] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        if (articles?.data) {
            articles.data.forEach(article => {
                if (article.is_liked) {
                    initial[article.slug] = true;
                }
            });
        }
        return initial;
    });
    const [likesCountBySlug, setLikesCountBySlug] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        if (articles?.data) {
            articles.data.forEach(article => {
                initial[article.slug] = article.likes_count ?? 0;
            });
        }
        return initial;
    });
    
    // Filters state - Safe initialization without using props directly in useState initializers if possible
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortOption, setSortOption] = useState('recent');
    const [filterType, setFilterType] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Effect to sync filters from props when they change
    useEffect(() => {
        if (filters) {
            setSearchQuery(filters.search || '');
            setSortOption(filters.sort || 'recent');
            setFilterType(filters.type || 'all');
            setMinPrice(filters.min_price || '');
            setMaxPrice(filters.max_price || '');
        }
    }, [filters]);

    // Update filters
    const updateFilters = (newFilters: any) => {
        router.get(
            route('category.show', category.slug),
            {
                search: searchQuery,
                sort: sortOption,
                type: filterType !== 'all' ? filterType : undefined,
                min_price: minPrice,
                max_price: maxPrice,
                ...newFilters,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Helper for currency format
    const formatCfa = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return null;
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(value));
    };

    const toggleLike = async (slug: string, baseLikes: number) => {
        try {
            const currentLiked = liked[slug];
            const newLiked = !currentLiked;

            setLiked((prev) => ({ ...prev, [slug]: newLiked }));
            setLikesCountBySlug((prev) => ({
                ...prev,
                [slug]: (prev[slug] ?? baseLikes) + (newLiked ? 1 : -1),
            }));

            await axios.post(`/articles/${slug}/like`);
        } catch (error) {
            setLiked((prev) => ({ ...prev, [slug]: !prev[slug] }));
            console.error(error);
        }
    };
    
    // We don't filter client-side anymore as it's handled by backend
    // But if we wanted to filter locally, we would use articles.data
    const displayArticles = articles?.data || [];

    return (
        <MainLayout title={category.name}>
            {/* Category Header */}
            <div className="relative mb-6 md:mb-12 overflow-hidden bg-gray-900 py-16 md:py-20 text-center text-white rounded-2xl md:rounded-[50px] mx-0 md:mx-4 mt-0 md:mt-4 shadow-2xl">
                {/* Background Image or Gradient */}
                {category.image ? (
                    <>
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={category.image} 
                                alt={category.name} 
                                className="h-full w-full object-cover opacity-40"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/30 z-10" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 z-10" />
                )}
                
                {/* Optional pattern background (only if no image) */}
                {!category.image && (
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] z-0" />
                )}
                
                <div className="relative z-20 container mx-auto px-4">
                    <span className="inline-block mb-4 rounded-full bg-primary/20 px-4 py-1 text-sm font-bold uppercase tracking-wider text-primary border border-primary/20 backdrop-blur-sm">
                        Catégorie
                    </span>
                    <h1 className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight drop-shadow-lg">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-200 drop-shadow-md">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-0 md:px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12">
                    
                    {/* Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        
                        {/* Filters & Search Bar */}
                        <div className="mb-8 flex flex-col gap-4 p-4 rounded-xl bg-white shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            {/* Top Row: Search & View Mode */}
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            // Debounce search update could be better here
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateFilters({ search: searchQuery });
                                            }
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                                
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`rounded-md p-1.5 transition-colors ${
                                                viewMode === 'grid'
                                                    ? 'bg-white shadow-sm dark:bg-gray-800 text-primary'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`rounded-md p-1.5 transition-colors ${
                                                viewMode === 'list'
                                                    ? 'bg-white shadow-sm dark:bg-gray-800 text-primary'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row: Filters */}
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Sort Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Filter className="h-3.5 w-3.5" />
                                            Tri: {sortOption === 'recent' ? 'Récent' : sortOption === 'oldest' ? 'Ancien' : sortOption === 'popular' ? 'Populaire' : sortOption === 'az' ? 'A-Z' : 'Z-A'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={sortOption} onValueChange={(val) => { setSortOption(val); updateFilters({ sort: val }); }}>
                                            <DropdownMenuRadioItem value="recent">Plus récent</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="oldest">Plus ancien</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="popular">Populaire</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="az">Alphabétique (A-Z)</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="za">Alphabétique (Z-A)</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Type Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            {filterType === 'all' ? 'Tous types' : filterType === 'premium' ? 'Premium' : 'Gratuit'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuLabel>Type d'article</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={filterType} onValueChange={(val) => { setFilterType(val); updateFilters({ type: val }); }}>
                                            <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="free">Gratuit</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="premium">Premium</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Price Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            {(minPrice || maxPrice) ? `Prix: ${minPrice || '0'} - ${maxPrice || '∞'}` : 'Prix'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-64 p-4">
                                        <DropdownMenuLabel>Tranche de prix (FCFA)</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input 
                                                placeholder="Min" 
                                                type="number" 
                                                value={minPrice} 
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="h-8"
                                            />
                                            <span>-</span>
                                            <Input 
                                                placeholder="Max" 
                                                type="number" 
                                                value={maxPrice} 
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="h-8"
                                            />
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="w-full mt-4"
                                            onClick={() => updateFilters({ min_price: minPrice, max_price: maxPrice })}
                                        >
                                            Appliquer
                                        </Button>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {(searchQuery !== (filters?.search || '') || sortOption !== 'recent' || filterType !== 'all' || minPrice !== '' || maxPrice !== '') && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSortOption('recent');
                                            setFilterType('all');
                                            setMinPrice('');
                                            setMaxPrice('');
                                            router.get(route('category.show', category.slug));
                                        }}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Articles Grid/List */}
                        {articles?.data && articles.data.length > 0 ? (
                            <>
                                <div className={`grid gap-6 ${
                                viewMode === 'grid' 
                                    ? 'grid-cols-1 md:grid-cols-2' 
                                    : 'grid-cols-1'
                            }`}>
                                {articles.data.map((article) => (
                                    <ArticleCard
                                        key={article.slug}
                                        a={article}
                                        liked={liked[article.slug] ?? false}
                                        likesCount={likesCountBySlug[article.slug] ?? 0}
                                        onToggleLike={() => toggleLike(article.slug, article.likes_count ?? 0)}
                                        mode={viewMode}
                                    />
                                ))}
                                </div>

                                {/* Pagination */}
                                <div className="mt-12 flex justify-center">
                                    <nav className="flex flex-wrap items-center gap-2 justify-center bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                                            
                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={i}
                                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed select-none"
                                                    >
                                                        {content}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={i}
                                                    href={link.url}
                                                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                                        link.active
                                                            ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary'
                                                    }`}
                                                >
                                                    {content}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                                    <Search className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                    Aucun article trouvé
                                </h3>
                                <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">
                                    Nous n'avons trouvé aucun article correspondant à vos critères dans cette catégorie.
                                </p>
                                <Button 
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSortOption('recent');
                                        setFilterType('all');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        router.get(route('category.show', category.slug));
                                    }}
                                >
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
                        <HomeSidebar
                            marketPrices={market_prices}
                            webtvVideos={webtv_videos}
                            partners={partners}
                            comments={latest_comments}
                        />
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}
