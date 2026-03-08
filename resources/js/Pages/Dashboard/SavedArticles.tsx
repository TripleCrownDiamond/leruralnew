import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Bookmark, Clock, ArrowRight, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ImageWithFallback from '@/Components/ImageWithFallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

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

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="h-6 w-6 text-primary" />
                    Articles Sauvegardés
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Retrouvez ici tous les articles que vous avez mis de côté pour lire plus tard.
                </p>
            </div>

            {articles.data.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.data.map((article) => (
                        <div key={article.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                            <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                                <ImageWithFallback 
                                    src={article.image} 
                                    alt={article.title} 
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {article.premium && (
                                    <div className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                        PREMIUM
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-primary">
                                        {article.category}
                                    </span>
                                    <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {article.published_at}
                                    </span>
                                </div>
                                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-400">
                                    <Link href={`/article/${article.slug}`}>
                                        {article.title}
                                    </Link>
                                </h3>
                                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                                    {article.excerpt}
                                </p>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                            {article.author.charAt(0)}
                                        </div>
                                        {article.author}
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-4">
                        <Bookmark className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun article sauvegardé</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm">
                        Vous n'avez pas encore sauvegardé d'article. Utilisez l'icône de marque-page sur les articles pour les retrouver ici.
                    </p>
                    <Button className="mt-6" asChild>
                        <Link href="/">Découvrir les articles</Link>
                    </Button>
                </Card>
            )}

            {/* Pagination */}
            {articles.links && articles.links.length > 3 && (
                <div className="mt-8 flex justify-center">
                    <div className="flex flex-wrap gap-2">
                        {articles.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-md px-3 text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
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