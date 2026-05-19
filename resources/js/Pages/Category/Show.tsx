import ArticleCard from '@/Components/ArticleCard';
import AuthModal from '@/Components/AuthModal';
import HomeSidebar from '@/Components/HomeSidebar';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import useSharedContent from '@/Hooks/useSharedContent';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Grid,
    List,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
        image_position_x?: number | null;
        image_position_y?: number | null;
        is_following?: boolean;
        followers_count?: number;
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
}: CategoryShowProps) {
    const categoryImagePositionX = Number(category.image_position_x ?? 50);
    const categoryImagePositionY = Number(category.image_position_y ?? 50);
    const { props } = usePage<any>();
    const baseUrl = (() => {
        try {
            return props.ziggy?.location
                ? new URL(props.ziggy.location).origin
                : window.location.origin;
        } catch {
            return 'https://lerural.bj';
        }
    })();
    const resolveAbsoluteUrl = (value?: string | null) => {
        if (!value) return `${baseUrl}/logos/logo.png`;
        if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
            return value.startsWith('//') ? `https:${value}` : value;
        }
        try {
            return new URL(value, baseUrl).href;
        } catch {
            return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
        }
    };
    const shareDescription =
        category.description ||
        `Toutes les actualites de la rubrique ${category.name}.`;
    const shareImage = resolveAbsoluteUrl(
        category.image ||
            articles.data?.find((article) => article.image)?.image ||
            '/logos/logo.png',
    );
    const shareUrl =
        props.ziggy?.location || `${baseUrl}/categorie/${category.slug}`;
    const {
        marketPrices,
        webtvVideos,
        partners: partnersData,
        latestComments,
    } = useSharedContent();
    const locale = props.locale ?? 'fr';
    const authUser = props.auth?.user;
    const hasActiveSubscription = Boolean(props.auth?.has_active_subscription);
    const isElevatedUser = Boolean(
        authUser && ['admin', 'editor'].includes(String(authUser.role ?? '')),
    );
    const [liked, setLiked] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        if (articles?.data) {
            articles.data.forEach((article) => {
                if (article.is_liked) {
                    initial[article.slug] = true;
                }
            });
        }
        return initial;
    });
    const [likesCountBySlug, setLikesCountBySlug] = useState<
        Record<string, number>
    >(() => {
        const initial: Record<string, number> = {};
        if (articles?.data) {
            articles.data.forEach((article) => {
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
    const [showSubscriptionAuthModal, setShowSubscriptionAuthModal] =
        useState(false);
    const [isFollowing, setIsFollowing] = useState(
        Boolean(category.is_following),
    );
    const [followBusy, setFollowBusy] = useState(false);

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
            { preserveState: true, preserveScroll: true, replace: true },
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

    const handleSubscriptionCta = () => {
        if (!authUser) {
            setShowSubscriptionAuthModal(true);
            return;
        }

        if (isElevatedUser) {
            window.location.href = '/dashboard';
            return;
        }

        if (hasActiveSubscription) {
            window.location.href = route('user.subscription');
            return;
        }

        window.location.href = '/checkout?type=subscription&id=default';
    };

    const toggleCategoryFollow = () => {
        if (!authUser) {
            router.visit(route('login'));
            return;
        }

        setFollowBusy(true);
        const done = () => setFollowBusy(false);

        if (isFollowing) {
            router.delete(route('categories.unfollow', category.slug), {
                preserveScroll: true,
                onSuccess: () => setIsFollowing(false),
                onFinish: done,
            });
        } else {
            router.post(
                route('categories.follow', category.slug),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => setIsFollowing(true),
                    onFinish: done,
                },
            );
        }
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

    const totalArticles = articles?.total ?? displayArticles.length;

    return (
        <MainLayout title={category.name}>
            <Head>
                <title>{category.name}</title>
                <meta
                    head-key="description"
                    name="description"
                    content={shareDescription}
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content="LE RURAL"
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content={category.name}
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={shareDescription}
                />
                <meta
                    head-key="og:image"
                    property="og:image"
                    content={shareImage}
                />
                <meta
                    head-key="og:image:secure_url"
                    property="og:image:secure_url"
                    content={shareImage}
                />
                <meta head-key="og:url" property="og:url" content={shareUrl} />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content={category.name}
                />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={shareDescription}
                />
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content={shareImage}
                />
                <link head-key="canonical" rel="canonical" href={shareUrl} />
            </Head>
            <AuthModal
                isOpen={showSubscriptionAuthModal}
                onClose={() => setShowSubscriptionAuthModal(false)}
                purchaseType="subscription"
            />
            {/* Editorial Category Header */}
            <div className="relative mx-0 mb-8 mt-0 overflow-hidden shadow-2xl md:mx-4 md:mb-12 md:mt-4 md:rounded-3xl">
                <div className="relative bg-gray-950 text-white">
                    {category.image && (
                        <img
                            src={category.image}
                            alt={category.name}
                            className="absolute inset-0 h-full w-full object-cover opacity-45"
                            style={{
                                objectPosition: `${categoryImagePositionX}% ${categoryImagePositionY}%`,
                            }}
                            loading="eager"
                            decoding="async"
                        />
                    )}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-br from-gray-950/70 via-gray-950/60 to-gray-900/35"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '26px 26px',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-primary/25 blur-3xl"
                    />

                    {/* Brand rail */}
                    <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.32em] text-white/70 sm:px-10">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>LE RURAL</span>
                        <span className="text-white/20">/</span>
                        <span>Categorie</span>
                        <span className="ml-auto hidden text-white/50 sm:inline">
                            {totalArticles} article
                            {totalArticles > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 backdrop-blur">
                            Rubrique
                        </span>
                        <h1 className="mt-5 font-heading text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            {category.name}
                        </h1>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleCategoryFollow}
                                disabled={followBusy}
                                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isFollowing
                                    ? 'Ne plus suivre'
                                    : 'Suivre cette rubrique'}
                            </button>
                            <span className="text-xs font-semibold text-white/75">
                                {category.followers_count ?? 0} abonnes
                            </span>
                        </div>
                        {category.description && (
                            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-0 pb-16 sm:px-6 md:px-4 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        {/* Filters & Search Bar */}
                        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_40px_-15px_rgba(47,106,17,0.15)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]">
                            {/* Top Row: Search & View Mode */}
                            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                <div className="relative w-full flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                updateFilters({
                                                    search: searchQuery,
                                                });
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
                                                    ? 'bg-white text-primary shadow-sm dark:bg-gray-800'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`rounded-md p-1.5 transition-colors ${
                                                viewMode === 'list'
                                                    ? 'bg-white text-primary shadow-sm dark:bg-gray-800'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row: Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Sort Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Filter className="h-3.5 w-3.5" />
                                            Tri:{' '}
                                            {sortOption === 'recent'
                                                ? 'Recent'
                                                : sortOption === 'oldest'
                                                  ? 'Ancien'
                                                  : sortOption === 'popular'
                                                    ? 'Populaire'
                                                    : sortOption === 'az'
                                                      ? 'A-Z'
                                                      : 'Z-A'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuLabel>
                                            Trier par
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup
                                            value={sortOption}
                                            onValueChange={(val) => {
                                                setSortOption(val);
                                                updateFilters({ sort: val });
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="recent">
                                                Plus recent
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="oldest">
                                                Plus ancien
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="popular">
                                                Populaire
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="az">
                                                Alphabetique (A-Z)
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="za">
                                                Alphabetique (Z-A)
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Type Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            {filterType === 'all'
                                                ? 'Tous types'
                                                : filterType === 'premium'
                                                  ? 'Premium'
                                                  : 'Gratuit'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuLabel>
                                            Type d'article
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup
                                            value={filterType}
                                            onValueChange={(val) => {
                                                setFilterType(val);
                                                updateFilters({ type: val });
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                Tous
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="free">
                                                Gratuit
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="premium">
                                                Premium
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Price Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            {minPrice || maxPrice
                                                ? `Prix: ${minPrice || '0'} - ${maxPrice || 'illimite'}`
                                                : 'Prix'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="start"
                                        className="w-64 p-4"
                                    >
                                        <DropdownMenuLabel>
                                            Tranche de prix (FCFA)
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <div className="mt-2 flex items-center gap-2">
                                            <Input
                                                placeholder="Min"
                                                type="number"
                                                value={minPrice}
                                                onChange={(e) =>
                                                    setMinPrice(e.target.value)
                                                }
                                                className="h-8"
                                            />
                                            <span>-</span>
                                            <Input
                                                placeholder="Max"
                                                type="number"
                                                value={maxPrice}
                                                onChange={(e) =>
                                                    setMaxPrice(e.target.value)
                                                }
                                                className="h-8"
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            className="mt-4 w-full"
                                            onClick={() =>
                                                updateFilters({
                                                    min_price: minPrice,
                                                    max_price: maxPrice,
                                                })
                                            }
                                        >
                                            Appliquer
                                        </Button>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {(searchQuery !== (filters?.search || '') ||
                                    sortOption !== 'recent' ||
                                    filterType !== 'all' ||
                                    minPrice !== '' ||
                                    maxPrice !== '') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSortOption('recent');
                                            setFilterType('all');
                                            setMinPrice('');
                                            setMaxPrice('');
                                            router.get(
                                                route(
                                                    'category.show',
                                                    category.slug,
                                                ),
                                            );
                                        }}
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        Reinitialiser
                                    </Button>
                                )}
                            </div>
                        </div>

                        {!isElevatedUser && (
                            <section className="mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-emerald-700 to-emerald-800 p-[1px] shadow-[0_20px_60px_-35px_rgba(47,106,17,0.45)]">
                                <div className="rounded-3xl bg-gray-950 px-5 py-6 text-white sm:px-7 sm:py-7">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                                        Abonnement LE RURAL
                                    </p>
                                    <h3 className="mt-2 font-heading text-2xl font-black tracking-tight sm:text-3xl">
                                        {hasActiveSubscription
                                            ? 'Votre abonnement est actif'
                                            : 'Debloquez tous les articles premium'}
                                    </h3>
                                    <p className="mt-2 max-w-2xl text-sm text-gray-300">
                                        {hasActiveSubscription
                                            ? 'Profitez de tous les contenus reserves aux abonnes, gerez vos factures et vos achats depuis votre tableau de bord.'
                                            : "Accedez a l'integralite des analyses payantes et des contenus exclusifs de la redaction."}
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleSubscriptionCta}
                                            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-primary/40 transition-transform hover:scale-[1.02]"
                                        >
                                            {hasActiveSubscription
                                                ? 'Tableau de bord'
                                                : "S'abonner"}
                                        </button>
                                        {!authUser && (
                                            <a
                                                href={route('register')}
                                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-white/40 hover:bg-white/10"
                                            >
                                                Creer un compte
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Articles Grid/List */}
                        {articles?.data && articles.data.length > 0 ? (
                            <>
                                <div
                                    className={`grid gap-6 ${
                                        viewMode === 'grid'
                                            ? 'grid-cols-1 md:grid-cols-2'
                                            : 'grid-cols-1'
                                    }`}
                                >
                                    {articles.data.map((article) => (
                                        <ArticleCard
                                            key={article.slug}
                                            a={article}
                                            liked={liked[article.slug] ?? false}
                                            likesCount={
                                                likesCountBySlug[
                                                    article.slug
                                                ] ?? 0
                                            }
                                            onToggleLike={() =>
                                                toggleLike(
                                                    article.slug,
                                                    article.likes_count ?? 0,
                                                )
                                            }
                                            mode={viewMode}
                                            className={
                                                viewMode === 'grid'
                                                    ? 'h-full'
                                                    : ''
                                            }
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="mt-12 flex justify-center">
                                    <nav className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        {articles.links.map((link, i) => {
                                            let content;
                                            const isPrevious =
                                                link.label.includes(
                                                    'Previous',
                                                ) ||
                                                link.label.includes(
                                                    'pagination.previous',
                                                );
                                            const isNext =
                                                link.label.includes('Next') ||
                                                link.label.includes(
                                                    'pagination.next',
                                                );

                                            if (isPrevious) {
                                                content = (
                                                    <ChevronLeft className="h-4 w-4" />
                                                );
                                            } else if (isNext) {
                                                content = (
                                                    <ChevronRight className="h-4 w-4" />
                                                );
                                            } else {
                                                content = (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                );
                                            }

                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={i}
                                                        className="flex h-10 w-10 cursor-not-allowed select-none items-center justify-center rounded-lg text-sm font-medium text-gray-300 dark:text-gray-600"
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
                                                            ? 'scale-105 bg-primary text-white shadow-md shadow-primary/30'
                                                            : 'text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700'
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
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/50 py-24 text-center dark:border-white/10 dark:bg-white/[0.02]">
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 text-primary">
                                    <Search className="h-7 w-7" />
                                </div>
                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                    LE RURAL / Archives vides
                                </div>
                                <h3 className="font-heading text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                    Aucun article dans cette selection
                                </h3>
                                <p className="mb-7 mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                                    Ajustez vos filtres ou elargissez la
                                    recherche pour decouvrir plus de contenus
                                    agricoles.
                                </p>
                                <Button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSortOption('recent');
                                        setFilterType('all');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        router.get(
                                            route(
                                                'category.show',
                                                category.slug,
                                            ),
                                        );
                                    }}
                                    className="rounded-full px-6"
                                >
                                    Reinitialiser les filtres
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8 lg:col-span-4 xl:col-span-3">
                        <HomeSidebar
                            marketPrices={marketPrices}
                            webtvVideos={webtvVideos}
                            partners={partnersData}
                            comments={latestComments}
                        />
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}
