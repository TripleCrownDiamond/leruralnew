import AdSpace from '@/Components/AdSpace';
import ArticleCard from '@/Components/ArticleCard';
import CommentItem from '@/Components/CommentItem';
import HomeSidebar from '@/Components/HomeSidebar';
import ImageWithFallback from '@/Components/ImageWithFallback';
import Paywall from '@/Components/Paywall';
import { Button } from '@/Components/ui/button';
import useSharedContent from '@/Hooks/useSharedContent';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    Bookmark,
    Calendar,
    Check,
    Copy,
    Eye,
    Facebook,
    Linkedin,
    Lock,
    Mail,
    MessageCircle,
    MessageSquare,
    Send,
    Share2,
    ThumbsUp,
    Twitter,
} from 'lucide-react';
import { useState } from 'react';

interface ArticleShowProps {
    article: {
        id: number;
        slug: string;
        title: string;
        content: string | null;
        excerpt: string | null;
        share_description?: string | null;
        share_image?: string | null;
        share_url?: string | null;
        image: string | null;
        image_position_x?: number | null;
        image_position_y?: number | null;
        author: string;
        published_at: string | null;
        published_human: string | null;
        category: any;
        likes_count: number;
        views_count: number;
        comments_count: number;
        is_liked: boolean;
        is_saved?: boolean;
        premium: boolean;
        can_read?: boolean;
        price: number | string | null;
        comments: any[];
        read_time?: number;
    };
    similar_articles: any[];
    market_prices?: any[];
    webtv_videos?: any[];
    partners?: any[];
    latest_comments?: any[];
    min_subscription_price?: number | null;
}

