import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Bookmark, Clock, ArrowUpRight, X, Sparkles } from 'lucide-react';
import ImageWithFallback from '@/Components/ImageWithFallback';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    image?: string;
    category: string;
    author: string;
    premium: boolean;
    published_at: string;
    saved_at: string;
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
}

export default function SavedArticles({ articles }: Props) {
    return (
        <DashboardLayout title="Articles Sauvegardés">
            <Head title="Articles Sauvegardés" />

            {/* Editorial header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_15px_40px_-20px_rgba(47,106,17,0.2)] dark:border-white/10 dark:bg-gray-900 sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                     style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span>Ma bibliothèque</span>
                            <span className="h-px w-6 bg-primary/40" />
                            <span className="text-gray-500 dark:text-gray-400">{articles.total} article{articles.total > 1 ? 's' : ''}</span>
                        </div>
                        <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Sauvegardés
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                            Retrouvez tous les articles mis de côté pour les lire plus tard, sans connexion, en toute tranquillité.
                        </p>
                    </div>
                    <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-lg shadow-primary/30">
                        <Bookmark className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {articles.data.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.data.map((article) => (
                        <article
                            key={article.id}
                            className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-20px_rgba(47,106,17,0.3)] dark:border-white/10 dark:bg-gray-900"
                        >
                            <Link href={`/article/${article.slug}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-950">
                                <ImageWithFallback
                                    src={article.image}
                                    alt={article.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                <div className="absolute left-3 top-3 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-primary shadow-sm">
                                        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                                        {article.category}
                                    </span>
                                </div>
                                {article.premium && (
                                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-amber-500/40">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        Premium
                                    </span>
                                )}
                                <div className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white opacity-0 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </Link>

                            <div className="p-5">
                                <Link
                                    href={`/article/${article.slug}`}
                                    className="block font-heading text-lg font-black leading-tight tracking-tight text-gray-900 line-clamp-2 transition-colors group-hover:text-primary dark:text-white"
                                >
                                    {article.title}
                                </Link>
                                <p className="mt-2 line-clamp-2 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
                                    {article.excerpt}
                                </p>
                                <div className="mt-4 flex items-center justify-between border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-[11px]">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-black text-primary">
                                            {article.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">Par</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">{article.author}</span>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {article.published_at}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="absolute top-3 right-3 hidden h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur transition-colors hover:bg-red-500 hover:text-white dark:bg-gray-900/90"
                                title="Retirer de la sélection"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center dark:border-white/10 dark:bg-gray-900">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                         style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    <div className="relative mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                        <Bookmark className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="relative font-heading text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        Aucun article sauvegardé
                    </h3>
                    <p className="relative mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                        Utilisez l'icône marque-page sur chaque article pour le retrouver ici à la prochaine connexion.
                    </p>
                    <Link
                        href="/"
                        className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_-10px_rgba(47,106,17,0.5)] transition hover:-translate-y-0.5"
                    >
                        Découvrir les articles
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            )}

            {articles.links && articles.links.length > 3 && (
                <div className="mt-10 flex justify-center">
                    <div className="flex flex-wrap gap-2">
                        {articles.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3.5 text-xs font-black uppercase tracking-[0.14em] transition-all ${
                                        link.active
                                            ? 'bg-primary text-white shadow-[0_10px_25px_-10px_rgba(47,106,17,0.5)]'
                                            : 'border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-3.5 text-xs font-bold text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
