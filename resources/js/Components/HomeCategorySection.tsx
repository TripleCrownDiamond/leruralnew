import ArticleCard from '@/Components/ArticleCard';
import { ArrowRight } from 'lucide-react';
import AdSpace from '@/Components/AdSpace';
import { Link } from '@inertiajs/react';

type Article = {
    slug: string;
    title?: string;
    excerpt?: string;
    content?: string;
    image: string | null;
    author: string;
    premium: boolean;
    price: number | string | null;
    published_human: string | null;
    likes_count?: number;
    views_count?: number;
    comments_count?: number;
};

export default function HomeCategorySection({
    id,
    name,
    articles,
    formatCfa,
    likedBySlug,
    likesCountBySlug,
    onToggleLike,
}: {
    id: string;
    name: string;
    articles: Article[];
    formatCfa: (value: number | undefined) => string | null;
    likedBySlug: Record<string, boolean>;
    likesCountBySlug: Record<string, number>;
    onToggleLike: (slug: string, baseLikes: number) => void;
}) {
    if (!articles.length) return null;

    const count = articles.length;

    return (
        <section id={id} className="relative py-16">
            <div className="absolute left-0 top-20 bottom-20 hidden w-[2px] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent lg:block" aria-hidden="true" />

            <header className="mb-10">
                <div className="mb-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(47,106,17,0.15)]" />
                    <span>LE RURAL</span>
                    <span className="h-px w-8 bg-primary/30" />
                    <span className="text-gray-400 dark:text-gray-500">Rubrique · {count} {count > 1 ? 'articles' : 'article'}</span>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-gray-900 pb-5 dark:border-white">
                    <h3 className="font-heading text-4xl font-black uppercase leading-[0.9] tracking-tight text-gray-900 dark:text-white lg:text-5xl">
                        {name}
                    </h3>

                    <Link
                        href={`/categorie/${encodeURIComponent(id)}`}
                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-md transition-all hover:shadow-lg hover:shadow-primary/20 dark:bg-white dark:text-gray-900"
                    >
                        <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-primary to-primary/80 transition-transform duration-300 group-hover:translate-y-0" aria-hidden="true" />
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-white">Voir tout</span>
                        <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white dark:group-hover:text-white" />
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {articles.slice(0, 6).map((a) => {
                    const fallbackExcerpt =
                        typeof a.excerpt === 'string' && a.excerpt.trim() !== ''
                            ? a.excerpt
                            : typeof a.content === 'string'
                                ? a.content
                                : '';

                    return (
                        <ArticleCard
                            key={a.slug}
                            a={{ ...a, excerpt: fallbackExcerpt }}
                            priceLabel={formatCfa(typeof a.price === 'number' ? a.price : undefined)}
                            liked={Boolean(likedBySlug[a.slug])}
                            onToggleLike={() => onToggleLike(a.slug, a.likes_count ?? 0)}
                            likesCount={likesCountBySlug[a.slug]}
                            className="h-full"
                        />
                    );
                })}
            </div>

            <div className="my-14 flex justify-center">
                <AdSpace
                    width={970}
                    height={120}
                    locationId={`home_category_${id}_bottom`}
                    label={`Publicite ${name}`}
                    className="mx-auto"
                />
            </div>
        </section>
    );
}