export default function ArticleShow({
    article,
    similar_articles,
    min_subscription_price,
}: ArticleShowProps) {
    const { props } = usePage<any>();
    const { marketPrices, webtvVideos, partners, latestComments } =
        useSharedContent();
    const locale = props.locale ?? 'fr';
    const flash = props.flash ?? {};
    const [likesCount, setLikesCount] = useState(article.likes_count);
    const [isLiked, setIsLiked] = useState(article.is_liked);
    const [isSaved, setIsSaved] = useState(article.is_saved ?? false);
    const [copiedLink, setCopiedLink] = useState(false);
    const imagePositionX = Number(article.image_position_x ?? 50);
    const imagePositionY = Number(article.image_position_y ?? 50);

    // Similar articles state
    const [similarLiked, setSimilarLiked] = useState<Record<string, boolean>>(
        () => {
            const initial: Record<string, boolean> = {};
            similar_articles.forEach((article) => {
                if (article.is_liked) {
                    initial[article.slug] = true;
                }
            });
            return initial;
        },
    );
    const [similarLikesCount, setSimilarLikesCount] = useState<
        Record<string, number>
    >({});

    const auth = props.auth?.user;

    // Comment Form with Inertia useForm
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        author_name: auth ? auth.name : '',
        author_email: auth ? auth.email : '',
        rating: 5,
    });

    const formatCfa = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return null;
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(Number(value));
    };

    const handleLike = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        const prevLiked = isLiked;
        const prevCount = likesCount;

        setIsLiked(!prevLiked);
        setLikesCount(prevCount + (!prevLiked ? 1 : -1));

        try {
            await axios.post(`/articles/${article.slug}/like`);
        } catch {
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    const handleSimilarLike = async (slug: string, baseLikes: number) => {
        const currentLiked = similarLiked[slug];
        const newLiked = !currentLiked;

        setSimilarLiked((prev) => ({ ...prev, [slug]: newLiked }));
        setSimilarLikesCount((prev) => ({
            ...prev,
            [slug]: (prev[slug] ?? baseLikes) + (newLiked ? 1 : -1),
        }));

        try {
            await axios.post(`/articles/${slug}/like`);
        } catch {
            setSimilarLiked((prev) => ({ ...prev, [slug]: currentLiked }));
            setSimilarLikesCount((prev) => ({
                ...prev,
                [slug]: (prev[slug] ?? baseLikes) + (currentLiked ? 1 : -1),
            }));
        }
    };

    const handleSave = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (!auth) {
            window.location.href = '/login';
            return;
        }

        const prevSaved = isSaved;
        setIsSaved(!prevSaved);

        try {
            await axios.post(`/articles/${article.slug}/save`);
        } catch {
            setIsSaved(prevSaved);
        }
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/articles/${article.id}/comments`, {
            onSuccess: () => reset('content'),
            preserveScroll: true,
        });
    };
    const shareUrl = article.share_url || route('article.show', article.slug);
    const shareDescription = article.share_description || article.excerpt || '';
    
    // S'assurer que l'image de partage est une URL absolue
    const resolveImageUrl = (img: string | null | undefined): string => {
        if (!img) return `${window.location.origin}/logos/logo.png`;
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//')) {
            return img.startsWith('//') ? `https:${img}` : img;
        }
        return `${window.location.origin}${img.startsWith('/') ? '' : '/'}${img}`;
    };
    
    const shareImage = resolveImageUrl(
        article.share_image || article.image
    );

    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            window.setTimeout(() => setCopiedLink(false), 1800);
        } catch {
            // noop
        }
    };

    const shareNatively = async () => {
        try {
            if (typeof navigator !== 'undefined' && 'share' in navigator) {
                await navigator.share({
                    title: article.title,
                    text: shareDescription || article.title,
                    url: shareUrl,
                });
                return;
            }
        } catch {
            // noop
        }

        await copyShareLink();
    };

    return (
        <MainLayout title={article.title}>
            <Head>
                <title>{article.title}</title>
                <meta
                    head-key="description"
                    name="description"
                    content={shareDescription}
                />
                <meta head-key="og:type" property="og:type" content="article" />
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content="LE RURAL"
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content={article.title}
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
                <meta
                    head-key="og:image:alt"
                    property="og:image:alt"
                    content={article.title}
                />
                <meta head-key="og:url" property="og:url" content={shareUrl} />
                <meta
                    head-key="article:published_time"
                    property="article:published_time"
                    content={article.published_at ?? ''}
                />
                <meta
                    head-key="article:section"
                    property="article:section"
                    content={article.category?.name ?? 'Actualite'}
                />
                <meta
                    head-key="article:author"
                    property="article:author"
                    content={article.author}
                />
                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content="summary_large_image"
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content={article.title}
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
                <meta
                    head-key="twitter:image:alt"
                    name="twitter:image:alt"
                    content={article.title}
                />
                <link head-key="canonical" rel="canonical" href={shareUrl} />
            </Head>

            {/* Editorial Article Hero */}
            <div className="relative mx-0 mt-0 overflow-hidden shadow-2xl md:mx-4 md:mt-4 md:rounded-3xl">
                <div className="relative bg-gray-950 pb-16 pt-12 text-white lg:pb-20 lg:pt-14">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{
                            backgroundImage: `url(${article.image || '/images/article-placeholder.svg'})`,
                            backgroundPosition: `${imagePositionX}% ${imagePositionY}%`,
                            filter: 'blur(8px)',
                            transform: 'scale(1.08)',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-b from-gray-950/45 via-gray-950/55 to-gray-950/75"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                            backgroundSize: '26px 26px',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
                    />

                    {/* Brand rail */}
                    <div className="relative z-20 mb-10 flex items-center gap-3 border-b border-white/10 px-5 pb-3 text-[10px] font-black uppercase tracking-[0.32em] text-white/70 sm:px-10">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>LE RURAL</span>
                        <span className="text-white/20">/</span>
                        <span>Article</span>
                        {article.premium && (
                            <span className="ml-auto text-primary">
                                Premium
                            </span>
                        )}
                    </div>

                    <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
                                {article.category &&
                                Array.isArray(article.category) &&
                                article.category.length > 0 ? (
                                    article.category.map((cat: any) => (
                                        <Link
                                            key={cat.slug}
                                            href={`/categorie/${cat.slug}`}
                                            className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur transition-colors hover:border-primary hover:bg-primary/20"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))
                                ) : article.category &&
                                  typeof article.category === 'object' ? (
                                    <Link
                                        href={`/categorie/${article.category.slug}`}
                                        className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur transition-colors hover:border-primary hover:bg-primary/20"
                                    >
                                        {article.category.name_fr ||
                                            article.category.name}
                                    </Link>
                                ) : typeof article.category === 'string' ? (
                                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur">
                                        {article.category}
                                    </span>
                                ) : null}

                                {article.premium ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-500/30">
                                        <Lock className="h-3 w-3" />
                                        {article.price
                                            ? `${formatCfa(article.price)}`
                                            : 'Payant'}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-emerald-600 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30">
                                        Gratuit
                                    </span>
                                )}
                            </div>

                            <h1 className="font-heading text-3xl font-black leading-[1.08] tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-[3.75rem]">
                                {article.title}
                            </h1>

                            {article.excerpt && (
                                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                                    {article.excerpt.length > 180
                                        ? `${article.excerpt.slice(0, 180)}...`
                                        : article.excerpt}
                                </p>
                            )}

                            <div className="mt-9 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-300">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 text-sm font-black text-white ring-2 ring-white/20">
                                        {article.author
                                            ? article.author.charAt(0)
                                            : '?'}
                                    </div>
                                    <div className="leading-tight">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                            Par
                                        </div>
                                        <div className="text-sm font-bold text-white">
                                            {article.author || 'Auteur inconnu'}
                                        </div>
                                    </div>
                                </div>
                                <span className="h-5 w-px bg-white/20" />
                                <span className="flex items-center gap-1.5 text-white/80">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {article.published_at ||
                                        article.published_human}
                                </span>
                                <span className="h-5 w-px bg-white/20" />
                                <span className="flex items-center gap-1.5 text-white/80">
                                    <Eye className="h-3.5 w-3.5" />
                                    {new Intl.NumberFormat(locale).format(
                                        article.views_count,
                                    )}{' '}
                                    vues
                                </span>
                                {article.read_time && (
                                    <>
                                        <span className="h-5 w-px bg-white/20" />
                                        <span className="flex items-center gap-1.5 text-white/80">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            {article.read_time} min de lecture
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-30 mx-auto mt-8 max-w-7xl px-0 pb-16 sm:px-6 md:px-4 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12">
                    {/* Main Article Content */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="overflow-hidden rounded-none border-y border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl md:border">
                            {/* Featured Image */}
                            <div className="aspect-[21/9] w-full overflow-hidden">
                                <ImageWithFallback
                                    src={article.image || undefined}
                                    alt={article.title}
                                    className="h-full w-full object-cover"
                                    style={{
                                        objectPosition: `${imagePositionX}% ${imagePositionY}%`,
                                    }}
                                    fallbackSrc="/images/article-placeholder.svg"
                                />
                            </div>
                            <div className="p-6 sm:p-10">
                                {/* Actions Bar */}
                                <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-gray-100 pb-6 dark:border-gray-700 sm:flex-row">
                                    <div className="flex w-full justify-center gap-2 sm:w-auto sm:justify-start">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`gap-2 ${isLiked ? 'text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20' : 'text-gray-500'}`}
                                            onClick={handleLike}
                                        >
                                            <ThumbsUp
                                                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                                            />
                                            {likesCount}{' '}
                                            <span className="hidden sm:inline">
                                                J'aime
                                            </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`gap-2 ${isSaved ? 'text-primary hover:bg-primary/10 hover:text-primary' : 'text-gray-500'}`}
                                            onClick={handleSave}
                                        >
                                            <Bookmark
                                                className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
                                            />
                                            <span className="hidden sm:inline">
                                                {isSaved
                                                    ? 'Enregistre'
                                                    : 'Sauvegarder'}
                                            </span>
                                        </Button>
                                    </div>
                                    <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto sm:justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 rounded-full"
                                            onClick={copyShareLink}
                                        >
                                            {copiedLink ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                            {copiedLink
                                                ? 'Lien copie'
                                                : 'Copier le lien'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 rounded-full"
                                            onClick={shareNatively}
                                        >
                                            <Share2 className="h-4 w-4" />
                                            Partager
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            asChild
                                        >
                                            <a
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Facebook className="h-4 w-4 text-blue-600" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            asChild
                                        >
                                            <a
                                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${article.title}${shareDescription ? ` - ${shareDescription}` : ''}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Twitter className="h-4 w-4 text-sky-500" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            asChild
                                        >
                                            <a
                                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Linkedin className="h-4 w-4 text-sky-700" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            asChild
                                        >
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent(`${article.title}${shareDescription ? ` - ${shareDescription}` : ''} ${shareUrl}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MessageCircle className="h-4 w-4 text-green-500" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            asChild
                                        >
                                            <a
                                                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${article.title}${shareDescription ? ` - ${shareDescription}` : ''}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Send className="h-4 w-4 text-sky-500" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            asChild
                                        >
                                            <a
                                                href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(
                                                    `${
                                                        shareDescription
                                                            ? `${shareDescription}

`
                                                            : ''
                                                    }${shareUrl}`,
                                                )}`}
                                            >
                                                <Mail className="h-4 w-4 text-gray-600" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Article Body */}
                                <div className="prose prose-lg prose-indigo max-w-none dark:prose-invert">
                                    {article.excerpt && (
                                        <div className="relative mb-6">
                                            <p className="lead overflow-hidden rounded-r-lg border-l-4 border-primary bg-gray-50 p-4 pl-4 font-medium italic text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                                                <span
                                                    className="block"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient:
                                                            'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                    }}
                                                >
                                                    {article.excerpt}
                                                </span>
                                            </p>
                                            {/* Indicateur visuel si l'extrait est tronque */}
                                            {article.excerpt.length > 200 && (
                                                <div className="absolute bottom-2 right-4 rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                    ...
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Contenu payant avec effet de floutage */}
                                    {!article.can_read && article.premium ? (
                                        <div className="relative">
                                            <div
                                                className="prose prose-lg max-w-none select-none blur-sm dark:prose-invert prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl"
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        article.content || '',
                                                }}
                                            />

                                            {/* Overlay de floutage */}
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-gray-800 dark:via-gray-800/90 dark:to-transparent"></div>

                                            {/* Icone de cadenas au centre */}
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-full border border-gray-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/90">
                                                    <Lock className="h-6 w-6 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="prose prose-lg max-w-none dark:prose-invert prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl"
                                            dangerouslySetInnerHTML={{
                                                __html: article.content || '',
                                            }}
                                        />
                                    )}

                                    {/* Paywall */}
                                    {!article.can_read && article.premium && (
                                        <Paywall
                                            price={article.price}
                                            articleId={article.id}
                                            articleSlug={article.slug}
                                            title="Contenu Payant"
                                            minSubscriptionPrice={
                                                min_subscription_price
                                            }
                                        />
                                    )}
                                </div>

                                {/* Tags & Navigation */}
                                <div className="mt-12 border-t border-gray-100 pt-8 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        {article.category && (
                                            <Button
                                                variant="link"
                                                className="pl-0 text-gray-500 transition-colors hover:text-primary"
                                                asChild
                                            >
                                                <Link
                                                    href={`/categorie/${article.category.slug}`}
                                                    className="flex items-center gap-2"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Retour a{' '}
                                                    {article.category.name}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ad Space Article Bottom */}
                        <AdSpace
                            width="100%"
                            height={150}
                            locationId="article_single_bottom"
                            className="my-12 overflow-hidden rounded-xl shadow-sm"
                            hideWhenEmpty
                        />

                        {/* Author Bio */}
                        <div className="relative mb-12 mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-primary/[0.03] p-8 shadow-[0_10px_40px_-15px_rgba(47,106,17,0.15)] dark:border-white/10 dark:from-gray-900 dark:to-primary/10">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
                            />
                            <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-lg shadow-primary/20 ring-4 ring-white dark:ring-white/10">
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-emerald-700 text-2xl font-black text-white">
                                        {article.author.charAt(0)}
                                    </div>
                                </div>
                                <div className="flex-1 pt-2">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                        LE RURAL / Redaction
                                    </div>
                                    <h3 className="mt-1 font-heading text-xl font-black tracking-tight text-gray-900 dark:text-white">
                                        A propos de {article.author}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        Redacteur expert sur LE RURAL. Passionne
                                        par l'agriculture durable et les
                                        innovations technologiques dans le
                                        secteur agro-alimentaire en Afrique de
                                        l'Ouest.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div
                            className="mb-12 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-10"
                            id="comments"
                        >
                            <h3 className="mb-8 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                                <MessageSquare className="h-6 w-6 text-primary" />
                                Commentaires (
                                {article.comments_count ??
                                    article.comments?.length ??
                                    0}
                                )
                            </h3>

                            {/* Flash Message */}
                            {flash.success && (
                                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    {flash.success}
                                </div>
                            )}

                            {/* Comment Form */}
                            <form
                                onSubmit={submitComment}
                                className="mb-10 rounded-xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50"
                            >
                                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                                    Laisser un commentaire
                                </h4>
                                {!auth && (
                                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <input
                                            type="text"
                                            placeholder="Nom"
                                            className="w-full rounded-lg border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                            required
                                            value={data.author_name}
                                            onChange={(e) =>
                                                setData(
                                                    'author_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full rounded-lg border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                            required
                                            value={data.author_email}
                                            onChange={(e) =>
                                                setData(
                                                    'author_email',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                )}
                                <textarea
                                    rows={4}
                                    placeholder="Partagez votre avis..."
                                    className="mb-4 w-full rounded-lg border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                    required
                                    value={data.content}
                                    onChange={(e) =>
                                        setData('content', e.target.value)
                                    }
                                />
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-full px-6"
                                    >
                                        {processing
                                            ? 'Envoi...'
                                            : 'Publier le commentaire'}
                                    </Button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-8">
                                {article.comments &&
                                article.comments.length > 0 ? (
                                    article.comments.map((comment) => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            articleId={article.id}
                                        />
                                    ))
                                ) : (
                                    <p className="rounded-xl bg-gray-50 py-8 text-center italic text-gray-500 dark:bg-gray-900/30">
                                        Soyez le premier a commenter cet article
                                        !
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Similar Articles */}
                        {similar_articles.length > 0 && (
                            <section>
                                <div className="mb-6 flex items-end justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                            LE RURAL / Continuer la lecture
                                        </div>
                                        <h3 className="mt-1 font-heading text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                                            Articles similaires
                                        </h3>
                                    </div>
                                    <div className="hidden h-1 flex-1 translate-y-[-0.5rem] bg-gradient-to-r from-primary to-transparent sm:block" />
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {similar_articles.map((article) => (
                                        <ArticleCard
                                            key={article.slug}
                                            a={article}
                                            priceLabel={formatCfa(
                                                article.price,
                                            )}
                                            liked={Boolean(
                                                similarLiked[article.slug],
                                            )}
                                            onToggleLike={() =>
                                                handleSimilarLike(
                                                    article.slug,
                                                    article.likes_count ?? 0,
                                                )
                                            }
                                            likesCount={
                                                similarLikesCount[article.slug]
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8 lg:col-span-4 xl:col-span-3">
                        <HomeSidebar
                            marketPrices={marketPrices}
                            webtvVideos={webtvVideos}
                            partners={partners}
                            comments={latestComments}
                        />
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}
