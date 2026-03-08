import { Link } from '@inertiajs/react';
import { Clock, MessageCircle, Eye, ThumbsUp } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

type Article = {
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
    category?: string;
    categories?: { name: string, slug: string }[];
};

export default function ArticleCard({
    a,
    article,
    priceLabel,
    liked,
    onToggleLike,
    likesCount,
    mode = 'grid',
    className = "",
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
    
    const displayedLikes = likesCount ?? (data.likes_count ?? 0) + (liked ? 1 : 0);
    const isList = mode === 'list';

    return (
        <Link
            href={`/article/${data.slug || '#'}`}
            className={`group relative flex overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100 dark:border-gray-800 ${
                isList ? 'flex-col sm:flex-row h-auto sm:h-52' : 'flex-col h-full'
            } ${className}`}
        >
            {/* Image Container */}
            <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${
                isList ? 'w-full sm:w-1/3 h-48 sm:h-full shrink-0' : 'aspect-[16/9] w-full'
            }`}>
                <ImageWithFallback
                    src={data.image || undefined}
                    alt={data.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                    {(data.categories && data.categories.length > 0) ? (
                        <span className="inline-flex items-center rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md shadow-sm border border-white/10">
                            {data.categories[0].name}
                        </span>
                    ) : (data.category && typeof data.category === 'string') ? (
                        <span className="inline-flex items-center rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md shadow-sm border border-white/10">
                            {data.category}
                        </span>
                    ) : null}
                    
                    {data.premium ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                            {data.price ? `${Number(data.price).toLocaleString('fr-FR')} FCFA` : (priceLabel || 'Payant')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                            Gratuit
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {data.published_human}
                    </span>
                    {data.views_count !== undefined && (
                        <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {data.views_count}
                        </span>
                    )}
                </div>

                <h3 className={`font-bold leading-tight text-gray-900 dark:text-white transition-colors group-hover:text-primary ${
                    isList ? 'text-xl mb-2 line-clamp-2' : 'text-xl mb-3'
                }`}>
                    {data.title}
                </h3>

                <p className={`text-sm leading-relaxed text-gray-600 dark:text-gray-300 ${
                    isList ? 'line-clamp-2 mb-2' : 'line-clamp-3 mb-4'
                }`}>
                    {data.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
                        {data.author ? (
                            <>
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    {data.author.charAt(0)}
                                </div>
                                <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {data.author}
                                </span>
                            </>
                        ) : (
                             <span className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                                Auteur inconnu
                            </span>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {data.comments_count !== undefined && (
                            <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                {data.comments_count}
                            </span>
                        )}
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.();
                            }}
                            className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
                        >
                            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                            {displayedLikes}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
