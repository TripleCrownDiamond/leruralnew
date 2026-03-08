import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import ArticleCard from '@/Components/ArticleCard';
import { Search } from 'lucide-react';

interface SearchProps {
    query: string;
    results: {
        data: any[];
        links: any[];
        total: number;
    };
}

export default function SearchIndex({ query, results }: SearchProps) {
    return (
        <MainLayout title={`Recherche : ${query}`}>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Résultats de recherche</h1>
                    <p className="text-muted-foreground">
                        {results.total} résultat(s) pour "<span className="font-semibold text-foreground">{query}</span>"
                    </p>
                </div>

                {results.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.data.map((article) => (
                            <ArticleCard key={article.id} a={article} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-muted/50 p-6 rounded-full mb-4">
                            <Search className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h3>
                        <p className="text-muted-foreground max-w-md">
                            Nous n'avons trouvé aucun article correspondant à votre recherche. Essayez d'autres mots-clés ou vérifiez l'orthographe.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {results.links.length > 3 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="flex flex-wrap items-center gap-2">
                            {results.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-4 py-2 text-sm text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}