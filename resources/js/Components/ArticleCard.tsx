import { Link } from '@inertiajs/react';
import { Clock, MessageCircle, Eye, ThumbsUp, ArrowUpRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

type Article = {
    slug: string;
    title?: string;
    title_fr?: string;
    title_en?: string;
    excerpt?: string;
    excerpt_fr?: string;
    excerpt_en?: string;
    content?: string;
    content_fr?: string;
    content_en?: string;
    image: string | null;
    image_position_x?: number | null;
    image_position_y?: number | null;
    author?: string;
    premium: boolean;
    price: number | string | null;
    published_human: string | null;
    likes_count?: number;
    views_count?: number;
    read_count?: number;
    comments_count?: number;
    category?: string;
    categories?: { name: string; slug: string }[];
};

export default function ArticleCard({
    a,
    article,
    priceLabel,
    liked,
    onToggleLike,
    likesCount,
    mode = 'grid',
    className = '',
}: {
    a?: Article;
    article?: Article;
    priceLabel?: string | null;
    liked?: boolean;
    onToggleLike?: () => void;
    likesCount?: number;
    mode?: 'grid' | 'list';
    className?: string;
}) {
    const data = a || article;
    if (!data) return null;

    const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
    const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const slugToTitle = (slug: string): string => slug.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    const capitalizeStart = (value: string): string => {
        if (!value) return '';
        const trimmedStart = value.trimStart();
        if (!trimmedStart) return '';

        const prefixLen = value.length - trimmedStart.length;
        const first = trimmedStart.charAt(0).toLocaleUpperCase('fr-FR');
        return `${value.slice(0, prefixLen)}${first}${trimmedStart.slice(1)}`;
    };

    const hasMeaningfulText = (value: string): boolean => /[\p{L}\p{N}]/u.test(value);
    const cleanExcerpt = (value: string): string => {
        const plain = normalizeText(stripHtml(value));
        const withoutLeadingPunctuation = plain.replace(/^[\s;:.,|/\\\-_'"`~!?]+/u, '').trim();
        return withoutLeadingPunctuation;
    };

    const rawTitle =
        normalizeText(data.title) ||
        normalizeText(data.title_fr) ||
        normalizeText(data.title_en) ||
        slugToTitle(normalizeText(data.slug));
    const titleText = capitalizeStart(rawTitle);

    const excerptCandidates = [
        normalizeText(data.excerpt),
        normalizeText(data.excerpt_fr),
        normalizeText(data.excerpt_en),
        normalizeText(data.content),
        normalizeText(data.content_fr),
        normalizeText(data.content_en),
    ];

    const excerptSource = excerptCandidates
        .map((candidate) => cleanExcerpt(candidate))
        .find((candidate) => hasMeaningfulText(candidate)) ?? '';

    const excerptText =
        excerptSource !== ''
            ? capitalizeStart(excerptSource.length > 180 ? `${excerptSource.slice(0, 180).trimEnd()}...` : excerptSource)
            : '...';

    const shouldDebugCards =
        typeof window !== 'undefined' &&
        window.location.search.includes('debugCards=1');

    if (shouldDebugCards) {
        console.debug('[CardDebug]', {
            slug: data.slug,
            raw_excerpt: data.excerpt,
            raw_excerpt_fr: data.excerpt_fr,
            raw_excerpt_en: data.excerpt_en,
            content_len: normalizeText(data.content || data.content_fr || data.content_en).length,
            final_excerpt: excerptText,
        });
    }

    const viewsValue = Number(data.views_count ?? data.read_count ?? 0);
    const commentsValue = Number(data.comments_count ?? 0);
    const authorText = normalizeText(data.author) || 'Redaction LE RURAL';

    const displayedLikes = likesCount ?? (data.likes_count ?? 0) + (liked ? 1 : 0);
    const isList = mode === 'list';
    const imagePositionX = Number(data.image_position_x ?? 50);
    const imagePositionY = Number(data.image_position_y ?? 50);

    return (
        <Link
            href={data.slug ? `/article/${data.slug}` : '#'}
            className={`group relative flex overflow-hidden rounded-3xl bg-white transition-all duration-500 hover:-translate-y-2 border border-gray-200/70 shadow-[0_4px_24px_-12px_rgba(47,106,17,0.15)] hover:shadow-[0_28px_70px_-30px_rgba(47,106,17,0.45)] hover:border-primary/30 dark:bg-gray-900 dark:border-gray-800 ${
                isList ? 'flex-col sm:flex-row h-auto' : 'flex-col h-full'
            } ${className}`}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-20" />

            <div
                className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${
                    isList ? 'w-full sm:w-2/5 h-52 sm:h-auto sm:min-h-[15rem] shrink-0' : 'aspect-[16/10] w-full'
                }`}
            >
                <ImageWithFallback
                    src={data.image || undefined}
                    alt={titleText || 'Article LE RURAL'}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                    style={{ objectPosition: `${imagePositionX}% ${imagePositionY}%` }}
                    loading="lazy"
                    fallbackSrc="/images/article-placeholder.svg"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="absolute bottom-4 right-4 z-10">
                    {data.premium ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-amber-500/30">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
                            {data.price ? `${Number(data.price).toLocaleString('fr-FR')} F` : (priceLabel || 'Premium')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/30">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
                            Gratuit
                        </span>
                    )}
                </div>

                <div className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg shadow-primary/40">
                    <ArrowUpRight className="h-5 w-5" />
                </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] font-semibold text-gray-500 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {data.published_human}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {viewsValue}
                    </span>
                </div>

                <h3
                    className={`font-heading font-black leading-[1.15] text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-primary ${
                        isList ? 'text-2xl mb-3 line-clamp-2' : 'text-xl lg:text-2xl mb-3 line-clamp-2'
                    }`}
                >
                    {titleText}
                </h3>

                <p
                    className={`text-sm leading-relaxed text-gray-700 dark:text-gray-200 ${
                        isList ? 'line-clamp-2 mb-3 min-h-[2.6rem] shrink-0' : 'line-clamp-2 mb-5 min-h-[3.1rem] shrink-0'
                    }`}
                >
                    {excerptText}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-dashed border-gray-200 dark:border-gray-800 pt-4">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-black text-white ring-2 ring-white dark:ring-gray-900 shadow-md shadow-primary/20">
                            {authorText.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400 dark:text-gray-500 leading-none">Par</span>
                            <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight mt-0.5">{authorText}</span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span className="tabular-nums font-semibold">{commentsValue}</span>
                        </span>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.();
                            }}
                            className={`flex items-center gap-1 transition-all ${liked ? 'text-red-500 scale-110' : 'hover:text-red-500 hover:scale-110'}`}
                        >
                            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                            <span className="tabular-nums font-semibold">{displayedLikes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
