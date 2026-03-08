import ArticleCard from '@/Components/ArticleCard';
import { ChevronRight } from 'lucide-react';
import AdSpace from '@/Components/AdSpace';

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
    formatCfa: (value: number | string | null | undefined) => string | null;
    likedBySlug: Record<string, boolean>;
    likesCountBySlug: Record<string, number>;
    onToggleLike: (slug: string, baseLikes: number) => void;
}) {
    if (!articles.length) return null;

    return (
        <section id={id} className="py-12">
            <div className="mb-8 flex items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="relative">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <div className="absolute -bottom-4 left-0 h-1 w-24 bg-primary rounded-full" />
                </div>
                <a
                    href={`#${id}`}
                    className="group flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary/80"
                >
                    Voir tout
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 6).map((a) => (
                    <ArticleCard
                        key={a.slug}
                        a={a}
                        priceLabel={formatCfa(a.price)}
                        liked={Boolean(likedBySlug[a.slug])}
                        onToggleLike={() =>
                            onToggleLike(a.slug, a.likes_count ?? 0)
                        }
                        likesCount={likesCountBySlug[a.slug]}
                        className="h-full"
                    />
                ))}
            </div>

            {/* Ads between sections - Modernized */}
            <div className="my-12 flex justify-center">
                <AdSpace 
                    width={970} 
                    height={120} 
                    locationId={`home_category_${id}_bottom`} 
                    label={`Publicité ${name}`}
                    className="mx-auto"
                />
            </div>
        </section>
    );
}
